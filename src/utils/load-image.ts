// asset-cache.ts
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

const BASE_PATH = import.meta.env.BASE_URL || "/";

function getImage(path: string): HTMLImageElement | null {
	return imageCache.get(path) || null;
}

function getLoader(path: string, promise: Promise<HTMLImageElement>) {
	return { promise, get: () => getImage(path) };
}

// Helper to resolve path with base
function resolvePath(path: string): string {
	// If path is already absolute (starts with http/https), return as-is
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	// Remove leading slash if present to avoid double slashes
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;

	// Combine base path with asset path
	return `${BASE_PATH}/${cleanPath}`;
}

export function loadImage(path: string) {
	const resolvedPath = resolvePath(path);
	const cachedImage = imageCache.get(resolvedPath);

	if (cachedImage) return getLoader(resolvedPath, Promise.resolve(cachedImage));

	const cachedLoading = loadingPromises.get(resolvedPath);

	if (cachedLoading) return getLoader(resolvedPath, cachedLoading);

	const promise = new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			imageCache.set(resolvedPath, img);
			loadingPromises.delete(resolvedPath);
			resolve(img);
		};
		img.onerror = reject;
		img.src = resolvedPath;
	});
	loadingPromises.set(resolvedPath, promise);

	return getLoader(resolvedPath, promise);
}
