import type { CanvasContext, GameContext } from "../ui/canvas";
import { drawTexturedFog } from "./draw-fog";
import { drawFrogsOnPath } from "./draw-frogs-on-path";
import { drawGameGrid } from "./draw-game-grid";
import { drawLily } from "./draw-lily";
import { drawLilyPadsAtRest, drawLilyPadsOnPath } from "./draw-lily-pad";
import { drawLog } from "./draw-log";
import { drawPool } from "./draw-pool";
import { drawStream, updateWaves } from "./draw-stream";
import { drawTongues } from "./draw-tongues";
import { drawWaitingArea } from "./draw-waiting-area";

export function render(
	{ canvas, ctx, layout }: CanvasContext,
	{ renderContext, state }: GameContext,
	animationTime: number,
) {
	// Definitely want to think about incremental updates
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	updateWaves();
	drawStream(ctx, layout.core);
	drawLilyPadsAtRest(
		ctx,
		layout.core,
		state,
		state?.path.capacity,
		state?.path.entities.length,
	);

	drawLog(ctx, layout.conveyorSlots);

	if (
		renderContext &&
		state &&
		["playing", "victory_mode"].includes(state.status)
	) {
		drawGameGrid({
			ctx,
			grid: state.grid,
			layout: renderContext.gridLayout,
		});

		drawLilyPadsOnPath(ctx, state, renderContext.gridLayout);
		drawTongues(ctx, renderContext, state);
		drawFrogsOnPath(ctx, state, renderContext.gridLayout);

		drawWaitingArea(ctx, state, layout.conveyorSlots, renderContext);

		drawPool(ctx, state, layout.feeder, renderContext);
	}

	drawTexturedFog(ctx, layout, animationTime);
	drawLily(ctx, layout.core);
}
