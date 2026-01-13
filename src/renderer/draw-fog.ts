import { FEEDER_FOG_OVERLAP } from "../constants";
import type { LayoutFrame } from "../viewport";

interface FogLayer {
	startY: number;
	endY: number;
	color: string;
	opacity: number;
	cloudScale: number; // How "zoomed in" the clouds are
	speed: number; // Animation speed multiplier
}

export function drawTexturedFog(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame,
	animationTime: number = 0,
) {
	const fogStartY = layout.elastic.y;
	const fogEndY = layout.elastic.fogEnd;
	const fogHeight = fogEndY - fogStartY;

	const fogCanvas = document.createElement("canvas");
	fogCanvas.width = layout.width;
	fogCanvas.height = fogHeight;
	const fogCtx = fogCanvas.getContext("2d");
	if (!fogCtx) return;

	// Start layers MUCH higher and with more dramatic speed differences
	const layers: FogLayer[] = [
		{
			startY: fogHeight, // Start at the very top
			endY: fogHeight,
			color: "190, 200, 230",
			opacity: 0.9,
			cloudScale: 120,
			speed: 0.15, // Slow
		},
		{
			startY: fogHeight, // Also from top
			endY: fogHeight,
			color: "200, 215, 235",
			opacity: 0.9,
			cloudScale: 85,
			speed: 0.35, // Faster
		},
		{
			startY: 0,
			endY: fogHeight,
			color: "205, 220, 240",
			opacity: 0.85,
			cloudScale: 65,
			speed: 0.6, // Even faster
		},
		{
			startY: 0,
			endY: fogHeight,
			color: "210, 225, 245",
			opacity: 0.85,
			cloudScale: 48,
			speed: 1.2, // Quite fast
		},
		{
			startY: 0,
			endY: fogHeight,
			color: "215, 230, 248",
			opacity: 0.8,
			cloudScale: 55,
			speed: 0.85, // Medium-fast
		},
	];

	for (let li = 0; li < layers.length; li++) {
		const layer = layers[li];
		// give each layer a simple distinct seed so the patterns aren't identical
		const layerSeed = li * 1234.567;

		drawCloudLayerComposite(
			fogCtx,
			layout.width,
			fogHeight,
			layer,
			animationTime,
			layerSeed,
		);
	}

	ctx.save();
	ctx.drawImage(fogCanvas, 0, fogStartY);
	ctx.restore();
}

function drawCloudLayerComposite(
	fogCtx: CanvasRenderingContext2D,
	width: number,
	height: number,
	layer: FogLayer,
	animationTime: number,
	seed: number,
) {
	// create offscreen canvas for this layer
	const layerCanvas = document.createElement("canvas");
	layerCanvas.width = width;
	layerCanvas.height = height;
	const layerCtx = layerCanvas.getContext("2d");
	if (!layerCtx) return;

	const imageData = layerCtx.createImageData(width, height);
	const data = imageData.data;

	// Offsets for movement (tweak multipliers as you like)
	const xOffset = animationTime * 0.01 * layer.speed;
	const yOffset = animationTime * 0.005 * layer.speed;

	for (let y = 0; y < height; y++) {
		if (y < layer.startY || y > layer.endY) continue;
		const fadeProgress =
			Math.min(1, (y - layer.startY) / (height * 0.5)) ** 0.7;
		const t = Math.min(1, y / FEEDER_FOG_OVERLAP);
		const overlapFactor = t * t;

		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;

			// Add the seed into the noise input so patterns differ per layer
			const cloudDensity = fbm(
				(x + xOffset + seed) / layer.cloudScale,
				(y * 0.7 + yOffset + seed) / layer.cloudScale,
				3,
			);

			const threshold = cloudDensity ** 1.2;

			if (threshold > 0.2) {
				const stepped = (Math.round(threshold * 6) / 6) ** 1.05;
				const alpha = stepped * layer.opacity * fadeProgress * overlapFactor;
				const [r, g, b] = layer.color.split(", ").map(Number);

				// populate pixel in this layer's imageData (no cross-layer reads)
				data[i] = r;
				data[i + 1] = g;
				data[i + 2] = b;
				data[i + 3] = Math.floor(alpha * 255);
			}
		}
	}

	// put this layer into its offscreen canvas
	layerCtx.putImageData(imageData, 0, 0);

	// Composite onto fogCtx using drawImage (respects alpha)
	// choose compositing mode if you want a different visual: 'source-over' (normal), 'lighter' (additive),
	// 'screen' (soft light), etc. Save/restore state to avoid side effects.
	fogCtx.save();
	fogCtx.globalCompositeOperation = "source-over"; // try 'screen' or 'lighter' if you want a glow/additive look
	fogCtx.drawImage(layerCanvas, 0, 0);
	fogCtx.restore();
}

// Fractional Brownian Motion - creates natural-looking noise
function fbm(x: number, y: number, octaves: number): number {
	let value = 0;
	let amplitude = 1;
	let frequency = 1;
	let maxValue = 0;

	for (let i = 0; i < octaves; i++) {
		value += noise2D(x * frequency, y * frequency) * amplitude;
		maxValue += amplitude;
		amplitude *= 0.5;
		frequency *= 2;
	}

	return (value / maxValue + 1) / 2; // Normalize to 0-1
}

// Simple 2D noise function (simplified Perlin-like)
function noise2D(x: number, y: number): number {
	// Grid cell coordinates
	const xi = Math.floor(x);
	const yi = Math.floor(y);

	// Interpolation weights
	const xf = x - xi;
	const yf = y - yi;

	// Smooth interpolation (smoothstep)
	const u = xf * xf * (3 - 2 * xf);
	const v = yf * yf * (3 - 2 * yf);

	// Hash-based pseudo-random gradients
	const a = hash2D(xi, yi);
	const b = hash2D(xi + 1, yi);
	const c = hash2D(xi, yi + 1);
	const d = hash2D(xi + 1, yi + 1);

	// Bilinear interpolation
	return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

// Simple hash function for pseudo-random values
function hash2D(x: number, y: number): number {
	const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return (n - Math.floor(n)) * 2 - 1; // Return value between -1 and 1
}
