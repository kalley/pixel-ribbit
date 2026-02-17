# Repository Guidelines

## Project Structure & Module Organization

- `src/engine/`: core simulation logic (state, constraints, events, tick loop, path timing).
- `src/game/`: game-specific setup from image/palette data (`createLevel`, `createFrogGame`).
- `src/renderer/`: canvas drawing and interpolation.
- `src/ui/`: DOM/canvas input, modal flows, upload UX.
- `src/image-processing/`: image loading, resize/crop, posterization, grid conversion.
- `src/assets/`: visual assets (`.webp`).
- Tests live next to source as `*.test.ts` (for example `src/engine/rng.test.ts`).
- Additional docs are in `docs/`.

## Build, Test, and Development Commands

- `npm run dev`: start local development server (Vite).
- `npm run dev:sandbox`: run sandbox build variant.
- `npm run build`: type-check and produce production bundle.
- `npm run preview`: serve the production build locally.
- `npm run test`: run unit tests with Vitest.
- `npm run type-check`: run TypeScript checks only.
- `npm run lint`: run Biome checks.
- `npm run format`: format `src/` with Biome.

## Coding Style & Naming Conventions

- Language: TypeScript (`strict` mode enabled).
- Formatting/linting: Biome (`npm run lint`, `npm run format`).
- Use tabs for indentation and keep style consistent with existing files.
- File naming: kebab-case for modules (for example `movement-timing.ts`).
- Prefer descriptive function names and small pure helpers for shared logic.
- Keep engine logic deterministic and avoid UI concerns in `src/engine/`.

## Testing Guidelines

- Framework: Vitest.
- Name tests `*.test.ts` and colocate with related modules.
- Add tests for behavior changes in engine timing, deploy constraints, and input helpers.
- Run before PR: `npm run test && npm run type-check && npm run lint`.

## Commit & Pull Request Guidelines

- Commit style in history is short, imperative, and sentence case (for example `Fix fog overlay, resize stream`).
- Keep commits focused; avoid mixing refactors and unrelated fixes.
- PRs should include:
  - concise summary of behavior changes,
  - affected areas (for example `src/engine`, `src/ui`),
  - test/lint/type-check status,
  - screenshots or short clips for UI/visual changes.
