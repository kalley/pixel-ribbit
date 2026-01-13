import { FEEDER_CELL_SIZE, SLOT_PADDING, SLOT_SIZE } from "../constants";
import type { LayoutFrame } from "../viewport";

const STROKE_WIDTH = 2;

export function getWaitingAreaPosition(
	slotIndex: number,
	layout: LayoutFrame["conveyorSlots"],
): { x: number; y: number } {
	const offset = STROKE_WIDTH / 2;
	const x = layout.slotPositions[slotIndex] + FEEDER_CELL_SIZE / 2;
	const y = SLOT_PADDING + layout.y - offset + SLOT_SIZE / 2 + 5;

	return { x, y };
}
