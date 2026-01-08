// constants.ts

// ============================================
// DESIGN SPACE
// ============================================
export const DESIGN_WIDTH = 390;
export const VERTIAL_SPACING = 40;

export const FROG_SIZE = 56;

// ============================================
// TOP RAIL
// ============================================
export const TOP_RAIL_HEIGHT = 60; // Logo + score + lives

// ============================================
// CORE (Stream + Embedded Grid)
// ============================================
export const CORE_PADDING = 28; // Visual preference - breathing room
export const CORE_CONTENT_SIZE = DESIGN_WIDTH - CORE_PADDING * 2; // Stream/grid square size
export const CORE_HEIGHT = VERTIAL_SPACING + CORE_CONTENT_SIZE;

// Core content positioning (static)
export const CORE_X = CORE_PADDING; // = 37.5
export const CORE_Y = TOP_RAIL_HEIGHT; // = 37.5 (relative to core rail top)

// Stream specifics (for decoration)
export const STREAM_WIDTH = 56;
export const STREAM_BORDER_RADIUS = 20;

// Grid (static position, dynamic density)
export const GRID_PADDING = 12;
export const TARGET_GRID_SIZE =
	CORE_CONTENT_SIZE - STREAM_WIDTH * 2 - GRID_PADDING * 2;
export const GRID_X = CORE_X + STREAM_WIDTH + GRID_PADDING;
export const GRID_Y = CORE_Y + STREAM_WIDTH + GRID_PADDING;
export const GRID_GAP_RATIO = 0.33; // For calculateGridLayout

// ============================================
// CONVEYOR SLOTS (The Log)
// ============================================
export const LOG_HEIGHT = 80; // Total log height
export const SLOT_HEIGHT = LOG_HEIGHT + VERTIAL_SPACING;
export const SLOT_PADDING = 10;
export const LOG_WIDTH = DESIGN_WIDTH - SLOT_PADDING * 2;
export const SLOT_SIZE = 60; // Cannon size in slot
export const SLOT_SPACING = 12; // Gap between slots
// Slots are centered horizontally based on count

// ============================================
// FEEDER (Cannon Columns)
// ============================================
export const FEEDER_CELL_SIZE = 60; // Cannon size
export const FEEDER_ROW_SPACING = 12; // Vertical gap
export const FEEDER_COL_SPACING = 16; // Horizontal gap
export const FEEDER_PADDING = 24; // Top/bottom padding

// ============================================
// ELASTIC/FOG
// ============================================
export const MIN_ELASTIC_HEIGHT = 40; // Minimum fog space
export const FEEDER_FOG_OVERLAP = 30; // Fog overlaps feeder top
export const FOG_OPACITY_MAX = 0.85; // Max fog opacity
