import type {
	ConveyorSlots,
	GameEvent,
	GameState,
	PlayerAction,
} from "../types";
import {
	deployCannonToConveyor,
	deployedToConveyorEvent,
	isEntryClear,
} from "./deploy";

function consumeFromSlot(slots: ConveyorSlots, slotIndex: number) {
	const slot = slots.slots[slotIndex];
	if (!slot) return;

	// Remove cannon from the deployed slot
	slots.slots[slotIndex] = null;

	// Shift all frogs after this slot to the left (up in visual terms)
	for (let i = slotIndex; i < slots.slots.length - 1; i++) {
		slots.slots[i] = slots.slots[i + 1];
	}

	// Clear the last slot (it's now empty after shifting)
	slots.slots[slots.slots.length - 1] = null;
}

export function handleDeployFromSlot(
	state: GameState,
	action: Extract<PlayerAction, { type: "DEPLOY_FROM_SLOT" }>,
): GameEvent[] {
	const cannonId = state.conveyorSlots.slots[action.slotIndex];
	if (!cannonId) {
		throw new Error("Slot is empty");
	}

	if (state.conveyor.cannonsOnBelt.length >= state.conveyor.capacity) {
		throw new Error("Conveyor is at capacity");
	}

	if (!isEntryClear(state)) {
		throw new Error("Entry is not clear");
	}

	const cannon = state.cannons[cannonId];

	deployCannonToConveyor(state, cannon);
	consumeFromSlot(state.conveyorSlots, action.slotIndex);

	return [deployedToConveyorEvent(cannonId)];
}
