export type PaletteChoices = [r: number, g: number, b: number][];

export const palette = [
	// --- REDS & PINKS ---
	[225, 75, 75], // Soft Red
	[240, 110, 110], // Coral Pink
	[190, 40, 85], // Deep Rose
	[250, 140, 160], // Light Flamingo
	[160, 50, 50], // Brick Red
	[200, 50, 50], // Cherry (NEW - saturated red between soft & brick)
	[255, 195, 200], // Blush (NEW - very light pink for highlights)

	// --- ORANGES & YELLOWS ---
	[245, 130, 50], // Bright Orange
	[255, 180, 70], // Golden Yellow
	[220, 150, 40], // Amber
	[255, 210, 110], // Creamy Maize
	[210, 100, 40], // Ochre
	[255, 230, 80], // Lemon (NEW - bright saturated yellow)
	[235, 95, 30], // Tangerine (NEW - punchy orange-red)
	[180, 120, 30], // Raw Sienna (NEW - darker earthy orange)

	// --- GREENS ---
	[80, 180, 100], // Sage Green
	[40, 150, 90], // Emerald
	[140, 210, 100], // Pistachio
	[100, 130, 50], // Olive Branch
	[60, 190, 160], // Seafoam
	[30, 100, 60], // Forest (NEW - dark saturated green)
	[180, 230, 140], // Spring Green (NEW - very light yellow-green)
	[70, 160, 80], // Grass (NEW - classic mid green)

	// --- CYANS & TEALS ---
	[60, 170, 200], // Sky Blue
	[30, 130, 150], // Muted Teal
	[120, 220, 230], // Ice Blue
	[30, 190, 220], // Electric Cyan
	[100, 190, 210], // Soft Cyan
	[20, 100, 120], // Deep Teal (NEW - darker anchor)
	[160, 240, 240], // Aqua Mint (NEW - very light cyan)

	// --- BLUES ---
	[70, 110, 220], // Royal Blue
	[100, 140, 250], // Cornflower
	[50, 70, 160], // Indigo
	[130, 170, 240], // Periwinkle
	[140, 160, 210], // Soft Denim
	[30, 50, 120], // Navy (NEW - deep blue anchor)
	[90, 140, 200], // Steel Blue (NEW - muted mid-blue)

	// --- PURPLES & MAGENTAS ---
	[150, 90, 210], // Medium Purple
	[170, 120, 250], // Bright Lavender
	[200, 130, 230], // Orchid
	[180, 60, 160], // Magenta
	[230, 170, 220], // Thistle
	[100, 50, 140], // Deep Plum (NEW - darker purple)
	[240, 200, 250], // Pale Lilac (NEW - very light purple)

	// --- NEUTRALS & EARTH TONES ---
	[45, 45, 50], // Dark Gunmetal
	[70, 60, 55], // Cocoa
	[100, 88, 75], // Umber (NEW - darker skin shadow)
	[120, 105, 90], // Driftwood
	[145, 125, 105], // Tan (NEW - core skin mid-tone)
	[160, 145, 125], // Wheat
	[180, 165, 145], // Buff (NEW - lighter skin tone)
	[190, 175, 160], // Oat
	[210, 200, 185], // Cream
	[230, 230, 230], // Cool Fog
	[245, 240, 235], // Warm White
] as const satisfies PaletteChoices;
