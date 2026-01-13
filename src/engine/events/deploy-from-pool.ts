// engine/events/deploy-from-feeder.ts

import type { GameState } from "../types";
import {
	applyEntityDeployed,
	type DeployIntent,
	handleDeployIntent,
} from "./deploy";

export interface DeployFromPoolAction {
	type: "DEPLOY_FROM_POOL";
	columnIndex: number;
}

export function handleDeployFromPool(
	state: GameState,
	action: DeployFromPoolAction,
) {
	const column = state.pool.columns[action.columnIndex];
	if (!column || column.entities.length === 0) {
		return [{ type: "DEPLOY_BLOCKED", reason: "No entity in column" }];
	}

	const entityId = column.entities[0];

	const intent: DeployIntent = {
		type: "DEPLOY_ENTITY",
		entityId,
		source: "pool",
		sourceIndex: action.columnIndex,
	};

	const events = handleDeployIntent(state, intent);

	// Apply events to state
	for (const event of events) {
		if (event.type === "ENTITY_DEPLOYED") {
			applyEntityDeployed(state, event);
		}
	}

	return events;
}
