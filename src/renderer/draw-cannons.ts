import { GRID_PADDING, STREAM_WIDTH } from "../constants";
import type { RGB } from "../domain/color";
import type { Level } from "../domain/level";
import type { Cannon, GameState } from "../engine/types";

import type { GridLayout } from "./calculate-grid-layout";
import { leaf } from "./draw-lily";
import { drawOutlinedText } from "./draw-outlined-text";
import { gridToScreenCoords } from "./grid-to-screen-coords";

const SPRITE_SIZE = 56;
export const HALF_SPRITE_SIZE = SPRITE_SIZE / 2;

const FACING_TO_RADIANS: Record<string, number> = {
	north: 0,
	east: Math.PI / 2,
	south: Math.PI,
	west: -Math.PI / 2, // or 3*Math.PI/2, same effect
};

export function drawCannons(
	ctx: CanvasRenderingContext2D,
	state: GameState,
	level: Level,
	gridLayout: GridLayout,
	factory: (color: RGB) => HTMLCanvasElement,
) {
	for (const cannonId of state.conveyor.cannonsOnBelt) {
		const cannon = state.cannons[cannonId];
		if (cannon.location.type !== "conveyor") continue;

		// Convert grid position to canvas pixels along stream band
		const pos = getCannonRenderPosition(cannon, gridLayout);
		if (!pos) continue;

		const { x, y } = pos;
		const color = level.palette[cannon.color];
		const sprite = factory(color.rgb);

		const angle = FACING_TO_RADIANS[cannon.location.position.facing] ?? 0;
		const leafImage = leaf.get();

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		if (leafImage) {
			ctx.drawImage(
				leafImage,
				-HALF_SPRITE_SIZE,
				-HALF_SPRITE_SIZE,
				SPRITE_SIZE,
				SPRITE_SIZE,
			);
		}
		ctx.drawImage(
			sprite,
			-HALF_SPRITE_SIZE,
			-HALF_SPRITE_SIZE,
			SPRITE_SIZE,
			SPRITE_SIZE,
		);
		ctx.restore();

		// Show shot count
		drawOutlinedText(ctx, cannon.shotsRemaining.toString(), x, y + 4);
	}
}

// --- Compute cannon position along stream band ---
export function getCannonRenderPosition(
	cannon: Cannon,
	gridLayout: GridLayout,
) {
	if (cannon.location.type !== "conveyor") return null;

	const pos = cannon.location.position;

	let { x, y } = gridToScreenCoords(pos.x, pos.y, gridLayout);

	const offset = STREAM_WIDTH / 2 + GRID_PADDING + gridLayout.gridPadding;

	// Offset along the normal toward the center of the stream
	switch (pos.edge) {
		case "top":
			y -= offset; // move down into the stream
			break;
		case "bottom":
			y += offset; // move up into the stream
			break;
		case "left":
			x -= offset; // move right into the stream
			break;
		case "right":
			x += offset; // move left into the stream
			break;
	}

	return { x, y };
}
