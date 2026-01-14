export type GridLayout = {
	pixelSize: number;
	gap: number;
	gridPadding: number;
	offsetX: number;
	offsetY: number;
	gridSize: number; // e.g., 32, 64, 128
};

export function calculateGridLayout(
	targetSize: number,
	gridSize: number,
	offsetX: number,
	offsetY: number,
	gapRatio = 0.1,
): GridLayout {
	const numGaps = gridSize - 1;
	const pixelSize = targetSize / (gridSize + gapRatio * numGaps);
	const gap = pixelSize * gapRatio;
	const totalGridSize = pixelSize * gridSize + gap * numGaps;
	const gridPadding = (targetSize - totalGridSize) / 2;

	return {
		pixelSize,
		gap,
		gridPadding,
		offsetX: offsetX + gridPadding,
		offsetY: offsetY + gridPadding,
		gridSize,
	};
}
