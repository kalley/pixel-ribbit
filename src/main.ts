import { GRID_GAP_RATIO, GRID_X, GRID_Y, TARGET_GRID_SIZE } from "./constants";
import { createPalette } from "./domain/color";
import { createLevel, type Level } from "./domain/level";
import { createGameState } from "./engine/state";
import { tick } from "./engine/tick";
import type { GameState } from "./engine/types";
import { palette } from "./image-processing/color-utils";
import { getImageData } from "./image-processing/get-image-data";
import { imageDataToGrid } from "./image-processing/imagedata-to-grid";
import { posterize } from "./image-processing/posterize";
import { processImageForGrid } from "./image-processing/resize-image";
import { compileGrid } from "./level/compileGrid";
import {
	calculateGridLayout,
	type GridLayout,
} from "./renderer/calculate-grid-layout";
import { createFrogSpriteFactory } from "./renderer/draw-frog";
import { render } from "./renderer/render";
import "./style.css";
import { listenForClicks, makeCanvas } from "./ui/canvas";
import { imageUpload } from "./ui/image-upload";
import { activeTongues } from "./ui/tongues";
import { loadImage } from "./utils/load-image";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
	throw new Error("App element not found");
}
const imageUrls = ["/frog_mask.png", "/frog_lighting.png", "/frog_outline.png"];

// Load all three, do something when done
const factory = await Promise.all(
	imageUrls.map((path) => loadImage(path).promise),
)
	.then(([maskImg, lightingImg, outlineImg]) =>
		createFrogSpriteFactory({
			maskImg,
			lightingImg,
			outlineImg,
		}),
	)
	.catch((error) => {
		console.error("One or more images failed:", error);
	});

// Canvas
let gameState!: GameState;
let gameLevel!: Level;
let gridLayout!: GridLayout;

const { canvas, ctx, layout } = makeCanvas(() => console.log("size changed"));

const debug = document.createElement("pre");

// Toolbar
const toolbar = document.createElement("div");

toolbar.id = "toolbar";
toolbar.appendChild(
	imageUpload(async (file) => {
		if (!ctx) throw new Error("Canvas context not found");

		const pixelSize = 48;

		const imageData = await getImageData(file);
		const resized = processImageForGrid(imageData, pixelSize);
		const posterized = posterize(resized, palette);

		gridLayout = calculateGridLayout(
			TARGET_GRID_SIZE,
			pixelSize,
			GRID_X,
			GRID_Y,
			GRID_GAP_RATIO,
		);

		console.log(gridLayout);

		const usedPalette = posterized.usedPalette;
		const grid = imageDataToGrid(posterized.imageData);
		gameLevel = createLevel(compileGrid(grid), createPalette(usedPalette));
		gameState = createGameState(gameLevel, 123);

		isPaused = false;
		listenForClicks(canvas, gameState);
	}),
);

// Render it all
app.appendChild(canvas);
app.appendChild(toolbar);
app.appendChild(debug);

let isPaused = false;
let lastTime = performance.now();
let accumulator = 0;
const TICK_MS = 50;
const MAX_DELTA = 250; // ms

function gameLoop(now: number) {
	const delta = Math.min(now - lastTime, MAX_DELTA);
	lastTime = now;
	accumulator += delta;

	if (gameState && !isPaused && gameState.status === "playing") {
		const nowTick = gameState.tick;

		while (accumulator >= TICK_MS) {
			const events = tick(gameState, { type: "WAIT" });

			for (const event of events) {
				if (event.type === "PIXEL_CLEARED") {
					activeTongues.set(event.cannonId, {
						cannonId: event.cannonId,
						startTick: nowTick,
						targetX: event.position.x,
						targetY: event.position.y,
						duration: 2,
					});
				}
				if (event.type === "GAME_WON" || event.type === "GAME_LOST") {
					alert(`Game ${event.type === "GAME_WON" ? "Won!" : "Lost!"}`);
					isPaused = true;
					break;
				}
			}

			accumulator -= TICK_MS;
		}

		for (const [id, t] of activeTongues) {
			if (nowTick - t.startTick >= t.duration) {
				activeTongues.delete(id);
			}
		}
	}

	render(
		canvas,
		layout,
		gridLayout,
		gameState,
		gameLevel,
		factory ?? undefined,
	);
	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
