import { handleDeployFromPool } from "../engine/events/deploy-from-pool";
import { handleDeployFromWaitingArea } from "../engine/events/deploy-from-waiting-area";
import type { GameState } from "../engine/types";
import type { RenderContext } from "../renderer/render-context";
import { h } from "../utils/h";
import {
	computeLayout,
	createViewportState,
	type LayoutFrame,
} from "../viewport";

export type LayoutRules = {
	slotCount: number;
	columnCount: number;
	maxVisiblePerColumn: number;
};

const DEFAULT_LAYOUT_RULES: LayoutRules = {
	slotCount: 5,
	columnCount: 3,
	maxVisiblePerColumn: 3,
};

export type GameContext = {
	state: GameState | null;
	renderContext: RenderContext | null;
	isPaused: boolean;
	activeShareCode: string | null;
};

export type CanvasContext = {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	layout: LayoutFrame; // Cached
	levelRules: LayoutRules;
	updateLayout: () => LayoutFrame;
	cleanup: () => void;
};

export function getLayoutRulesFromState(state: GameState | null): LayoutRules {
	if (!state) {
		return DEFAULT_LAYOUT_RULES;
	}

	return {
		slotCount: state.waitingArea.capacity,
		columnCount: state.pool.columns.length,
		maxVisiblePerColumn:
			state.pool.columns[0]?.maxVisible ??
			DEFAULT_LAYOUT_RULES.maxVisiblePerColumn,
	};
}

export function getTouchClientPoint(
	event: Pick<TouchEvent, "changedTouches">,
): { x: number; y: number } | null {
	const touch = event.changedTouches.item(0) ?? event.changedTouches[0];
	if (!touch) {
		return null;
	}

	return { x: touch.clientX, y: touch.clientY };
}

export function makeCanvas(
	gameContext: GameContext,
	onResize?: (layout: LayoutFrame) => void,
): CanvasContext {
	let currentLayoutRules = getLayoutRulesFromState(gameContext.state);

	let cachedLayout: LayoutFrame;

	const handleCanvasClick = (x: number, y: number) => {
		if (!gameContext.renderContext || !gameContext.state) return;

		const { renderContext, state: gameState } = gameContext;

		for (const [key, clickable] of renderContext.clickables) {
			const dx = x - clickable.x;
			const dy = y - clickable.y;

			if (dx * dx + dy * dy <= clickable.radius * clickable.radius) {
				if (clickable.source === "waiting_area") {
					handleDeployFromWaitingArea(gameState, {
						type: "DEPLOY_FROM_WAITING_AREA",
						slotIndex: clickable.slotIndex,
					});
					renderContext.clickables.delete(key);
				} else if (clickable.source === "pool" && clickable.rowIndex === 0) {
					handleDeployFromPool(gameState, {
						type: "DEPLOY_FROM_POOL",
						columnIndex: clickable.columnIndex,
					});
					renderContext.clickables.delete(key);
				}
				break;
			}
		}
	};

	const canvas = h("canvas", {
		onclick: (e) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			handleCanvasClick(x, y);
		},
		ontouchend: (e) => {
			const clientPoint = getTouchClientPoint(e);
			if (!clientPoint) return;
			const rect = canvas.getBoundingClientRect();
			const x = clientPoint.x - rect.left;
			const y = clientPoint.y - rect.top;
			handleCanvasClick(x, y);
		},
		eventOptions: { touchend: { passive: true } },
	});

	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not get canvas context");
	}

	const updateLayout = () => {
		const viewport = createViewportState(canvas);
		currentLayoutRules = getLayoutRulesFromState(gameContext.state);
		cachedLayout = computeLayout(viewport, currentLayoutRules);

		// Apply transforms
		ctx.resetTransform();
		ctx.scale(viewport.dpr, viewport.dpr);
		ctx.scale(cachedLayout.scale, cachedLayout.scale);

		return cachedLayout;
	};

	const resizeObserver = new ResizeObserver(() => {
		const viewport = createViewportState(canvas);

		canvas.width = viewport.width * viewport.dpr;
		canvas.height = viewport.height * viewport.dpr;
		canvas.style.width = `${viewport.width}px`;
		onResize?.(updateLayout());
	});

	// Initialize layout before observing
	cachedLayout = computeLayout(createViewportState(canvas), currentLayoutRules);
	resizeObserver.observe(canvas);

	return {
		canvas,
		ctx,
		get layout() {
			return cachedLayout;
		},
		get levelRules() {
			return currentLayoutRules;
		},
		updateLayout,
		cleanup: () => resizeObserver.disconnect(),
	};
}
