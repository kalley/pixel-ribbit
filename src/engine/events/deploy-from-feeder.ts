import type { Feeder, GameEvent, GameState, PlayerAction } from "../types";
import {
	deployCannonToConveyor,
	deployedToConveyorEvent,
	isEntryClear,
} from "./deploy";

function consumeFromColumn(feeder: Feeder, columnIndex: number) {
	const column = feeder.columns[columnIndex];
	if (!column) return;

	// Remove bottom cannon
	column.cannons.shift();
}

export function handleDeployFromFeeder(
	state: GameState,
	action: Extract<PlayerAction, { type: "DEPLOY_FROM_FEEDER" }>,
): GameEvent[] {
	const column = state.feeder.columns[action.columnIndex];
	if (!column || column.cannons.length === 0) {
		throw new Error("No cannon to deploy in this column");
	}

	if (state.conveyor.cannonsOnBelt.length >= state.conveyor.capacity) {
		throw new Error("Conveyor is at capacity");
	}

	if (!isEntryClear(state)) {
		throw new Error("Entry is not clear");
	}

	const cannonId = column.cannons[0];
	const cannon = state.cannons[cannonId];

	deployCannonToConveyor(state, cannon);
	consumeFromColumn(state.feeder, action.columnIndex);

	return [deployedToConveyorEvent(cannonId)];
}
