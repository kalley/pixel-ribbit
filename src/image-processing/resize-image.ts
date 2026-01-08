interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Finds the tightest rectangle containing non-transparent pixels.
 */
function getOpaqueBoundingBox(imageData: ImageData): BoundingBox | null {
	const { width, height, data } = imageData;
	let minX = width,
		minY = height,
		maxX = 0,
		maxY = 0;
	let found = false;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const alphaIndex = (y * width + x) * 4 + 3;
			if (data[alphaIndex] > 0) {
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
				found = true;
			}
		}
	}

	return found
		? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
		: null;
}

export function processImageForGrid(
	imageData: ImageData,
	targetSize: number,
): ImageData {
	// 1. Setup original canvas
	const originalCanvas = document.createElement("canvas");
	const originalCtx = originalCanvas.getContext("2d");

	if (!originalCtx) {
		throw new Error("Failed to get 2D context for original canvas");
	}

	originalCanvas.width = imageData.width;
	originalCanvas.height = imageData.height;
	originalCtx.putImageData(imageData, 0, 0);

	// 2. Identify the "True" content area (ignore outer transparency)
	const bbox = getOpaqueBoundingBox(imageData) || {
		x: 0,
		y: 0,
		width: imageData.width,
		height: imageData.height,
	};

	// 3. Calculate Center-Crop coordinates relative to the Bounding Box
	let sX = bbox.x;
	let sY = bbox.y;
	let sWidth = bbox.width;
	let sHeight = bbox.height;

	const aspect = bbox.width / bbox.height;

	if (aspect > 1) {
		// Content is Landscape: Crop the sides to make it a square
		const offset = (bbox.width - bbox.height) / 2;
		sX += offset;
		sWidth = bbox.height;
	} else if (aspect < 1) {
		// Content is Portrait: Crop the top/bottom to make it a square
		const offset = (bbox.height - bbox.width) / 2;
		sY += offset;
		sHeight = bbox.width;
	}

	// 4. Draw to target square canvas
	const targetCanvas = document.createElement("canvas");
	const targetCtx = targetCanvas.getContext("2d");

	if (!targetCtx) {
		throw new Error("Failed to get 2D context for target canvas");
	}

	targetCanvas.width = targetSize;
	targetCanvas.height = targetSize;

	// Disable smoothing to keep pixel edges crisp for the posterizer
	targetCtx.imageSmoothingEnabled = false;

	targetCtx.drawImage(
		originalCanvas,
		sX,
		sY,
		sWidth,
		sHeight, // Source: The centered square within the bbox
		0,
		0,
		targetSize,
		targetSize, // Destination: The full grid
	);

	return targetCtx.getImageData(0, 0, targetSize, targetSize);
}
