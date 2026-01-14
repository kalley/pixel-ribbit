import leafUrl from "../assets/lily_leaf.png";
import {
	CORE_CONTENT_SIZE,
	CORE_X,
	FROG_SIZE,
	STREAM_WIDTH,
} from "../constants";
import type { EngineConstraints } from "../engine/constraints";
import type { PathSegment } from "../engine/path";
import type { GameState } from "../engine/types";
import type { Frog } from "../game/types";
import { loadImage } from "../utils/load-image";
import type { LayoutFrame } from "../viewport";
import type { GridLayout } from "./calculate-grid-layout";
import { FROG_CENTER } from "./draw-frog";
import { getEntityVisualPosition } from "./path-interpolation";

export const leaf = loadImage(leafUrl);

function drawLilyPad(
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
	const leafImage = leaf.get();

	if (!leafImage) return;

	ctx.save();
	ctx.translate(visualPos.x, visualPos.y);
	ctx.rotate(visualPos.rotation);

	ctx.drawImage(leafImage, -FROG_CENTER, -FROG_CENTER, FROG_SIZE, FROG_SIZE);
	ctx.restore();
}

export function drawLilyPadsOnPath(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	gridLayout: GridLayout,
) {
	for (const frogId of state.path.entities) {
		const frog = state.entityRegistry[frogId];

		drawLilyPad(ctx, frog, state.path.segments, state.constraints, gridLayout);
	}
}

export function drawLilyPadsAtRest(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame["core"],
	amount = 5,
	occupied = 0,
) {
	const leafImg = leaf.get();

	if (!leafImg) return;

	// Calculate center position once
	const centerX = CORE_X + STREAM_WIDTH / 2;
	const centerY = layout.y + CORE_CONTENT_SIZE - STREAM_WIDTH / 2;
	const sW = leafImg.width;
	const sH = leafImg.height;
	const dW = STREAM_WIDTH;
	const dH = sH * (dW / sW);
	const radius = dW * 0.5;

	for (let i = 0; i < amount - occupied; i++) {
		const angle = (i * Math.PI * 2) / amount;

		const leafX = centerX + Math.cos(angle) * radius;
		const leafY = centerY + Math.sin(angle) * radius;

		ctx.save();
		ctx.translate(leafX, leafY);
		ctx.rotate(angle);
		ctx.drawImage(leafImg, -dW / 2, -dH / 2, dW, dH);
		ctx.restore();
	}
}
