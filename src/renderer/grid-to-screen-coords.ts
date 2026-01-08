import type { GridLayout } from "./calculate-grid-layout";

export function gridToScreenCoords(
	gridX: number,
	gridY: number,
	layout: GridLayout,
): { x: number; y: number } {
	const stride = layout.pixelSize + layout.gap;

	return {
		x: layout.offsetX + gridX * stride, // top-left, not center
		y: layout.offsetY + gridY * stride,
	};
}
