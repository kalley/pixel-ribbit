// renderer/render-context.ts

import type { GridLayout } from "./calculate-grid-layout";

export interface TongueAnimation {
	entityId: string;
	startTick: number;
	targetRow: number;
	targetCol: number;
	phases: {
		extend: number; // Ticks for extension
		hold: number; // Ticks holding the pixel
		retract: number; // Ticks for retraction
	};
}

interface BaseClickable {
	x: number;
	y: number;
	radius: number;
	source: "pool" | "waiting_area";
}

interface PoolClickable extends BaseClickable {
	source: "pool";
	columnIndex: number;
	rowIndex: number;
}

interface WaitingAreaClickable extends BaseClickable {
	source: "waiting_area";
	slotIndex: number;
}

export type Clickable = PoolClickable | WaitingAreaClickable;

export interface RenderContext {
	gridLayout: GridLayout;
	activeTongues: Map<string, TongueAnimation>;
	clickables: Map<string, Clickable>;
}

export function createRenderContext(gridLayout: GridLayout): RenderContext {
	return {
		gridLayout,
		activeTongues: new Map(),
		clickables: new Map(),
	};
}

export function resetRenderContext(
	context: RenderContext,
	gridLayout: GridLayout,
): void {
	context.gridLayout = gridLayout;
	context.activeTongues.clear();
	context.clickables.clear();
}

export function createTongueAnimation(
	entityId: string,
	currentTick: number,
	targetRow: number,
	targetCol: number,
	ticksPerSegment: number,
): TongueAnimation {
	const extendTicks = ticksPerSegment * 0.4;
	const holdTicks = ticksPerSegment * 0.1;
	const retractTicks = ticksPerSegment * 0.5;

	return {
		entityId,
		startTick: currentTick,
		targetRow,
		targetCol,
		phases: {
			extend: extendTicks,
			hold: holdTicks,
			retract: retractTicks,
		},
	};
}

export function getTongueProgress(
	tongue: TongueAnimation,
	currentTick: number,
): { phase: "extend" | "hold" | "retract" | "done"; progress: number } {
	const elapsed = currentTick - tongue.startTick;

	// Extension phase
	if (elapsed < tongue.phases.extend) {
		return {
			phase: "extend",
			progress: elapsed / tongue.phases.extend,
		};
	}

	// Hold phase
	const afterExtend = elapsed - tongue.phases.extend;
	if (afterExtend < tongue.phases.hold) {
		return {
			phase: "hold",
			progress: 1.0, // Fully extended
		};
	}

	// Retract phase
	const afterHold = afterExtend - tongue.phases.hold;
	if (afterHold < tongue.phases.retract) {
		return {
			phase: "retract",
			progress: 1.0 - afterHold / tongue.phases.retract,
		};
	}

	// Done
	return { phase: "done", progress: 0 };
}

export function isTongueDone(
	tongue: TongueAnimation,
	currentTick: number,
): boolean {
	return getTongueProgress(tongue, currentTick).phase === "done";
}

// Update cleanup function
export function cleanupTongues(
	context: RenderContext,
	currentTick: number,
): void {
	for (const [id, tongue] of context.activeTongues) {
		if (isTongueDone(tongue, currentTick)) {
			context.activeTongues.delete(id);
		}
	}
}
