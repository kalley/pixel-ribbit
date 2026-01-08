import { tick } from "../engine/tick";
import type { GameState } from "../engine/types";
import {
	computeLayout,
	createViewportState,
	type LayoutFrame,
} from "../viewport";
import { clickables } from "./clickables";

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
		canvas.style.height = `${viewport.height}px`;

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
) {
	canvas.addEventListener("click", (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		handleCanvasClick(x, y);
	});

	function handleCanvasClick(x: number, y: number) {
		for (const [, area] of clickables) {
			const dx = x - area.x;
			const dy = y - area.y;

			if (dx * dx + dy * dy <= area.radius * area.radius) {
				if (area.source === "slot") {
					tick(gameState, {
						type: "DEPLOY_FROM_SLOT",
						slotIndex: area.slotIndex,
					});
				} else if (area.source === "feeder") {
					if (area.rowIndex === 0) {
						tick(gameState, {
							type: "DEPLOY_FROM_FEEDER",
							columnIndex: area.columnIndex,
						});
					}
				}
				break;
			}
		}
	}
}
