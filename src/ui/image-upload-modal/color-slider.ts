import { h } from "../../utils/h";
import {
	DIFFICULTY_PRESETS,
	type DifficultyPreset,
} from "./difficulty-selector";

export function makeColorSlider(
	currentDifficulty: DifficultyPreset,
	currentColorCount: number,
	onColorCountChange: (newColorCount: number) => void,
) {
	return h("input", {
		type: "range",
		min: DIFFICULTY_PRESETS[currentDifficulty].minColors,
		max: DIFFICULTY_PRESETS[currentDifficulty].maxColors,
		value: currentColorCount,
		onChange: (e) => {
			const target = e.target;
			onColorCountChange(parseInt(target.value, 10));
		},
	});
}
