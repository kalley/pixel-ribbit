import "./style.css";
import lightingUrl from "./assets/frog_lighting.png";
import lightingUrlFixed from "./assets/frog_lighting_bright_fixed.png";
import lightingUrlGamma from "./assets/frog_lighting_bright_gamma.png";
import lightingUrlLevels from "./assets/frog_lighting_bright_levels.png";
import lightingUrlSimple from "./assets/frog_lighting_bright_simple.png";
import maskUrl from "./assets/frog_mask.png";
import outlineUrl from "./assets/frog_outline.png";
import { palette } from "./image-processing/color-utils";
import { buildFrogSprite } from "./renderer/draw-frog";
import { loadImage } from "./utils/load-image";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
	throw new Error("App element not found");
}

const maskImg = loadImage(maskUrl);
const lightingImg = loadImage(lightingUrl);
const lightingImgSimple = loadImage(lightingUrlSimple);
const lightingImgGamma = loadImage(lightingUrlGamma);
const lightingImgLevels = loadImage(lightingUrlLevels);
const lightingImgFixed = loadImage(lightingUrlFixed);
const outlineImg = loadImage(outlineUrl);

await Promise.all([
	maskImg.promise,
	lightingImg.promise,
	lightingImgSimple.promise,
	lightingImgGamma.promise,
	lightingImgLevels.promise,
	lightingImgFixed.promise,
	outlineImg.promise,
]);

type LightingMode = "default" | "simple" | "gamma" | "levels" | "fixed";

function drawFrog(
	lightingMode: LightingMode,
	screenMode: "screen" | "multiply",
) {
	const mask = maskImg.get();
	const lighting = {
		default: lightingImg,
		simple: lightingImgSimple,
		gamma: lightingImgGamma,
		levels: lightingImgLevels,
		fixed: lightingImgFixed,
	}[lightingMode].get();
	const outline = outlineImg.get();

	if (!mask || !lighting || !outline) {
		console.error("Failed to load frog assets");
		return;
	}

	return palette.map((color) =>
		buildFrogSprite({
			mask,
			lighting,
			outline,
			color,
			targetSize: 128,
			screenMode,
		}),
	);
}

const canvas = document.createElement("canvas");
canvas.height = palette.length * 56;
canvas.width = 56 + 56 * 5 * 2;
canvas.style.width = `${canvas.width}px`;
canvas.style.maxWidth = `${canvas.width}px`;
canvas.style.height = `${canvas.height}px`;
const ctx = canvas.getContext("2d");

if (!ctx) {
	throw new Error("Failed to get canvas context");
}

app.appendChild(canvas);

let x = 0;
let y = 0;

palette.forEach(([r, g, b]) => {
	ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
	ctx.fillRect(x, y, 56, 56);
	y += 56;
});

(["default", "simple", "gamma", "levels", "fixed"] as const).forEach((mode) => {
	(["screen", "multiply"] as const).forEach((screenMode) => {
		drawFrog(mode, screenMode)?.forEach((sprite) => {
			ctx.drawImage(sprite, x, y, 56, 56);
			y += 56;
		});
		x += 56;
		y = 0;
	});
});
