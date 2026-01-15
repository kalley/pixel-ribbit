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

	const edges = [
		{
			edge: "bottom",
			facing: "north",
			length: width,
			at: (i: number) => ({ row: height - 1, col: i }),
		},
		{
			edge: "right",
			facing: "west",
			length: height,
			at: (i: number) => ({ row: height - 1 - i, col: width - 1 }),
		},
		{
			edge: "top",
			facing: "south",
			length: width,
			at: (i: number) => ({ row: 0, col: width - 1 - i }),
		},
		{
			edge: "left",
			facing: "east",
			length: height - 1, // avoid re-adding start
			at: (i: number) => ({ row: i, col: 0 }),
		},
	] as const;

	for (const edge of edges) {
		for (let i = 0; i < edge.length; i++) {
			path.push({
				gridPosition: edge.at(i),
				edge: edge.edge,
				facing: edge.facing,
			});
		}
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
