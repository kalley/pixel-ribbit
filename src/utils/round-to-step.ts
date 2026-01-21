/**
 * Rounds a numeric value to the nearest multiple of `step`.
 *
 * The value is first snapped to the closest step increment. An optional
 * `bias` can be applied to subtly influence how halfway values are rounded.
 * The final result is then clamped to the optional `min` and `max` bounds.
 *
 * @param value - The number to round.
 * @param step - The increment to round to. If `step` is <= 0, `value` is returned unchanged.
 * @param options - Optional rounding configuration.
 * @param options.min - Minimum allowed value after rounding (inclusive).
 * @param options.max - Maximum allowed value after rounding (inclusive).
 * @param options.bias - Bias applied to rounding decisions. Positive values
 *   favor rounding up; negative values favor rounding down.
 *
 * @returns The rounded value, constrained to the provided bounds.
 *
 * @example
 * roundToStep(7.3, 2); // 8
 *
 * @example
 * roundToStep(7.5, 2, { bias: -0.01 }); // 6 (slightly favors rounding down)
 *
 * @example
 * roundToStep(7.3, 2, { min: 0, max: 6 }); // 6
 */

export function roundToStep(
	value: number,
	step: number,
	options?: {
		min?: number;
		max?: number;
		bias?: number;
	},
): number {
	if (step <= 0) return value;

	const bias = options?.bias ?? 0;
	const min = options?.min ?? -Infinity;
	const max = options?.max ?? Infinity;

	const rounded =
		bias === 0
			? Math.round(value / step) * step
			: Math.floor(value / step + 0.5 + bias) * step;

	return Math.max(min, Math.min(max, rounded));
}
