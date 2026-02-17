import { createPalette, type RGB } from "./color";
import type { Grid } from "./Grid";
import { createLevel, type Level, type LevelRules } from "./level";
import type { Pixel } from "./Pixel";

const SHARE_VERSION = 1;

type SerializedLevel = {
	width: number;
	height: number;
	pixelsPerSize: number;
	palette: RGB[];
	rules: LevelRules;
	pixelData: string;
};

export type SharedGameSnapshot = {
	version: typeof SHARE_VERSION;
	seed: number;
	level: SerializedLevel;
};

export function createSharedGameSnapshot(
	level: Level,
	seed: number,
): SharedGameSnapshot {
	return {
		version: SHARE_VERSION,
		seed,
		level: {
			width: level.width,
			height: level.height,
			pixelsPerSize: level.pixelsPerSize,
			palette: Object.values(level.palette).map((entry) => entry.rgb),
			rules: level.rules,
			pixelData: encodePixels(level),
		},
	};
}

export function rehydrateLevelFromSnapshot(
	snapshot: SharedGameSnapshot,
): Level {
	const serialized = snapshot.level;
	const palette = createPalette(serialized.palette);
	const pixels = decodePixels(serialized.pixelData, serialized, palette);

	const grid: Grid = {
		width: serialized.width,
		height: serialized.height,
		pixels,
	};

	return createLevel(grid, serialized.pixelsPerSize, palette, serialized.rules);
}

export function encodeSharedGameSnapshot(snapshot: SharedGameSnapshot): string {
	const json = JSON.stringify(snapshot);
	return encodeBase64Url(json);
}

export function decodeSharedGameSnapshot(
	encoded: string,
): SharedGameSnapshot | null {
	try {
		const decoded = decodeBase64Url(encoded);
		const parsed = JSON.parse(decoded) as SharedGameSnapshot;

		if (!parsed || parsed.version !== SHARE_VERSION) {
			return null;
		}

		if (
			typeof parsed.seed !== "number" ||
			!Number.isFinite(parsed.seed) ||
			!parsed.level
		) {
			return null;
		}

		return parsed;
	} catch {
		return null;
	}
}

export function extractShareCodeFromInput(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) {
		return null;
	}

	try {
		const url = new URL(trimmed);
		const code = url.searchParams.get("share");

		return code?.trim() ? code : null;
	} catch {
		return trimmed;
	}
}

function encodePixels(level: Level): string {
	const paletteIds = Object.keys(level.palette);
	const paletteIndexById = new Map<string, number>();
	paletteIds.forEach((id, index) => {
		paletteIndexById.set(id, index);
	});

	const values = new Uint8Array(level.width * level.height);
	let offset = 0;

	for (const row of level.pixels) {
		for (const pixel of row) {
			const colorIndex = paletteIndexById.get(pixel.colorId) ?? 0;
			const aliveBit = pixel.alive ? 1 : 0;
			values[offset] = (aliveBit << 7) | colorIndex;
			offset++;
		}
	}

	return bytesToBase64Url(values);
}

function decodePixels(
	encoded: string,
	serialized: SerializedLevel,
	palette: ReturnType<typeof createPalette>,
): Pixel[][] {
	const bytes = base64UrlToBytes(encoded);
	const expectedLength = serialized.width * serialized.height;

	if (bytes.length !== expectedLength) {
		throw new Error(
			`Invalid pixel payload length: expected ${expectedLength}, received ${bytes.length}`,
		);
	}

	const colorIds = Object.keys(palette);
	const pixels: Pixel[][] = [];
	let offset = 0;

	for (let row = 0; row < serialized.height; row++) {
		const pixelRow: Pixel[] = [];

		for (let col = 0; col < serialized.width; col++) {
			const value = bytes[offset];
			const alive = (value & 0b1000_0000) !== 0;
			const colorIndex = value & 0b0111_1111;
			const colorId = colorIds[colorIndex];

			if (!colorId) {
				throw new Error(`Invalid color index in pixel payload: ${colorIndex}`);
			}

			pixelRow.push({
				colorId,
				alive,
			});
			offset++;
		}

		pixels.push(pixelRow);
	}

	return pixels;
}

function encodeBase64Url(value: string): string {
	const encoded = btoa(value);
	return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	const requiredPadding = (4 - (padded.length % 4)) % 4;
	return atob(`${padded}${"=".repeat(requiredPadding)}`);
}

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = "";

	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return encodeBase64Url(binary);
}

function base64UrlToBytes(value: string): Uint8Array {
	const binary = decodeBase64Url(value);
	const bytes = new Uint8Array(binary.length);

	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	return bytes;
}
