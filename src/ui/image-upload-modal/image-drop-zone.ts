import { h } from "../../utils/h";

export function makeImageDropZone(onFileSelect: (file: File) => void) {
	const handleFileSelect = (file: File) => {
		dropZone.style.display = "none";
		onFileSelect(file);
	};
	const fileInput = h("input", {
		type: "file",
		accept: "image/*",
		style: "display: none",
		onChange: (e) => {
			const target = e.target as HTMLInputElement;
			const file = target.files?.[0];

			if (file) handleFileSelect(file);
		},
	});

	const dropZone = h(
		"div",
		{
			class: "drop-zone",
			onClick: () => fileInput.click(),
			onDragOver: (e) => {
				e.preventDefault();
				e.stopPropagation();
				e.currentTarget.classList.add("is-dragging");
			},
			onDragLeave: (e) => {
				e.preventDefault();
				e.stopPropagation();
				e.currentTarget.classList.remove("is-dragging");
			},
			onDrop: (e) => {
				e.preventDefault();
				dropZone.classList.remove("is-dragging");

				const file = e.dataTransfer?.files[0];

				if (file?.type.startsWith("image/")) {
					handleFileSelect(file);
				}
			},
		},
		h("p", {}, "Drop an image here or click to browse"),
		fileInput,
	);

	return {
		element: dropZone,
		reset: () => {
			dropZone.style.display = "block";
			fileInput.value = "";
		},
	};
}
