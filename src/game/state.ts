// game/state.ts (frog-specific setup)

import { levelRulesToConstraints } from "../engine/constraints";
import { SeededRNG } from "../engine/rng";
import { createGameState as createEngineState } from "../engine/state";
import type { Entity, GameState } from "../engine/types";
import type { Level } from "./level";
import { createFrog, createPixel } from "./types";

export function createFrogGame(level: Level, seed: number): GameState {
	const { pixels, rules, width, height } = level;
	const rng = new SeededRNG(seed);

	// Convert pixels to resources
	const resources = pixels.map((row, rowIdx) =>
		row.map((pixel, colIdx) =>
			createPixel(
				`pixel_${rowIdx}_${colIdx}`,
				pixel.colorId,
				rowIdx,
				colIdx,
				pixel.alive,
			),
		),
	);

	// Count pixels by color for frog generation
	const pixelsByColor = new Map<string, number>();
	for (const row of pixels) {
		for (const pixel of row) {
			if (pixel.alive) {
				const count = pixelsByColor.get(pixel.colorId) || 0;
				pixelsByColor.set(pixel.colorId, count + 1);
			}
		}
	}

	// Generate frogs
	const frogs: Entity[] = [];
	let nextId = 0;

	const colorEntries = [...pixelsByColor.entries()].sort(([a], [b]) =>
		a.localeCompare(b),
	);

	for (const [colorId, totalPixels] of colorEntries) {
		let remaining = totalPixels;

		while (remaining > 0) {
			const hunger = Math.min(
				remaining,
				rng.weightedChoiceObj(rules.cannonGeneration.shotWeights),
			);

			frogs.push(createFrog(`frog_${nextId}`, colorId, hunger));

			remaining -= hunger;
			nextId++;
		}
	}

	// Shuffle frogs
	let shuffled = rng.shuffle(frogs);
	const maxInitialShots = rules.cannonGeneration.maxInitialShots;

	if (maxInitialShots) {
		const small = shuffled.filter((f) => f.capacity <= maxInitialShots);
		const large = shuffled.filter((f) => f.capacity > maxInitialShots);
		shuffled = [...small, ...large];
	}

	// Calculate path length
	const perimeter = 2 * (width + height) - 4;
	const pathLength = perimeter * rules.conveyor.ticksPerPixel;

	// Create constraints
	const constraints = levelRulesToConstraints(rules);

	// Create game state
	return createEngineState({
		constraints,
		entities: shuffled,
		resources,
		gridWidth: width,
		gridHeight: height,
		pathLength,
		poolColumns: rules.feeder.columnCount,
		seed,
	});
}
