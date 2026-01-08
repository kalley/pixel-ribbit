import { handleDeployFromFeeder } from "./events/deploy-from-feeder";
import { handleDeployFromSlot } from "./events/deploy-from-slot";
import { resolveFiring } from "./events/firing";
import { checkGameEnd } from "./events/game-end";
import { advanceConveyor } from "./events/position";
import type { GameEvent, GameState, PlayerAction } from "./types";

export function tick(state: GameState, action: PlayerAction): GameEvent[] {
	const events: GameEvent[] = [];

	// Phase 1: Handle player action
	switch (action.type) {
		case "DEPLOY_FROM_FEEDER":
			events.push(...handleDeployFromFeeder(state, action));
			break;
		case "DEPLOY_FROM_SLOT":
			events.push(...handleDeployFromSlot(state, action));
			break;
		case "WAIT":
			// No-op, continue to firing
			break;
	}

	// Phase 2: All cannons fire
	events.push(...resolveFiring(state));

	// Phase 3: Advance conveyor
	events.push(...advanceConveyor(state));

	// Phase 4: Check game end
	events.push(...checkGameEnd(state));

	state.tick++;

	// Store events for debug/replay
	state._debug?.eventLog.push(...events);

	return events;
}
