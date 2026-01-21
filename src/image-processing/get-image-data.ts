export async function getImageData(
	image: File,
): Promise<{ imageData: ImageData; width: number; height: number }> {
	const url = URL.createObjectURL(image);
	const img = new Image();

	img.src = url;

	return new Promise((resolve, reject) => {
		img.onload = () => {
			URL.revokeObjectURL(url);
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext("2d");

			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0);

			resolve({
				imageData: ctx.getImageData(0, 0, img.width, img.height),
				width: img.width,
				height: img.height,
			});
		};

		img.onerror = (error) => {
			URL.revokeObjectURL(url);
			reject(error);
		};
	});
}
