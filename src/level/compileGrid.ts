import type { Grid } from "../domain/Grid";
import type { RawGrid } from "../image-processing/imagedata-to-grid";

export function compileGrid(raw: RawGrid): Grid {
	return {
		width: raw.width,
		height: raw.height,
		pixels: raw.pixels.map((row) =>
			row.map((p) => ({
				colorId: p.colorId,
				alive: p.active,
			})),
		),
	};
}
