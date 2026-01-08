import { LOG_HEIGHT, LOG_WIDTH, SLOT_PADDING } from "../constants";
import { loadImage } from "../utils/load-image";
import type { LayoutFrame } from "../viewport";

const log = loadImage("/log.png");

export function drawLog(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame["conveyorSlots"],
) {
	const img = log.get();

	if (!img) return;

	ctx.drawImage(img, SLOT_PADDING, layout.y, LOG_WIDTH, LOG_HEIGHT);
}
