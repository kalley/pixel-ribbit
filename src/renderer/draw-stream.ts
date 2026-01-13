import {
	CORE_CONTENT_SIZE,
	CORE_PADDING,
	CORE_X,
	STREAM_BORDER_RADIUS,
	STREAM_WIDTH,
} from "../constants";
import type { LayoutFrame } from "../viewport";

type WaveLayer = {
	color: string;
	speed: number; // pixels per frame
	amplitude: number; // wave height
	frequency: number; // waves per perimeter length
	phase: number; // current animation offset
};

// Call this each frame to update wave animation
let waveLayers: WaveLayer[] | null = null;

export function updateWaves(deltaTime: number = 1) {
	if (!waveLayers) {
		waveLayers = [
			{
				color: "rgba(140, 200, 230, 0.12)",
				speed: 0.04,
				amplitude: 4,
				frequency: 0.02,
				phase: 0,
			},
			{
				color: "rgba(100, 170, 210, 0.2)",
				speed: 0.01,
				amplitude: 6,
				frequency: 0.015,
				phase: 0,
			},
			{
				color: "rgba(70, 140, 190, 0.25)",
				speed: 0.012,
				amplitude: 7,
				frequency: 0.012,
				phase: 0,
			},
			{
				color: "rgba(70, 140, 190, 0.1)",
				speed: 0.002,
				amplitude: 9,
				frequency: 0.012,
				phase: 0,
			},
		];
	}

	waveLayers.forEach((layer) => {
		layer.phase -= layer.speed * deltaTime;
	});
}

export function drawStream(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame["core"],
) {
	const { y } = layout;

	// Calculate inner bounds
	const innerX = CORE_PADDING + STREAM_WIDTH;
	const innerY = y + STREAM_WIDTH;
	const innerWidth = CORE_CONTENT_SIZE - STREAM_WIDTH * 2;
	const innerHeight = CORE_CONTENT_SIZE - STREAM_WIDTH * 2;
	const innerRadius = STREAM_BORDER_RADIUS / 2;

	// Create clipping region for stream band
	const outerPath = new Path2D();
	outerPath.roundRect(
		CORE_X,
		y,
		CORE_CONTENT_SIZE,
		CORE_CONTENT_SIZE,
		STREAM_BORDER_RADIUS,
	);

	const innerPath = new Path2D();
	innerPath.roundRect(innerX, innerY, innerWidth, innerHeight, innerRadius);

	ctx.save();
	// Draw base stream color
	ctx.fillStyle = "rgba(90, 140, 180, 0.4)";
	ctx.fill(outerPath);

	// Draw animated wave layers
	if (waveLayers) {
		waveLayers.forEach((layer, layerIndex) => {
			drawWaveLayer(ctx, layout, layer, layerIndex);
		});
	}

	// Set up clipping: only draw in the stream band area
	ctx.clip(outerPath);
	ctx.globalCompositeOperation = "destination-out";
	ctx.fillStyle = "black";
	ctx.fill(innerPath);
	ctx.globalCompositeOperation = "source-over";

	ctx.restore();

	// Draw borders for definition
	// ctx.strokeStyle = "rgba(80, 130, 180, 0.5)";
	// ctx.lineWidth = 2;
	// ctx.stroke(outerPath);
	// ctx.stroke(innerPath);
}

function drawWaveLayer(
	ctx: CanvasRenderingContext2D,
	layout: LayoutFrame["core"],
	layer: WaveLayer,
	layerIndex: number,
) {
	const { y } = layout;

	const sizeMod = (layerIndex % 3) + 0.75;

	// Calculate perimeter centerline
	const centerOffset = STREAM_WIDTH / (2 * sizeMod);
	const cx = CORE_PADDING + centerOffset;
	const cy = y + centerOffset;
	const cw = CORE_CONTENT_SIZE - STREAM_WIDTH / sizeMod;
	const ch = CORE_CONTENT_SIZE - STREAM_WIDTH / sizeMod;

	// Calculate perimeter length
	const perimeter = (cw + ch) * 2;

	const path = new Path2D();
	let firstPoint = true;

	// Sample points along the perimeter
	const segments = 200; // Higher = smoother

	for (let i = 0; i <= segments; i++) {
		const t = i / segments;
		const distance = t * perimeter;

		// Get position on perimeter
		const [px, py, normalX, normalY] = getPerimeterPoint(
			cx,
			cy,
			cw,
			ch,
			distance,
			perimeter,
		);

		// Add wave displacement perpendicular to stream direction
		const waveOffset =
			Math.sin((distance * layer.frequency + layer.phase) * Math.PI * 2) *
			layer.amplitude;

		const finalX = px + normalX * waveOffset;
		const finalY = py + normalY * waveOffset;

		if (firstPoint) {
			path.moveTo(finalX, finalY);
			firstPoint = false;
		} else {
			path.lineTo(finalX, finalY);
		}
	}

	path.closePath();

	ctx.fillStyle = layer.color;
	ctx.fill(path);
}

// Returns [x, y, normalX, normalY] for a point at 'distance' along the perimeter
// normalX/normalY is the perpendicular direction (pointing inward to the stream)
function getPerimeterPoint(
	x: number,
	y: number,
	width: number,
	height: number,
	distance: number,
	perimeter: number,
): [number, number, number, number] {
	// Normalize distance to 0-1 range
	const t = (distance % perimeter) / perimeter;

	// Bottom edge (moving left to right)
	if (t < width / perimeter) {
		const progress = t * perimeter;
		return [
			x + progress,
			y + height,
			0, // normal points up (into stream)
			-1,
		];
	}

	// Right edge (moving bottom to top)
	const rightStart = width / perimeter;
	if (t < rightStart + height / perimeter) {
		const progress = (t - rightStart) * perimeter;
		return [
			x + width,
			y + height - progress,
			-1, // normal points left (into stream)
			0,
		];
	}

	// Top edge (moving right to left)
	const topStart = rightStart + height / perimeter;
	if (t < topStart + width / perimeter) {
		const progress = (t - topStart) * perimeter;
		return [
			x + width - progress,
			y,
			0, // normal points down (into stream)
			1,
		];
	}

	// Left edge (moving top to bottom)
	const leftStart = topStart + width / perimeter;
	const progress = (t - leftStart) * perimeter;
	return [
		x,
		y + progress,
		1, // normal points right (into stream)
		0,
	];
}
