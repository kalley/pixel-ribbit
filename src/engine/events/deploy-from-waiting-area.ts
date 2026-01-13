// engine/events/deploy-from-slot.ts

import type { GameState } from "../types";
import {
	applyEntityDeployed,
	type DeployIntent,
	handleDeployIntent,
} from "./deploy";

export interface DeployFromWaitingAreaAction {
	type: "DEPLOY_FROM_WAITING_AREA";
	slotIndex: number;
}

export function handleDeployFromWaitingArea(
	state: GameState,
	action: DeployFromWaitingAreaAction,
) {
	const entityId = state.waitingArea.entities[action.slotIndex];
	if (!entityId) {
		return [{ type: "DEPLOY_BLOCKED", reason: "Slot is empty" }];
	}

	const intent: DeployIntent = {
		type: "DEPLOY_ENTITY",
		entityId,
		source: "waiting_area",
		sourceIndex: action.slotIndex,
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
