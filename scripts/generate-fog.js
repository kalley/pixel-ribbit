import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "canvas";

const OUTPUT_DIR = "./src/assets"; // or wherever your assets live
const WIDTH = 390;
const HEIGHT = 290;

// Your existing noise functions
function fbmTileable(x, y, width, height, octaves, seed) {
	let value = 0;
	let amplitude = 1;
	let frequency = 1;
	let maxValue = 0;

	for (let i = 0; i < octaves; i++) {
		value +=
			noise2DTileable(
				x * frequency,
				y * frequency,
				width * frequency,
				height * frequency,
				seed + i * 100,
			) * amplitude;
		maxValue += amplitude;
		amplitude *= 0.5;
		frequency *= 2;
	}

	return (value / maxValue + 1) / 2;
}

function noise2DTileable(x, y, width, height, seed) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const xf = x - xi;
	const yf = y - yi;

	const u = xf * xf * (3 - 2 * xf);
	const v = yf * yf * (3 - 2 * yf);

	// Make sure wrapping is consistent
	const wrapX = (n) => ((n % width) + width) % width;
	const wrapY = (n) => ((n % height) + height) % height;

	const x0 = wrapX(xi);
	const x1 = wrapX(xi + 1);
	const y0 = wrapY(yi);
	const y1 = wrapY(yi + 1);

	// Use the SAME hash function as browser
	const a = hash2D(x0, y0);
	const b = hash2D(x1, y0);
	const c = hash2D(x0, y1);
	const d = hash2D(x1, y1);

	return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function hash2D(x, y) {
	const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return (n - Math.floor(n)) * 2 - 1;
}

// Layer configurations
const layerConfigs = [
	{ color: "190, 200, 230", opacity: 0.9, cloudScale: 120, speed: 0.15 },
	{ color: "200, 215, 235", opacity: 0.9, cloudScale: 85, speed: 0.35 },
	{ color: "210, 225, 245", opacity: 0.85, cloudScale: 48, speed: 1.2 },
	{ color: "215, 230, 248", opacity: 0.8, cloudScale: 55, speed: 0.85 },
];

async function generateFogLayers() {
	// Ensure output directory exists
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	console.log(
		`Generating ${layerConfigs.length} fog layers at ${WIDTH}x${HEIGHT}...`,
	);

	for (let li = 0; li < layerConfigs.length; li++) {
		const layer = layerConfigs[li];
		const layerSeed = li * 1234.567;

		console.log(`  Layer ${li}...`);

		const canvas = createCanvas(WIDTH, HEIGHT);
		const ctx = canvas.getContext("2d");
		const imageData = ctx.createImageData(WIDTH, HEIGHT);
		const data = imageData.data;

		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				const i = (y * WIDTH + x) * 4;

				const cloudDensity = fbmTileable(
					(x + layerSeed) / layer.cloudScale, // Add seed here
					(y * 0.7 + layerSeed) / layer.cloudScale, // And here, with 0.7 factor
					WIDTH / layer.cloudScale,
					HEIGHT / layer.cloudScale,
					3,
					layerSeed,
				);

				const threshold = cloudDensity ** 1.2;

				if (threshold > 0.2) {
					const stepped = (Math.round(threshold * 6) / 6) ** 1.05;
					const alpha = stepped * layer.opacity;
					const [r, g, b] = layer.color.split(", ").map(Number);

					data[i] = r;
					data[i + 1] = g;
					data[i + 2] = b;
					data[i + 3] = Math.floor(alpha * 255);
				}
			}
		}

		ctx.putImageData(imageData, 0, 0);

		// Save as PNG
		const outputPath = path.join(OUTPUT_DIR, `fog-layer-${li}.png`);
		const buffer = canvas.toBuffer("image/png");
		fs.writeFileSync(outputPath, buffer);

		console.log(`  ✓ Saved ${outputPath}`);
	}

	console.log('Done! Run GIMP "Make Seamless" filter, then convert to WebP:');
	console.log(
		`  magick mogrify -format webp -quality 75 ${OUTPUT_DIR}/fog-layer-*.png`,
	);
}

generateFogLayers();
