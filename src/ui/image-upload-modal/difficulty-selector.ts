import { h } from "../../utils/h";

export const DIFFICULTY_PRESETS = {
	easy: {
		label: "Easy",
		pixelsPerSide: 16,
		minColors: 4,
		maxColors: 7,
		defaultColors: 5,
	},
	medium: {
		label: "Medium",
		pixelsPerSide: 32,
		minColors: 6,
		maxColors: 10,
		defaultColors: 7,
	},
	hard: {
		label: "Hard",
		pixelsPerSide: 48,
		minColors: 8,
		maxColors: 12,
		defaultColors: 9,
	},
} as const;
export type DifficultyPreset = keyof typeof DIFFICULTY_PRESETS;

function isDifficultyPreset(value: unknown): value is DifficultyPreset {
	return (
		typeof value === "string" && Object.keys(DIFFICULTY_PRESETS).includes(value)
	);
}

export function makeDifficultySelector({
	currentDifficulty,
	onDifficultyChange,
}: {
	currentDifficulty: DifficultyPreset;
	onDifficultyChange: (newDifficulty: DifficultyPreset) => void;
}) {
	const difficultyRadios = Object.entries(DIFFICULTY_PRESETS).map(
		([key, preset]) => {
			if (!isDifficultyPreset(key)) return null;

			const input = h("input", {
				type: "radio",
				name: "difficulty",
				value: key,
				checked: key === currentDifficulty,
				onChange: () => {
					if (input.checked) {
						onDifficultyChange(key);
					}
				},
			});

			return h(
				"label",
				{ class: "radio-label" },
				input,
				h("span", {}, preset.label),
			);
		},
	);

	return h(
		"fieldset",
		{ class: "control-group" },
		h("legend", {}, "Difficulty:"),
		h("div", { class: "radio-group" }, ...difficultyRadios),
	);
}
