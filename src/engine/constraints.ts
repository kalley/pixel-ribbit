import type { LevelRules } from "../game/level";
import type { PathSegment } from "./path";
import type {
	Entity,
	GameGrid,
	GameState,
	GridPosition,
	Resource,
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
		deploymentCooldownTicks: DEFAULT_CONSTRAINTS.deploymentCooldownTicks, // Add to rules if needed
		poolVisibleCount: 3, // Could derive from feeder.columnCount * maxVisible
		victoryModeSpeedup: DEFAULT_CONSTRAINTS.victoryModeSpeedup,
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
			if (ticksSinceLastDeploy < constraints.deploymentCooldownTicks) {
				return { valid: false, reason: "Deployment on cooldown" };
			}

			const hasAvailableEntity = state.pool.columns.some(
				(col) => col.entities.length > 0,
			);
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
			const { dx, dy } = getDirectionVector(facing);

			let x = gridPosition.col;
			let y = gridPosition.row;

			while (
				y >= 0 &&
				y < grid.resources.length &&
				x >= 0 &&
				x < grid.resources[0].length
			) {
				const resource = grid.resources[y]?.[x];

				if (resource?.alive) {
					if (
						resource.type === entity.resourceType &&
						entity.consumed < entity.capacity
					) {
						return {
							willConsume: true,
							resource,
							targetPosition: { row: y, col: x },
							willExhaust: entity.consumed + 1 >= entity.capacity,
						};
					}

					// First alive resource blocks the ray, even if wrong type
					return { willConsume: false };
				}

				x += dx;
				y += dy;
			}

			return { willConsume: false };
		},

		shouldEntityWait(entity: Entity, state: GameState): ValidationResult {
			if (state.status === "victory_mode") {
				return { valid: false, reason: "Victory mode active" };
			}

			if (entity.consumed >= entity.capacity) {
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

			const remainingInPool = state.pool.columns.reduce(
				(sum, col) => sum + col.entities.length,
				0,
			);

			const onPath = state.path.entities.length;
			const totalRemaining = remainingInPool + onPath;

			if (totalRemaining > constraints.pathCapacity) {
				return {
					canEnter: false,
					remainingEntities: totalRemaining,
					pathCapacity: constraints.pathCapacity,
				};
			}

			// TODO: Check resource availability

			return { canEnter: true };
		},

		isGameWon(state: GameState): boolean {
			const remainingInPool = state.pool.columns.reduce(
				(sum, col) => sum + col.entities.length,
				0,
			);

			if (remainingInPool > 0) return false;
			if (state.path.entities.length > 0) return false;

			const inWaitingArea = state.waitingArea.entities.filter(
				(e) => e !== null,
			).length;
			if (inWaitingArea > 0) return false;

			return true;
		},

		getEffectiveMsPerTick(state: GameState): number {
			if (state.status === "victory_mode") {
				return constraints.msPerTick / constraints.victoryModeSpeedup;
			}
			return constraints.msPerTick;
		},
	};
}

function getDirectionVector(facing: PathSegment["facing"]) {
	switch (facing) {
		case "north":
			return { dx: 0, dy: -1 };
		case "south":
			return { dx: 0, dy: 1 };
		case "east":
			return { dx: 1, dy: 0 };
		case "west":
			return { dx: -1, dy: 0 };
	}
}
