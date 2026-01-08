import type { LevelRules } from "../domain/level";

// engine/constraints.ts
export interface EngineConstraints {
	pathCapacity: number;
	waitingAreaCapacity: number;
	msPerTick: number;
	ticksPerSegment: number;
	deploymentCooldownTicks: number;
	poolVisibleCount: number;
}

// game/config.ts (or wherever you set up levels)
export function levelRulesToConstraints(rules: LevelRules): EngineConstraints {
	return {
		pathCapacity: rules.conveyor.capacity,
		waitingAreaCapacity: rules.conveyorSlots.slotCount,
		msPerTick: rules.timing?.msPerTick ?? 100, // default for now
		ticksPerSegment: rules.conveyor.ticksPerPixel,
		deploymentCooldownTicks: 1, // could come from rules later
		poolVisibleCount: rules.feeder.maxVisibleRows, // or derived from feeder columns
	};
}
