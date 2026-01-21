// game/types.ts

import type { Entity, Resource } from "../engine/types";

// ============================================
// GAME-SPECIFIC TYPE ALIASES
// ============================================

export type Frog = Entity;
export type Pixel = Resource;

// ============================================
// FACTORY FUNCTIONS
// ============================================

export function createFrog(id: string, color: string, hunger: number): Frog {
	return {
		id,
		resourceType: color,
		capacity: hunger,
		consumed: 0,
		position: { index: 0, timeAtPosition: 0 },
		state: "waiting",
	};
}

export function createPixel(
	id: string,
	color: string,
	row: number,
	col: number,
	alive: boolean = true,
): Pixel {
	return {
		id,
		type: color,
		gridPosition: { row, col },
		alive,
	};
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFrogHunger(frog: Frog): number {
	return frog.capacity - frog.consumed;
}
