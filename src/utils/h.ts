import type { JSX } from "solid-js";

export type Children = (HTMLElement | Text | string | null | undefined)[];

type EventListenerOptions = {
	passive?: boolean;
	capture?: boolean;
	once?: boolean;
};
type ElementSpecificAttributes<T extends keyof HTMLElementTagNameMap> =
	T extends "input"
		? JSX.InputHTMLAttributes<HTMLElementTagNameMap[T]>
		: T extends "button"
			? JSX.ButtonHTMLAttributes<HTMLElementTagNameMap[T]>
			: T extends "a"
				? JSX.AnchorHTMLAttributes<HTMLElementTagNameMap[T]>
				: T extends "img"
					? JSX.ImgHTMLAttributes<HTMLElementTagNameMap[T]>
					: T extends "textarea"
						? JSX.TextareaHTMLAttributes<HTMLElementTagNameMap[T]>
						: T extends "select"
							? JSX.SelectHTMLAttributes<HTMLElementTagNameMap[T]>
							: JSX.HTMLAttributes<HTMLElementTagNameMap[T]>;

type HTMLPropsWithEventOptions<T extends keyof HTMLElementTagNameMap> =
	ElementSpecificAttributes<T> & {
		eventOptions?: {
			[K in keyof HTMLElementEventMap]?: EventListenerOptions;
		};
	};

function isEventListener(value: unknown): value is EventListener {
	return typeof value === "function";
}

function isString(value: unknown): value is string {
	return typeof value === "string";
}

function appendChildren(
	element: HTMLElement | DocumentFragment,
	children: Children,
) {
	children.flat().forEach((child) => {
		if (child == null) return;
		element.appendChild(
			isString(child) ? document.createTextNode(child) : child,
		);
	});
}

export function h<T extends keyof HTMLElementTagNameMap>(
	tag: T,
	props: Partial<HTMLPropsWithEventOptions<T>> = {},
	...children: Children
): HTMLElementTagNameMap[T] {
	const element = document.createElement(tag);

	// Handle props
	for (const [key, value] of Object.entries(props)) {
		if (key === "eventOptions") continue;

		if (key.startsWith("on") && isEventListener(value)) {
			const event = key.substring(2).toLowerCase();
			const options = props.eventOptions?.[event as keyof HTMLElementEventMap];
			element.addEventListener(event, value, options);
		} else if ((key === "class" || key === "className") && isString(value)) {
			element.className = value;
		} else if (key === "style" && typeof value === "object") {
			Object.assign(element.style, value);
		} else if (
			isString(value) ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			element.setAttribute(key, String(value));
		}
	}

	appendChildren(element, children);

	return element;
}

export function createFragment(...children: Children): DocumentFragment {
	const fragment = document.createDocumentFragment();

	appendChildren(fragment, children);

	return fragment;
}
