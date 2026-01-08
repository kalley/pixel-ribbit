export type WeightedOption<T> = { value: T; weight: number };

export class SeededRNG {
	private state: number;

	constructor(seed: number) {
		this.state = seed;
	}

	// Returns a float between 0 and 1
	next(): number {
		// Linear congruential generator (LCG)
		// These magic numbers are from Numerical Recipes
		this.state = (this.state * 1664525 + 1013904223) % 2 ** 32;
		return this.state / 2 ** 32;
	}

	// Returns integer between min (inclusive) and max (exclusive)
	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min)) + min;
	}

	// Returns integer between min and max, aligned to step
	nextIntStep(min: number, max: number, step: number): number {
		const range = Math.floor((max - min) / step);
		return min + this.nextInt(0, range + 1) * step;
	}

	// Pick random element from array
	choice<T>(array: T[]): T {
		if (array.length === 0) {
			throw new Error("Cannot choose from empty array");
		}
		return array[this.nextInt(0, array.length)];
	}

	// Weighted choice - weights don't need to sum to 1
	weightedChoice<T>(options: T[], weights: number[]): T {
		if (options.length !== weights.length) {
			throw new Error("Options and weights must have same length");
		}

		const totalWeight = weights.reduce((sum, w) => sum + w, 0);

		if (totalWeight === 0) {
			throw new Error("Total weight must be greater than zero");
		}

		let random = this.next() * totalWeight;

		for (let i = 0; i < options.length; i++) {
			random -= weights[i];
			if (random <= 0) {
				return options[i];
			}
		}

		// Fallback (shouldn't happen with valid weights)
		return options[options.length - 1];
	}

	weightedChoiceObj<T>(options: WeightedOption<T>[]): T {
		const values = options.map((o) => o.value);
		const weights = options.map((o) => o.weight);
		return this.weightedChoice(values, weights);
	}

	// Shuffle array (Fisher-Yates)
	shuffle<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = this.nextInt(0, i + 1);
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}
}
