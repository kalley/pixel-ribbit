import { palette } from "../../image-processing/color-utils";
import { getImageData } from "../../image-processing/get-image-data";
import {
	type PosterizeResult,
	posterize,
} from "../../image-processing/posterize";
import { processImageForGrid } from "../../image-processing/resize-image";
import { h } from "../../utils/h";
import { makeButton } from "../button/button";
import { makeModal } from "../modal/modal";
import { makeColorSlider } from "./color-slider";
import {
	DIFFICULTY_PRESETS,
	type DifficultyPreset,
	makeDifficultySelector,
} from "./difficulty-selector";
import { makeImageDropZone } from "./image-drop-zone";
import "./image-upload-modal-styles.css";

function imageDataToDataUrl(imageData: ImageData): string {
	const canvas = document.createElement("canvas");
	canvas.width = imageData.width;
	canvas.height = imageData.height;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.putImageData(imageData, 0, 0);
	}
	return canvas.toDataURL();
}

export function makeImageUploadModal({
	onConfirm,
}: {
	onConfirm: (result: PosterizeResult, pixelsPerSide: number) => void;
}) {
	// State management
	let originalImageData: ImageData | null = null;
	let posterizedResult: PosterizeResult | null = null;
	let currentDifficulty: DifficultyPreset = "medium";
	let currentColorCount: number = DIFFICULTY_PRESETS.medium.defaultColors;
	let debounceTimer: number | undefined;

	const processingIndicator = h(
		"div",
		{
			class: "processing",
			style: "display: none",
		},
		"Processing...",
	);
	const originalPreviewImg = h("img", { alt: "Original" });
	const posterizedPreviewImg = h("img", { alt: "Posterized" });
	const colorCountLabel = h(
		"label",
		{},
		`Colors: ${currentColorCount} (${DIFFICULTY_PRESETS[currentDifficulty].minColors}-${DIFFICULTY_PRESETS[currentDifficulty].maxColors})`,
	);

	// ... etc
	async function handleFileSelect(file: File) {
		processingIndicator.style.display = "block";

		try {
			originalImageData = await getImageData(file);
			const resized = processImageForGrid(
				originalImageData,
				DIFFICULTY_PRESETS[currentDifficulty].pixelsPerSide,
			);
			originalPreviewImg.src = imageDataToDataUrl(resized);

			configView.style.display = "flex";

			updatePosterization();
		} catch (error) {
			console.error("Failed to load image:", error);
			processingIndicator.style.display = "none";
		}
	}

	function updatePosterization() {
		if (!originalImageData) return;

		clearTimeout(debounceTimer);
		processingIndicator.style.display = "block";
		posterizedPreviewImg.style.display = "none";

		debounceTimer = setTimeout(() => {
			if (!originalImageData) return;

			const resized = processImageForGrid(
				originalImageData,
				DIFFICULTY_PRESETS[currentDifficulty].pixelsPerSide,
			);
			posterizedResult = posterize(resized, palette, currentColorCount);
			posterizedPreviewImg.src = imageDataToDataUrl(posterizedResult.imageData);
			posterizedPreviewImg.style.display = "block";
			processingIndicator.style.display = "none";
		}, 150);
	}

	function handleColorCountChange(value: number) {
		currentColorCount = value;
		const preset = DIFFICULTY_PRESETS[currentDifficulty];
		colorCountLabel.textContent = `Colors: ${value} (${preset.minColors}-${preset.maxColors})`;
		updatePosterization();
	}

	const colorSlider = makeColorSlider(
		currentDifficulty,
		currentColorCount,
		handleColorCountChange,
	);

	function handleDifficultyChange(newDifficulty: DifficultyPreset) {
		if (!originalImageData) return;

		currentDifficulty = newDifficulty;
		const preset = DIFFICULTY_PRESETS[newDifficulty];
		currentColorCount = preset.defaultColors;

		// Update slider
		colorSlider.min = String(preset.minColors);
		colorSlider.max = String(preset.maxColors);
		colorSlider.value = String(preset.defaultColors);

		// Update label
		colorCountLabel.textContent = `Colors: ${currentColorCount} (${preset.minColors}-${preset.maxColors})`;

		const resized = processImageForGrid(
			originalImageData,
			preset.pixelsPerSide,
		);
		originalPreviewImg.src = imageDataToDataUrl(resized);
		updatePosterization();
	}

	// Create sub-components
	const dropZone = makeImageDropZone(handleFileSelect);
	const difficultySelector = makeDifficultySelector({
		currentDifficulty,
		onDifficultyChange: handleDifficultyChange,
	});

	function resetModal() {
		originalImageData = null;
		posterizedResult = null;
		currentDifficulty = "medium";
		currentColorCount = DIFFICULTY_PRESETS.medium.defaultColors;

		configView.style.display = "none";
		dropZone.reset();

		// Reset difficulty radio buttons
		const preset = DIFFICULTY_PRESETS.medium;
		colorSlider.min = String(preset.minColors);
		colorSlider.max = String(preset.maxColors);
		colorSlider.value = String(preset.defaultColors);
		colorCountLabel.textContent = `Colors: ${preset.defaultColors} (${preset.minColors}-${preset.maxColors})`;
	}

	function handleConfirm() {
		if (posterizedResult) {
			const preset = DIFFICULTY_PRESETS[currentDifficulty];
			onConfirm(posterizedResult, preset.pixelsPerSide);
			modal.close();
			resetModal();
		}
	}

	const configView = h(
		"div",
		{
			class: "configuration-view",
			style: "display: none",
		},
		// Difficulty selection
		difficultySelector,

		// Color count slider
		h("div", { class: "control-group" }, colorCountLabel, colorSlider),

		// Image previews
		h(
			"div",
			{ class: "preview-grid" },
			h(
				"div",
				{ class: "preview-container" },
				h("h3", {}, "Original"),
				h("div", { class: "preview-image" }, originalPreviewImg),
			),
			h(
				"div",
				{ class: "preview-container" },
				h("h3", {}, "Posterized"),
				h(
					"div",
					{ class: "preview-image" },
					processingIndicator,
					posterizedPreviewImg,
				),
			),
		),

		// Action buttons
		h(
			"div",
			{ class: "button-group" },
			makeButton({ onClick: resetModal }, "Change Image"),
			makeButton({ onClick: handleConfirm, class: "primary" }, "Start Game"),
		),
	);

	// Compose them
	const modal = makeModal(
		h("div", { class: "image-upload-modal" }, dropZone.element, configView),
	);

	return { element: modal, showModal: () => modal.showModal() };
}
