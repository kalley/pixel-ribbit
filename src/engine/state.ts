import type { ColorId } from "../domain/color";
import type { Level } from "../domain/level";
import { SeededRNG } from "./rng";
import type { Cannon, CannonId, FeederColumn, GameState } from "./types";

export function createGameState(
	{ pixels, rules, width, height }: Level,
	seed: number,
): GameState {
	if (pixels.length === 0) {
		throw new Error("Level must have at least one pixel");
	}
	const rng = new SeededRNG(seed);

	// Count pixels by color
	const pixelsByColor = new Map<ColorId, number>();
	for (const row of pixels) {
		for (const pixel of row) {
			if (pixel.alive) {
				const count = pixelsByColor.get(pixel.colorId) || 0;
				pixelsByColor.set(pixel.colorId, count + 1);
			}
		}
	}

	if (pixelsByColor.size === 0) {
		throw new Error("Grid must have at least one active pixel");
	}

	// Generate cannons - total shots must equal total pixels
	const cannons: Record<CannonId, Cannon> = {};
	let nextId = 0;

	const colorEntries = [...pixelsByColor.entries()].sort(([a], [b]) =>
		a.localeCompare(b),
	);

	for (const [colorId, totalPixels] of colorEntries) {
		let shotsRemaining = totalPixels;

		// Create multiple cannons for this color
		while (shotsRemaining > 0) {
			const shots = Math.min(
				shotsRemaining,
				rng.weightedChoiceObj(rules.cannonGeneration.shotWeights), // Random shots per cannon
			);
			const id = `cannon_${nextId}`;

			cannons[id] = {
				id,
				color: colorId,
				shotsRemaining: shots,
				location: { type: "feeder" },
				groupId: null,
			};

			shotsRemaining -= shots;
			nextId++;
		}
	}

	// Create feeder - shuffle cannons for random order
	const allCannonIds = Object.keys(cannons);
	let shuffled = rng.shuffle(allCannonIds);
	const maxInitialShots = rules.cannonGeneration.maxInitialShots;

	if (maxInitialShots) {
		const large = shuffled.filter(
			(id) => cannons[id].shotsRemaining > maxInitialShots,
		);
		const small = shuffled.filter(
			(id) => cannons[id].shotsRemaining <= maxInitialShots,
		);
		shuffled = [...small, ...large]; // Small cannons first
	}

	const columnCount = rules.feeder.columnCount;
	const columns: FeederColumn[] = [];

	for (let i = 0; i < columnCount; i++) {
		columns[i] = {
			cannons: [],
			maxVisible: rules.feeder.maxVisibleRows,
		};
	}

	// Distribute cannons round-robin
	shuffled.forEach((cannonId, index) => {
		const columnIndex = index % columnCount;
		columns[columnIndex].cannons.push(cannonId);
	});

	const perimeter = 2 * (width + height) - 4;
	const beltLength = perimeter * rules.conveyor.ticksPerPixel;

	return {
		grid: { height, pixels, width },
		cannons,
		cannonGroups: {},
		conveyor: {
			cannonsOnBelt: [],
			capacity: rules.conveyor.capacity,
			beltLength,
		},
		conveyorSlots: {
			slots: Array(rules.conveyorSlots.slotCount).fill(null),
		},
		feeder: { columns },
		tick: 0,
		status: "playing",
		_debug: {
			seed,
			moveHistory: [],
			eventLog: [],
		},
	};
}
