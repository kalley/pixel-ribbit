// engine/events/deploy.ts

import type { EntityId, GameState } from "../types";

export interface DeployIntent {
	type: "DEPLOY_ENTITY";
	entityId: EntityId;
	source: "pool" | "waiting_area";
	sourceIndex: number;
}

export interface EntityDeployedEvent {
	type: "ENTITY_DEPLOYED";
	entityId: EntityId;
	fromSource: "pool" | "waiting_area";
}

export interface DeployBlockedEvent {
	type: "DEPLOY_BLOCKED";
	reason: string;
}

function getInitialPathPosition(): number {
	return -1; // Always start at beginning of path
}

function isEntryPositionClear(state: GameState): boolean {
	return state.path.entities.every((entityId) => {
		const entity = state.entityRegistry[entityId];
		const distance = entity.position.index;

		return distance >= state.grid.width / 4;
	});
}

export function handleDeployIntent(
	state: GameState,
	intent: DeployIntent,
): (EntityDeployedEvent | DeployBlockedEvent)[] {
	// Validate using constraints
	const canDeploy = state.validator.canDeployEntity(state);
	if (!canDeploy.valid) {
		return [{ type: "DEPLOY_BLOCKED", reason: canDeploy.reason }];
	}

	// Check entry position
	if (!isEntryPositionClear(state)) {
		return [{ type: "DEPLOY_BLOCKED", reason: "Entry position occupied" }];
	}

	// Get entity from registry
	const entity = state.entityRegistry[intent.entityId];
	if (!entity) {
		return [{ type: "DEPLOY_BLOCKED", reason: "Entity not found" }];
	}

	// Verify entity is in the correct source
	if (intent.source === "pool") {
		const column = state.pool.columns[intent.sourceIndex];
		if (!column || column.entities[0] !== intent.entityId) {
			return [
				{ type: "DEPLOY_BLOCKED", reason: "Entity not at front of column" },
			];
		}
	} else {
		const waitingEntityId = state.waitingArea.entities[intent.sourceIndex];
		if (!waitingEntityId || waitingEntityId !== intent.entityId) {
			return [
				{ type: "DEPLOY_BLOCKED", reason: "Entity not in waiting area slot" },
			];
		}
	}

	// Intent is valid, emit success event
	return [
		{
			type: "ENTITY_DEPLOYED",
			entityId: intent.entityId,
			fromSource: intent.source,
		},
	];
}

// State mutation happens in response to events
export function applyEntityDeployed(
	state: GameState,
	event: EntityDeployedEvent,
): void {
	const entity = state.entityRegistry[event.entityId];

	// Update entity state
	entity.position = {
		index: getInitialPathPosition(),
		timeAtPosition: state.constraints.msPerSegment,
	};
	entity.state = "moving";

	// Add to path
	state.path.entities.push(entity.id);

	// Remove from source
	if (event.fromSource === "pool") {
		// Find which column and remove
		for (const column of state.pool.columns) {
			const idx = column.entities.indexOf(event.entityId);
			if (idx === 0) {
				column.entities.shift();
				break;
			}
		}
	} else {
		// Remove from waiting area
		for (let i = 0; i < state.waitingArea.entities.length; i++) {
			if (state.waitingArea.entities[i] === event.entityId) {
				state.waitingArea.entities[i] = null;

				// Shift entities up (compact the waiting area)
				for (let j = i; j < state.waitingArea.entities.length - 1; j++) {
					state.waitingArea.entities[j] = state.waitingArea.entities[j + 1];
				}
				state.waitingArea.entities[state.waitingArea.entities.length - 1] =
					null;
				break;
			}
		}
	}

	// Update debug info
	state._debug.lastDeployTime = state.elapsedTime;
}
