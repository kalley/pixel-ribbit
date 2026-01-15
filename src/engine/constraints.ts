import type { LevelRules } from "../game/level";
import type { PathSegment } from "./path";
import {
	type Entity,
	entitySatisfied,
	type GameGrid,
	type GameState,
	type GridPosition,
	type Resource,
} from "./types";

export interface EngineConstraints {
	// Capacity limits
	pathCapacity: number; // Max entities on the path (stream)
	waitingAreaCapacity: number; // Max entities in waiting area (log)

	// Timing
	msPerTick: number; // Real-world ms between game ticks
	ticksPerSegment: number; // Ticks an entity spends at each path position
	deploymentCooldownTicks: number; // Ticks between deployments

	// Visibility
	poolVisibleCount: number; // How many upcoming entities visible

	// Victory mode
	victoryModeSpeedup: number; // Speed multiplier when victory mode triggers
}

const DEFAULT_CONSTRAINTS = {
	pathCapacity: 8,
	waitingAreaCapacity: 5,
	msPerTick: 100,
	ticksPerSegment: 8,
	deploymentCooldownTicks: 4,
	poolVisibleCount: 3,
	victoryModeSpeedup: 3,
} satisfies EngineConstraints;

export function levelRulesToConstraints(rules: LevelRules): EngineConstraints {
	return {
		pathCapacity: rules.conveyor.capacity,
		waitingAreaCapacity: rules.conveyorSlots.slotCount,
		msPerTick: rules.timing?.msPerTick ?? DEFAULT_CONSTRAINTS.msPerTick,
		ticksPerSegment: rules.conveyor.ticksPerPixel,
		deploymentCooldownTicks:
			rules.timing?.deploymentCooldownTicks ??
			DEFAULT_CONSTRAINTS.deploymentCooldownTicks,
		poolVisibleCount:
			rules.feeder?.maxVisibleRows ?? DEFAULT_CONSTRAINTS.poolVisibleCount,
		victoryModeSpeedup:
			rules.timing?.victoryModeSpeedup ??
			DEFAULT_CONSTRAINTS.victoryModeSpeedup,
	};
}

export type ValidationResult =
	| { valid: true }
	| { valid: false; reason: string };

export interface ConsumeCheckResult {
	willConsume: boolean;
	willExhaust?: boolean;
	resource?: Resource;
	targetPosition?: GridPosition;
}

export interface VictoryModeCheckResult {
	canEnter: boolean;
	remainingEntities?: number;
	pathCapacity?: number;
}

export function createValidator(constraints: EngineConstraints) {
	return {
		canDeployEntity(state: GameState): ValidationResult {
			if (state.path.entities.length >= constraints.pathCapacity) {
				return { valid: false, reason: "Path at capacity" };
			}

			const ticksSinceLastDeploy =
				state.tick - (state._debug.lastDeployTick ?? -Infinity);
			if (
				ticksSinceLastDeploy <
				constraints.deploymentCooldownTicks * constraints.msPerTick
			) {
				return { valid: false, reason: "Deployment on cooldown" };
			}

			const hasAvailableEntity =
				state.pool.columns.some((col) => col.entities.length > 0) ||
				state.waitingArea.entities.length > 0;
			if (!hasAvailableEntity) {
				return { valid: false, reason: "No entities available" };
			}

			return { valid: true };
		},

		willEntityConsume(
			entity: Entity,
			gridPosition: GridPosition,
			grid: GameGrid,
			facing: PathSegment["facing"],
		): ConsumeCheckResult {
			const hit = findFirstResourceInDirection(gridPosition, grid, facing);
			if (!hit) return { willConsume: false };

			const { resource, position } = hit;

			if (resource.type === entity.resourceType && !entitySatisfied(entity)) {
				return {
					willConsume: true,
					resource,
					targetPosition: position,
					willExhaust: entity.consumed + 1 >= entity.capacity,
				};
			}

			return { willConsume: false };
		},

		shouldEntityWait(entity: Entity, state: GameState): ValidationResult {
			if (state.status === "victory_mode") {
				return { valid: false, reason: "Victory mode active" };
			}

			if (entitySatisfied(entity)) {
				return { valid: false, reason: "Entity satisfied" };
			}

			return { valid: true };
		},

		canAcceptWaitingEntity(state: GameState): ValidationResult {
			const currentCount = state.waitingArea.entities.filter(
				(e) => e !== null,
			).length;

			if (currentCount >= constraints.waitingAreaCapacity) {
				return { valid: false, reason: "Waiting area full - game over" };
			}

			return { valid: true };
		},

		canEnterVictoryMode(state: GameState): VictoryModeCheckResult {
			if (state.status !== "playing") {
				return { canEnter: false };
			}

			const { total } = countRemainingEntities(state);

			if (total > constraints.pathCapacity) {
				return {
					canEnter: false,
					remainingEntities: total,
					pathCapacity: constraints.pathCapacity,
				};
			}

			// TODO: Check resource availability

			return { canEnter: true };
		},

		isGameWon(state: GameState): boolean {
			const { total } = countRemainingEntities(state);
			return total === 0;
		},

		getEffectiveMsPerTick(state: GameState): number {
			if (state.status === "victory_mode") {
				return constraints.msPerTick / constraints.victoryModeSpeedup;
			}
			return constraints.msPerTick;
		},
	};
}

const DIRECTION_VECTORS = {
	north: { dx: 0, dy: -1 },
	south: { dx: 0, dy: 1 },
	east: { dx: 1, dy: 0 },
	west: { dx: -1, dy: 0 },
} as const;

function getDirectionVector(facing: PathSegment["facing"]) {
	return DIRECTION_VECTORS[facing];
}

function countRemainingEntities(state: GameState): {
	inPool: number;
	onPath: number;
	inWaiting: number;
	total: number;
} {
	const inPool = state.pool.columns.reduce(
		(sum, col) => sum + col.entities.length,
		0,
	);
	const onPath = state.path.entities.length;
	const inWaiting = state.waitingArea.entities.filter((e) => e !== null).length;

	return {
		inPool,
		onPath,
		inWaiting,
		total: inPool + onPath + inWaiting,
	};
}

function findFirstResourceInDirection(
	gridPosition: GridPosition,
	grid: GameGrid,
	facing: PathSegment["facing"],
): { resource: Resource; position: GridPosition } | null {
	const { dx, dy } = getDirectionVector(facing);
	let { col: x, row: y } = gridPosition;
	const maxY = grid.resources.length;
	const maxX = grid.resources[0]?.length ?? 0;

	while (y >= 0 && y < maxY && x >= 0 && x < maxX) {
		const resource = grid.resources[y]?.[x];

		if (resource?.alive) {
			return { resource, position: { row: y, col: x } };
		}

		x += dx;
		y += dy;
	}

	return null;
}
