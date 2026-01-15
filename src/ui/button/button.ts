import type { JSX } from "solid-js";
import { type Children, h } from "../../utils/h";
import "./button-styles.css";

export function makeButton(
	{
		class: className,
		onClick,
	}: {
		class?: string;
		onClick?: JSX.EventHandlerUnion<
			HTMLButtonElement,
			MouseEvent,
			JSX.EventHandler<HTMLButtonElement, MouseEvent>
		>;
	},
	...children: Children
) {
	return h(
		"button",
		{
			class: `pixel-btn${className ? ` ${className}` : ""}`,
			onClick,
		},
		...children,
	);
}
