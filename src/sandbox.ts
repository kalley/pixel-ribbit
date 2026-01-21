import "./style.css";
import lightingUrl from "./assets/frog_lighting.webp";
import lightingUrlFixed from "./assets/frog_lighting_bright_fixed.webp";
import lightingUrlGamma from "./assets/frog_lighting_bright_gamma.webp";
import lightingUrlLevels from "./assets/frog_lighting_bright_levels.webp";
import lightingUrlSimple from "./assets/frog_lighting_bright_simple.webp";
import lightingUrlSimpleFix from "./assets/frog_lighting_bright_simple_fix.webp";
import maskUrl from "./assets/frog_mask.webp";
import outlineUrl from "./assets/frog_outline.webp";
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
const lightingImgSimpleFix = loadImage(lightingUrlSimpleFix);

await Promise.all([
	maskImg.promise,
	lightingImg.promise,
	lightingImgSimple.promise,
	lightingImgGamma.promise,
	lightingImgLevels.promise,
	lightingImgFixed.promise,
	outlineImg.promise,
	lightingImgSimpleFix.promise,
]);

type LightingMode =
	| "default"
	| "simple"
	| "gamma"
	| "levels"
	| "fixed"
	| "simple-fix";

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
		"simple-fix": lightingImgSimpleFix,
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
	ctx.font = "bold 8px SF Mono, Roboto Mono, Menlo"; // Made bold
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;
	ctx.lineJoin = "round";
	ctx.strokeText(`${r}\n${g}\n${b}`, x + 28, y + 28);
	ctx.fillStyle = "white";
	ctx.fillText(`${r}\n${g}\n${b}`, x + 28, y + 28); // Centered text
	y += 56;
});

const modes = [
	"default",
	// "simple",
	"simple-fix",
	// "gamma",
	// "levels",
	"fixed",
] as const;

modes.forEach((mode) => {
	(["multiply"] as const).forEach((screenMode) => {
		y = 0;
		x += 56;
		console.log(mode, screenMode, x, y, 56, 56);
		drawFrog(mode, screenMode)?.forEach((sprite) => {
			ctx.drawImage(sprite, x, y, 56, 56);
			y += 56;
		});
	});
});
