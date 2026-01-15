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

export type GameContext = {
	state: GameState | null;
	renderContext: RenderContext | null;
	isPaused: boolean;
};

export type CanvasContext = {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	layout: LayoutFrame; // Cached
	levelRules: {
		slotCount: number;
		columnCount: number;
		maxVisiblePerColumn: number;
	};
	updateLayout: () => void;
	cleanup: () => void;
};

export function makeCanvas(
	gameContext: GameContext,
	onResize?: (layout: LayoutFrame) => void,
): CanvasContext {
	const levelRules = {
		slotCount: 5,
		columnCount: 3,
		maxVisiblePerColumn: 3,
	};

	let cachedLayout: LayoutFrame;

	const handleCanvasClick = (x: number, y: number) => {
		if (!gameContext.renderContext || !gameContext.state) return;

		const { renderContext, state: gameState } = gameContext;

		for (const [, clickable] of renderContext.clickables) {
			const dx = x - clickable.x;
			const dy = y - clickable.y;

			if (dx * dx + dy * dy <= clickable.radius * clickable.radius) {
				if (clickable.source === "waiting_area") {
					handleDeployFromWaitingArea(gameState, {
						type: "DEPLOY_FROM_WAITING_AREA",
						slotIndex: clickable.slotIndex,
					});
				} else if (clickable.source === "pool" && clickable.rowIndex === 0) {
					handleDeployFromPool(gameState, {
						type: "DEPLOY_FROM_POOL",
						columnIndex: clickable.columnIndex,
					});
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
			if (!e.touches.length) return;
			const rect = canvas.getBoundingClientRect();
			const x = e.touches[0].clientX - rect.left;
			const y = e.touches[0].clientY - rect.top;
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
		cachedLayout = computeLayout(viewport, levelRules);

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
	cachedLayout = computeLayout(createViewportState(canvas), levelRules);
	resizeObserver.observe(canvas);

	return {
		canvas,
		ctx,
		get layout() {
			return cachedLayout;
		},
		levelRules,
		updateLayout,
		cleanup: () => resizeObserver.disconnect(),
	};
}
