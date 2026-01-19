import type { RGB } from "../game/color";

export type PaletteChoices = RGB[];

export const palette = [
	// --- REDS & PINKS (5) ---
	[225, 75, 75], // Soft Red
	[190, 40, 85], // Deep Rose
	[250, 140, 160], // Light Flamingo
	[180, 50, 50], // Dark Red
	[240, 100, 120], // Coral

	// --- ORANGES & YELLOWS (6) ---
	[245, 130, 50], // Bright Orange
	[255, 180, 70], // Golden Yellow
	[220, 150, 40], // Amber
	[210, 100, 40], // Ochre
	[255, 230, 80], // Lemon
	[235, 95, 30], // Tangerine

	// --- BROWNS (3 - removed Espresso) ---
	[140, 90, 60], // Sienna
	[100, 70, 50], // Walnut
	[180, 120, 80], // Caramel

	// --- GREENS (8) ---
	[80, 180, 100], // Sage Green
	[40, 150, 90], // Emerald
	[140, 210, 100], // Pistachio
	[100, 130, 50], // Olive Branch
	[60, 190, 160], // Seafoam
	[30, 100, 60], // Forest
	[180, 230, 140], // Spring Green
	[90, 220, 80], // Bright Lime
	[50, 180, 60], // Kelly Green

	// --- CYANS & TEALS (5) ---
	[60, 170, 200], // Sky Blue
	[30, 130, 150], // Muted Teal
	[120, 220, 230], // Ice Blue
	[30, 190, 220], // Electric Cyan
	[20, 100, 120], // Deep Teal

	// --- BLUES (4 - removed Steel Blue) ---
	[90, 120, 240], // Bright Blue
	[50, 70, 160], // Indigo
	[150, 180, 240], // Light Blue
	[30, 50, 120], // Navy

	// --- PURPLES & MAGENTAS (6) ---
	[150, 90, 210], // Medium Purple
	[170, 120, 250], // Bright Lavender
	[200, 130, 230], // Orchid
	[180, 60, 160], // Magenta
	[230, 170, 220], // Thistle
	[100, 50, 140], // Deep Plum

	// ========== NEW: DEEP SATURATED ========== (2)
	[160, 70, 20], // Burnt Orange
	[0, 140, 160], // Deep Turquoise

	// ========== NEW: DESATURATED MIDTONES ========== (3)
	[140, 120, 130], // Dusty Mauve
	[130, 140, 120], // Sage Gray
	[120, 130, 140], // Slate Blue-Gray

	// ========== NEW: NEUTRAL GRAYS ========== (3)
	[90, 90, 90], // Charcoal Gray
	[130, 130, 130], // Medium Gray
	[170, 170, 170], // Light Gray

	// ========== NEW: PALE TINTS ========== (2)
	[245, 235, 220], // Vanilla
	[235, 245, 240], // Mint Cream

	// ========== NEW: TRUE DARKS ========== (1)
	[15, 15, 15], // Near Black

	// --- NEUTRALS (7) ---
	[45, 45, 50], // Dark Gunmetal
	[70, 60, 55], // Cocoa
	[100, 88, 75], // Umber
	[120, 105, 90], // Driftwood
	[150, 135, 115], // Tan
	[185, 170, 150], // Buff
	[210, 200, 185], // Cream
	[250, 250, 250], // Pure White
] as const satisfies PaletteChoices;
