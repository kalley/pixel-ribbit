import type { Pixel } from "./Pixel";

export type Grid = {
	width: number;
	height: number;
	pixels: Pixel[][]; // [y][x]
};
