import { h } from "../utils/h";
import { makeButton } from "./button/button";
import { makeModal } from "./modal/modal";

export function makeWinDialog() {
	const element = makeModal(
		h(
			"header",
			{},
			h("h2", { class: "pixel-text color-gold" }, "LEVEL CLEAR!"),
		),
		h(
			"div",
			{ class: "reward-area" },
			h("span", { class: "star filled" }, "★"),
			h("span", { class: "star filled" }, "★"),
			h("span", { class: "star empty" }, "★"),
		),
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
