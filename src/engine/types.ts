import type { ColorId } from "../domain/color";
import type { Grid } from "../domain/Grid";

export type GridPosition = {
	x: number;
	y: number;
};

export type CannonId = string;
export type CannonGroupId = string;

export type ConveyorPosition = {
	x: number; // Position on perimeter
	y: number;
	edge: "top" | "right" | "bottom" | "left";
	facing: "north" | "east" | "south" | "west";
};

export type Cannon = {
	id: CannonId;
	color: ColorId;
	shotsRemaining: number;

	// Location state
	location:
		| { type: "feeder" } // In feeder (visible or hidden)
		| { type: "conveyor"; ticksOnBelt: number; position: ConveyorPosition } // Moving on belt
		| { type: "slot"; slotIndex: number }; // Parked in slot

	groupId: CannonGroupId | null;
};

export type CannonGroup = {
	id: CannonGroupId;
	cannonIds: CannonId[];
	slotsRequired: number;
};

export type Conveyor = {
	beltLength: number; // Ticks for full lap
	capacity: number; // Max cannons on belt at once
	cannonsOnBelt: CannonId[]; // Currently moving
};

export type ConveyorSlots = {
	slots: (CannonId | null)[]; // Parking spots
};

export type FeederColumn = {
	cannons: CannonId[]; // Bottom to top (bottom-most is deployable)
	maxVisible: number; // How many to show in this column
};

export type Feeder = {
	columns: FeederColumn[];
};

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
	grid: Grid;

	cannons: Record<CannonId, Cannon>;
	cannonGroups: Record<CannonGroupId, CannonGroup>;

	conveyor: Conveyor;
	conveyorSlots: ConveyorSlots;

	feeder: Feeder;

	tick: number;
	status: GameStatus;
	_debug: {
		seed: number;
		moveHistory: unknown[];
		eventLog: unknown[];
	};
};

export type PlayerAction =
	| {
			type: "DEPLOY_FROM_FEEDER";
			columnIndex: number;
	  }
	| {
			type: "DEPLOY_FROM_SLOT";
			slotIndex: number;
	  }
	| {
			type: "WAIT";
	  };

export type GameEvent =
	| {
			type: "PIXEL_CLEARED";
			cannonId: CannonId;
			position: GridPosition;
			color: ColorId;
	  }
	| { type: "CANNON_EXHAUSTED"; cannonId: CannonId }
	| { type: "CANNON_DEPLOYED_TO_CONVEYOR"; cannonId: CannonId }
	| { type: "CANNON_ENTERED_SLOT"; cannonId: CannonId; slot: number }
	| { type: "CANNON_COMPLETED_LAP"; cannonId: CannonId }
	| { type: "GAME_WON" }
	| { type: "GAME_LOST" };
