export type PaletteChoices = [r: number, g: number, b: number][];

export const palette = [
	// --- REDS & PINKS (5 → cleaner spread) ---
	[225, 75, 75], // Soft Red (KEEP - mid red)
	// REMOVE: [240, 110, 110] - Coral Pink (too close to Soft Red)
	[190, 40, 85], // Deep Rose (KEEP - dark saturated)
	[250, 140, 160], // Light Flamingo (KEEP - light pink)
	[180, 50, 50], // Dark Red (CHANGED from Brick/Cherry - split the difference)
	[200, 50, 50], // Cherry (or remove this, keep Brick at 160)

	// --- ORANGES & YELLOWS (6 → better spacing) ---
	[245, 130, 50], // Bright Orange
	[255, 180, 70], // Golden Yellow
	[220, 150, 40], // Amber
	// REMOVE: [255, 210, 110] - Creamy Maize (Golden Yellow covers this)
	[210, 100, 40], // Ochre
	[255, 230, 80], // Lemon
	[235, 95, 30], // Tangerine
	// REMOVE: [180, 120, 30] - Raw Sienna (too close to Ochre)

	// --- GREENS (6 → distinct roles) ---
	[80, 180, 100], // Sage Green (KEEP - blue-green mid)
	[40, 150, 90], // Emerald (KEEP - saturated mid)
	[140, 210, 100], // Pistachio (KEEP - yellow-green light)
	[100, 130, 50], // Olive Branch (KEEP - dark yellow-green)
	[60, 190, 160], // Seafoam (KEEP - cyan-green)
	[30, 100, 60], // Forest (KEEP - very dark)
	[180, 230, 140], // Spring Green (KEEP - light yellow-green)
	// REMOVE: [70, 160, 80] - Grass (too close to Sage/Emerald)

	// --- CYANS & TEALS (5 → clearer separation) ---
	[60, 170, 200], // Sky Blue
	[30, 130, 150], // Muted Teal
	[120, 220, 230], // Ice Blue
	[30, 190, 220], // Electric Cyan
	// REMOVE: [100, 190, 210] - Soft Cyan (between Sky and Ice)
	[20, 100, 120], // Deep Teal

	// --- BLUES (5 → key tones only) ---
	[90, 120, 240], // Bright Blue (MERGED Royal + Cornflower)
	// REMOVE: [70, 110, 220] - Royal Blue
	// REMOVE: [100, 140, 250] - Cornflower
	[50, 70, 160], // Indigo (KEEP - dark anchor)
	[150, 180, 240], // Light Blue (MERGED Periwinkle + Denim)
	// REMOVE: [130, 170, 240] - Periwinkle
	// REMOVE: [140, 160, 210] - Soft Denim
	[30, 50, 120], // Navy
	[90, 140, 200], // Steel Blue

	// --- PURPLES & MAGENTAS (6 → good as is) ---
	[150, 90, 210], // Medium Purple
	[170, 120, 250], // Bright Lavender
	[200, 130, 230], // Orchid
	[180, 60, 160], // Magenta
	[230, 170, 220], // Thistle
	[100, 50, 140], // Deep Plum

	// --- NEUTRALS (7 → better steps) ---
	[45, 45, 50], // Dark Gunmetal
	[70, 60, 55], // Cocoa
	[100, 88, 75], // Umber
	[120, 105, 90], // Driftwood
	[150, 135, 115], // Tan (MERGED Tan + Wheat)
	// REMOVE: [145, 125, 105] - Tan
	// REMOVE: [160, 145, 125] - Wheat
	[185, 170, 150], // Buff (MERGED Buff + Oat)
	// REMOVE: [180, 165, 145] - Buff
	// REMOVE: [190, 175, 160] - Oat
	[210, 200, 185], // Cream
	[250, 250, 250], // Pure White
] as const satisfies PaletteChoices;
