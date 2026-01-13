// engine/path.ts (new file for path logic)

import type { GridPosition } from "./types";

export interface PathSegment {
	gridPosition: GridPosition; // Where on the grid this path position maps to
	edge: "top" | "right" | "bottom" | "left";
	facing: "north" | "south" | "east" | "west";
}

/**
 * Generate the complete path around a grid perimeter
 * Returns array where index = path position
 */
export function generateGridPath(width: number, height: number): PathSegment[] {
	const path: PathSegment[] = [];

	// Bottom edge (left to right)
	for (let x = 0; x < width; x++) {
		path.push({
			gridPosition: { row: height - 1, col: x },
			edge: "bottom",
			facing: "north",
		});
	}

	// Right edge (bottom to top)
	for (let y = height - 1; y >= 0; y--) {
		path.push({
			gridPosition: { row: y, col: width - 1 },
			edge: "right",
			facing: "west",
		});
	}

	// Top edge (right to left)
	for (let x = width - 1; x >= 0; x--) {
		path.push({
			gridPosition: { row: 0, col: x },
			edge: "top",
			facing: "south",
		});
	}

	// Left edge (top to bottom, excluding last to avoid duplicate with start)
	for (let y = 0; y < height - 1; y++) {
		path.push({
			gridPosition: { row: y, col: 0 },
			edge: "left",
			facing: "east",
		});
	}

	return path;
}

export function getNextPathPosition(
	currentIndex: number,
	pathLength: number,
): number | null {
	const next = currentIndex + 1;
	if (next >= pathLength) {
		return null; // Completed loop
	}
	return next;
}

export function getPathSegment(
	pathIndex: number,
	path: PathSegment[],
): PathSegment | null {
	return path[pathIndex] ?? null;
}

export function isCornerTransition(
	current: PathSegment,
	next: PathSegment,
): boolean {
	return current.edge !== next.edge;
}
