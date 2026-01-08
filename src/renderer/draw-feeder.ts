import { FEEDER_CELL_SIZE, FROG_SIZE } from "../constants";
import type { RGB } from "../domain/color";
import type { Level } from "../domain/level";
import type { GameState } from "../engine/types";
import { clickables } from "../ui/clickables";
import type { LayoutFrame } from "../viewport";
import { drawOutlinedText } from "./draw-outlined-text";

export function drawFeeder(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	level: Level,
	layout: LayoutFrame["feeder"],
	factory: (color: RGB) => HTMLCanvasElement,
) {
	const { columns } = state.feeder;

	columns.forEach((column, colIndex) => {
		const colX = layout.columnPositions[colIndex];

		// Draw up to maxVisible cannons (bottom to top)
		const visibleCannons = column.cannons.slice(0, column.maxVisible);

		visibleCannons.forEach((cannonId, slotIndex) => {
			const cannon = state.cannons[cannonId];
			const color = level.palette[cannon.color];

			const x = colX + FEEDER_CELL_SIZE / 2;
			const y = layout.y + slotIndex * (FROG_SIZE + 5);

			ctx.drawImage(
				factory(color.rgb),
				x - FROG_SIZE / 2,
				y - FROG_SIZE / 2,
				FROG_SIZE,
				FROG_SIZE,
			);

			const isClickable = slotIndex === 0;
			ctx.globalAlpha = isClickable ? 1.0 : 0.4;

			clickables.set(cannonId, {
				x,
				y,
				radius: FROG_SIZE / 2,
				source: "feeder",
				columnIndex: colIndex,
				rowIndex: slotIndex,
			});

			// Shot count
			drawOutlinedText(ctx, cannon.shotsRemaining.toString(), x, y + 4);
			ctx.globalAlpha = 1.0;
		});
	});
}
