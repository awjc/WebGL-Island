# Iteration 9: Predator-Prey Ecosystem

## Overview

Added a full predator-prey ecosystem with carnivore creatures that hunt herbivores,
creating classic Lotka-Volterra population dynamics where both species co-evolve.

## New Features

### Carnivore Species (Predators)
- **Cone-shaped visual**: Predators appear as sharp 6-sided cones — visually distinct
  from the cube-shaped herbivores and immediately identifiable as threats
- **Red/orange genetics**: Predator DNA is initialized with a hue gene locked to the
  red-orange range (0°–40°), and offspring inherit this coloring
- **Higher metalness**: Predators have a shinier, more menacing material finish
- **Hunting AI (PredatorBrain)**: New `PredatorBrain` state machine with two states:
  - `wandering`: Patrol randomly when no prey is visible
  - `hunting`: Chase the nearest visible herbivore at full sprint speed
- **Kill mechanic**: Predator strikes a herbivore when within kill range (1.8m),
  instantly killing it and gaining a configurable energy reward (70 energy)
- **Faster base speed**: Predators have a 1.4× speed multiplier over herbivores
- **Larger detection radius**: 20m detection range (vs 15m for herbivores)
- **Higher energy drain**: 1.8× energy drain rate — being an apex predator is costly
- **Slower reproduction**: 60s cooldown (vs 30s for herbivores) with 88% energy threshold

### Fear & Flee System (Herbivores)
- **Predator detection**: Herbivores can sense predators within a 12m fear radius
- **Flee state**: When a predator is within range, herbivore overrides all other
  behaviors (hunger, food seeking) and sprints in the opposite direction at 2× speed
- **Survival priority**: Flee state has highest priority — a starving herbivore will
  still flee rather than seek food if a predator is close

### Population Dynamics
- **Lotka-Volterra oscillations**: Predator and prey populations naturally oscillate —
  predators boom when prey is plentiful, then crash as prey population falls
- **Co-evolutionary pressure**: Prey evolve faster speed genes to escape; predators
  evolve faster speed genes to catch slower prey
- **Extinction cascade**: When all herbivores die, simulation recognizes this as
  extinction (predators soon starve) and shows the extinction overlay

### Statistics & Visualization
- **Predator count** displayed in the Stats panel (separate from "Herbivores")
- **Red predator line** added to the population graph — watch the classic predator-prey
  oscillation unfold in real time
- **Death tracking**: All creature deaths (starvation + predation) are now tracked
  and reported as `totalDeaths` in the stats

### Audio
- **Kill sound**: A deep, low descending growl plays each time a predator kills prey,
  distinct from the death sound (which plays on starvation)

### UI Controls
- **Predators slider**: New slider in the Reset section (0–20 predators) to configure
  starting predator population
- **Predators stat**: Live predator count displayed in the Statistics section

## Configuration (config.js)

All predator parameters are in `PREDATOR_CONFIG`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `ENERGY_DRAIN_MULTIPLIER` | 1.8 | Energy drain relative to herbivores |
| `ENERGY_FROM_KILL` | 70 | Energy gained from killing prey |
| `SPEED_MULTIPLIER` | 1.4 | Base speed multiplier vs herbivores |
| `CHASE_SPEED_MULTIPLIER` | 1.8 | Extra speed when actively chasing |
| `DETECTION_RADIUS` | 20 | How far predators can spot prey (m) |
| `KILL_RANGE` | 1.8 | Distance to strike and kill (m) |
| `FEAR_RADIUS` | 12 | Range at which herbivores detect threat (m) |
| `FLEE_SPEED_MULTIPLIER` | 2.0 | Speed multiplier when fleeing |
| `REPRODUCTION_COOLDOWN` | 60 | Seconds between predator reproductions |

## Files Changed

- `config.js` — Added `PREDATOR_CONFIG`, `DEFAULT_PREDATOR_COUNT`, `PREDATOR_SLIDER_*`,
  `KILL_SOUND_*` audio settings
- `behaviors/PredatorBrain.js` — **New**: carnivore AI state machine
- `behaviors/SimpleBrain.js` — Added `fleeing` state and `findNearestPredator()` / `flee()`
- `entities/Creature.js` — Cone geometry for carnivores, `PredatorBrain`, `killPrey()`,
  species-aware energy thresholds, `createStateIndicator()` (◆ for hunting predators)
- `genetics/DNA.js` — Species-aware constructor (red-orange hue for carnivores),
  `clampHueForCarnivore()` helper
- `core/World.js` — `totalDeaths` tracking, `spawnCarnivore()`, species-aware `spawnOffspring()`,
  updated `getStats()` with `predatorCount`, updated `reset()` with `predatorCount` param
- `utils/SoundManager.js` — Added `playKillSound()`
- `ui/ControlPanel.js` — Predator stat display, predator slider, passes `predatorCount` to reset
- `ui/PopulationGraph.js` — Added red predator population dataset (dataset index 1)

## Observing Predator-Prey Dynamics

1. **Run at 5–10× speed** to see oscillations develop quickly
2. **Watch the population graph**: Blue (herbivores) and red (predators) lines
   will oscillate out of phase — predators lag behind prey peaks
3. **Observe chase sequences**: Predators (cones) sprint toward herbivores (cubes),
   which scatter in all directions
4. **Speed co-evolution**: Over many generations, both herbivore speed and predator speed
   genes will trend upward — an evolutionary arms race
5. **Adjust balance**: Start with fewer predators (1–2) or more herbivores (20+)
   to find a stable equilibrium for your island size
