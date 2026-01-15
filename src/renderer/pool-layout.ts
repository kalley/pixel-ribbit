import { FEEDER_CELL_SIZE, FROG_SIZE } from "../constants";
import type { LayoutFrame } from "../viewport";

export function getPoolEntityPosition(
	columnIndex: number,
	rowIndex: number,
	layout: LayoutFrame["feeder"],
): { x: number; y: number } {
	const x = layout.columnPositions[columnIndex] + FEEDER_CELL_SIZE / 2;
	const y = layout.y + rowIndex * (FROG_SIZE + 5);

	return { x, y };
}
