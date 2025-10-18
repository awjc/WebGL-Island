# Iteration 2 - Entities and Basic Movement

## What Was Implemented

This iteration adds the core entity system with Food and Creatures that move around the island. Creatures wander randomly and lose energy over time (they will die eventually - food seeking comes in next iteration).

### Files Created

1. **client/src/core/Entity.js** - Base entity class
   - Position and velocity tracking
   - Boundary checking (keeps entities on island)
   - Bounce physics when hitting island edge
   - Auto-incrementing entity IDs
   - Mesh position syncing

2. **client/src/entities/Food.js** - Food entity
   - Small light green spheres (0.5 radius)
   - Nutrition value: 30 energy points
   - Respawn mechanic: 20 seconds after being consumed
   - Visual feedback: becomes invisible when consumed

3. **client/src/entities/Creature.js** - Living creature entity
   - Blue cube representation (1x1x1)
   - Energy system: starts at 100, drains 2 per second
   - Simple wandering behavior (changes direction every 3 seconds)
   - Speed: 5 units/second
   - Visual scaling based on energy (shrinks as energy depletes)
   - Faces movement direction
   - Dies when energy reaches 0

4. **client/src/core/World.js** - Simulation manager
   - Manages all entities (creatures and food)
   - Update loop integrated with renderer
   - Spawning/despawning logic
   - Statistics tracking (population, food count, time)
   - Pause/resume functionality
   - Console logging for creature deaths

### Files Modified

5. **client/src/main.js** - Updated
   - Imports and initializes World class
   - World starts automatically after terrain/trees load
   - World manages its own animation loop

### Features Working

✅ **Entity System**
- Base Entity class with position, velocity, and boundaries
- Entities bounce off island edges
- Clean inheritance structure (Food and Creature extend Entity)

✅ **Food System**
- 20 food items spawn at random locations on island
- Light green spheres visible on terrain
- Respawn after 20 seconds when consumed (ready for next iteration)
- Can be eaten by creatures (method exists, will be used in iteration 3)

✅ **Creature System**
- 1 blue creature spawns at island center
- Wanders randomly, changing direction every 3 seconds
- Loses 2 energy per second
- Visual scale shrinks as energy depletes
- Rotates to face movement direction
- Dies when energy hits 0 (despawns from world)
- Death logged to console with age

✅ **World Management**
- Centralized simulation loop
- Delta-time based updates (framerate independent)
- Automatic cleanup of dead creatures
- Statistics available via `getStats()` method
- Pause/resume capability (ready for UI integration)

✅ **Performance**
- Efficient entity iteration
- Dead creatures removed immediately
- Smooth 60fps with current entity count

## How to Test

1. Start the server:
   ```bash
   cd server
   python server.py
   ```

2. Open browser to `http://localhost:8080`

3. You should see:
   - The island with trees (from iteration 1)
   - **20 small green spheres** scattered on island (food)
   - **1 blue cube** at center that starts wandering around
   - Creature rotates to face its movement direction
   - Creature slowly shrinks as it loses energy
   - After ~50 seconds, creature dies and disappears

4. Open browser console to see:
   - "Starting world simulation..."
   - "World started with 20 food and 1 creatures"
   - When creature dies: "Creature 0 died at age 50.0s"

5. Test boundaries:
   - Wait for creature to wander near island edge
   - It should bounce back when hitting the boundary

## Expected Behavior

The creature will wander aimlessly around the island for about 50 seconds (100 energy ÷ 2 energy/sec), getting smaller as it loses energy, then die. This demonstrates:
- Movement system works
- Energy system works
- Death system works
- Boundary checking works

**Note:** The creature doesn't eat yet - that comes in iteration 3 with the AI brain!

## Technical Details

### Entity Lifecycle
1. **Spawn**: Created via `World.spawnCreature()` or `World.spawnFood()`
2. **Update**: Called every frame with deltaTime
3. **Death**: Creature marked as `isDead` when energy <= 0
4. **Cleanup**: Removed from world arrays and scene

### Coordinate System
- **X/Z plane**: Horizontal (island surface)
- **Y axis**: Height (0.5 for creatures/food)
- **Origin**: Center of island
- **Boundaries**: 48 unit radius circle

### Energy System
- **Starting energy**: 100
- **Drain rate**: 2 per second
- **Max lifetime without food**: 50 seconds
- **Visual feedback**: Scale from 1.0 → 0.5 as energy depletes

### Wandering Algorithm
```
Every 3 seconds:
  - Pick random angle (0 to 2π)
  - Convert to direction vector
  - Apply velocity = direction × speed
```

## What's Missing (Coming in Iteration 3)

- ❌ Creatures don't seek food yet
- ❌ Creatures don't eat food yet
- ❌ No AI brain / decision making
- ❌ No perception system (creatures can't "see" food)
- ❌ No UI controls yet
- ❌ No population statistics display

## Code Quality

- Clean separation of concerns (Entity → Food/Creature)
- World acts as simulation manager
- Delta-time ensures consistent behavior across framerates
- Console logging helps debug entity lifecycle
- Ready for AI system to be plugged in (iteration 3)

## File Structure After Iteration 2

```
client/src/
├── main.js
├── renderer.js
├── core/
│   ├── Entity.js     ← Base class
│   └── World.js      ← Simulation manager
├── entities/
│   ├── Food.js       ← Food resource
│   └── Creature.js   ← Living creature
└── rendering/
    ├── Terrain.js
    └── Tree.js
```

---

**Status**: ✅ Ready for iteration 3 (AI brain and food seeking)
**Estimated Time**: ~1.5 hours
**LOC Added**: ~300 lines
**Entities in Scene**: 21 (20 food + 1 creature)
