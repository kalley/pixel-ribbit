import { handleDeployFromPool } from "../engine/events/deploy-from-pool";
import { handleDeployFromWaitingArea } from "../engine/events/deploy-from-waiting-area";
import type { GameState } from "../engine/types";
import type { RenderContext } from "../renderer/render-context";
import {
	computeLayout,
	createViewportState,
	type LayoutFrame,
} from "../viewport";

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
	onResize?: (layout: LayoutFrame) => void,
): CanvasContext {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not get canvas context");
	}

	const levelRules = {
		slotCount: 5,
		columnCount: 3,
		maxVisiblePerColumn: 3,
	};

	let cachedLayout = computeLayout(createViewportState(canvas), levelRules);

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
		// canvas.style.height = `${viewport.height}px`;

		const newLayout = updateLayout();

		onResize?.(newLayout);
	});

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

export function listenForClicks(
	canvas: HTMLCanvasElement,
	gameState: GameState,
	renderContext: RenderContext,
) {
	canvas.addEventListener("click", (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		handleCanvasClick(x, y);
	});

	canvas.addEventListener("touchend", (e) => {
		if (!e.touches.length) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.touches[0].clientX - rect.left;
		const y = e.touches[0].clientY - rect.top;

		handleCanvasClick(x, y);
	});

	function handleCanvasClick(x: number, y: number) {
		for (const [, clickable] of renderContext.clickables) {
			const dx = x - clickable.x;
			const dy = y - clickable.y;

			if (dx * dx + dy * dy <= clickable.radius * clickable.radius) {
				if (
					clickable.source === "waiting_area" &&
					clickable.slotIndex !== undefined
				) {
					handleDeployFromWaitingArea(gameState, {
						type: "DEPLOY_FROM_WAITING_AREA",
						slotIndex: clickable.slotIndex,
					});
				} else if (
					clickable.source === "pool" &&
					clickable.columnIndex !== undefined &&
					clickable.rowIndex === 0
				) {
					handleDeployFromPool(gameState, {
						type: "DEPLOY_FROM_POOL",
						columnIndex: clickable.columnIndex,
					});
				}
				break;
			}
		}
	}
}
