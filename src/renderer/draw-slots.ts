import { FROG_SIZE, SLOT_PADDING, SLOT_SIZE } from "../constants";
import type { RGB } from "../domain/color";
import type { Level } from "../domain/level";
import type { GameState } from "../engine/types";
import { clickables } from "../ui/clickables";
import type { LayoutFrame } from "../viewport";
import { drawOutlinedText } from "./draw-outlined-text";

const STROKE_WIDTH = 2;

export function drawSlots(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	level: Level,
	layout: LayoutFrame["conveyorSlots"],
	factory: (color: RGB) => HTMLCanvasElement,
) {
	ctx.globalCompositeOperation = "source-over";
	state.conveyorSlots.slots.forEach((cannonId, index) => {
		const offset = STROKE_WIDTH / 2;
		const x = layout.slotPositions[index];
		const y = SLOT_PADDING + layout.y - offset;

		const slot = new Path2D();
		slot.roundRect(x, y, SLOT_SIZE, SLOT_SIZE, 10);

		// Draw slot background
		ctx.fillStyle = cannonId
			? "rgba(100, 100, 100, 0.8)"
			: "rgba(50, 50, 50, 0.5)";

		ctx.fill(slot);

		// Draw border
		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
		ctx.lineWidth = STROKE_WIDTH;
		ctx.stroke(slot);

		// Draw cannon if occupied
		if (cannonId) {
			const cannon = state.cannons[cannonId];
			const color = level.palette[cannon.color];
			const cX = x + SLOT_SIZE / 2;
			const cY = y + SLOT_SIZE / 2 + 5;

			ctx.drawImage(
				factory(color.rgb),
				cX - FROG_SIZE / 2,
				cY - FROG_SIZE / 2,
				FROG_SIZE,
				FROG_SIZE,
			);

			clickables.set(cannonId, {
				x: cX,
				y: cY,
				radius: FROG_SIZE / 2,
				source: "slot",
				slotIndex: index,
			});

			// Shot count
			drawOutlinedText(ctx, cannon.shotsRemaining.toString(), cX, cY);
		}
	});
}
