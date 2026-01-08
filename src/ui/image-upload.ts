export function imageUpload(onUpload: (file: File) => void) {
	const input = document.createElement("input");

	input.type = "file";
	input.accept = "image/*";

	input.addEventListener("change", async () => {
		const image = Array.from(input.files ?? []).at(0);

		if (!image) return;

		onUpload(image);
	});

	return input;
}
