import type { GameState } from "../engine/types";
import { getFrogHunger } from "../game/types";
import type { GridLayout } from "./calculate-grid-layout";
import { drawFrogOnPath } from "./draw-frog";
import { drawOutlinedText } from "./draw-outlined-text";

export function drawFrogsOnPath(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	gridLayout: GridLayout,
) {
	for (const frogId of state.path.entities) {
		const frog = state.entityRegistry[frogId];
		const { x, y } = drawFrogOnPath(
			ctx,
			frog,
			state.path.segments,
			state.constraints,
			gridLayout,
		);
		drawOutlinedText(ctx, getFrogHunger(frog).toString(), x, y + 4);
	}
}
