import type { RGB } from "../game/color";
import type { PaletteChoices } from "./color-utils";

export const ALPHA_THRESHOLD = 128; // Ignore pixels that are more than 50% transparent

export interface PosterizeResult {
	imageData: ImageData;
	usedPalette: PaletteChoices; // The final N colors selected
}

/**
 * Posterizes an image to a limited color palette using perceptually-aware selection.
 *
 * Algorithm:
 * 1. Map all opaque pixels to their nearest palette color
 * 2. Count frequency of each palette color in the image
 * 3. Filter candidates using adaptive threshold based on:
 *    - Image complexity (color diversity)
 *    - Target color count
 *    - Color distribution (dominance)
 * 4. Seed selection with the most saturated common color
 * 5. Greedily select remaining colors by maximizing:
 *    - Perceptual distance from already-selected colors
 *    - Frequency in the image (log-scaled)
 *    - Saturation (with capped bonus to preserve neutrals)
 * 6. Remap all pixels to the final selected palette
 *
 * @param imageData - Source image
 * @param paletteColors - Available colors to choose from
 * @param maxColors - Maximum colors in final image (default: 8)
 * @returns Posterized image and the subset of palette colors actually used
 */
export function posterize(
	imageData: ImageData,
	paletteColors: PaletteChoices,
	maxColors = 8,
): PosterizeResult {
	const data = imageData.data;

	const paletteCache = new Map<number, [number, number, number]>();
	const effectivePalette =
		maxColors < paletteColors.length
			? selectBestPaletteColors(data, paletteColors, paletteCache, maxColors)
			: paletteColors;

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < ALPHA_THRESHOLD) continue;

		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		// alpha at data[i + 3], usually keep as-is

		const closest = findClosestColor([r, g, b], effectivePalette, paletteCache);
		data[i] = closest[0];
		data[i + 1] = closest[1];
		data[i + 2] = closest[2];
	}

	return {
		imageData,
		usedPalette: effectivePalette,
	};
}

function selectBestPaletteColors(
	data: Uint8ClampedArray,
	palette: PaletteChoices,
	paletteCache: Map<number, RGB>,
	count: number,
): PaletteChoices {
	const colorCounts = new Map<number, number>();
	const presentColorsMap = new Map<number, [number, number, number]>();
	let totalOpaquePixels = 0;

	// 1. Initial Pass: Identify what colors exist and how often
	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < ALPHA_THRESHOLD) continue;
		totalOpaquePixels++;

		const closest = findClosestColor(
			[data[i], data[i + 1], data[i + 2]],
			palette,
			paletteCache,
		);
		const key = (closest[0] << 16) | (closest[1] << 8) | closest[2];

		colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
		if (!presentColorsMap.has(key)) presentColorsMap.set(key, closest);
	}

	const allPresentColors = Array.from(presentColorsMap.values());

	// 2. Filter by Threshold (The "Good" Candidates)
	const minPixelThreshold = calculateAdaptiveThreshold(
		totalOpaquePixels,
		presentColorsMap.size,
		palette.length,
		count,
		colorCounts,
	);
	const candidates = allPresentColors.filter((color) => {
		const key = (color[0] << 16) | (color[1] << 8) | color[2];
		return (colorCounts.get(key) ?? 0) >= minPixelThreshold;
	});

	// 3. SAFETY NET: If we over-filtered, add back the most common rejected colors
	const targetCount = Math.min(count, candidates.length);

	// 4. SEED: Start with the most vibrant (saturated) common color
	// This ensures Pikachu's Yellow or Red is the "anchor" color
	candidates.sort((a, b) => getSaturation(b) - getSaturation(a));

	const firstColor = candidates.shift();

	if (!firstColor) {
		throw new Error("No colors found in image - is it completely transparent?");
	}

	const selected: PaletteChoices = [firstColor];

	// 5. GREEDY SELECTION: Maximize Diversity
	while (selected.length < targetCount && candidates.length > 0) {
		let maxScore = -1;
		let bestCandidateIdx = -1;

		for (let i = 0; i < candidates.length; i++) {
			const candidate = candidates[i];
			const key = (candidate[0] << 16) | (candidate[1] << 8) | candidate[2];
			const freq = colorCounts.get(key) ?? 0;

			let minDistSq = Infinity;
			for (const s of selected) {
				const d = colorDistanceSq(candidate, s);
				if (d < minDistSq) minDistSq = d;
			}

			// SCORE: Distance * Popularity * Saturation
			// Math.sqrt(minDistSq) gives us the linear distance
			const saturationBoost = 1 + getSaturation(candidate) * 0.5; // Max 1.5x instead of 2x
			const score =
				Math.sqrt(minDistSq) * Math.log10(freq + 1) * saturationBoost;

			if (score > maxScore) {
				maxScore = score;
				bestCandidateIdx = i;
			}
		}

		if (bestCandidateIdx !== -1) {
			selected.push(candidates.splice(bestCandidateIdx, 1)[0]);
		} else {
			break;
		}
	}

	return selected;
}

function calculateAdaptiveThreshold(
	totalPixels: number,
	uniqueColors: number,
	paletteSize: number,
	targetCount: number,
	colorCounts: Map<number, number>,
): number {
	// Factor 1: Image complexity
	const complexityFactor = Math.max(
		0.4,
		Math.min(1.2, uniqueColors / paletteSize),
	);

	// Factor 2: Target count
	const targetFactor = Math.sqrt(8 / targetCount); // sqrt to soften the curve

	// Factor 3: Distribution evenness (simplified entropy)
	const counts = Array.from(colorCounts.values()).sort((a, b) => b - a);
	const top3Share = (counts[0] + counts[1] + counts[2]) / totalPixels;
	const dominanceFactor = top3Share > 0.7 ? 1.5 : 1.0; // If 3 colors dominate, be pickier

	// Combine
	const baseThreshold = 0.002; // 0.2%
	const adjustedThreshold =
		baseThreshold * complexityFactor * targetFactor * dominanceFactor;

	return Math.max(5, Math.floor(totalPixels * adjustedThreshold));
}

// Helper to prioritize "colorful" colors over greys/blacks
function getSaturation(color: [number, number, number]): number {
	const max = Math.max(...color);
	const min = Math.min(...color);
	return max === 0 ? 0 : (max - min) / max;
}

// Helper to keep code clean
function colorDistanceSq(
	c1: [number, number, number],
	c2: [number, number, number],
): number {
	return (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2;
}

// Convert RGB to LAB color space (perceptually uniform)
function rgbToLab(rgb: [number, number, number]): [number, number, number] {
	// First convert to XYZ
	const [r, g, b] = rgb.map((v) => {
		v = v / 255;
		return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92;
	});

	const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
	const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
	const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

	const fx = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
	const fy = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
	const fz = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;

	return [
		116 * fy - 16, // L (lightness)
		500 * (fx - fy), // a (green-red)
		200 * (fy - fz), // b (blue-yellow)
	];
}

function findClosestColor(
	pixel: RGB,
	palette: PaletteChoices,
	paletteCache: Map<number, RGB>,
): RGB {
	let minDist = Infinity;
	let closest = palette[0];

	const pixelLab = rgbToLab(pixel);

	for (const color of palette) {
		const key = (color[0] << 16) | (color[1] << 8) | color[2];
		let colorLab = paletteCache.get(key);

		if (!colorLab) {
			colorLab = rgbToLab(color);
			paletteCache.set(key, colorLab);
		}

		// Simple Euclidean distance in LAB space (CIE76)
		const baseDist = Math.sqrt(
			(pixelLab[0] - colorLab[0]) ** 2 +
				(pixelLab[1] - colorLab[1]) ** 2 +
				(pixelLab[2] - colorLab[2]) ** 2,
		);

		if (baseDist === 0) return color;

		// In findClosestColor, add luminance check
		const pixelLuminance =
			0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
		const colorLuminance =
			0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];

		// Penalize colors that are in a very different luminance range
		const luminancePenalty =
			Math.abs(pixelLuminance - colorLuminance) > 50 ? 1.5 : 1.0;
		const dist = baseDist * luminancePenalty;

		if (dist < minDist) {
			minDist = dist;
			closest = color;
		}
	}

	return closest;
}
