import { createGameState } from "./state";
import type { Entity, Resource } from "./types";

function makeEntity(id: string): Entity {
	return {
		id,
		resourceType: "red",
		capacity: 1,
		consumed: 0,
		position: { index: -1, timeAtPosition: 0 },
		state: "waiting",
	};
}

function makeResources(width: number, height: number): Resource[][] {
	return Array.from({ length: height }, (_, row) =>
		Array.from({ length: width }, (_, col) => ({
			id: `resource_${row}_${col}`,
			type: "red",
			gridPosition: { row, col },
			alive: true,
		})),
	);
}

describe("constraints.canDeployEntity", () => {
	it("returns invalid when both pool and waiting area are empty", () => {
		const state = createGameState({
			constraints: {
				pathCapacity: 5,
				waitingAreaCapacity: 3,
				msPerSegment: 100,
				deploymentCooldownMs: 10,
				poolVisibleCount: 3,
				victoryModeSpeedup: 3,
			},
			entities: [],
			resources: makeResources(2, 2),
			gridWidth: 2,
			gridHeight: 2,
			poolColumns: 2,
		});

		expect(state.validator.canDeployEntity(state)).toEqual({
			valid: false,
			reason: "No entities available",
		});
	});

	it("returns valid when waiting area contains an entity", () => {
		const entity = makeEntity("frog_1");
		const state = createGameState({
			constraints: {
				pathCapacity: 5,
				waitingAreaCapacity: 3,
				msPerSegment: 100,
				deploymentCooldownMs: 10,
				poolVisibleCount: 3,
				victoryModeSpeedup: 3,
			},
			entities: [entity],
			resources: makeResources(2, 2),
			gridWidth: 2,
			gridHeight: 2,
			poolColumns: 1,
		});

		state.pool.columns[0].entities = [];
		state.waitingArea.entities[0] = entity.id;

		expect(state.validator.canDeployEntity(state)).toEqual({ valid: true });
	});
});
