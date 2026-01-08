function buildFrogSprite({
	maskImg,
	lightingImg,
	outlineImg,
	color, // [r, g, b]
	targetSize = 128,
}: {
	maskImg: HTMLImageElement;
	lightingImg: HTMLImageElement;
	outlineImg: HTMLImageElement;
	color: [number, number, number];
	targetSize?: number;
}): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = targetSize;
	canvas.height = targetSize;

	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("Failed to get 2D context");

	ctx.clearRect(0, 0, targetSize, targetSize);

	// 1. Draw silhouette
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(maskImg, 0, 0, targetSize, targetSize);

	// 2. Fill silhouette with color
	ctx.globalCompositeOperation = "source-in";
	ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
	ctx.fillRect(0, 0, targetSize, targetSize);

	// 3. Apply lighting
	ctx.globalCompositeOperation = "multiply";
	ctx.drawImage(lightingImg, 0, 0, targetSize, targetSize);

	// 4. Draw outline
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(outlineImg, 0, 0, targetSize, targetSize);

	return canvas;
}

export function createFrogSpriteFactory({
	maskImg,
	lightingImg,
	outlineImg,
}: {
	maskImg: HTMLImageElement;
	lightingImg: HTMLImageElement;
	outlineImg: HTMLImageElement;
}) {
	const cache = new Map<string, HTMLCanvasElement>();

	return function getFrogSprite(color: [number, number, number]) {
		const key = `${color[0]},${color[1]},${color[2]}`;

		let sprite = cache.get(key);
		if (!sprite) {
			sprite = buildFrogSprite({
				maskImg,
				lightingImg,
				outlineImg,
				color,
			});
			cache.set(key, sprite);
		}

		return sprite;
	};
}
