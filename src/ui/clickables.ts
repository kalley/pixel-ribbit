import type { CannonId } from "../engine/types";

export const clickables = new Map<
	CannonId,
	{ x: number; y: number; radius: number } & (
		| { source: "slot"; slotIndex: number }
		| { source: "feeder"; columnIndex: number; rowIndex: number }
	)
>();
