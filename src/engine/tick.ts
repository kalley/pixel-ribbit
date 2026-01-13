// engine/tick.ts

import {
	advancePathEntities,
	applyEntityCompletedLoop,
	applyEntityMoving,
	applyEntityToWaitingArea,
	applyGameLost,
	applyGameWon,
	applyResourceConsumed,
	applyVictoryMode,
	type GameEvent,
} from "./events/movement";
import type { GameState } from "./types";

export interface TickAction {
	type: "TICK";
}

/**
 * Process one game tick
 */
export function tick(state: GameState, _action: TickAction): GameEvent[] {
	if (state.status !== "playing" && state.status !== "victory_mode") {
		return []; // Game is over
	}

	// Increment tick counter
	state.tick++;

	// Advance all entities on the path
	const events = advancePathEntities(state);

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
