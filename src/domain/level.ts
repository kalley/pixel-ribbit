import type { WeightedOption } from "../engine/rng";
import type { Palette } from "./color";
import type { Grid } from "./Grid";
import type { Pixel } from "./Pixel";

type CannonGeneration = {
	maxInitialShots?: number;
	shotWeights: WeightedOption<number>[];
};

type Conveyor = {
	capacity: number;
	ticksPerPixel: number;
};

type ConveyorSlots = {
	slotCount: number;
};

type Feeder = {
	columnCount: number;
	maxVisibleRows: number;
};

type Timing = {
	msPerTick: number;
};

type LevelRulesOptions = {
	cannonGeneration?: Pick<CannonGeneration, "maxInitialShots">;
	conveyor?: Partial<Conveyor>;
	conveyorSlots?: Partial<ConveyorSlots>;
	feeder?: Partial<Feeder>;
	timing?: Partial<Timing>;
};

export type LevelRules = {
	cannonGeneration: CannonGeneration;
	conveyor: Conveyor;
	conveyorSlots: ConveyorSlots;
	feeder: Feeder;
	timing: Timing;
};

export type Level = {
	width: number;
	height: number;
	pixels: Pixel[][];
	palette: Palette;
	rules: LevelRules;
};

function clamp(num: number, min: number, max: number) {
	return Math.min(Math.max(num, min), max);
}

export function roundToStep(
	value: number,
	step: number,
	options?: {
		min?: number;
		max?: number;
		bias?: number;
	},
): number {
	if (step <= 0) return value;

	const bias = options?.bias ?? 0;
	const min = options?.min ?? -Infinity;
	const max = options?.max ?? Infinity;

	const rounded =
		bias === 0
			? Math.round(value / step) * step
			: Math.floor(value / step + 0.5 + bias) * step;

	return Math.max(min, Math.min(max, rounded));
}

export function createLevel(
	grid: Grid,
	palette: Palette,
	rules?: LevelRulesOptions,
): Level {
	const shotWeights = calculateShotWeights(grid, palette);

	return {
		...grid,
		palette,
		rules: {
			cannonGeneration: { shotWeights, ...rules?.cannonGeneration },
			conveyorSlots: { slotCount: 5, ...rules?.conveyorSlots },
			conveyor: {
				capacity: 5,
				ticksPerPixel: 2,
				...rules?.conveyor,
			},
			feeder: { columnCount: 3, maxVisibleRows: 3, ...rules?.feeder },
			timing: { msPerTick: 100, ...rules?.timing },
		},
	};
}

function calculateShotWeights(
	grid: Grid,
	palette: Palette,
): WeightedOption<number>[] {
	const totalPixels = grid.width * grid.height;
	const colorCount = Object.values(palette).length;
	const minShots = grid.width / 4;
	const maxShots = roundToStep(grid.width, 5);

	const avgPerColor = totalPixels / colorCount;

	const baselineAvg = 50; // your anchor
	const scaleFactor = avgPerColor / baselineAvg;

	const baseMin = 10;
	const baseMax = 50;

	const min = clamp(baseMin * scaleFactor, 4, minShots);
	const max = clamp(baseMax * scaleFactor, 20, maxShots);

	const mid = (min + max) / 2;

	const values = [mid * 0.75, mid * 0.9, mid, mid * 1.1, mid * 1.25];

	return values.map((v, i) => ({
		value: roundToStep(v, 5),
		weight: 5 - i, // or something more expressive later
	}));
}
