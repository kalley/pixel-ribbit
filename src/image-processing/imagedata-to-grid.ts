import { type ColorId, makeColorId, type RGBA } from "../game/color";
import { ALPHA_THRESHOLD } from "./posterize";

export type RawPixel = {
	colorId: ColorId;
	active: boolean;
	x: number;
	y: number;
};

export type RawGrid = {
	width: number;
	height: number;
	pixels: RawPixel[][];
};

export function imageDataToGrid(imageData: ImageData): RawGrid {
	const { data, width, height } = imageData;
	const pixels: RawPixel[][] = [];

	for (let y = 0; y < height; y++) {
		pixels[y] = [];
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) << 2;
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];

			const color: RGBA = [r, g, b, a];
			const colorId = makeColorId(color);

			pixels[y][x] = {
				colorId,
				x,
				y,
				active: a > ALPHA_THRESHOLD, // Only active if not fully transparent
			};
		}
	}

	return { width, height, pixels };
}
