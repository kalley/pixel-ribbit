import flowerUrl from "../assets/lily_flower.png";
import { CORE_CONTENT_SIZE, CORE_X, STREAM_WIDTH } from "../constants";
import { loadImage } from "../utils/load-image";
import type { LayoutFrame } from "../viewport";

const flower = loadImage(flowerUrl);

export function drawLily(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame["core"],
) {
	// Calculate center position once
	const centerX = CORE_X + STREAM_WIDTH / 2;
	const centerY = layout.y + CORE_CONTENT_SIZE - STREAM_WIDTH / 2;
	const flowerImage = flower.get();

	if (!flowerImage) return;

	const sW = flowerImage.width;
	const sH = flowerImage.height;
	const dW = STREAM_WIDTH * 1.5;
	const dH = sH * (dW / sW);

	ctx.drawImage(
		flowerImage,
		centerX - dW / 2, // Center the flower
		centerY - dH / 2,
		dW,
		dH,
	);
}
