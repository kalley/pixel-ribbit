export type WeightedOption<T> = { value: T; weight: number };

export interface SeededRNG {
	next(): number;
	nextInt(min: number, max: number): number;
	nextIntStep(min: number, max: number, step: number): number;
	choice<T>(array: T[]): T;
	weightedChoice<T>(options: T[], weights: number[]): T;
	weightedChoiceObj<T>(options: WeightedOption<T>[]): T;
	shuffle<T>(array: T[]): T[];
}

export function createSeededRNG(seed: number): SeededRNG {
	let state = seed >>> 0; // ensure uint32

	const next = () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 2 ** 32;
	};

	const nextInt = (min: number, max: number) =>
		Math.floor(next() * (max - min)) + min;

	const nextIntStep = (min: number, max: number, step: number) => {
		const range = Math.floor((max - min) / step);
		return min + nextInt(0, range + 1) * step;
	};

	const choice = <T>(array: T[]): T => {
		if (array.length === 0) {
			throw new Error("Cannot choose from empty array");
		}
		return array[nextInt(0, array.length)];
	};

	const weightedChoice = <T>(options: T[], weights: number[]): T => {
		if (options.length !== weights.length) {
			throw new Error("Options and weights must have same length");
		}

		const totalWeight = weights.reduce((sum, w) => sum + w, 0);
		if (totalWeight === 0) {
			throw new Error("Total weight must be greater than zero");
		}

		let r = next() * totalWeight;

		for (let i = 0; i < options.length; i++) {
			r -= weights[i];
			if (r <= 0) return options[i];
		}

		return options[options.length - 1];
	};

	const weightedChoiceObj = <T>(options: WeightedOption<T>[]): T =>
		weightedChoice(
			options.map((o) => o.value),
			options.map((o) => o.weight),
		);

	const shuffle = <T>(array: T[]): T[] => {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = nextInt(0, i + 1);
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	};

	return {
		next,
		nextInt,
		nextIntStep,
		choice,
		weightedChoice,
		weightedChoiceObj,
		shuffle,
	};
}
