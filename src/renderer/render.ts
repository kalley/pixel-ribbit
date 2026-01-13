import type { GameState } from "../engine/types";
import type { CanvasContext } from "../ui/canvas";
import { drawFeeder } from "./draw-feeder";
import { drawTexturedFog } from "./draw-fog";
import { drawFrogsOnPath } from "./draw-frogs-on-path";
import { drawGameGrid } from "./draw-game-grid";
import { drawLily } from "./draw-lily";
import { drawLilyPads } from "./draw-lily-pad";
import { drawLog } from "./draw-log";
import { drawSlots } from "./draw-slots";
import { drawStream, updateWaves } from "./draw-stream";
import { drawTongues } from "./draw-tongues";
import type { RenderContext } from "./render-context";

export function render(
	{ canvas, ctx, layout }: CanvasContext,
	state: GameState | null,
	renderContext: RenderContext | null,
	animationTime: number,
) {
	// Definitely want to think about incremental updates
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	updateWaves();
	drawStream(ctx, layout.core);

	drawLog(ctx, layout.conveyorSlots);

	if (
		renderContext &&
		state &&
		["playing", "victory_mode"].includes(state.status)
	) {
		renderContext.clickables.clear();

		drawGameGrid({
			ctx,
			grid: state.grid,
			layout: renderContext.gridLayout,
		});

		drawLilyPads(ctx, state, renderContext.gridLayout);
		drawTongues(ctx, renderContext, state);
		drawFrogsOnPath(ctx, state, renderContext.gridLayout);

		drawSlots(ctx, state, layout.conveyorSlots, renderContext);

		drawFeeder(ctx, state, layout.feeder, renderContext);
	}

	drawTexturedFog(ctx, layout, animationTime);
	drawLily(ctx, layout.core, state?.path.entities.length, state?.path.capacity);
}
