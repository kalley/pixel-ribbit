import { FROG_SIZE, SLOT_PADDING, SLOT_SIZE } from "../constants";
import type { GameState } from "../engine/types";
import { getFrogHunger } from "../game/types";
import type { LayoutFrame } from "../viewport";
import { drawFrogInWaitingArea } from "./draw-frog";
import { drawOutlinedText } from "./draw-outlined-text";
import type { RenderContext } from "./render-context";

const STROKE_WIDTH = 2;

export function drawSlots(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	layout: LayoutFrame["conveyorSlots"],
	renderContext: RenderContext,
) {
	ctx.globalCompositeOperation = "source-over";
	state.waitingArea.entities.forEach((frogId, index) => {
		const offset = STROKE_WIDTH / 2;
		const x = layout.slotPositions[index];
		const y = SLOT_PADDING + layout.y - offset;

		const slot = new Path2D();
		slot.roundRect(x, y, SLOT_SIZE, SLOT_SIZE, 10);

		// Draw slot background
		ctx.fillStyle = frogId
			? "rgba(100, 100, 100, 0.8)"
			: "rgba(50, 50, 50, 0.5)";

		ctx.fill(slot);

		// Draw border
		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
		ctx.lineWidth = STROKE_WIDTH;
		ctx.stroke(slot);

		// Draw cannon if occupied
		if (frogId) {
			const frog = state.entityRegistry[frogId];
			const { x, y } = drawFrogInWaitingArea(ctx, frog, index, layout);
			drawOutlinedText(ctx, getFrogHunger(frog).toString(), x, y + 4);

			renderContext.clickables.set(frog.id, {
				x,
				y,
				radius: FROG_SIZE / 2,
				source: "waiting_area",
				slotIndex: index,
			});
		}
	});
}
