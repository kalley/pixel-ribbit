import { GRID_GAP_RATIO, GRID_SIZE, GRID_X, GRID_Y } from "../constants";
import { createPalette } from "../game/color";
import { compileGrid } from "../game/compileGrid";
import { createLevel, type Level } from "../game/level";
import { createFrogGame } from "../game/state";
import { imageDataToGrid } from "../image-processing/imagedata-to-grid";
import { calculateGridLayout } from "../renderer/calculate-grid-layout";
import {
	createRenderContext,
	resetRenderContext,
} from "../renderer/render-context";
import { createFragment, h } from "../utils/h";
import { makeButton } from "./button/button";
import { type GameContext, makeCanvas } from "./canvas";
import { makeImageUploadModal } from "./image-upload-modal/image-upload-modal";
import { makeLossDialog } from "./loss-dialog";
import { makeWinDialog } from "./win-dialog";

function initGame(gameContext: GameContext, level: Level, seed: number) {
	gameContext.state = createFrogGame(level, seed);

	// Create or reset render context
	const gridLayout = calculateGridLayout(
		GRID_SIZE,
		level.pixelsPerSize,
		GRID_X,
		GRID_Y,
		GRID_GAP_RATIO,
	);

	if (!gameContext.renderContext) {
		gameContext.renderContext = createRenderContext(gridLayout);
	} else {
		resetRenderContext(gameContext.renderContext, gridLayout);
	}
}

export function makeApp(gameContext: GameContext) {
	const canvasCtx = makeCanvas(gameContext, () => console.log("size changed"));
	const winDialog = makeWinDialog();
	const lossDialog = makeLossDialog();

	const imageUploadModal = makeImageUploadModal({
		onConfirm: ({ usedPalette, imageData }, pixelsPerSide) => {
			uploadOverlay.style.display = "none";
			const grid = imageDataToGrid(imageData);
			const gameLevel = createLevel(
				compileGrid(grid),
				pixelsPerSide,
				createPalette(usedPalette),
			);
			gameContext.isPaused = false;
			initGame(gameContext, gameLevel, 123);
		},
	});

	const uploadOverlay = h(
		"div",
		{ class: "upload-overlay" },
		makeButton(
			{ class: "upload-button", onClick: () => imageUploadModal.showModal() },
			"UPLOAD",
		),
	);

	return {
		app: createFragment(
			canvasCtx.canvas,
			uploadOverlay,
			winDialog.element,
			lossDialog.element,
			imageUploadModal.element,
		),
		canvasCtx,
		onWin: () => {
			winDialog.showModal();
			gameContext.isPaused = true;
			uploadOverlay.style.display = "";
		},
		onLoss: () => {
			lossDialog.showModal();
			gameContext.isPaused = true;
			uploadOverlay.style.display = "";
		},
	};
}
