// engine/types.ts

import type { createValidator, EngineConstraints } from "./constraints";
import type { PathSegment } from "./path";

// ============================================
// CORE ENGINE TYPES
// ============================================
//
export type EntityId = string;

export type EntityState = "moving" | "dwelling" | "waiting";

export interface PathPosition {
	index: number;
	ticksAtPosition: number;
}

export interface GridPosition {
	row: number;
	col: number;
}

export interface Entity {
	id: EntityId;
	resourceType: string;
	capacity: number;
	consumed: number;
	position: PathPosition;
	state: EntityState;
}

export interface Resource {
	id: string;
	type: string;
	gridPosition: GridPosition;
	alive: boolean;
}

// ============================================
// GAME STATE
// ============================================

export type GameStatus = "playing" | "victory_mode" | "won" | "lost";

interface EntityColumn {
	entities: EntityId[]; // Entity IDs
	maxVisible: number;
}

export interface GameGrid {
	width: number;
	height: number;
	resources: Resource[][];
}

export interface GamePath {
	entities: EntityId[];
	capacity: number;
	length: number;
}

export interface WaitingArea {
	entities: (EntityId | null)[];
	capacity: number;
}

export interface EntityPool {
	columns: EntityColumn[];
}

export interface DebugInfo {
	seed?: number;
	moveHistory: unknown[]; // Define better later
	eventLog: unknown[]; // Define better later
	lastDeployTick?: number;
}

export type EntityRegistry = Record<string, Entity>;

export interface GameState {
	constraints: EngineConstraints;
	validator: ReturnType<typeof createValidator>;

	grid: GameGrid;
	path: GamePath;
	waitingArea: WaitingArea;
	pool: EntityPool;

	entityRegistry: EntityRegistry;

	tick: number;
	status: GameStatus;

	_debug: DebugInfo;
}

export interface GamePath {
	entities: EntityId[];
	capacity: number;
	segments: PathSegment[]; // Add this - the actual path definition
}

export function entitySatisfied(entity: Entity): boolean {
	return entity.consumed >= entity.capacity;
}
