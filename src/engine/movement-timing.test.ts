import {
	CORNER_SEGMENT_TIME_MULTIPLIER,
	getMsNeededForSegment,
	getSegmentProgress,
	isCornerPathTransition,
} from "./movement-timing";
import type { PathSegment } from "./path";

const bottomSegment: PathSegment = {
	gridPosition: { row: 1, col: 1 },
	edge: "bottom",
	facing: "north",
};

const rightSegment: PathSegment = {
	gridPosition: { row: 1, col: 2 },
	edge: "right",
	facing: "west",
};

describe("movement timing", () => {
	it("detects corner transitions", () => {
		expect(isCornerPathTransition(bottomSegment, rightSegment)).toBe(true);
		expect(isCornerPathTransition(bottomSegment, bottomSegment)).toBe(false);
		expect(isCornerPathTransition(bottomSegment, null)).toBe(false);
	});

	it("uses corner multiplier when needed", () => {
		expect(getMsNeededForSegment(100, bottomSegment, bottomSegment)).toBe(100);
		expect(getMsNeededForSegment(100, bottomSegment, rightSegment)).toBe(
			100 * CORNER_SEGMENT_TIME_MULTIPLIER,
		);
	});

	it("computes segment progress from elapsed time", () => {
		expect(getSegmentProgress(50, 100, bottomSegment, bottomSegment)).toBe(0.5);
		expect(getSegmentProgress(150, 100, bottomSegment, rightSegment)).toBe(0.5);
	});
});
