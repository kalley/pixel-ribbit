import type { PaletteChoices } from "../image-processing/color-utils";
import { ALPHA_THRESHOLD } from "../image-processing/posterize";

export type ColorId = string;

export type RGB = [r: number, g: number, b: number];
export type RGBA = [r: number, g: number, b: number, a: number];

export type ColorEntry = {
	id: ColorId;
	rgb: RGB;
	css: string;
};

export type Palette = Record<ColorId, ColorEntry>;

export function makeColorId([r, g, b, a]: RGBA): ColorId {
	return a < ALPHA_THRESHOLD ? "transparent" : `${r}-${g}-${b}`;
}

export function normalizeColor(rgb: RGB): ColorEntry {
	const [r, g, b] = rgb;
	const id = `${r},${g},${b}`;
	const css = `rgb(${r}, ${g}, ${b})`;

	return { rgb, id, css };
}

export function createPalette(colors: PaletteChoices): Palette {
	const palette: Palette = {};

	for (const color of colors) {
		const [r, g, b] = color;
		const id = makeColorId([r, g, b, 255]);
		const css = `rgb(${r}, ${g}, ${b})`;

		palette[id] = { id, rgb: [r, g, b], css };
	}

	return palette;
}
