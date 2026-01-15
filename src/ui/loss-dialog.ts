import { h } from "../utils/h";
import { makeButton } from "./button/button";
import { makeModal } from "./modal/modal";

export function makeLossDialog() {
	const element = makeModal(
		h("header", {}, h("h2", { class: "pixel-text color-gold" }, "GAME OVER")),
		h(
			"menu",
			{},
			makeButton(
				{ class: "btn-brown", onClick: () => element.close() },
				"TRY ANOTHER",
			),
		),
	);

	return { element, showModal: () => element.showModal() };
}
