import type { RGB } from "../domain/color";
import type { Level } from "../domain/level";
import type { GameState } from "../engine/types";
import { clickables } from "../ui/clickables";
import type { LayoutFrame } from "../viewport";
import type { GridLayout } from "./calculate-grid-layout";
import { drawCannons } from "./draw-cannons";
import { drawFeeder } from "./draw-feeder";
import { drawGameGrid } from "./draw-game-grid";
import { drawLily } from "./draw-lily";
import { drawLog } from "./draw-log";
import { drawSlots } from "./draw-slots";
import { drawStream, updateWaves } from "./draw-stream";
import { drawTongues } from "./draw-tongues";

export function render(
	canvas: HTMLCanvasElement,
	layout: LayoutFrame,
	gridLayout?: GridLayout,
	state?: GameState,
	level?: Level,
	factory?: (color: RGB) => HTMLCanvasElement,
) {
	const ctx = canvas.getContext("2d");

	if (!ctx) return;

	// Definitely want to think about incremental updates
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	updateWaves();
	drawStream(ctx, layout.core);

	drawLog(ctx, layout.conveyorSlots);

	if (gridLayout && state && level && factory && state.status === "playing") {
		clickables.clear();

		drawGameGrid({
			ctx,
			grid: state.grid,
			palette: level.palette,
			layout: gridLayout,
		});

		drawTongues(ctx, state, gridLayout);
		drawCannons(ctx, state, level, gridLayout, factory);

		drawSlots(ctx, state, level, layout.conveyorSlots, factory);

		drawFeeder(ctx, state, level, layout.feeder, factory);
	}

	drawLily(
		ctx,
		layout.core,
		state?.conveyor.cannonsOnBelt.length,
		state?.conveyor.capacity,
	);
}
