// advanceConveyor.ts
import type { ConveyorPosition, GameEvent, GameState } from "../types";

function advancePosition(
	pos: ConveyorPosition,
	gridWidth: number,
	gridHeight: number,
): ConveyorPosition | null {
	switch (pos.edge) {
		case "bottom":
			if (pos.x < gridWidth - 1) {
				return { ...pos, x: pos.x + 1 };
			}
			return {
				x: gridWidth,
				y: gridHeight - 1,
				edge: "right",
				facing: "west",
			};

		case "right":
			if (pos.y > 0) {
				return { ...pos, y: pos.y - 1 };
			}
			return { x: gridWidth - 1, y: 0, edge: "top", facing: "south" };

		case "top":
			if (pos.x > 0) {
				return { ...pos, x: pos.x - 1 };
			}
			return { x: 0, y: 0, edge: "left", facing: "east" };

		case "left":
			if (pos.y < gridHeight - 1) {
				return { ...pos, y: pos.y + 1 };
			}
			return null; // Completed lap
	}
}

function findAvailableSlot(state: GameState): number | null {
	for (let i = 0; i < state.conveyorSlots.slots.length; i++) {
		if (state.conveyorSlots.slots[i] === null) {
			return i;
		}
	}
	return null;
}

export function advanceConveyor(state: GameState): GameEvent[] {
	const events: GameEvent[] = [];

	const { width, height } = state.grid;

	// Advance each cannon on the belt
	for (const cannonId of [...state.conveyor.cannonsOnBelt]) {
		const cannon = state.cannons[cannonId];
		if (cannon.location.type !== "conveyor") continue;

		cannon.location.ticksOnBelt++;

		const newPosition = advancePosition(
			cannon.location.position,
			width,
			height,
		);

		if (newPosition === null) {
			// Cannon completed lap
			events.push({
				type: "CANNON_COMPLETED_LAP",
				cannonId,
			});

			// Try to find available slot
			const availableSlot = findAvailableSlot(state);

			if (availableSlot !== null) {
				// Park in slot
				state.conveyor.cannonsOnBelt = state.conveyor.cannonsOnBelt.filter(
					(id) => id !== cannonId,
				);
				state.conveyorSlots.slots[availableSlot] = cannonId;
				cannon.location = { type: "slot", slotIndex: availableSlot };

				events.push({
					type: "CANNON_ENTERED_SLOT",
					cannonId,
					slot: availableSlot,
				});
			} else {
				// No slot available - GAME OVER
				state.status = "lost";
				events.push({ type: "GAME_LOST" });
			}
		} else {
			// Continue moving
			cannon.location.position = newPosition;
		}
	}

	return events;
}
