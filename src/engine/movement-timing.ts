import type { PathSegment } from "./path";

export const CORNER_SEGMENT_TIME_MULTIPLIER = 3;

export function isCornerPathTransition(
	current: PathSegment | null | undefined,
	next: PathSegment | null | undefined,
): boolean {
	if (!current || !next) {
		return false;
	}

	return current.edge !== next.edge;
}

export function getMsNeededForSegment(
	msPerSegment: number,
	current: PathSegment | null | undefined,
	next: PathSegment | null | undefined,
): number {
	return isCornerPathTransition(current, next)
		? msPerSegment * CORNER_SEGMENT_TIME_MULTIPLIER
		: msPerSegment;
}

export function getSegmentProgress(
	timeAtPosition: number,
	msPerSegment: number,
	current: PathSegment | null | undefined,
	next: PathSegment | null | undefined,
): number {
	const msNeeded = getMsNeededForSegment(msPerSegment, current, next);

	if (msNeeded <= 0) {
		return 1;
	}

	return timeAtPosition / msNeeded;
}
