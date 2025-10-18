# Iteration 5: Reproduction & Genetics

## Overview
This iteration implements a reproduction system with genetic inheritance, allowing creatures to spawn offspring that inherit mutated traits from their parents. This creates evolutionary dynamics where successful traits can spread through the population over time.

## Features Implemented

### 1. DNA & Genetic System
**New File:** `client/src/genetics/DNA.js`

- **DNA Class**: Encodes heritable traits in genetic "genes"
- **Five Genetic Traits**:
  - `speed`: Affects movement speed (0.8x - 1.2x multiplier)
  - `perception`: Affects how far creature can see food (0.8x - 1.2x multiplier)
  - `efficiency`: Affects energy consumption rate (0.8x - 1.2x multiplier)
  - `size`: Affects visual size of creature (0.8x - 1.2x multiplier)
  - `hue`: Controls base color (0.0 - 1.0, full color spectrum)

- **Mutation System**:
  - 15% chance per gene to mutate
  - Mutations add/subtract up to ±0.1 to gene values
  - Genes clamped to viable ranges (0.5 - 1.5 for most traits)
  - Hue wraps around for color spectrum continuity

- **Color Expression**:
  - DNA generates colors based on genetic hue
  - HSL color space for natural variations
  - Still shows red when hungry, genetic color when healthy

### 2. Reproduction Mechanics

**Reproduction Requirements** (configurable in `config.js`):
- Energy threshold: 85% (creature must be well-fed)
- Energy cost: 40 energy points (significant investment)
- Cooldown: 30 seconds between reproductions

**Reproduction Process**:
1. Creature checks energy and cooldown each frame
2. When conditions met, automatically reproduces
3. Offspring spawns 2 units away at random angle
4. Parent loses 40 energy
5. Offspring inherits mutated DNA from parent
6. Birth sound plays and statistics update

**Offspring Characteristics**:
- Start with 60 energy
- Inherit parent's DNA with mutations
- Generation counter increments
- Traits affected by genetic modifiers
- Unique color based on genetic hue

### 3. Visual Variations

**Genetic Expression**:
- **Size Variation**: Creatures range from 0.8x to 1.2x base size based on `size` gene
- **Color Diversity**: Each creature has unique color based on `hue` gene
  - Hue determines base color on the spectrum
  - Saturation increases with energy (healthier = more vibrant)
  - Lightness increases with energy (healthier = brighter)
- **Performance Differences**: Speed and perception visibly affect behavior

**Visual Feedback**:
- Offspring appear smaller initially (lower energy)
- Family groups may cluster (offspring spawn near parents)
- Color variations make lineages visually distinct

### 4. Statistics & Tracking

**New Statistics**:
- Total Births: Cumulative count of all reproductions
- Total Deaths: Cumulative count of all deaths
- Generation tracking: Each creature knows its generation number

**Console Logging**:
- Birth events: `"Birth! Generation X, Population: Y"`
- Death events now show generation: `"Creature died at age Xs, Gen Y"`

**Control Panel Updates**:
- Added "Total Births" stat display
- Added "Total Deaths" stat display
- Statistics update 10x per second in real-time

### 5. Audio Feedback

**New Sound Effect**:
- Birth sound: Rising tone (400Hz → 800Hz)
- Duration: 0.2 seconds
- Sine wave for happy, pleasant sound
- Volume: 0.15 (balanced with other sounds)

### 6. Configuration

**New Config Section:** `GENETICS_CONFIG`

```javascript
MUTATION_RATE: 0.15           // 15% chance per gene
MUTATION_AMOUNT: 0.2          // ±0.1 max change
REPRODUCTION_ENERGY_THRESHOLD: 85
REPRODUCTION_ENERGY_COST: 40
REPRODUCTION_COOLDOWN: 30
OFFSPRING_STARTING_ENERGY: 60
OFFSPRING_SPAWN_DISTANCE: 2
```

**Audio Config Additions**:
```javascript
BIRTH_SOUND_VOLUME: 0.15
BIRTH_SOUND_FREQ_START: 400
BIRTH_SOUND_FREQ_END: 800
BIRTH_SOUND_DURATION: 0.2
```

## Technical Implementation

### Creature.js Changes
- Constructor now accepts optional `parentDNA` parameter
- First generation: Creates random DNA
- Offspring: Inherits and mutates parent DNA
- Traits modified by genetic multipliers:
  - `speed = BASE_SPEED * dna.genes.speed`
  - `perceptionRadius = BASE_PERCEPTION * dna.genes.perception`
  - `energyDrainRate = BASE_DRAIN / dna.genes.efficiency`
- Reproduction check runs every frame in `update()`
- Color determined by DNA instead of hardcoded values

### World.js Changes
- New method: `spawnOffspring(x, z, parentDNA)`
- Tracks `totalBirths` and `totalDeaths`
- Statistics reset on simulation reset
- `getStats()` returns birth/death counts
- Offspring creation uses Creature constructor with DNA parameter

### Inheritance Flow
```
Parent Creature
    └─> Parent DNA
        └─> mutate()
            └─> Offspring DNA (genes slightly different)
                └─> New Creature with mutated traits
```

## Evolutionary Dynamics

### Natural Selection Pressures
1. **Food Scarcity**: Efficient creatures survive longer
2. **Perception**: Better perception finds food faster
3. **Speed**: Faster creatures reach food first (but drain energy faster)
4. **Efficiency**: Lower energy drain = longer survival
5. **Size**: Larger size more visible but no gameplay impact yet

### Observable Patterns
- **Population Growth**: With abundant food, population can grow exponentially
- **Trait Drift**: Random mutations cause trait values to drift over time
- **Adaptation**: Successful trait combinations more likely to reproduce
- **Diversity**: Color variations make population diversity visible
- **Clustering**: Family groups may stay near food sources

## Testing Checklist

- [x] Creatures reproduce when energy > 85%
- [x] Offspring spawn near parents
- [x] Offspring have mutated traits from parent
- [x] Visual size variations work correctly
- [x] Color variations display properly
- [x] Birth sound plays on reproduction
- [x] Birth/death statistics track correctly
- [x] Generation counter increments properly
- [x] Genetic traits affect creature behavior
- [x] Statistics reset on simulation reset
- [x] Multiple generations can occur
- [x] Population can grow beyond initial count
- [x] Energy cost prevents continuous reproduction
- [x] Cooldown prevents spam reproduction

## Known Behaviors & Balance

### Current Balance:
- Reproduction threshold (85%) requires significant food consumption
- Energy cost (40) is substantial, preventing continuous reproduction
- 30-second cooldown prevents population explosion
- Offspring start at 60 energy (somewhat hungry)
- With default settings (80 food, 12 creatures), population usually grows slowly

### Expected Dynamics:
- Initial population may decline if food distribution is unlucky
- Once creatures start finding food regularly, births begin
- Population tends to stabilize around food carrying capacity
- Faster reproduction at higher simulation speeds

### Potential Adjustments:
- Decrease reproduction threshold for more births
- Decrease energy cost for faster population growth
- Decrease cooldown for exponential growth
- Increase offspring energy for better survival rates
- Adjust mutation rate for faster/slower evolution

## Future Enhancements (Not Implemented)

- Sexual reproduction (two-parent genetics)
- Fitness-based selection
- Genetic diversity metrics
- Trait distribution graphs
- Phylogenetic tree visualization
- Dominant/recessive genes
- Genetic markers for tracking lineages
- Evolution speed controls
- Manual trait editing
- Breeding programs

## Usage Notes

### Observing Evolution:
1. Start simulation with default settings
2. Increase speed to 5-10x to see evolution faster
3. Watch statistics: births should exceed deaths for growth
4. Observe color diversity increasing over time
5. Notice behavioral differences (some creatures faster, etc.)

### Encouraging Reproduction:
- Increase food count (more food = more energy = more births)
- Decrease reproduction threshold in config
- Decrease reproduction cooldown
- Increase food nutrition value

### Slowing Population Growth:
- Decrease food count
- Increase reproduction threshold
- Increase reproduction energy cost
- Increase reproduction cooldown

## Code Organization

```
client/src/
├── genetics/
│   └── DNA.js              # New: Genetic system
├── entities/
│   └── Creature.js         # Modified: DNA integration, reproduction
├── core/
│   └── World.js            # Modified: Offspring spawning, statistics
├── ui/
│   └── ControlPanel.js     # Modified: Birth/death stats
├── utils/
│   └── SoundManager.js     # Modified: Birth sound
└── config.js               # Modified: Genetics config
```

## Documentation

- Comprehensive code comments in all files
- JSDoc style documentation for new methods
- Config values all documented inline
- Console logging for debugging evolution

---

**Iteration 5 Complete!** The ecosystem now has a functioning genetic system with reproduction and heredity. Creatures evolve over time based on which traits help them survive and reproduce.
