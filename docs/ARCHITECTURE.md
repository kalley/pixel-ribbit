# Architecture Notes

## High-Level Flow

1. UI collects an image and difficulty config.
2. Image-processing modules produce a posterized grid.
3. `game/state.ts` converts that grid into engine entities/resources.
4. Main loop (`src/main.ts`) advances simulation and renders every frame.
5. Canvas input dispatches deploy actions back into the engine.

## Main Layers

### `src/image-processing`

- Loads image data
- Crops/resizes to square grid
- Posterizes against game palette
- Converts image result into grid resources

### `src/game`

- Bridges image output to domain setup
- Builds `Level` rules and generated frogs
- Creates seeded, deterministic game setup

### `src/engine`

- Owns canonical game state (`GameState`)
- Processes intent-like events (deploy, movement, loop completion)
- Enforces constraints and victory/loss checks
- Uses shared movement timing (`movement-timing.ts`) for consistency

### `src/renderer`

- Draws stream, grid, frogs, fog, tongues
- Interpolates frog movement using the same timing model as engine
- Maintains render-only state (`RenderContext`)

### `src/ui`

- Modal and upload controls
- Canvas creation and pointer/touch handling
- Derives layout rules from current `GameState` capacities

## Important Data Structures

- `GameState` (`src/engine/types.ts`): source of truth for entities, grid, path, pool, waiting area
- `GameEvent` (`src/engine/events/movement.ts`): state transition events
- `RenderContext` (`src/renderer/render-context.ts`): clickables and tongue animations
- `LayoutFrame` (`src/viewport.ts`): computed responsive layout geometry

## Engine Tick Lifecycle

Per animation frame:

1. `updateGameState(state, deltaMs)` advances elapsed time.
2. `updatePathEntities` emits movement/loop/win events.
3. `applyEvent` mutates state.
4. `main.ts` handles UI/render side effects for emitted events.
5. Renderer draws the latest state.

## Testing Strategy (Current)

- Unit tests for deterministic RNG behavior
- Unit tests for deploy constraints
- Unit tests for movement timing utilities
- Unit tests for canvas helper logic (touch/layout derivation)

## Extension Points

- Add new level presets by passing overrides to `createLevel`.
- Add new entity behavior in engine event handlers.
- Add richer animation phases in `render-context` + `draw-tongues`.
- Add stronger simulation tests around end-to-end tick + event sequences.
