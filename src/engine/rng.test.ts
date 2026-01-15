import { createSeededRNG, type WeightedOption } from "./rng";

describe("SeededRNG", () => {
	describe("determinism", () => {
		it("produces the same sequence for the same seed", () => {
			const rng1 = createSeededRNG(123);
			const rng2 = createSeededRNG(123);

			const values1 = Array.from({ length: 10 }, () => rng1.next());
			const values2 = Array.from({ length: 10 }, () => rng2.next());

			expect(values1).toEqual(values2);
		});

		it("produces different sequences for different seeds", () => {
			const rng1 = createSeededRNG(1);
			const rng2 = createSeededRNG(2);

			expect(rng1.next()).not.toBe(rng2.next());
		});
	});

	describe("next()", () => {
		it("returns values in [0, 1)", () => {
			const rng = createSeededRNG(42);

			for (let i = 0; i < 1000; i++) {
				const value = rng.next();
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThan(1);
			}
		});
	});

	describe("nextInt()", () => {
		it("returns integers within the given range", () => {
			const rng = createSeededRNG(99);

			for (let i = 0; i < 1000; i++) {
				const value = rng.nextInt(5, 10);
				expect(Number.isInteger(value)).toBe(true);
				expect(value).toBeGreaterThanOrEqual(5);
				expect(value).toBeLessThan(10);
			}
		});

		it("nextInt(0, 1) always returns 0", () => {
			const rng = createSeededRNG(1);
			for (let i = 0; i < 100; i++) {
				expect(rng.nextInt(0, 1)).toBe(0);
			}
		});

		it("nextInt with equal bounds returns min", () => {
			const rng = createSeededRNG(1);
			expect(rng.nextInt(5, 5)).toBe(5);
		});
	});

	describe("nextIntStep()", () => {
		it("returns values aligned to step", () => {
			const rng = createSeededRNG(7);

			for (let i = 0; i < 1000; i++) {
				const value = rng.nextIntStep(0, 10, 2);
				expect(value % 2).toBe(0);
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThanOrEqual(10);
			}
		});

		it("returns min when step exceeds range", () => {
			const rng = createSeededRNG(1);
			expect(rng.nextIntStep(0, 5, 10)).toBe(0);
		});

		it("respects odd step sizes", () => {
			const rng = createSeededRNG(2);
			const values = Array.from({ length: 20 }, () =>
				rng.nextIntStep(1, 10, 3),
			);
			values.forEach((v) => {
				expect([1, 4, 7, 10]).toContain(v);
			});
		});
	});

	describe("choice()", () => {
		it("returns an element from the array", () => {
			const rng = createSeededRNG(123);
			const options = ["a", "b", "c"];

			for (let i = 0; i < 100; i++) {
				expect(options).toContain(rng.choice(options));
			}
		});

		// Potentially have it throw
		it("returns undefined when choosing from empty array", () => {
			const rng = createSeededRNG(1);
			expect(() => rng.choice([] as number[])).toThrow();
		});
	});

	describe("weightedChoice()", () => {
		it("throws if options and weights length differ", () => {
			const rng = createSeededRNG(1);

			expect(() => rng.weightedChoice(["a", "b"], [1])).toThrow();
		});

		it("returns the only option when one is provided", () => {
			const rng = createSeededRNG(1);

			const result = rng.weightedChoice(["only"], [10]);
			expect(result).toBe("only");
		});

		it("favors higher-weighted options", () => {
			const rng = createSeededRNG(42);
			const options = ["low", "high"] as ["low", "high"];
			const weights = [1, 9];

			const counts = { low: 0, high: 0 };

			for (let i = 0; i < 10_000; i++) {
				const result = rng.weightedChoice(options, weights);
				counts[result]++;
			}

			expect(counts.high).toBeGreaterThan(counts.low);
			// Loose ratio check to avoid flakiness
			expect(counts.high / counts.low).toBeGreaterThan(5);
		});

		it("throws on zero total weight", () => {
			const rng = createSeededRNG(1);
			expect(() => rng.weightedChoice(["a"], [0])).toThrow();
		});
	});

	describe("weightedChoiceObj()", () => {
		it("delegates correctly to weightedChoice", () => {
			const rng = createSeededRNG(10);

			const options: WeightedOption<string>[] = [
				{ value: "a", weight: 1 },
				{ value: "b", weight: 3 },
			];

			const results = Array.from({ length: 1000 }, () =>
				rng.weightedChoiceObj(options),
			);

			const countA = results.filter((r) => r === "a").length;
			const countB = results.filter((r) => r === "b").length;

			expect(countB).toBeGreaterThan(countA);
		});
	});

	describe("shuffle()", () => {
		it("returns a permutation of the original array", () => {
			const rng = createSeededRNG(5);
			const array = [1, 2, 3, 4, 5];

			const shuffled = rng.shuffle(array);

			expect(shuffled).toHaveLength(array.length);
			expect(shuffled.sort()).toEqual([...array].sort());
		});

		it("is deterministic for the same seed", () => {
			const rng1 = createSeededRNG(123);
			const rng2 = createSeededRNG(123);

			const array = [1, 2, 3, 4, 5];

			expect(rng1.shuffle(array)).toEqual(rng2.shuffle(array));
		});

		it("shuffle handles single element", () => {
			const rng = createSeededRNG(1);
			expect(rng.shuffle([42])).toEqual([42]);
		});
	});
});
