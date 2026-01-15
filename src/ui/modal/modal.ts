import { type Children, h } from "../../utils/h";
import "./modal-styles.css";

export function makeModal(...children: Children) {
	return h(
		"dialog",
		{ class: "pixel-modal" },
		h("div", { class: "modal-content" }, ...children),
	);
}
