import { createPalette, type RGB } from "./color";
import type { Grid } from "./Grid";
import { createLevel } from "./level";
import {
	createSharedGameSnapshot,
	decodeSharedGameSnapshot,
	encodeSharedGameSnapshot,
	rehydrateLevelFromSnapshot,
} from "./share";
import { createFrogGame } from "./state";

function createTestLevel() {
	const colors: RGB[] = [
		[255, 0, 0],
		[0, 255, 0],
		[0, 0, 255],
	];
	const palette = createPalette(colors);
	const [red, green, blue] = Object.values(palette).map((entry) => entry.id);

	const width = 20;
	const height = 2;
	const grid: Grid = {
		width,
		height,
		pixels: Array.from({ length: height }, (_, row) =>
			Array.from({ length: width }, (_, col) => {
				if (row === 0 && col % 3 === 0) {
					return { colorId: red, alive: true };
				}

				if (row === 0 && col % 3 === 1) {
					return { colorId: green, alive: false };
				}

				return { colorId: blue, alive: true };
			}),
		),
	};

	return createLevel(grid, 16, palette);
}

describe("game sharing", () => {
	it("round-trips level and seed through snapshot encoding", () => {
		const level = createTestLevel();
		const seed = 123456;

		const encoded = encodeSharedGameSnapshot(
			createSharedGameSnapshot(level, seed),
		);
		const decoded = decodeSharedGameSnapshot(encoded);

		expect(decoded).not.toBeNull();
		expect(decoded?.seed).toBe(seed);

		if (!decoded) {
			throw new Error("Expected snapshot to decode");
		}

		const rehydrated = rehydrateLevelFromSnapshot(decoded);

		expect(rehydrated.width).toBe(level.width);
		expect(rehydrated.height).toBe(level.height);
		expect(rehydrated.pixelsPerSize).toBe(level.pixelsPerSize);
		expect(rehydrated.rules).toEqual(level.rules);
		expect(rehydrated.pixels).toEqual(level.pixels);
		expect(Object.values(rehydrated.palette).map((entry) => entry.rgb)).toEqual(
			Object.values(level.palette).map((entry) => entry.rgb),
		);
	});

	it("rehydrates deterministically for game generation", () => {
		const seed = 42;
		const level = createTestLevel();
		const snapshot = createSharedGameSnapshot(level, seed);
		const rehydratedLevel = rehydrateLevelFromSnapshot(snapshot);

		const originalState = createFrogGame(level, seed);
		const rehydratedState = createFrogGame(rehydratedLevel, seed);

		expect(rehydratedState.pool.columns).toEqual(originalState.pool.columns);
		expect(rehydratedState.entityRegistry).toEqual(
			originalState.entityRegistry,
		);
		expect(rehydratedState.grid.resources).toEqual(
			originalState.grid.resources,
		);
	});
});
