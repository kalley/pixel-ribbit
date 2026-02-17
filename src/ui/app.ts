import { GRID_GAP_RATIO, GRID_SIZE, GRID_X, GRID_Y } from "../constants";
import { createPalette } from "../game/color";
import { compileGrid } from "../game/compileGrid";
import { createLevel, type Level } from "../game/level";
import {
	createSharedGameSnapshot,
	decodeSharedGameSnapshot,
	encodeSharedGameSnapshot,
	extractShareCodeFromInput,
	rehydrateLevelFromSnapshot,
	type SharedGameSnapshot,
} from "../game/share";
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
	const shareStatus = h(
		"span",
		{ class: "share-status", style: "display: none" },
		"",
	);

	let shareStatusTimer: number | undefined;

	const updateShareUrl = (shareCode: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set("share", shareCode);
		window.history.replaceState({}, "", url.toString());
	};

	const showShareStatus = (message: string, durationMs = 1600) => {
		shareStatus.textContent = message;
		shareStatus.style.display = "inline";

		clearTimeout(shareStatusTimer);
		shareStatusTimer = window.setTimeout(() => {
			shareStatus.style.display = "none";
		}, durationMs);
	};

	const startGame = (level: Level, seed: number, shareCode?: string) => {
		uploadOverlay.style.display = "none";
		gameContext.isPaused = false;
		initGame(gameContext, level, seed);
		canvasCtx.updateLayout();

		if (shareCode) {
			gameContext.activeShareCode = shareCode;
			updateShareUrl(shareCode);
			shareControls.style.display = "flex";
		}
	};

	const imageUploadModal = makeImageUploadModal({
		onConfirm: ({ usedPalette, imageData }, pixelsPerSide) => {
			const grid = imageDataToGrid(imageData);
			const gameLevel = createLevel(
				compileGrid(grid),
				pixelsPerSide,
				createPalette(usedPalette),
			);
			const seed = Date.now();
			const shareCode = encodeSharedGameSnapshot(
				createSharedGameSnapshot(gameLevel, seed),
			);

			startGame(gameLevel, seed, shareCode);
		},
		onLoadSharedGame: (shareInput) => {
			const shareCode = extractShareCodeFromInput(shareInput);
			if (!shareCode) {
				return false;
			}

			const snapshot = decodeSharedGameSnapshot(shareCode);
			if (!snapshot) {
				return false;
			}

			const level = rehydrateLevelFromSnapshot(snapshot);
			startGame(level, snapshot.seed, shareCode);

			return true;
		},
	});

	const shareButton = makeButton(
		{
			class: "share-button compact",
			onClick: async () => {
				if (!gameContext.activeShareCode) {
					showShareStatus("No share link available");
					return;
				}

				const url = new URL(window.location.href);
				url.searchParams.set("share", gameContext.activeShareCode);
				const shareUrl = url.toString();

				try {
					await navigator.clipboard.writeText(shareUrl);
					showShareStatus("Link copied");
				} catch {
					showShareStatus("Copy failed");
				}
			},
		},
		"Share",
	);

	const shareControls = h(
		"div",
		{ class: "share-controls", style: "display: none" },
		shareButton,
		shareStatus,
	);

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
			shareControls,
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
		startFromShareSnapshot: (
			snapshot: SharedGameSnapshot,
			shareCode?: string,
		) => {
			const level = rehydrateLevelFromSnapshot(snapshot);
			startGame(level, snapshot.seed, shareCode);
		},
	};
}
