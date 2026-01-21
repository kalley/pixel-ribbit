// Import your fog images
import fogLayer0 from "../assets/fog-layer-0.webp";
import fogLayer1 from "../assets/fog-layer-1.webp";
import fogLayer2 from "../assets/fog-layer-2.webp";
import fogLayer3 from "../assets/fog-layer-3.webp";
import { FEEDER_FOG_OVERLAP } from "../constants";
import { loadImage } from "../utils/load-image";
import { roundToStep } from "../utils/round-to-step";
import type { LayoutFrame } from "../viewport";

const fogLayers = [
	loadImage(fogLayer0),
	loadImage(fogLayer1),
	loadImage(fogLayer2),
	loadImage(fogLayer3),
];

const fogCompositeCanvas = document.createElement("canvas");

export function drawTexturedFog(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame,
	animationTime: number = 0,
) {
	// Early return if images aren't loaded yet
	if (fogLayers.some((img) => !img.get())) return;

	const fogStartY = layout.elastic.y;
	const fogEndY = layout.elastic.fogEnd;
	const fogHeight = fogEndY - fogStartY;

	if (
		fogCompositeCanvas.width !== layout.width ||
		fogCompositeCanvas.height !== fogHeight
	) {
		fogCompositeCanvas.width = layout.width;
		fogCompositeCanvas.height = fogHeight;
	}

	const fogCtx = fogCompositeCanvas.getContext("2d");
	if (!fogCtx) return;

	fogCtx.clearRect(0, 0, layout.width, fogHeight);

	const layers = [
		{ color: "190, 200, 230", opacity: 0.9, cloudScale: 120, speed: 0.15 },
		{ color: "200, 215, 235", opacity: 0.9, cloudScale: 85, speed: 0.35 },
		{ color: "210, 225, 245", opacity: 0.85, cloudScale: 48, speed: 1.2 },
		{ color: "215, 230, 248", opacity: 0.8, cloudScale: 55, speed: 0.85 },
	];

	for (let i = 0; i < fogLayers.length; i++) {
		const layer = layers[i];
		const fogImage = fogLayers[i].get();

		if (!fogImage) continue;

		const xOffset = roundToStep(
			(animationTime * 0.01 * layer.speed) % fogImage.width,
			1,
			{ bias: 0.25 },
		);
		const yOffset = roundToStep(
			(animationTime * 0.005 * layer.speed) % fogImage.height,
			1,
			{ bias: 0.25 },
		);

		fogCtx.globalAlpha = layer.opacity;

		const tilesX = Math.ceil(layout.width / fogImage.width) + 1;
		const tilesY = Math.ceil(fogHeight / fogImage.height) + 1;

		for (let ty = -1; ty <= tilesY; ty++) {
			for (let tx = -1; tx <= tilesX; tx++) {
				fogCtx.drawImage(
					fogImage,
					fogImage.width * tx - xOffset,
					fogImage.height * ty - yOffset,
					fogImage.width,
					fogImage.height,
				);
			}
		}
	}

	fogCtx.globalAlpha = 1;

	// Apply vertical fade gradient as a mask to match original behavior
	const overlapDistance = FEEDER_FOG_OVERLAP; // The distance it covers above
	const fadeDistance = fogHeight * 0.5; // Fade over first 50% like original

	const fadeGradient = fogCtx.createLinearGradient(
		0,
		0,
		0,
		Math.max(overlapDistance, fadeDistance),
	);

	// Start fully transparent at the top
	fadeGradient.addColorStop(0, "rgba(0, 0, 0, 1)");

	// Create gradient with combined fade curves
	const fadeStops = 10;
	for (let i = 1; i <= fadeStops; i++) {
		const pixelY = (i / fadeStops) * Math.max(overlapDistance, fadeDistance);

		// fadeProgress: fade over first 50% of total fog height
		const fadeProgress = Math.min(1, pixelY / fadeDistance) ** 0.7;

		// overlapFactor: fade over the overlap distance
		const t = Math.min(1, pixelY / overlapDistance);
		const overlapFactor = t * t;

		// Combine both factors like original (multiply them together)
		const combinedAlpha = 1 - fadeProgress * overlapFactor;

		fadeGradient.addColorStop(i / fadeStops, `rgba(0, 0, 0, ${combinedAlpha})`);
	}

	fogCtx.globalCompositeOperation = "destination-out";
	fogCtx.fillStyle = fadeGradient;
	fogCtx.fillRect(0, 0, layout.width, fogHeight);
	fogCtx.globalCompositeOperation = "source-over";
	// Now draw the complete fog to main canvas in one go
	ctx.drawImage(fogCompositeCanvas, 0, fogStartY);
}
