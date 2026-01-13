import type { GameGrid } from "../engine/types";
import { GLOBAL_PALLETE } from "../game/color";
import type { GridLayout } from "./calculate-grid-layout";

export function drawGameGrid({
	ctx,
	grid,
	layout,
}: {
	ctx: CanvasRenderingContext2D;
	grid: GameGrid;
	layout: GridLayout;
}) {
	for (let y = 0; y < grid.resources.length; y++) {
		for (let x = 0; x < grid.resources[y].length; x++) {
			const pixel = grid.resources[y][x];

			if (!pixel.alive) continue; // Skip cleared pixels

			const color = GLOBAL_PALLETE[pixel.type]; // Look up from palette
			ctx.fillStyle = color.css;
			const screenX = layout.offsetX + x * (layout.pixelSize + layout.gap);
			const screenY = layout.offsetY + y * (layout.pixelSize + layout.gap);
			ctx.fillRect(screenX, screenY, layout.pixelSize, layout.pixelSize);
		}
	}
}
