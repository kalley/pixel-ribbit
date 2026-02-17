# Pixel Ribbit

Pixel Ribbit is a browser game where frogs move around a stream path and consume matching pixel colors from an uploaded image.

## Getting Started

### Requirements

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Open the local URL shown by Vite.

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## How to Play

1. Click `UPLOAD` and choose an image.
2. Pick a difficulty and color count.
3. Start the game.
4. Click/tap frogs in the feeder or waiting area to deploy them.
5. Match frog color to available pixels on the grid.

Loss condition: a frog finishes a loop without enough food and cannot be placed in the waiting area.  
Win condition: all frogs are resolved (no frogs left in pool, path, or waiting area).

See `docs/GAMEPLAY.md` for the full mechanics.

## Scripts

- `npm run dev`: start local dev server
- `npm run dev:sandbox`: start sandbox variant
- `npm run test`: run Vitest
- `npm run type-check`: run TypeScript checks
- `npm run lint`: run Biome checks
- `npm run format`: format `src/` with Biome
- `npm run knip`: detect unused code

## Project Structure

- `src/engine`: game rules, state, events, constraints, timing
- `src/game`: game-specific setup from image/palette data
- `src/renderer`: canvas rendering and interpolation
- `src/ui`: DOM controls, modal, upload flow, canvas input
- `src/image-processing`: image loading, resize, posterization

See `docs/ARCHITECTURE.md` for deeper design details.
