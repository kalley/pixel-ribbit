// engine/events/movement.ts

import type { ConsumeCheckResult } from "../constraints";
import {
	getNextPathPosition,
	getPathSegment,
	isCornerTransition,
} from "../path";
import type { Entity, GameState, GridPosition } from "../types";

export interface EntityMovingEvent {
	type: "ENTITY_MOVING";
	entityId: string;
	fromIndex: number;
	toIndex: number;
	consumeIntent: ConsumeCheckResult;
}

export interface EntityCompletedLoopEvent {
	type: "ENTITY_COMPLETED_LOOP";
	entityId: string;
	satisfied: boolean; // Did it eat enough?
}

export interface EntityToWaitingAreaEvent {
	type: "ENTITY_TO_WAITING_AREA";
	entityId: string;
	slotIndex: number;
}

export interface ResourceConsumedEvent {
	type: "RESOURCE_CONSUMED";
	resourceId: string;
	entityId: string;
	atPosition: number;
	position?: GridPosition;
}

export interface EntityExhaustedEvent {
	type: "ENTITY_EXHAUSTED";
	entityId: string;
}

export interface GameLostEvent {
	type: "GAME_LOST";
	reason: string;
}

/**
 * Advance all entities on the path by one tick
 */
export function advancePathEntities(state: GameState): GameEvent[] {
	const events: GameEvent[] = [];

	for (const entityId of [...state.path.entities]) {
		const entity = state.entityRegistry[entityId];
		const currentSegment = state.path.segments[entity.position.index];
		const nextSegment = state.path.segments[entity.position.index + 1];
		entity.position.ticksAtPosition++;

		// Determine how many ticks needed for this segment
		// Corners take 2x as long to give smoother visual interpolation
		const isAtCorner =
			currentSegment &&
			nextSegment &&
			isCornerTransition(currentSegment, nextSegment);
		const ticksNeeded = isAtCorner
			? state.constraints.ticksPerSegment * 3
			: state.constraints.ticksPerSegment;

		// Check if entity should move to next position
		if (entity.position.ticksAtPosition >= ticksNeeded) {
			const moveEvents = handleEntityMovement(state, entity);
			events.push(...moveEvents);
		}
	}

	// Check for victory mode
	if (state.status === "playing") {
		const victoryCheck = state.validator.canEnterVictoryMode(state);
		if (victoryCheck.canEnter) {
			events.push({ type: "VICTORY_MODE_TRIGGERED" });
		}
	}

	// Check for win
	if (state.validator.isGameWon(state)) {
		events.push({ type: "GAME_WON" });
	}

	return events;
}

function handleEntityMovement(state: GameState, entity: Entity): GameEvent[] {
	const events: GameEvent[] = [];
	const currentIndex = entity.position.index;
	const nextIndex = getNextPathPosition(
		currentIndex,
		state.path.segments.length,
	);

	if (nextIndex === null) {
		// Completed loop
		return handleLoopCompletion(state, entity);
	}

	// Look ahead to see if entity will consume at next position
	const nextSegment = getPathSegment(nextIndex, state.path.segments);
	if (!nextSegment) {
		return events; // Shouldn't happen, but safety
	}

	const consumeCheck = state.validator.willEntityConsume(
		entity,
		nextSegment.gridPosition,
		state.grid,
		nextSegment.facing,
	);

	// Emit movement event with lookahead info
	events.push({
		type: "ENTITY_MOVING",
		entityId: entity.id,
		fromIndex: currentIndex,
		toIndex: nextIndex,
		consumeIntent: consumeCheck,
	});

	return events;
}

function handleLoopCompletion(state: GameState, entity: Entity): GameEvent[] {
	const events: GameEvent[] = [];
	const satisfied = entity.consumed >= entity.capacity;

	events.push({
		type: "ENTITY_COMPLETED_LOOP",
		entityId: entity.id,
		satisfied,
	});

	if (satisfied || state.status === "victory_mode") {
		// Entity can be removed (either satisfied or victory mode loops)
		return events;
	}

	// Unsatisfied entity must go to waiting area
	const canWait = state.validator.shouldEntityWait(entity, state);
	const hasSpace = state.validator.canAcceptWaitingEntity(state);

	if (!canWait.valid || !hasSpace.valid) {
		let reason = "";

		if (hasSpace.valid && !canWait.valid) {
			reason = canWait.reason;
		} else if (!hasSpace.valid) {
			reason = hasSpace.reason;
		}
		// Game over - no space in waiting area
		events.push({
			type: "GAME_LOST",
			reason,
		});
		return events;
	}

	// Find available slot
	const slotIndex = state.waitingArea.entities.indexOf(null);
	if (slotIndex === -1) {
		events.push({
			type: "GAME_LOST",
			reason: "No waiting area slot available",
		});
		return events;
	}

	events.push({
		type: "ENTITY_TO_WAITING_AREA",
		entityId: entity.id,
		slotIndex,
	});

	return events;
}

/**
 * Apply movement events to state
 */
export function applyEntityMoving(
	state: GameState,
	event: EntityMovingEvent,
): void {
	const entity = state.entityRegistry[event.entityId];

	// Update position
	entity.position = {
		index: event.toIndex,
		ticksAtPosition: 0,
	};

	entity.state = event.consumeIntent.willConsume ? "dwelling" : "moving";

	// If entity is dwelling and will consume, handle mid-dwell consumption
	// This happens after tongue extends (at ticksAtPosition ~= ticksPerSegment / 2)
	// For now, we'll consume immediately on arrival
	// TODO: Split this into extend/consume/retract phases
	const consumeIntent = event.consumeIntent;

	if (consumeIntent.willConsume && consumeIntent.resource) {
		const consumeEvent: ResourceConsumedEvent = {
			type: "RESOURCE_CONSUMED",
			resourceId: consumeIntent.resource.id,
			entityId: event.entityId,
			atPosition: event.toIndex,
			position: consumeIntent.targetPosition,
		};

		applyResourceConsumed(state, consumeEvent);

		if (consumeIntent.willExhaust) {
			const exhaustedEvent: EntityExhaustedEvent = {
				type: "ENTITY_EXHAUSTED",
				entityId: event.entityId,
			};
			applyEntityExhausted(state, exhaustedEvent);
		}
	}
}

export function applyResourceConsumed(
	state: GameState,
	event: ResourceConsumedEvent,
): void {
	const resource =
		state.grid.resources[event.position?.row ?? -1]?.[
			event.position?.col ?? -1
		];
	if (!resource || !resource.alive) return;

	resource.alive = false;

	const entity = state.entityRegistry[event.entityId];
	entity.consumed++;
}

export function applyEntityCompletedLoop(
	state: GameState,
	event: EntityCompletedLoopEvent,
): void {
	const entity = state.entityRegistry[event.entityId];

	if (event.satisfied || state.status === "victory_mode") {
		// Remove from path
		state.path.entities = state.path.entities.filter(
			(e) => e !== event.entityId,
		);
		entity.state = "waiting"; // Or could be 'removed'
	}
	// If not satisfied and not victory mode, entity will be moved to waiting area
	// by the ENTITY_TO_WAITING_AREA event
}

export function applyEntityToWaitingArea(
	state: GameState,
	event: EntityToWaitingAreaEvent,
): void {
	const entity = state.entityRegistry[event.entityId];

	// Remove from path
	state.path.entities = state.path.entities.filter((e) => e !== event.entityId);

	// Add to waiting area
	state.waitingArea.entities[event.slotIndex] = entity.id;
	entity.state = "waiting";
}

function applyEntityExhausted(
	state: GameState,
	event: EntityExhaustedEvent,
): void {
	const entity = state.entityRegistry[event.entityId];

	// Remove from path
	state.path.entities = state.path.entities.filter((e) => e !== event.entityId);

	entity.state = "waiting";
}

export function applyGameLost(state: GameState, _event: GameLostEvent): void {
	state.status = "lost";
}

export function applyVictoryMode(state: GameState): void {
	state.status = "victory_mode";
}

export function applyGameWon(state: GameState): void {
	state.status = "won";
}

export type GameEvent =
	| EntityMovingEvent
	| EntityCompletedLoopEvent
	| EntityToWaitingAreaEvent
	| ResourceConsumedEvent
	| GameLostEvent
	| { type: "VICTORY_MODE_TRIGGERED" }
	| { type: "GAME_WON" };
