import { updateGameState } from "./engine/tick";
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
const MAX_DELTA = 250; // Prevent spiral of death

function gameLoop(now: number) {
	const deltaMs = Math.min(now - lastTime, MAX_DELTA);
	lastTime = now;

	if (
		gameContext.state &&
		!gameContext.isPaused &&
		["playing", "victory_mode"].includes(gameContext.state.status)
	) {
		// CHANGE: Direct update with deltaMs
		const events = updateGameState(gameContext.state, deltaMs);

		for (const event of events) {
			handleGameEvent(event, gameContext.state.elapsedTime); // CHANGE: pass elapsedTime
		}
	}

	// Render
	render(appContext.canvasCtx, gameContext, now);

	requestAnimationFrame(gameLoop);
}

function handleGameEvent(event: GameEvent, currentTime: number): void {
	switch (event.type) {
		case "ENTITY_MOVING":
			// Start tongue animation when entity begins dwelling with food ahead
			if (event.consumeIntent.willConsume && event.consumeIntent.resource) {
				gameContext.renderContext?.activeTongues.set(
					event.entityId,
					createTongueAnimation(
						event.entityId,
						currentTime,
						event.consumeIntent.targetPosition?.row ?? 0,
						event.consumeIntent.targetPosition?.col ?? 0,
						gameContext.state?.constraints.msPerSegment ?? 0,
					),
				);
			}
			break;
		case "RESOURCE_CONSUMED": {
			if (!gameContext.renderContext) break;

			cleanupTongues(gameContext.renderContext, currentTime);
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
