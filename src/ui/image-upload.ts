import { h } from "../utils/h";

export function imageUpload(onUpload: (file: File) => void) {
	return h("input", {
		type: "file",
		accept: "image/*",
		onChange: (event) => {
			const image = Array.from(event.target.files ?? []).at(0);

			if (!image) return;

			onUpload(image);
			event.target.value = "";
		},
	});
}
