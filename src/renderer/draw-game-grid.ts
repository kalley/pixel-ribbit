import type { Palette } from "../domain/color";
import type { Grid } from "../domain/Grid";
import type { GridLayout } from "./calculate-grid-layout";

export function drawGameGrid({
	ctx,
	grid,
	layout,
	palette,
}: {
	ctx: CanvasRenderingContext2D;
	grid: Grid;
	layout: GridLayout;
	palette: Palette;
}) {
	for (let y = 0; y < grid.pixels.length; y++) {
		for (let x = 0; x < grid.pixels[y].length; x++) {
			const pixel = grid.pixels[y][x];

			if (!pixel.alive) continue; // Skip cleared pixels

			const color = palette[pixel.colorId]; // Look up from palette
			ctx.fillStyle = color.css;
			const screenX = layout.offsetX + x * (layout.pixelSize + layout.gap);
			const screenY = layout.offsetY + y * (layout.pixelSize + layout.gap);
			ctx.fillRect(screenX, screenY, layout.pixelSize, layout.pixelSize);
		}
	}
}
