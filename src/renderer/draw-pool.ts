import { FROG_SIZE } from "../constants";
import type { GameState } from "../engine/types";
import { getFrogHunger } from "../game/types";
import type { LayoutFrame } from "../viewport";
import { drawFrogInPool } from "./draw-frog";
import { drawOutlinedText } from "./draw-outlined-text";
import type { RenderContext } from "./render-context";

export function drawPool(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	layout: LayoutFrame["feeder"],
	renderContext: RenderContext,
) {
	const { columns } = state.pool;

	columns.forEach((column, colIndex) => {
		// Draw up to maxVisible cannons (bottom to top)
		const visibleFrogs = column.entities.slice(0, layout.actualRows);

		visibleFrogs.forEach((frogId, slotIndex) => {
			const frog = state.entityRegistry[frogId];

			const { x, y } = drawFrogInPool(ctx, frog, colIndex, slotIndex, layout);

			const isClickable = slotIndex === 0;
			ctx.globalAlpha = isClickable ? 1.0 : 0.4;

			renderContext.clickables.set(frogId, {
				x,
				y,
				radius: FROG_SIZE / 2,
				source: "pool",
				columnIndex: colIndex,
				rowIndex: slotIndex,
			});

			// Shot count
			if (slotIndex < layout.visibleRows) {
				drawOutlinedText(ctx, getFrogHunger(frog).toString(), x, y + 4);
			}
			ctx.globalAlpha = 1.0;
		});
	});
}
