// asset-cache.ts
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

function getImage(path: string): HTMLImageElement | null {
	return imageCache.get(path) || null;
}

function getLoader(path: string, promise: Promise<HTMLImageElement>) {
	return { promise, get: () => getImage(path) };
}

export function loadImage(path: string) {
	const cachedImage = imageCache.get(path);

	if (cachedImage) return getLoader(path, Promise.resolve(cachedImage));

	const cachedLoading = loadingPromises.get(path);

	if (cachedLoading) return getLoader(path, cachedLoading);

	const promise = new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			imageCache.set(path, img);
			loadingPromises.delete(path);
			resolve(img);
		};
		img.onerror = reject;
		img.src = path;
	});
	loadingPromises.set(path, promise);

	return getLoader(path, promise);
}
