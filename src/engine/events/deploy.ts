import type { Cannon, CannonId, ConveyorPosition, GameState } from "../types";

function getInitialPosition(gridHeight: number): ConveyorPosition {
	// Always deploy at bottom-left corner, shooting north, moving east
	return {
		x: 0,
		y: gridHeight,
		edge: "bottom",
		facing: "north",
	};
}

export function deployCannonToConveyor(state: GameState, cannon: Cannon) {
	// Put cannon on the belt
	cannon.location = {
		type: "conveyor",
		ticksOnBelt: 0,
		position: getInitialPosition(state.grid.height),
	};
	state.conveyor.cannonsOnBelt.push(cannon.id);
}

export function deployedToConveyorEvent(cannonId: CannonId) {
	return {
		type: "CANNON_DEPLOYED_TO_CONVEYOR",
		cannonId,
	} as const;
}

function circularDistance(a: number, b: number, loop: number): number {
	const d = Math.abs(a - b);
	return Math.min(d, loop - d);
}

const CANNON_LENGTH_TICKS = 10;

export function isEntryClear(state: GameState): boolean {
	return state.conveyor.cannonsOnBelt.every((id) => {
		const cannon = state.cannons[id];
		if (cannon.location.type !== "conveyor") return true;

		const distance = circularDistance(
			cannon.location.ticksOnBelt,
			0,
			state.conveyor.beltLength,
		);

		return distance >= CANNON_LENGTH_TICKS;
	});
}
