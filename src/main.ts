import { tick } from "./engine/tick";
import { render } from "./renderer/render";
import "./style.css";
import type { GameEvent } from "./engine/events/movement";
import {
	cleanupTongues,
	createTongueAnimation,
} from "./renderer/render-context";
import { makeApp } from "./ui/app";
import type { GameContext } from "./ui/canvas";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
	throw new Error("App element not found");
}

// In main
const gameContext: GameContext = {
	state: null,
	renderContext: null,
	isPaused: false,
};

const appContext = makeApp(gameContext);

app.appendChild(appContext.app);

let lastTime = performance.now();
let accumulator = 0;
const MAX_DELTA = 250; // Prevent spiral of death

function gameLoop(now: number) {
	const delta = Math.min(now - lastTime, MAX_DELTA);
	lastTime = now;
	accumulator += delta;

	if (
		gameContext.state &&
		!gameContext.isPaused &&
		["playing", "victory_mode"].includes(gameContext.state.status)
	) {
		// Get effective tick rate (faster in victory mode)
		const effectiveTickMs = gameContext.state.validator.getEffectiveMsPerTick(
			gameContext.state,
		);

		while (accumulator >= effectiveTickMs) {
			const currentTick = gameContext.state.tick;

			// Process one game tick
			const events = tick(gameContext.state, { type: "TICK" });

			// Handle events
			for (const event of events) {
				handleGameEvent(event, currentTick);
			}

			accumulator -= effectiveTickMs;
		}
	}

	// Render
	render(appContext.canvasCtx, gameContext, now);

	requestAnimationFrame(gameLoop);
}

function handleGameEvent(event: GameEvent, currentTick: number): void {
	switch (event.type) {
		case "ENTITY_MOVING":
			// Start tongue animation when entity begins dwelling with food ahead
			if (event.consumeIntent.willConsume && event.consumeIntent.resource) {
				gameContext.renderContext?.activeTongues.set(
					event.entityId,
					createTongueAnimation(
						event.entityId,
						currentTick,
						event.consumeIntent.targetPosition?.row ?? 0,
						event.consumeIntent.targetPosition?.col ?? 0,
						gameContext.state?.constraints.ticksPerSegment ?? 0,
					),
				);
			}
			break;
		case "RESOURCE_CONSUMED": {
			if (!gameContext.renderContext) break;

			cleanupTongues(gameContext.renderContext, currentTick);
			break;
		}

		case "GAME_WON":
			appContext.onWin();
			break;

		case "GAME_LOST":
			appContext.onLoss();
			break;

		case "VICTORY_MODE_TRIGGERED":
			console.log("🎉 Victory mode activated!");
			// Could trigger visual/audio effects here
			break;
	}
}

// Start the game loop
requestAnimationFrame(gameLoop);
