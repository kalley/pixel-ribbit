// renderer/path-interpolation.ts

import { GRID_PADDING, GRID_SIZE, STREAM_WIDTH } from "../constants";
import type { PathSegment } from "../engine/path";
import { clamp } from "../utils/clamp";
import type { GridLayout } from "./calculate-grid-layout";

export interface VisualPosition {
	x: number;
	y: number;
	rotation: number; // radians
}

/**
 * Get the center point of the stream at a given path segment
 */
function getStreamCenter(
	segment: PathSegment,
	gridLayout: GridLayout,
): { x: number; y: number } {
	const { pixelSize, gap, offsetX, offsetY } = gridLayout;

	const col = segment.gridPosition.col;
	const row = segment.gridPosition.row;

	// Calculate pixel position on grid
	const pixelX = offsetX + col * (pixelSize + gap);
	const pixelY = offsetY + row * (pixelSize + gap);
	const pixelCenterX = pixelX + pixelSize / 2;
	const pixelCenterY = pixelY + pixelSize / 2;

	// Offset to stream center based on edge
	switch (segment.edge) {
		case "bottom":
			return {
				x: pixelCenterX,
				y: offsetY + GRID_SIZE + GRID_PADDING + STREAM_WIDTH / 2,
			};
		case "right":
			return {
				x: offsetX + GRID_SIZE + GRID_PADDING + STREAM_WIDTH / 2,
				y: pixelCenterY,
			};
		case "top":
			return {
				x: pixelCenterX,
				y: offsetY - GRID_PADDING - STREAM_WIDTH / 2,
			};
		case "left":
			return {
				x: offsetX - GRID_PADDING - STREAM_WIDTH / 2,
				y: pixelCenterY,
			};
	}
}

/**
 * Convert facing direction to rotation angle
 */
function getFacingAngle(facing: PathSegment["facing"]): number {
	switch (facing) {
		case "west":
			return -Math.PI / 2;
		case "north":
			return 0;
		case "east":
			return Math.PI / 2;
		case "south":
			return Math.PI;
	}
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/**
 * Angle interpolation (handles wrapping)
 */
function lerpAngle(a: number, b: number, t: number): number {
	let diff = b - a;

	// Normalize to [-π, π]
	while (diff > Math.PI) diff -= 2 * Math.PI;
	while (diff < -Math.PI) diff += 2 * Math.PI;

	return a + diff * t;
}

/**
 * Check if transitioning between two segments is a corner
 */
function isCornerTransition(current: PathSegment, next: PathSegment): boolean {
	return current.edge !== next.edge;
}

/**
 * Interpolate position along path with smooth corners
 */
function interpolatePathPosition(
	currentSegment: PathSegment,
	nextSegment: PathSegment | null,
	progress: number, // 0 to 1 within current segment
	gridLayout: GridLayout,
): VisualPosition {
	const currentCenter = getStreamCenter(currentSegment, gridLayout);
	const currentAngle = getFacingAngle(currentSegment.facing);

	// At end of path or no next segment
	if (!nextSegment) {
		return {
			x: currentCenter.x,
			y: currentCenter.y,
			rotation: currentAngle,
		};
	}

	const nextCenter = getStreamCenter(nextSegment, gridLayout);
	const nextAngle = getFacingAngle(nextSegment.facing);

	// Check if this is a corner transition
	if (isCornerTransition(currentSegment, nextSegment)) {
		const corner = getCornerPivot(currentSegment, nextSegment, gridLayout);

		if (progress < 0.5) {
			return {
				x: lerp(currentCenter.x, corner.x, progress),
				y: lerp(currentCenter.y, corner.y, progress),
				rotation: lerpAngle(currentAngle, nextAngle, progress * 0.5),
			};
		} else {
			return {
				x: lerp(corner.x, nextCenter.x, progress),
				y: lerp(corner.y, nextCenter.y, progress),
				rotation: lerpAngle(currentAngle, nextAngle, 0.5 + progress * 0.5),
			};
		}
	}

	// Linear interpolation for straight segments
	return {
		x: lerp(currentCenter.x, nextCenter.x, progress),
		y: lerp(currentCenter.y, nextCenter.y, progress),
		rotation: currentAngle,
	};
}

/**
 * Get visual position for an entity on the path
 */
export function getEntityVisualPosition(
	pathIndex: number,
	ticksAtPosition: number,
	ticksPerSegment: number,
	pathSegments: PathSegment[],
	gridLayout: GridLayout,
): VisualPosition {
	const currentSegment = pathSegments[pathIndex];
	if (!currentSegment) {
		// Fallback for invalid index
		return { x: 0, y: 0, rotation: 0 };
	}

	const nextSegment = pathSegments.at(pathIndex + 1) ?? null;
	const isCorner = nextSegment
		? isCornerTransition(currentSegment, nextSegment)
		: false;
	const ticksPerUnit = isCorner ? ticksPerSegment * 3 : ticksPerSegment;
	const segmentLength = isCorner ? Math.PI / 2 : 1;
	const distance = ticksAtPosition / ticksPerUnit;
	const progress = clamp(distance / segmentLength, 0, 1);

	if (progress < 0 || progress > 1) {
		console.warn("Progress out of bounds", progress);
	}

	return interpolatePathPosition(
		currentSegment,
		nextSegment,
		progress,
		gridLayout,
	);
}

function getCornerPivot(
	current: PathSegment,
	next: PathSegment,
	gridLayout: GridLayout,
) {
	const { offsetX, offsetY } = gridLayout;
	const maxX = offsetX + GRID_SIZE + GRID_PADDING + STREAM_WIDTH / 2;
	const minX = offsetX - GRID_PADDING - STREAM_WIDTH / 2;
	const maxY = offsetY + GRID_SIZE + GRID_PADDING + STREAM_WIDTH / 2;
	const minY = offsetY - GRID_PADDING - STREAM_WIDTH / 2;

	// bottom → right
	if (current.edge === "bottom" && next.edge === "right") {
		return { x: maxX, y: maxY };
	}

	// right → top
	if (current.edge === "right" && next.edge === "top") {
		return { x: maxX, y: minY };
	}

	// top → left
	if (current.edge === "top" && next.edge === "left") {
		return { x: minX, y: minY };
	}

	// left → bottom
	if (current.edge === "left" && next.edge === "bottom") {
		return { x: minX, y: maxY };
	}

	throw new Error(
		`Unsupported corner transition: ${current.edge} → ${next.edge}`,
	);
}
