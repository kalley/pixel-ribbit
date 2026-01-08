import type { GridLayout } from "./calculate-grid-layout";

export function getGridVisualBounds(layout: GridLayout) {
	const stride = layout.pixelSize + layout.gap;
	const size = layout.gridSize * stride - layout.gap;

	// Treat offsetX/Y as the top-left of the first cell
	return {
		x: layout.offsetX,
		y: layout.offsetY,
		width: size,
		height: size,
	};
}
