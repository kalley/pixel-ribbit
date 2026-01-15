// viewport.ts

import {
	CORE_HEIGHT,
	DESIGN_WIDTH,
	FEEDER_CELL_SIZE,
	FEEDER_COL_SPACING,
	FEEDER_FOG_OVERLAP,
	FEEDER_PADDING,
	FEEDER_ROW_SPACING,
	MIN_ELASTIC_HEIGHT,
	SLOT_HEIGHT,
	SLOT_SIZE,
	SLOT_SPACING,
	TOP_RAIL_HEIGHT,
} from "./constants";

export type ViewportState = {
	width: number;
	height: number;
	dpr: number;
	safeArea: { top: number; bottom: number };
};

const DEFAULT_VIEWPORT: ViewportState = {
	width: 390, // iPhone 14 Pro width
	height: 844, // iPhone 14 Pro height
	dpr: 2,
	safeArea: { top: 0, bottom: 0 },
};

function getSafeArea(): { top: number; bottom: number } {
	// CSS env() variables for safe area insets
	const top = parseInt(
		getComputedStyle(document.documentElement).getPropertyValue(
			"env(safe-area-inset-top)",
		) || "0",
		10,
	);
	const bottom = parseInt(
		getComputedStyle(document.documentElement).getPropertyValue(
			"env(safe-area-inset-bottom)",
		) || "0",
		10,
	);

	return { top, bottom };
}

export function createViewportState(canvas: HTMLCanvasElement): ViewportState {
	const dpr = window.devicePixelRatio || 1;
	const rect = canvas.getBoundingClientRect();

	if (!rect.width || !rect.height) {
		return DEFAULT_VIEWPORT;
	}

	return {
		width: rect.width,
		height: rect.height,
		dpr,
		safeArea: getSafeArea(), // see below
	};
}

export type LayoutFrame = {
	topRail: { y: number; height: number };

	core: {
		y: number;
		height: number;
		// Content is at static positions relative to core.y:
		// x = CORE_X
		// y = core.y + CORE_Y
		// size = CORE_CONTENT_SIZE
	};

	conveyorSlots: {
		y: number;
		height: number;
		slotCount: number;
		slotPositions: number[]; // Pre-calculated X positions for slots
	};

	feeder: {
		y: number;
		height: number;
		visibleRows: number;
		columnCount: number;
		columnPositions: number[]; // Pre-calculated X positions for columns
		actualRows: number; // Total rows that can fit (for fog hint)
	};

	elastic: {
		y: number;
		height: number;
		fogEnd: number; // Where fog becomes fully opaque
	};

	scale: number;
	visibleHeight: number;
	width: number;
};

function computeSlotPositions(slotCount: number): number[] {
	const totalWidth = SLOT_SIZE * slotCount + SLOT_SPACING * (slotCount - 1);
	const startX = (DESIGN_WIDTH - totalWidth) / 2;

	return Array.from(
		{ length: slotCount },
		(_, i) => startX + i * (SLOT_SIZE + SLOT_SPACING),
	);
}

function computeColumnPositions(columnCount: number): number[] {
	const totalWidth =
		FEEDER_CELL_SIZE * columnCount + FEEDER_COL_SPACING * (columnCount - 1);
	const startX = (DESIGN_WIDTH - totalWidth) / 2;

	return Array.from(
		{ length: columnCount },
		(_, i) => startX + i * (FEEDER_CELL_SIZE + FEEDER_COL_SPACING),
	);
}

function computeFeederHeight(visibleRows: number): number {
	return (
		FEEDER_PADDING +
		FEEDER_CELL_SIZE * visibleRows +
		FEEDER_ROW_SPACING * (visibleRows - 1)
	);
}

function computeMaxFeederRows(availableHeight: number): number {
	return Math.floor(
		(availableHeight + FEEDER_ROW_SPACING) /
			(FEEDER_CELL_SIZE + FEEDER_ROW_SPACING),
	);
}

export function computeLayout(
	viewport: ViewportState,
	levelRules: {
		slotCount: number;
		columnCount: number;
		maxVisiblePerColumn: number;
	},
): LayoutFrame {
	const scale = viewport.width / DESIGN_WIDTH;
	const visibleHeight = viewport.height / scale;

	const safeTop = viewport.safeArea.top / scale;
	const safeBottom = viewport.safeArea.bottom / scale;

	// Fixed heights
	const topRailHeight = TOP_RAIL_HEIGHT + safeTop;
	const coreHeight = CORE_HEIGHT;
	const conveyorHeight = SLOT_HEIGHT;

	// Dynamic feeder height (based on visible rows)
	const feederHeight =
		computeFeederHeight(levelRules.maxVisiblePerColumn) + safeBottom;

	// Calculate elastic space
	const requiredHeight =
		topRailHeight +
		coreHeight +
		conveyorHeight +
		feederHeight -
		FEEDER_FOG_OVERLAP;

	const elasticHeight = Math.max(
		MIN_ELASTIC_HEIGHT,
		visibleHeight - requiredHeight,
	);

	// Calculate how many rows can actually fit (for fog peeking)
	const totalAvailableForFeeder =
		feederHeight + elasticHeight - MIN_ELASTIC_HEIGHT;
	const actualRows = computeMaxFeederRows(totalAvailableForFeeder);

	const y = 0;
	const coreY = y + topRailHeight;
	const slotsY = coreY + coreHeight;
	const feederY = slotsY + conveyorHeight;

	const elasticY = feederY + feederHeight - FEEDER_FOG_OVERLAP;

	const layout = {
		topRail: {
			y,
			height: topRailHeight,
		},
		core: {
			y: coreY,
			height: coreHeight,
		},
		conveyorSlots: {
			y: slotsY,
			height: conveyorHeight,
			slotCount: levelRules.slotCount,
			slotPositions: computeSlotPositions(levelRules.slotCount),
		},
		feeder: {
			y: feederY,
			height: feederHeight,
			visibleRows: levelRules.maxVisiblePerColumn,
			columnCount: levelRules.columnCount,
			columnPositions: computeColumnPositions(levelRules.columnCount),
			actualRows: Math.max(actualRows, levelRules.maxVisiblePerColumn),
		},
		elastic: {
			y: elasticY - FEEDER_PADDING * 2 - FEEDER_FOG_OVERLAP,
			height: elasticHeight + FEEDER_PADDING * 2 + FEEDER_FOG_OVERLAP,
			fogEnd: elasticY + elasticHeight,
		},
		scale,
		visibleHeight,
		width: DESIGN_WIDTH,
	};

	return layout;
}
