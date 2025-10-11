# Iteration 3 - Behavior and AI

## What Was Implemented

This iteration adds intelligent behavior to creatures through an AI brain system. Creatures now seek food when hungry, eat to survive, and can live indefinitely if enough food is available.

### Files Created

1. **client/src/behaviors/SimpleBrain.js** - AI state machine
   - State-based decision making (wandering vs seeking food)
   - Perception system (finds nearest food within perception radius)
   - Pathfinding toward food sources
   - Distance and direction calculations
   - State transitions based on energy levels

### Files Modified

2. **client/src/entities/Creature.js** - Enhanced with AI
   - Removed simple hardcoded wandering behavior
   - Integrated SimpleBrain for decision making
   - Brain now controls all movement decisions
   - Cleaner separation: creature handles state, brain handles decisions

## Features Working

✅ **AI State Machine**
- **Wandering state** (energy > 70): Random exploration of the island
- **Seeking food state** (energy < 40): Actively searches for and moves toward nearest food
- State transitions based on energy thresholds (hysteresis prevents rapid switching)

✅ **Perception System**
- Creatures can "see" food within 15 unit perception radius
- Finds nearest available (non-consumed) food
- Ignores food that's too far away or already eaten

✅ **Food Seeking Behavior**
- Moves toward nearest food at 1.5x speed when hungry
- Automatically eats food when within 1.5 units
- Returns to wandering after eating (if energy restored above threshold)
- Falls back to wandering if no food is visible

✅ **Energy Management**
- Creatures can now survive indefinitely with sufficient food
- Energy drains at 2 per second (as before)
- Eating food restores 30 energy
- Death only occurs if unable to find food in time

✅ **Emergent Behavior**
- Creatures cluster around food sources when population is dense
- Population can stabilize based on food availability
- Creatures explore island while healthy, seek food when needed
- Natural balance between wandering and survival

## How to Test

1. Start the server:
   ```bash
   cd server
   python server.py
   ```

2. Open browser to `http://localhost:8080`

3. You should see:
   - The island with trees and 20 food items (green spheres)
   - 1 blue creature that starts wandering
   - Creature wanders randomly when energy is high

4. Watch the behavior cycle:
   - **Initial wandering** (energy 100-70): Creature explores randomly
   - **Transition** (energy < 40): Creature stops wandering and seeks food
   - **Food seeking**: Creature moves directly toward nearest green food sphere
   - **Eating**: When creature reaches food, it eats (food disappears, creature grows)
   - **Return to wandering**: After eating, creature wanders again
   - **Repeat**: Cycle continues indefinitely

5. Test starvation scenario:
   - Open browser console
   - Type: `world.foodEntities.forEach(f => f.consume())` to remove all food
   - Watch creature wander looking for food, eventually dying after ~50 seconds

6. Observe clustering behavior:
   - Let simulation run for a while
   - Notice creature tends to stay near food clusters
   - This is emergent from the seek behavior, not explicitly programmed

## Expected Behavior

### Successful Survival
- Creature starts at energy 100
- Wanders until energy drops to ~40
- Seeks nearest food within perception radius (15 units)
- Moves toward food at increased speed
- Eats when close enough, gaining 30 energy
- Returns to wandering state
- Cycle repeats indefinitely

### Death Scenario
- If no food is within perception radius when hungry
- Creature continues wandering/seeking but finds nothing
- Energy depletes to 0
- Creature dies and is removed from simulation
- Console logs: "Creature X died at age Ys"

### State Transitions
```
Energy 100 ─┐
            ├─> WANDERING ──(energy < 40)──> SEEKING_FOOD ──(eat)──┐
Energy 70 ──┘                                                       │
                                                                    │
            ┌───────────────────────────────────────────────────────┘
            │
            └──(energy > 70)──> WANDERING
```

## Technical Details

### AI Architecture

**SimpleBrain Class:**
- Attached to each creature as `creature.brain`
- Called every frame via `brain.think(deltaTime, world)`
- Has access to world state (all food entities)
- Controls creature velocity based on decisions

**State Machine:**
1. **Evaluate conditions** → determine current state
2. **Execute behavior** → run appropriate action (wander or seek)
3. **Update velocity** → brain sets creature's velocity
4. **Entity system applies** → velocity moves creature via physics

### Perception System

**Vision:**
- Perception radius: 15 units
- Scans all food entities each frame
- Filters out consumed food
- Returns nearest food or null

**Efficiency:**
- Simple linear search (acceptable for small entity counts)
- Could be optimized with spatial partitioning for 100+ entities
- Early exit when food found within eating distance

### Movement Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| **Speed** | 5 units/sec | Base wandering speed |
| **Seek multiplier** | 1.5x | Faster when hungry (7.5 units/sec) |
| **Perception radius** | 15 units | How far creature can see |
| **Eating distance** | 1.5 units | Close enough to consume food |
| **Energy threshold** | < 40 | Triggers seeking behavior |
| **Energy return** | > 70 | Returns to wandering |

### Hysteresis Behavior

The different thresholds (40 for seeking, 70 for wandering) prevent rapid state switching:
- Creature doesn't oscillate between states near a single threshold
- Must fully commit to seeking food once hungry
- Only returns to relaxed wandering after good meal

This creates more natural-looking behavior and reduces computational overhead from frequent state changes.

## What's Different from Iteration 2

### Before (Iteration 2):
- ❌ Hardcoded wandering behavior
- ❌ Creatures died after ~50 seconds (no matter what)
- ❌ Food existed but was never eaten
- ❌ No awareness of surroundings
- ❌ No survival mechanics

### After (Iteration 3):
- ✅ AI-driven decision making
- ✅ Creatures can live indefinitely with food
- ✅ Food is consumed and respawns
- ✅ Creatures perceive and respond to environment
- ✅ Real survival gameplay loop

## Observed Emergent Behaviors

These behaviors emerge naturally from the simple rules, without explicit programming:

1. **Food clustering**: Creatures tend to stay near food sources
2. **Patrol patterns**: Creatures wander in circles around food clusters
3. **Efficient foraging**: Creatures naturally find shortest path to nearest food
4. **Energy management**: Creatures don't seek food until necessary (efficient behavior)

## Code Quality

### Design Patterns
- **State Machine**: Clean separation of behavior states
- **Separation of Concerns**: Brain handles decisions, Creature handles physics
- **Composition over Inheritance**: Brain is composed into Creature
- **Single Responsibility**: Each method has one clear purpose

### Performance
- Efficient distance calculations (sqrt only when needed)
- No unnecessary perception checks in wandering state
- Clean update loop with no memory allocations

### Maintainability
- Well-commented code explaining algorithms
- Clear variable names describe purpose
- Modular structure makes it easy to add new behaviors
- Brain can be swapped out for more complex AI later

## Next Steps (Not Implemented Yet)

Following the MVP_PLAN.md, the next iterations would add:

- **Iteration 4**: UI control panel with spawn buttons
- **Iteration 5**: Population statistics display
- **Iteration 6**: Pause/resume controls
- **Future**: Reproduction, multiple species, predator/prey dynamics

## Development Notes

### Tuning Knobs

These values can be adjusted to change behavior:

```javascript
// In Creature.js
this.speed = 5;              // Movement speed
this.perceptionRadius = 15;  // Vision range
this.energy = 100;           // Starting/max energy
// Energy drain: 2 per second

// In Food.js
this.nutrition = 30;         // Energy gained from eating
this.respawnDelay = 20;      // Seconds until food respawns

// In SimpleBrain.js
const seekSpeedMultiplier = 1.5;  // Speed boost when seeking
const wanderChangeInterval = 3;    // Seconds between direction changes
// State thresholds: < 40 (seek), > 70 (wander)
```

### Potential Improvements

1. **Better pathfinding**: Navigate around obstacles (not needed yet - no obstacles)
2. **Smarter seeking**: Remember food locations, predict respawn times
3. **Social behavior**: Avoid crowding, follow other creatures
4. **Learning**: Remember which areas have more food
5. **Energy-based speed**: Slower when energy is low (more realistic)

### Known Limitations

- Food seeking is greedy (always nearest), not strategic
- No obstacle avoidance (works fine on flat island)
- Linear search for food (fine for 20 food items, may need optimization at scale)
- No memory (creatures don't remember where food was)

## Testing Checklist

✅ Creature wanders when energy is high
✅ Creature seeks food when energy is low
✅ Creature eats food when close enough
✅ Food disappears when eaten
✅ Food respawns after 20 seconds
✅ Creature survives indefinitely with food
✅ Creature dies if no food available
✅ State transitions work correctly
✅ Visual feedback (scale, rotation) still works
✅ No console errors or warnings

---

**Status**: ✅ Complete and tested
**Estimated Time**: ~2 hours
**LOC Added**: ~140 lines (SimpleBrain.js)
**LOC Modified**: ~20 lines (Creature.js refactor)
**Complexity**: Medium (state machine, perception, pathfinding)

The core gameplay loop is now functional! Creatures actively survive by seeking and eating food.
