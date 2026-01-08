// checkGameEnd.ts
import type { GameEvent, GameState } from "../types";

export function checkGameEnd(state: GameState): GameEvent[] {
	const events: GameEvent[] = [];

	// Already lost (from advanceConveyor)
	if (state.status === "lost") {
		return events;
	}

	// Check win condition: all pixels cleared
	let hasActivePixels = false;

	for (const row of state.grid.pixels) {
		for (const pixel of row) {
			if (pixel.alive) {
				hasActivePixels = true;
				break;
			}
		}
		if (hasActivePixels) break;
	}

	if (!hasActivePixels) {
		state.status = "won";
		events.push({ type: "GAME_WON" });
	}

	return events;
}
