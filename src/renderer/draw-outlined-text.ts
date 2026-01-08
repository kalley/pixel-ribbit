export function drawOutlinedText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	fillColor: string = "white",
	outlineColor: string = "black",
	outlineWidth: number = 3,
) {
	ctx.font = "bold 14px SF Mono, Roboto Mono, Menlo"; // Made bold
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	// Draw outline
	ctx.strokeStyle = outlineColor;
	ctx.lineWidth = outlineWidth;
	ctx.lineJoin = "round";
	ctx.strokeText(text, x, y);

	// Draw fill
	ctx.fillStyle = fillColor;
	ctx.fillText(text, x, y);
}
