import { GRID_GAP_RATIO, GRID_SIZE, GRID_X, GRID_Y } from "../constants";
import { createPalette } from "../game/color";
import { compileGrid } from "../game/compileGrid";
import { createLevel, type Level } from "../game/level";
import { createFrogGame } from "../game/state";
import { palette } from "../image-processing/color-utils";
import { getImageData } from "../image-processing/get-image-data";
import { imageDataToGrid } from "../image-processing/imagedata-to-grid";
import { posterize } from "../image-processing/posterize";
import { processImageForGrid } from "../image-processing/resize-image";
import { calculateGridLayout } from "../renderer/calculate-grid-layout";
import {
	createRenderContext,
	resetRenderContext,
} from "../renderer/render-context";
import { createFragment, h } from "../utils/h";
import { type GameContext, makeCanvas } from "./canvas";
import { imageUpload } from "./image-upload";
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
	const imageUploader = imageUpload(async (file) => {
		if (!canvasCtx.ctx) throw new Error("Canvas context not found");

		const pixelSize = 24;

		const imageData = await getImageData(file);
		const resized = processImageForGrid(imageData, pixelSize);
		const posterized = posterize(resized, palette);

		const usedPalette = posterized.usedPalette;
		const grid = imageDataToGrid(posterized.imageData);
		const gameLevel = createLevel(
			compileGrid(grid),
			pixelSize,
			createPalette(usedPalette),
		);
		gameContext.isPaused = false;
		initGame(gameContext, gameLevel, 123);
	});
	const winDialog = makeWinDialog();
	const lossDialog = makeLossDialog();

	return {
		app: createFragment(
			canvasCtx.canvas,
			h("div", { id: "toolbar" }, imageUploader),
			winDialog.element,
			lossDialog.element,
		),
		canvasCtx,
		onWin: () => {
			winDialog.showModal();
			gameContext.isPaused = true;
		},
		onLoss: () => {
			lossDialog.showModal();
			gameContext.isPaused = true;
		},
	};
}
