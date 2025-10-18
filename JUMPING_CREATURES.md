# Jumping Creatures - Implementation Plan

## Vision

Evolve creatures that can jump to reach food at varying heights. This creates evolutionary pressure for jump ability while maintaining the existing size-metabolism dynamics. Creatures must balance the energy cost of jumping against the benefit of accessing high-altitude food sources.

---

## Core Concept

**Evolutionary Pressure**: Food spawns at various heights on trees (0m to tree height). Creatures with better jumping genes can access more food sources, but jumping costs energy. Over time, the population should evolve optimal jump heights based on food distribution.

**Why This Works**:
- Clear selection pressure (can't eat = die)
- Visually observable (creatures jumping around)
- Multiple trait interactions (size, jump height, energy efficiency)
- Emergent strategies (specialists vs generalists)

---

## Physics Engine: Do We Need One?

### Analysis

**Without Physics Engine (Custom Implementation)**:
- ✅ Lightweight and performant (50+ creatures)
- ✅ Full control over behavior and tuning
- ✅ Easy to understand and debug
- ✅ Matches current codebase style
- ❌ Need to implement gravity, jumping, collisions ourselves
- ❌ More complex interactions later may require rewrites

**With Physics Engine (Cannon.js / Ammo.js / Rapier)**:
- ✅ Handles complex physics automatically
- ✅ Robust collision detection
- ✅ Future-proof for advanced features
- ❌ Learning curve and integration effort
- ❌ Performance overhead (overkill for simple jumping)
- ❌ Less control over subtle behaviors
- ❌ Adds significant dependency

### Recommendation: **Start with Custom Physics**

**Rationale**:
1. Jumping is simple physics: parabolic motion under constant gravity
2. Current codebase is lightweight - adding a physics engine is a big architectural shift
3. We can always add a physics engine later if we need:
   - Creature-creature collisions
   - Complex terrain interactions
   - Ragdoll physics
   - Advanced environmental dynamics

**Implementation**: Use simple Euler integration for vertical motion with gravity. This is sufficient for jumping and matches our current horizontal movement system.

---

## Implementation Roadmap

### Phase 1: Vertical Physics Foundation
**Goal**: Add gravity and y-axis movement to all entities

**Tasks**:
1. **Update Entity base class** ([client/src/core/Entity.js](client/src/core/Entity.js))
   - Add `velocity.y` component
   - Add gravity constant to world/config
   - Apply gravity in update loop: `velocity.y -= GRAVITY * deltaTime`
   - Update position: `position.y += velocity.y * deltaTime`
   - Ground collision: if `position.y <= groundHeight`, snap to ground and zero y-velocity

2. **Add physics config** ([client/src/config.js](client/src/config.js))
   ```javascript
   export const PHYSICS_CONFIG = {
       GRAVITY: 20.0,              // m/s² (stronger than Earth for visible effect)
       GROUND_LEVEL: 0.0,          // Y position of ground
       AIR_RESISTANCE: 0.98,       // Velocity dampening (optional)
   };
   ```

3. **Ground height calculation**
   - For now: flat ground at y=0
   - Later: query terrain height at (x, z) position

4. **Test with existing entities**
   - Food should "fall" to ground if spawned in air
   - Creatures stay grounded when not jumping

**Checkpoint**: Entities respect gravity and stay on ground.

---

### Phase 2: Jumping Mechanics
**Goal**: Creatures can jump based on genetic trait

**Tasks**:

1. **Add jump gene to DNA** ([client/src/genetics/DNA.js](client/src/genetics/DNA.js))
   ```javascript
   genes: {
       // ... existing genes
       jumpPower: 0.8 + Math.random() * 0.4,  // 0.8 - 1.2 multiplier
   }
   ```
   - Mutation range: 0.5 - 1.5 (same as other traits)
   - Higher jumpPower = higher max jump height

2. **Add jump mechanics to Creature** ([client/src/entities/Creature.js](client/src/entities/Creature.js))
   ```javascript
   // Jump configuration
   BASE_JUMP_VELOCITY: 10.0,       // Base upward velocity (m/s)
   JUMP_COOLDOWN: 2.0,             // Seconds between jumps
   JUMP_ENERGY_COST_BASE: 5,       // Base energy cost
   JUMP_ENERGY_MULTIPLIER: 1.5,    // Cost scales with jumpPower

   // Jump state
   isGrounded: true,               // On ground or in air?
   jumpCooldown: 0,                // Time until can jump again

   // Jump method
   jump() {
       if (!this.isGrounded || this.jumpCooldown > 0) return;

       // Calculate jump velocity from genetics
       const jumpVelocity = BASE_JUMP_VELOCITY * this.dna.genes.jumpPower;
       this.velocity.y = jumpVelocity;
       this.isGrounded = false;

       // Energy cost scales with jump power (higher jumps cost more)
       const energyCost = JUMP_ENERGY_COST_BASE +
           (this.dna.genes.jumpPower * JUMP_ENERGY_MULTIPLIER);
       this.energy -= energyCost;

       // Start cooldown
       this.jumpCooldown = JUMP_COOLDOWN;
   }
   ```

3. **Update creature update loop**
   ```javascript
   update(deltaTime, world) {
       // ... existing energy drain, aging, etc.

       // Update jump cooldown
       if (this.jumpCooldown > 0) {
           this.jumpCooldown -= deltaTime;
       }

       // Check if grounded (after physics update)
       const groundHeight = 0.5 * this.dna.genes.size; // Half creature size
       this.isGrounded = (this.position.y <= groundHeight + 0.1);

       // Run AI (may trigger jump)
       this.brain.think(deltaTime, world);

       // Apply physics (gravity handled by Entity base class)
       super.update(deltaTime, world);

       // ... visual updates
   }
   ```

4. **Visual feedback for jumping**
   - Squash/stretch animation when jumping/landing
   - Particle effect on jump (optional)
   - Different color/opacity while airborne (optional)

**Checkpoint**: Creatures can jump with heights varying by genetics. Jump costs energy and has cooldown.

---

### Phase 3: 3D Tree & Food Distribution
**Goal**: Trees have height variation, food spawns at different vertical levels

**Tasks**:

1. **Update Tree entity** ([client/src/entities/Tree.js](client/src/entities/Tree.js) or [client/src/rendering/Tree.js](client/src/rendering/Tree.js))
   ```javascript
   constructor() {
       // Separate height and width
       this.height = 5 + Math.random() * 10;    // 5-15m tall
       this.width = 1 + Math.random() * 2;      // 1-3m wide canopy

       // Visual: trunk + foliage
       // Trunk: cylinder from ground to height
       // Foliage: sphere or cone at top
   }
   ```

2. **Add tree height gene** (optional - for evolving trees)
   - Trees could have genetics too
   - Food-productive trees spawn more fruit
   - Could create co-evolution (tall trees vs jump height)

3. **Modify food spawning** ([client/src/entities/Tree.js](client/src/entities/Tree.js))
   ```javascript
   spawnFood(world) {
       // Spawn food at random height on tree
       const foodHeight = Math.random() * this.height;

       // Spawn within canopy radius horizontally
       const angle = Math.random() * Math.PI * 2;
       const distance = Math.random() * this.width;
       const offsetX = Math.cos(angle) * distance;
       const offsetZ = Math.sin(angle) * distance;

       // Create food at height
       const food = world.spawnFood(
           this.position.x + offsetX,
           this.position.z + offsetZ
       );
       food.position.y = foodHeight;
       food.mesh.position.y = foodHeight;

       // Food stays at that height (doesn't fall)
       food.isAttachedToTree = true; // Flag to prevent gravity
   }
   ```

4. **Update Food entity** ([client/src/entities/Food.js](client/src/entities/Food.js))
   ```javascript
   update(deltaTime, world) {
       // Only apply gravity if not attached to tree
       if (!this.isAttachedToTree) {
           super.update(deltaTime, world); // Applies gravity
       } else {
           // Stay at current position (attached to tree)
           if (this.mesh) {
               this.mesh.position.set(
                   this.position.x,
                   this.position.y,
                   this.position.z
               );
           }
       }
   }
   ```

5. **Visual improvements**
   - Food "hangs" from tree branches visually
   - Thin line from food to tree trunk (vine/branch)
   - Sway animation for food in wind (optional)

**Checkpoint**: Trees have varying heights, food spawns at different vertical positions on trees.

---

### Phase 4: Jump-to-Eat AI Behavior
**Goal**: Creatures intelligently decide when to jump to reach food

**Tasks**:

1. **Update food perception** ([client/src/behaviors/SimpleBrain.js](client/src/behaviors/SimpleBrain.js))
   ```javascript
   findNearestFood(world) {
       let nearest = null;
       let minDist = Infinity;

       for (const food of world.foodEntities) {
           if (food.isConsumed) continue;

           // 3D distance calculation (including height)
           const dist = this.distance3DTo(food);

           // Check if within perception radius
           if (dist < this.creature.perceptionRadius && dist < minDist) {
               minDist = dist;
               nearest = food;
           }
       }

       return nearest;
   }

   distance3DTo(entity) {
       const dx = entity.position.x - this.creature.position.x;
       const dy = entity.position.y - this.creature.position.y;
       const dz = entity.position.z - this.creature.position.z;
       return Math.sqrt(dx*dx + dy*dy + dz*dz);
   }
   ```

2. **Food reachability check**
   ```javascript
   canReachFood(food) {
       // Calculate max jump height from genetics
       const jumpVelocity = BASE_JUMP_VELOCITY * this.creature.dna.genes.jumpPower;
       const maxJumpHeight = (jumpVelocity * jumpVelocity) / (2 * PHYSICS_CONFIG.GRAVITY);

       // Calculate required jump height
       const foodHeight = food.position.y;
       const creatureHeight = this.creature.position.y;
       const requiredJumpHeight = foodHeight - creatureHeight;

       // Can reach if max jump >= required height
       return maxJumpHeight >= requiredJumpHeight;
   }
   ```

3. **Jump decision logic**
   ```javascript
   seekFood(deltaTime, world) {
       const nearestFood = this.findNearestFood(world);

       if (nearestFood) {
           const horizontalDist = this.distanceTo(nearestFood); // 2D distance
           const verticalDist = nearestFood.position.y - this.creature.position.y;

           // If food is above us and we're close horizontally
           if (verticalDist > 1.0 && horizontalDist < EATING_DISTANCE * 2) {
               // Check if we can reach it
               if (this.canReachFood(nearestFood)) {
                   // Jump to reach it
                   this.creature.jump();
               }
           }

           // If close enough (horizontally and vertically), eat
           if (horizontalDist < EATING_DISTANCE &&
               Math.abs(verticalDist) < EATING_DISTANCE) {
               this.creature.eat(nearestFood);
           } else {
               // Move toward food horizontally
               const direction = this.directionTo(nearestFood);
               this.creature.velocity.x = direction.x * this.creature.speed;
               this.creature.velocity.z = direction.z * this.creature.speed;
           }
       } else {
           this.wander(deltaTime);
       }
   }
   ```

4. **Aerial eating** (optional enhancement)
   - Allow eating while in mid-air
   - Check 3D distance to food
   - More realistic: creature grabs food at apex of jump

**Checkpoint**: Creatures approach food, jump when needed, and eat when in range.

---

### Phase 5: Evolutionary Tuning
**Goal**: Balance costs/benefits so evolution toward optimal jump height is observable

**Tasks**:

1. **Food distribution strategy**
   ```javascript
   // In Tree.spawnFood()
   // Weighted distribution: more food at medium-high heights
   const heightDistribution = Math.pow(Math.random(), 0.5); // Skew toward higher
   const foodHeight = this.height * heightDistribution;
   ```
   - Experiment with distributions:
     - Uniform: food equally likely at any height
     - High-heavy: most food at top (strong selection pressure)
     - Bimodal: food at ground AND top (specialists evolve)

2. **Energy cost tuning**
   ```javascript
   // Make jump cost scale with both power and size
   const jumpCost = JUMP_ENERGY_COST_BASE *
       this.dna.genes.jumpPower *
       this.dna.genes.size;
   ```
   - Larger creatures pay more to jump (like metabolism)
   - Higher jumps cost exponentially more (physics-accurate)

3. **Add jump statistics**
   - Track jumps per second
   - Average jump height in population
   - Graph jump gene over time
   - Correlation between jump ability and survival

4. **Configuration knobs** ([client/src/config.js](client/src/config.js))
   ```javascript
   export const JUMPING_CONFIG = {
       ENABLED: true,              // Master toggle for jumping
       GRAVITY: 20.0,
       BASE_JUMP_VELOCITY: 10.0,
       JUMP_COOLDOWN: 2.0,
       JUMP_ENERGY_COST_BASE: 5,
       JUMP_ENERGY_SCALING: 1.5,   // How much cost scales with power

       // Food height distribution
       FOOD_HEIGHT_MIN: 0.0,
       FOOD_HEIGHT_MAX: 1.0,       // Fraction of tree height
       FOOD_HEIGHT_BIAS: 0.5,      // 0=ground, 1=top, 0.5=uniform
   };
   ```

5. **Observing evolution**
   - Run simulation at 5-10x speed
   - Watch average jump gene increase over generations
   - Adjust food height distribution to change pressure
   - Document emergent behaviors:
     - Do small creatures evolve better jumping to compensate?
     - Do efficient creatures jump more often?
     - Is there an optimal jump height given tree distribution?

**Checkpoint**: Clear evolutionary trend toward optimal jump height observable in population graphs.

---

## Technical Implementation Details

### Physics Calculations

**Jump Height Formula**:
```javascript
// Max height from jump velocity and gravity
maxHeight = (velocity²) / (2 * gravity)

// Example: velocity=10 m/s, gravity=20 m/s²
maxHeight = 100 / 40 = 2.5 meters
```

**Jump Velocity for Target Height**:
```javascript
// Required velocity to reach height h
velocity = sqrt(2 * gravity * h)

// Example: To jump 4 meters with gravity=20
velocity = sqrt(2 * 20 * 4) = sqrt(160) ≈ 12.65 m/s
```

**Time in Air**:
```javascript
// Total hang time for jump
airTime = (2 * velocity) / gravity

// Example: velocity=10, gravity=20
airTime = 20 / 20 = 1 second
```

### Gravity Integration

```javascript
// In Entity.update()
update(deltaTime, world) {
    // Apply gravity to y-velocity
    if (!this.isGrounded) {
        this.velocity.y -= PHYSICS_CONFIG.GRAVITY * deltaTime;
    }

    // Update position from velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    // Ground collision
    const groundHeight = this.getGroundHeight(); // Entity-specific
    if (this.position.y <= groundHeight) {
        this.position.y = groundHeight;
        this.velocity.y = 0;
        this.isGrounded = true;
    } else {
        this.isGrounded = false;
    }

    // Boundary checks (existing)
    // ...
}
```

### Food-Creature Collision in 3D

```javascript
// Check if creature is close enough to eat food (3D distance)
canEat(creature, food) {
    const dx = creature.position.x - food.position.x;
    const dy = creature.position.y - food.position.y;
    const dz = creature.position.z - food.position.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

    // Account for creature size
    const eatingRadius = CREATURE_CONFIG.EATING_DISTANCE + creature.dna.genes.size * 0.5;

    return dist < eatingRadius;
}
```

---

## Edge Cases & Considerations

### Boundary Handling
**Problem**: Creature jumps out of island bounds
**Solution**:
- Apply horizontal velocity reflection (existing code)
- Cap max y position to prevent flying off screen
- Or: jump puts creature into "out of bounds" state, takes damage

### Mid-Air Control
**Problem**: Can creatures steer while jumping?
**Solution**:
- Option A: No air control (realistic)
- Option B: Reduced air control (arcade-style, more forgiving)
- Recommendation: Start with no air control, add if needed

### Jump Spamming
**Problem**: Creatures jump constantly even when not needed
**Solution**:
- Jump cooldown (already planned)
- Energy cost makes spam expensive
- AI only jumps when food is above and reachable

### Food Clustering
**Problem**: All food at one tree = all creatures cluster there
**Solution**:
- Spread trees with varying heights
- Different trees produce different amounts
- Creatures with better perception find distant food

### Performance
**Problem**: Physics for 50+ creatures
**Solution**:
- Physics is simple (just gravity + y-velocity)
- Only complex when jumping (minority of time)
- Spatial partitioning already planned for other features

---

## Evolutionary Predictions

### Expected Outcomes

1. **If most food is high**:
   - Jump gene increases over generations
   - Size gene decreases (smaller = cheaper jumps)
   - Efficiency gene increases (need energy for jumping)

2. **If food is bimodal (ground + top)**:
   - Population splits into two strategies
   - "Ground foragers": low jump, high efficiency
   - "Tree climbers": high jump, accept cost
   - Diversity increases

3. **If trees vary greatly in height**:
   - Generalist strategy emerges
   - Medium jump height to access most trees
   - Perception becomes more important (find right tree)

### Interesting Experiments

- **Sudden shift**: Start with ground food, then switch to high food mid-simulation
- **Seasonal**: Alternate between ground and high food availability
- **Spatial**: One side of island has tall trees, other side has short trees
- **Catastrophe**: Kill all high-jumpers, watch recovery

---

## Visual Enhancements (Optional)

### Jump Animation
- Squash before jump (crouch)
- Stretch at apex (elongate)
- Squash on landing (compress)
- Rotation during flight (tumbling optional)

### Tree Variety
- Different tree models (pine, oak, palm)
- Branch geometry where food attaches
- Leaves sway in wind
- Seasonal color changes

### Particle Effects
- Dust cloud on jump
- Leaves scatter when landing on tree
- Energy glow when eating mid-air
- Trail effect during flight (arc visualization)

### Camera Modes
- Follow jumping creature
- Slow-motion during jump
- "Replay" of successful high jump
- Picture-in-picture for multiple jumpers

---

## Migration Path (Step-by-Step)

### Week 1: Foundation
- [ ] Add gravity and y-velocity to Entity
- [ ] Test gravity with Food (should fall)
- [ ] Add physics config constants
- [ ] Ensure creatures stay grounded

### Week 2: Jumping
- [ ] Add jumpPower gene to DNA
- [ ] Implement Creature.jump() method
- [ ] Add jump cooldown and energy cost
- [ ] Visual feedback for jumping state

### Week 3: Trees & Food
- [ ] Separate tree height and width
- [ ] Update tree visual (taller geometry)
- [ ] Spawn food at vertical positions
- [ ] Prevent food from falling (attach to tree)

### Week 4: AI Integration
- [ ] Update perception to 3D distance
- [ ] Add food reachability check
- [ ] Implement jump decision logic
- [ ] Tune eating distance for 3D

### Week 5: Balancing & Evolution
- [ ] Tune food height distribution
- [ ] Adjust jump costs and benefits
- [ ] Add jump statistics to UI
- [ ] Run evolution experiments
- [ ] Document interesting behaviors

---

## Success Metrics

### Technical
- ✅ Creatures jump with realistic parabolic arcs
- ✅ Jump height correlates with jumpPower gene
- ✅ Food spawns at varying heights on trees
- ✅ No physics glitches (stuck in ground, flying away)

### Behavioral
- ✅ Creatures only jump when food is above them
- ✅ Jump timing is reasonably optimal (not too early/late)
- ✅ Energy cost prevents wasteful jumping
- ✅ Creatures return to wandering after eating

### Evolutionary
- ✅ Average jump height increases when food is high
- ✅ Observable change over 10-20 generations
- ✅ Population graphs show clear trend
- ✅ Different food distributions produce different strategies

### User Experience
- ✅ Jumping is visually satisfying
- ✅ Easy to understand what's happening
- ✅ Runs smoothly with 30+ creatures jumping
- ✅ Controls allow experimenting with parameters

---

## Future Extensions

### Advanced Physics
- **Stamina system**: Jumping reduces max jump height temporarily
- **Injury**: Bad landings damage creature
- **Momentum**: Running jump goes farther than standing jump
- **Grabbing**: Creature can grab onto tree and climb

### Multi-Jump
- **Double jump**: Genetic trait for air jump
- **Gliding**: Slow fall gene
- **Wall jump**: Jump off tree trunk for extra height
- **Pogo stick**: Continuous bouncing

### Environmental
- **Wind**: Affects jump trajectory
- **Slopes**: Terrain height varies, affects jumping
- **Water**: Can't jump when swimming
- **Platforms**: Mushrooms creatures can land on

### Social
- **Jumping contest**: Creatures compete for height
- **Cooperative**: Multiple creatures jump to shake tree
- **Teaching**: Adults show offspring how to jump
- **Play**: Young creatures jump recreationally

---

## Conclusion

Jumping creatures is a **natural evolution** of the current simulation that:
- Maintains the genetic/evolution core
- Adds engaging 3D physicality
- Creates clear evolutionary pressures
- Is achievable without a full physics engine
- Opens doors for future complexity

**Recommendation**: Implement with custom physics first. This keeps the codebase lightweight and gives us full control over the jumping feel. If we later want creature-creature collisions or complex terrain interactions, we can evaluate physics engines at that point.

The key is to start simple (gravity + jumping), get it working and feeling good, then layer on complexity (AI, evolution, tuning) incrementally.
