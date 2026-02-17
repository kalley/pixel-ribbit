import { createGameState } from "../engine/state";
import type { Entity, Resource } from "../engine/types";
import { getLayoutRulesFromState, getTouchClientPoint } from "./canvas";

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

describe("canvas helpers", () => {
	it("derives layout rules from game state", () => {
		const state = createGameState({
			constraints: {
				pathCapacity: 5,
				waitingAreaCapacity: 7,
				msPerSegment: 100,
				deploymentCooldownMs: 10,
				poolVisibleCount: 4,
				victoryModeSpeedup: 3,
			},
			entities: [makeEntity("frog_1"), makeEntity("frog_2")],
			resources: makeResources(2, 2),
			gridWidth: 2,
			gridHeight: 2,
			poolColumns: 2,
			maxVisiblePerColumn: 4,
		});

		expect(getLayoutRulesFromState(state)).toEqual({
			slotCount: 7,
			columnCount: 2,
			maxVisiblePerColumn: 4,
		});
	});

	it("reads touch coordinates from changedTouches", () => {
		const touch = { clientX: 123, clientY: 456 } as Touch;
		const changedTouches = {
			0: touch,
			length: 1,
			item: (index: number) => (index === 0 ? touch : null),
		} as unknown as TouchList;

		expect(
			getTouchClientPoint({
				changedTouches,
			}),
		).toEqual({ x: 123, y: 456 });
	});

	it("returns null when no changed touches exist", () => {
		const changedTouches = {
			length: 0,
			item: () => null,
		} as unknown as TouchList;

		expect(
			getTouchClientPoint({
				changedTouches,
			}),
		).toBeNull();
	});
});
