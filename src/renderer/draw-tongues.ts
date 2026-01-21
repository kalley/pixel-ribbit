// renderer/draw-tongues.ts

import type { GameState } from "../engine/types";
import type { GridLayout } from "./calculate-grid-layout";
import { getEntityVisualPosition } from "./path-interpolation";
import type { RenderContext, TongueAnimation } from "./render-context";
import { getTongueProgress } from "./render-context";

function drawTongue(
	ctx: CanvasRenderingContext2D,
	tongue: TongueAnimation,
	currentTime: number,
	state: GameState,
	gridLayout: GridLayout,
) {
	if (!state.path.entities.some((entityId) => entityId === tongue.entityId)) {
		return;
	}

	const entity = state.entityRegistry[tongue.entityId];
	if (!entity) return;

	const { phase, progress } = getTongueProgress(tongue, currentTime);

	if (phase === "done") return;

	// Get frog's current visual position
	const frogPos = getEntityVisualPosition(
		entity.position.index,
		entity.position.timeAtPosition,
		state.constraints.msPerSegment,
		state.path.segments,
		gridLayout,
	);

	// Calculate pixel position
	const { pixelSize, gap, offsetX, offsetY } = gridLayout;
	const pixelX = offsetX + tongue.targetCol * (pixelSize + gap) + pixelSize / 2;
	const pixelY = offsetY + tongue.targetRow * (pixelSize + gap) + pixelSize / 2;

	// Interpolate tongue tip position based on phase
	let tongueProgress = progress;

	if (phase === "extend") {
		// Ease out for natural extension
		tongueProgress = 1 - (1 - progress) ** 3;
	} else if (phase === "retract") {
		// Ease in for snappy retraction
		tongueProgress = progress ** 2;
	}

	const tongueTipX = frogPos.x + (pixelX - frogPos.x) * tongueProgress;
	const tongueTipY = frogPos.y + (pixelY - frogPos.y) * tongueProgress;

	// Draw tongue
	ctx.save();

	// Tongue line
	ctx.strokeStyle = "#ff69b4"; // Or use entity color
	ctx.lineWidth = 2;
	ctx.lineCap = "round";

	ctx.beginPath();
	ctx.moveTo(frogPos.x, frogPos.y);
	ctx.lineTo(tongueTipX, tongueTipY);
	ctx.stroke();

	// Tongue tip (bigger during hold phase)
	const tipSize = phase === "hold" ? 4 : 2;
	ctx.fillStyle = "#ff1493";
	ctx.beginPath();
	ctx.arc(tongueTipX, tongueTipY, tipSize, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
}

export function drawTongues(
	ctx: CanvasRenderingContext2D,
	renderContext: RenderContext,
	state: GameState,
) {
	// console.log(
	// 	state.elapsedTime,
	// 	Object.fromEntries(renderContext.activeTongues.entries()),
	// );
	for (const [_entityId, tongue] of renderContext.activeTongues) {
		drawTongue(ctx, tongue, state.elapsedTime, state, renderContext.gridLayout);
	}
}
