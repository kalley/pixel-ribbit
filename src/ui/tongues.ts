import type { CannonId } from "../engine/types";

export type TongueAnimation = {
	cannonId: string;
	startTick: number;
	targetX: number;
	targetY: number;
	duration: number; // in ticks
};

export const activeTongues = new Map<CannonId, TongueAnimation>();
