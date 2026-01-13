// engine/state.ts

import type { EngineConstraints } from "./constraints";
import { createValidator } from "./constraints";
import { generateGridPath } from "./path";
import type { Entity, EntityRegistry, GameState, Resource } from "./types";

export interface GameStateConfig {
	constraints: EngineConstraints;
	entities: Entity[];
	resources: Resource[][];
	gridWidth: number;
	gridHeight: number;
	pathLength: number;
	poolColumns: number;
	maxVisiblePerColumn?: number;
	seed?: number;
}

export function createGameState(config: GameStateConfig): GameState {
	const validator = createValidator(config.constraints);

	// Create entity registry
	const entityRegistry: EntityRegistry = {};
	for (const entity of config.entities) {
		entityRegistry[entity.id] = entity;
	}

	// Distribute entities into pool columns (round-robin)
	const maxVisible = config.maxVisiblePerColumn ?? 3;
	const columns = Array.from({ length: config.poolColumns }, () => ({
		entities: [] as string[],
		maxVisible,
	}));

	config.entities.forEach((entity, index) => {
		const columnIndex = index % config.poolColumns;
		columns[columnIndex].entities.push(entity.id);
	});

	const pathSegments = generateGridPath(config.gridWidth, config.gridHeight);

	return {
		constraints: config.constraints,
		validator,

		grid: {
			width: config.gridWidth,
			height: config.gridHeight,
			resources: config.resources,
		},

		path: {
			entities: [],
			capacity: config.constraints.pathCapacity,
			segments: pathSegments,
			length: config.pathLength,
		},

		waitingArea: {
			entities: Array(config.constraints.waitingAreaCapacity).fill(null),
			capacity: config.constraints.waitingAreaCapacity,
		},

		pool: {
			columns,
		},

		entityRegistry,

		tick: 0,
		status: "playing",

		_debug: {
			seed: config.seed,
			moveHistory: [],
			eventLog: [],
		},
	};
}
