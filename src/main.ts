import { GRID_GAP_RATIO, GRID_SIZE, GRID_X, GRID_Y } from "./constants";
import { tick } from "./engine/tick";
import type { GameState } from "./engine/types";
import { createPalette } from "./game/color";
import { compileGrid } from "./game/compileGrid";
import { createLevel, type Level } from "./game/level";
import { palette } from "./image-processing/color-utils";
import { getImageData } from "./image-processing/get-image-data";
import { imageDataToGrid } from "./image-processing/imagedata-to-grid";
import { posterize } from "./image-processing/posterize";
import { processImageForGrid } from "./image-processing/resize-image";
import { calculateGridLayout } from "./renderer/calculate-grid-layout";
import { render } from "./renderer/render";
import "./style.css";
import type { GameEvent } from "./engine/events/movement";
import { createFrogGame } from "./game/state";
import {
	cleanupTongues,
	createRenderContext,
	createTongueAnimation,
	type RenderContext,
	resetRenderContext,
} from "./renderer/render-context";
import { listenForClicks, makeCanvas } from "./ui/canvas";
import { imageUpload } from "./ui/image-upload";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
	throw new Error("App element not found");
}

let gameState: GameState | null = null;
let renderContext: RenderContext | null = null;
let currentLevel: Level | null = null;

function initGame(level: Level, seed: number) {
	gameState = createFrogGame(level, seed);
	currentLevel = level;

	// Create or reset render context
	const gridLayout = calculateGridLayout(
		GRID_SIZE,
		level.pixelsPerSize,
		GRID_X,
		GRID_Y,
		GRID_GAP_RATIO,
	);

	if (!renderContext) {
		renderContext = createRenderContext(gridLayout);
	} else {
		resetRenderContext(renderContext, gridLayout);
	}

	// Setup clicks
	listenForClicks(canvasCtx.canvas, gameState, renderContext);
}

const canvasCtx = makeCanvas(() => console.log("size changed"));

// Toolbar
const toolbar = document.createElement("div");

toolbar.id = "toolbar";
toolbar.appendChild(
	imageUpload(async (file) => {
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
		isPaused = false;
		initGame(gameLevel, 123);
	}),
);

// Render it all
app.appendChild(canvasCtx.canvas);
app.appendChild(toolbar);

let isPaused = false;
let lastTime = performance.now();
let accumulator = 0;
const MAX_DELTA = 250; // Prevent spiral of death

function gameLoop(now: number) {
	const delta = Math.min(now - lastTime, MAX_DELTA);
	lastTime = now;
	accumulator += delta;

	if (
		gameState &&
		!isPaused &&
		(gameState.status === "playing" || gameState.status === "victory_mode")
	) {
		// Get effective tick rate (faster in victory mode)
		const effectiveTickMs =
			gameState.validator.getEffectiveMsPerTick(gameState);

		while (accumulator >= effectiveTickMs) {
			const currentTick = gameState.tick;

			// Process one game tick
			const events = tick(gameState, { type: "TICK" });

			// Handle events
			for (const event of events) {
				handleGameEvent(event, currentTick);
			}

			accumulator -= effectiveTickMs;
		}
	}

	// Render
	render(canvasCtx, gameState, renderContext, currentLevel, now);

	requestAnimationFrame(gameLoop);
}

function handleGameEvent(event: GameEvent, currentTick: number): void {
	switch (event.type) {
		case "ENTITY_MOVING":
			// Start tongue animation when entity begins dwelling with food ahead
			if (event.consumeIntent.willConsume && event.consumeIntent.resource) {
				renderContext?.activeTongues.set(
					event.entityId,
					createTongueAnimation(
						event.entityId,
						currentTick,
						event.consumeIntent.targetPosition?.row ?? 0,
						event.consumeIntent.targetPosition?.col ?? 0,
						gameState?.constraints.ticksPerSegment ?? 0,
					),
				);
			}
			break;
		case "RESOURCE_CONSUMED": {
			if (!renderContext) break;

			cleanupTongues(renderContext, currentTick);
			break;
		}

		case "GAME_WON":
			alert("Game Won!");
			isPaused = true;
			break;

		case "GAME_LOST":
			alert(`Game Lost! ${event.reason}`);
			isPaused = true;
			break;

		case "VICTORY_MODE_TRIGGERED":
			console.log("🎉 Victory mode activated!");
			// Could trigger visual/audio effects here
			break;
	}
}

// Start the game loop
requestAnimationFrame(gameLoop);
