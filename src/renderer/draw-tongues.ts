import type { GameState } from "../engine/types";
import { activeTongues } from "../ui/tongues";
import type { GridLayout } from "./calculate-grid-layout";
import { getCannonRenderPosition } from "./draw-cannons";
import { gridToScreenCoords } from "./grid-to-screen-coords";

export function drawTongues(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	layout: GridLayout,
) {
	for (const tongue of activeTongues.values()) {
		const cannon = state.cannons[tongue.cannonId];
		if (cannon.location.type !== "conveyor") continue;

		const cannonPos = getCannonRenderPosition(cannon, layout);
		if (!cannonPos) continue;

		const { x: targetX, y: targetY } = gridToScreenCoords(
			tongue.targetX,
			tongue.targetY,
			layout,
		);

		// Animation progress (0 to 1)
		const progress = (state.tick - tongue.startTick) / tongue.duration;
		const extendProgress =
			progress < 0.5
				? progress * 2 // Extend (0 to 1)
				: (1 - progress) * 2; // Retract (1 to 0)

		// Interpolate tongue tip
		const tipX = cannonPos.x + (targetX - cannonPos.x) * extendProgress;
		const tipY = cannonPos.y + (targetY - cannonPos.y) * extendProgress;

		// Draw tongue
		ctx.strokeStyle = "#EE6B9D"; // Pink tongue
		ctx.lineWidth = 2;
		ctx.lineCap = "round";

		ctx.beginPath();
		ctx.moveTo(cannonPos.x, cannonPos.y);
		ctx.lineTo(tipX, tipY);
		ctx.stroke();

		// Draw tongue tip (darker circle)
		ctx.fillStyle = "#D4548A";
		ctx.beginPath();
		ctx.arc(tipX, tipY, 2, 0, Math.PI * 2);
		ctx.fill();
	}
}
