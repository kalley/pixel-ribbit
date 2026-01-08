// resolveFiring.ts
import type { ColorId } from "../../domain/color";
import type { Pixel } from "../../domain/Pixel";
import type { ConveyorPosition, GameEvent, GameState } from "../types";

export function getTargetPixel(
	pos: ConveyorPosition,
	colorId: ColorId,
	grid: Pixel[][],
): { pixel: Pixel; x: number; y: number } | null {
	let dx = 0;
	let dy = 0;

	// Get direction vector
	switch (pos.facing) {
		case "north":
			dy = -1;
			break;
		case "south":
			dy = 1;
			break;
		case "east":
			dx = 1;
			break;
		case "west":
			dx = -1;
			break;
	}

	// Raycast from cannon position into grid
	let x = dx > 0 ? Math.min(0, pos.x + dx) : pos.x + dx;
	let y = dy > 0 ? Math.min(0, pos.y + dy) : pos.y + dy;

	while (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
		const pixel = grid[y][x];

		// Found first alive pixel in this direction
		if (pixel.alive) {
			// Only hit if color matches
			return pixel.colorId === colorId ? { pixel, x, y } : null;
		}

		// Keep searching deeper into grid
		x += dx;
		y += dy;
	}

	return null; // Nothing alive in this column/row
}

function removeExhaustedCannon(state: GameState, cannonId: string) {
	const cannon = state.cannons[cannonId];

	// Remove from wherever it is
	if (cannon.location.type === "conveyor") {
		state.conveyor.cannonsOnBelt = state.conveyor.cannonsOnBelt.filter(
			(id) => id !== cannonId,
		);
	} else if (cannon.location.type === "slot") {
		state.conveyorSlots.slots[cannon.location.slotIndex] = null;
	}

	// Mark as removed
	cannon.location = { type: "feeder" };
}

export function resolveFiring(state: GameState): GameEvent[] {
	const events: GameEvent[] = [];

	// Only cannons on the conveyor fire
	for (const cannonId of state.conveyor.cannonsOnBelt) {
		const cannon = state.cannons[cannonId];

		if (cannon.shotsRemaining === 0) continue;
		if (cannon.location.type !== "conveyor") continue;

		const target = getTargetPixel(
			cannon.location.position,
			cannon.color,
			state.grid.pixels,
		);

		// Only fire if target exists, is alive, and matches color
		if (target) {
			target.pixel.alive = false;
			cannon.shotsRemaining--;

			events.push({
				type: "PIXEL_CLEARED",
				cannonId,
				position: {
					x: target.x,
					y: target.y,
				},
				color: cannon.color,
			});

			if (cannon.shotsRemaining === 0) {
				removeExhaustedCannon(state, cannonId);
				events.push({
					type: "CANNON_EXHAUSTED",
					cannonId,
				});
			}
		}
	}

	return events;
}
