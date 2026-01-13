import flowerUrl from "../assets/lily_flower.png";
import { CORE_CONTENT_SIZE, CORE_X, STREAM_WIDTH } from "../constants";
import { loadImage } from "../utils/load-image";
import type { LayoutFrame } from "../viewport";
import { leaf } from "./draw-lily-pad";

const flower = loadImage(flowerUrl);

export function drawLily(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame["core"],
	occupied = 0,
	leaves = 5,
) {
	// Calculate center position once
	const centerX = CORE_X + STREAM_WIDTH / 2;
	const centerY = layout.y + CORE_CONTENT_SIZE - STREAM_WIDTH / 2;

	for (let i = 0; i < leaves - occupied; i++) {
		const leafImg = leaf.get();
		if (!leafImg) continue;

		const sW = leafImg.width;
		const sH = leafImg.height;
		const dW = STREAM_WIDTH;
		const dH = sH * (dW / sW);
		const angle = (i * Math.PI * 2) / leaves;
		const radius = dW * 0.5;

		const leafX = centerX + Math.cos(angle) * radius;
		const leafY = centerY + Math.sin(angle) * radius;

		ctx.save();
		ctx.translate(leafX, leafY);
		ctx.rotate(angle);
		ctx.drawImage(leafImg, -dW / 2, -dH / 2, dW, dH);
		ctx.restore();
	}

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
