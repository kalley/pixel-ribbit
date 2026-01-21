// engine/tick.ts

import {
	applyEntityCompletedLoop,
	applyEntityMoving,
	applyEntityToWaitingArea,
	applyGameLost,
	applyGameWon,
	applyResourceConsumed,
	applyVictoryMode,
	type GameEvent,
	updatePathEntities,
} from "./events/movement";
import type { GameState } from "./types";

/**
 * Process one game tick
 */
export function updateGameState(
	state: GameState,
	deltaMs: number,
): GameEvent[] {
	if (state.status !== "playing" && state.status !== "victory_mode") {
		return []; // Game is over
	}

	// Increment tick counter
	const effectiveDelta =
		state.status === "victory_mode"
			? deltaMs * state.constraints.victoryModeSpeedup
			: deltaMs;

	state.elapsedTime += effectiveDelta;

	// CHANGE: Pass deltaMs to movement update
	const events = updatePathEntities(state, effectiveDelta);

	// Apply all events to state
	for (const event of events) {
		applyEvent(state, event);
	}

	return events;
}

/**
 * Apply an event to the game state
 */
function applyEvent(state: GameState, event: GameEvent): void {
	switch (event.type) {
		case "ENTITY_MOVING":
			applyEntityMoving(state, event);
			break;
		case "ENTITY_COMPLETED_LOOP":
			applyEntityCompletedLoop(state, event);
			break;
		case "ENTITY_TO_WAITING_AREA":
			applyEntityToWaitingArea(state, event);
			break;
		case "RESOURCE_CONSUMED":
			applyResourceConsumed(state, event);
			break;
		case "GAME_LOST":
			applyGameLost(state, event);
			break;
		case "VICTORY_MODE_TRIGGERED":
			applyVictoryMode(state);
			break;
		case "GAME_WON":
			applyGameWon(state);
			break;
	}
}
