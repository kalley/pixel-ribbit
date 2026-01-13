import leafUrl from "../assets/lily_leaf.png";
import { FROG_SIZE } from "../constants";
import type { EngineConstraints } from "../engine/constraints";
import type { PathSegment } from "../engine/path";
import type { GameState } from "../engine/types";
import type { Frog } from "../game/types";
import { loadImage } from "../utils/load-image";
import type { GridLayout } from "./calculate-grid-layout";
import { HALF_FROG_SIZE } from "./draw-frog";
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

	ctx.drawImage(
		leafImage,
		-HALF_FROG_SIZE,
		-HALF_FROG_SIZE,
		FROG_SIZE,
		FROG_SIZE,
	);
	ctx.restore();
}

export function drawLilyPads(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	gridLayout: GridLayout,
) {
	for (const frogId of state.path.entities) {
		const frog = state.entityRegistry[frogId];

		drawLilyPad(ctx, frog, state.path.segments, state.constraints, gridLayout);
	}
}
