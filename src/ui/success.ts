import { h } from "../utils/h";

export const successDialog = h(
	"dialog",
	{ class: "pixel-modal" },
	h("div", {
		class: "modal-content",
		children: [
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
				h("button", { class: "pixel-btn btn-green" }, "NEXT LEVEL"),
				h(
					"button",
					{
						class: "pixel-btn btn-brown",
						onClick: () => successDialog.close(),
					},
					"REPLAY",
				),
			),
		],
	}),
);
