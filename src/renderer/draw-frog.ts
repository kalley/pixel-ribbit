import lightingUrl from "../assets/frog_lighting.png";
import maskUrl from "../assets/frog_mask.png";
import outlineUrl from "../assets/frog_outline.png";
import { FROG_SIZE } from "../constants";
import type { EngineConstraints } from "../engine/constraints";
import type { PathSegment } from "../engine/path";
import { GLOBAL_PALLETE, type RGB } from "../game/color";
import type { Frog } from "../game/types";
import { loadImage } from "../utils/load-image";
import type { LayoutFrame } from "../viewport";
import type { GridLayout } from "./calculate-grid-layout";
import { getEntityVisualPosition } from "./path-interpolation";
import { getPoolEntityPosition } from "./pool-layout";
import { getWaitingAreaPosition } from "./waiting-area-layout";

export const FROG_CENTER = FROG_SIZE / 2;

const maskImg = loadImage(maskUrl);
const lightingImg = loadImage(lightingUrl);
const outlineImg = loadImage(outlineUrl);

export function buildFrogSprite({
	mask: maskImg,
	lighting: lightingImg,
	outline: outlineImg,
	color, // [r, g, b]
	targetSize = 128,
	screenMode = "multiply",
}: {
	mask: HTMLImageElement;
	lighting: HTMLImageElement;
	outline: HTMLImageElement;
	color: RGB;
	targetSize?: number;
	screenMode?: "screen" | "multiply";
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
	ctx.globalCompositeOperation = screenMode;
	ctx.drawImage(lightingImg, 0, 0, targetSize, targetSize);

	// 4. Draw outline
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(outlineImg, 0, 0, targetSize, targetSize);

	return canvas;
}

const cache = new Map<string, HTMLCanvasElement>();

function getFrogSprite(color: RGB) {
	const key = `${color[0]},${color[1]},${color[2]}`;

	let sprite = cache.get(key);
	if (!sprite) {
		const mask = maskImg.get();
		const lighting = lightingImg.get();
		const outline = outlineImg.get();

		if (!mask || !lighting || !outline) {
			return null;
		}

		sprite = buildFrogSprite({
			mask,
			lighting,
			outline,
			color,
		});
		cache.set(key, sprite);
	}

	return sprite;
}

function drawFrogSprite(
	ctx: CanvasRenderingContext2D,
	sprite: HTMLCanvasElement | null,
	position: { x: number; y: number; rotation?: number },
) {
	if (sprite) {
		ctx.save();
		ctx.translate(position.x, position.y);
		ctx.rotate(position.rotation || 0);
		ctx.drawImage(sprite, -FROG_CENTER, -FROG_CENTER, FROG_SIZE, FROG_SIZE);
		ctx.restore();
	}

	return position;
}

export function drawFrogOnPath(
	ctx: CanvasRenderingContext2D,
	frog: Frog,
	pathSegments: PathSegment[],
	constraints: EngineConstraints,
	gridLayout: GridLayout,
) {
	const visualPos = getEntityVisualPosition(
		frog.position.index,
		frog.position.ticksAtPosition,
		constraints.ticksPerSegment,
		pathSegments,
		gridLayout,
	);
	const color = GLOBAL_PALLETE[frog.resourceType];
	const sprite = getFrogSprite(color.rgb);

	return drawFrogSprite(ctx, sprite, visualPos);
}

export function drawFrogInPool(
	ctx: CanvasRenderingContext2D,
	frog: Frog,
	columnIndex: number,
	rowIndex: number,
	layout: LayoutFrame["feeder"],
) {
	const color = GLOBAL_PALLETE[frog.resourceType];
	const sprite = getFrogSprite(color.rgb);
	const pos = getPoolEntityPosition(columnIndex, rowIndex, layout);

	return drawFrogSprite(ctx, sprite, pos);
}

export function drawFrogInWaitingArea(
	ctx: CanvasRenderingContext2D,
	frog: Frog,
	slotIndex: number,
	layout: LayoutFrame["conveyorSlots"],
) {
	const color = GLOBAL_PALLETE[frog.resourceType];
	const sprite = getFrogSprite(color.rgb);
	const pos = getWaitingAreaPosition(slotIndex, layout);

	return drawFrogSprite(ctx, sprite, pos);
}
