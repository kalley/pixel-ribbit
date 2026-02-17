# Gameplay Guide

## Core Idea

You upload an image, the game converts it into a pixel grid, and frogs consume matching colors around the grid perimeter.

## Board Areas

- `Grid`: pixel resources (alive/dead) generated from your uploaded image
- `Path`: stream perimeter where active frogs move
- `Pool/Feeder`: queued frogs available for deployment
- `Waiting Area`: temporary holding slots for unsatisfied frogs

## Frog Lifecycle

1. Frog starts in `pool`.
2. Player deploys frog to `path`.
3. Frog moves segment-by-segment around the perimeter.
4. At each segment, it checks for the first alive pixel in its facing direction.
5. If color matches and frog is still hungry, it consumes the pixel.
6. On loop completion:
   - if satisfied: frog exits play
   - if unsatisfied: frog moves to waiting area (if space exists)
   - if no waiting space exists: game is lost

## Deployment Rules

Deployment is blocked when:

- path capacity is full
- deployment cooldown is active
- no entities are available in pool/waiting area
- entry position is still occupied
- selected frog is not valid for the source slot/column

## Game States

- `playing`: normal mode
- `victory_mode`: speed-up mode when remaining frogs fit into path capacity
- `won`: all entities resolved
- `lost`: waiting-area overflow (or equivalent fail condition)

## Input

- Mouse click supported on canvas entities
- Touch `touchend` supported (uses changed touch point)

## Tips

- Deploy in color-aware order to avoid filling waiting slots.
- Use waiting area as a short buffer, not a long-term queue.
- When near victory mode, focus on clearing available color matches quickly.
