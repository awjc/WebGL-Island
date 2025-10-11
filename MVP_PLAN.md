# Island Ecosystem MVP - Implementation Plan

## Core Principle
Build the simplest possible version that demonstrates the core concept: creatures living on an island with emergent behavior. No server, no persistence, no complex features. Just get something alive and moving.

---

## What We're Building

A single-page browser application where:
- A 3D island exists in the center of the view
- Simple creatures (represented as colored geometric shapes) move around the island
- Creatures have basic needs (hunger) and behaviors (wander, seek food, eat)
- Users can pan/zoom the camera and spawn new creatures
- A UI panel shows population stats and provides spawn controls

**Session**: 5-10 minutes of watching creatures survive, reproduce, and die. No save/load needed.

---

## Technology Stack

- **Rendering**: Three.js (already in your project)
- **Camera Controls**: Three.js OrbitControls
- **UI**: Vanilla JavaScript + CSS (keep it simple)
- **Math**: gl-matrix from importmap (for vectors, utilities)
- **No server required** - pure client-side for MVP

---

## Architecture Overview

### Data Flow
```
User Input → UI Controls → World → Entities → Behaviors → Position Updates → Renderer
     ↓                         ↓
  Camera Control          Update Stats
```

### Core Classes

1. **World**: Central simulation manager
   - Holds all entities (creatures and food)
   - Runs update loop via requestAnimationFrame
   - Handles spawning/despawning
   - Calculates stats

2. **Entity** (base class): Any object in the world
   - Position (x, y, z)
   - Velocity (for movement)
   - Update method (called each frame)
   - Visual representation

3. **Creature** (extends Entity): Living entity
   - Energy level (0-100)
   - State machine (wandering, seeking, eating)
   - Perception radius (how far it can "see")
   - Simple brain that picks actions

4. **Food** (extends Entity): Static resource
   - Respawn timer
   - Nutrition value

5. **Renderer**: Manages Three.js scene
   - Creates/updates 3D meshes for entities
   - Camera management
   - Lights, terrain

6. **UI**: HTML/CSS panel
   - Displays stats
   - Provides spawn buttons
   - Speed controls (optional)

---

## File Structure

```
WebGL-Island/
├── index.html                 # Already exists - update importmap
├── src/
│   ├── main.js               # Entry point, initializes everything
│   │
│   ├── core/
│   │   ├── World.js          # Simulation manager
│   │   └── Entity.js         # Base entity class
│   │
│   ├── entities/
│   │   ├── Creature.js       # Living creature
│   │   └── Food.js           # Food source
│   │
│   ├── behaviors/
│   │   └── SimpleBrain.js    # AI state machine
│   │
│   ├── rendering/
│   │   ├── Renderer.js       # Three.js scene management
│   │   ├── Terrain.js        # Island geometry
│   │   └── EntityMesh.js     # Visual representation factory
│   │
│   ├── ui/
│   │   └── ControlPanel.js   # UI overlay
│   │
│   └── utils/
│       └── helpers.js        # Math utilities, distance calc, etc.
│
└── styles/
    └── ui.css                # UI styling
```

---

## Implementation Guide

### Phase 1: Foundation (Start Here)

**1.1 - Set Up Scene and Camera**

*File: `src/rendering/Renderer.js`*

Create a Three.js renderer with:
- Scene with ambient + directional light
- Perspective camera positioned above and angled down at island
- OrbitControls for mouse pan/zoom/rotate
- Blue background (sky color)
- Render loop

```javascript
// Pseudocode structure
class Renderer {
  constructor(containerElement) {
    // Initialize Three.js scene, camera, renderer
    // Camera: position (0, 50, 50), look at (0, 0, 0)
    // Add lights
    // Set up OrbitControls (import from three/addons)
    // Start render loop
  }

  render() {
    // Update controls
    // Render scene
    // Call requestAnimationFrame
  }

  addMesh(mesh) { scene.add(mesh); }
  removeMesh(mesh) { scene.remove(mesh); }
}
```

**1.2 - Create Island Terrain**

*File: `src/rendering/Terrain.js`*

Keep it dead simple for MVP:
- CircleGeometry or PlaneGeometry (50 units radius)
- Green material (grass color)
- Slightly rotate to make it horizontal
- Later: add height variation with noise

```javascript
// Simple approach
createTerrain() {
  const geometry = new THREE.CircleGeometry(50, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a7c59, // grass green
    roughness: 0.8
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // Lay flat
  return mesh;
}
```

**1.3 - Entry Point**

*File: `src/main.js`*

Wire everything together:
```javascript
import { Renderer } from './rendering/Renderer.js';
import { Terrain } from './rendering/Terrain.js';
import { World } from './core/World.js';
import { ControlPanel } from './ui/ControlPanel.js';

// Initialize
const renderer = new Renderer(document.getElementById('canvas-container'));
const terrain = new Terrain();
renderer.addMesh(terrain.mesh);

const world = new World(renderer);
const ui = new ControlPanel(world);

// Start simulation
world.start();
```

**Checkpoint**: You should see a green circular island with camera controls working.

---

### Phase 2: Entities and Movement

**2.1 - Base Entity Class**

*File: `src/core/Entity.js`*

```javascript
export class Entity {
  constructor(x, z) {
    this.id = generateId(); // Simple counter or random
    this.position = { x, y: 0, z }; // y=0 for ground level
    this.velocity = { x: 0, z: 0 };
    this.mesh = null; // Set by subclass
  }

  update(deltaTime, world) {
    // Base update: apply velocity to position
    this.position.x += this.velocity.x * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    // Keep on island (simple boundary check)
    const distFromCenter = Math.sqrt(this.position.x**2 + this.position.z**2);
    if (distFromCenter > 48) { // Island radius minus buffer
      // Bounce back or stop at edge
    }

    // Update mesh position
    if (this.mesh) {
      this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    }
  }

  destroy() {
    // Remove mesh from scene
  }
}
```

**2.2 - Food Entity**

*File: `src/entities/Food.js`*

```javascript
export class Food extends Entity {
  constructor(x, z) {
    super(x, z);
    this.nutrition = 30; // Energy provided
    this.isConsumed = false;
    this.respawnTimer = 0;
    this.respawnDelay = 20; // seconds

    // Visual: small green sphere
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x90ee90 })
    );
    this.mesh.position.set(x, 0.5, z);
  }

  consume() {
    this.isConsumed = true;
    this.mesh.visible = false;
  }

  update(deltaTime, world) {
    super.update(deltaTime, world);

    if (this.isConsumed) {
      this.respawnTimer += deltaTime;
      if (this.respawnTimer >= this.respawnDelay) {
        this.isConsumed = false;
        this.mesh.visible = true;
        this.respawnTimer = 0;
      }
    }
  }
}
```

**2.3 - Creature Entity**

*File: `src/entities/Creature.js`*

```javascript
import { SimpleBrain } from '../behaviors/SimpleBrain.js';

export class Creature extends Entity {
  constructor(x, z, species = 'herbivore') {
    super(x, z);
    this.species = species;
    this.energy = 100;
    this.maxEnergy = 100;
    this.speed = 5; // units per second
    this.perceptionRadius = 15;
    this.state = 'wandering';
    this.age = 0;

    this.brain = new SimpleBrain(this);

    // Visual: colored cube (blue for herbivore)
    const color = species === 'herbivore' ? 0x4169e1 : 0xe14141;
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color })
    );
    this.mesh.position.set(x, 0.5, z);
  }

  update(deltaTime, world) {
    // Age and energy decay
    this.age += deltaTime;
    this.energy -= 2 * deltaTime; // Lose 2 energy per second

    // Die if out of energy
    if (this.energy <= 0) {
      this.isDead = true;
      return;
    }

    // Run AI brain
    this.brain.think(world);

    // Apply velocity from brain decisions
    super.update(deltaTime, world);

    // Update visual based on energy (size or color)
    const scale = 0.5 + (this.energy / this.maxEnergy) * 0.5;
    this.mesh.scale.set(scale, scale, scale);
  }

  eat(food) {
    this.energy = Math.min(this.maxEnergy, this.energy + food.nutrition);
    food.consume();
  }
}
```

**Checkpoint**: You should be able to spawn a creature and food, see them appear on the island.

---

### Phase 3: Behavior and AI

**3.1 - Simple Brain**

*File: `src/behaviors/SimpleBrain.js`*

State machine with three states:
1. **Wander**: Random movement when energy is okay
2. **Seek Food**: Move toward nearest food when hungry
3. **Eat**: Consume food when close enough

```javascript
export class SimpleBrain {
  constructor(creature) {
    this.creature = creature;
    this.wanderTimer = 0;
    this.wanderDirection = this.randomDirection();
  }

  think(world) {
    const c = this.creature;

    // State transitions
    if (c.energy < 40) {
      c.state = 'seeking_food';
    } else if (c.energy > 70) {
      c.state = 'wandering';
    }

    // Execute state behavior
    switch (c.state) {
      case 'wandering':
        this.wander();
        break;
      case 'seeking_food':
        this.seekFood(world);
        break;
      case 'eating':
        this.eat(world);
        break;
    }
  }

  wander() {
    // Change direction every 3-5 seconds
    this.wanderTimer += deltaTime;
    if (this.wanderTimer > 3) {
      this.wanderDirection = this.randomDirection();
      this.wanderTimer = 0;
    }

    // Set velocity in wander direction
    this.creature.velocity.x = this.wanderDirection.x * this.creature.speed;
    this.creature.velocity.z = this.wanderDirection.z * this.creature.speed;
  }

  seekFood(world) {
    // Find nearest food within perception radius
    const nearestFood = this.findNearestFood(world);

    if (nearestFood) {
      const distance = this.distanceTo(nearestFood);

      if (distance < 1.5) {
        // Close enough to eat
        this.creature.eat(nearestFood);
        this.creature.state = 'wandering';
      } else {
        // Move toward food
        const direction = this.directionTo(nearestFood);
        this.creature.velocity.x = direction.x * this.creature.speed * 1.5; // Move faster when hungry
        this.creature.velocity.z = direction.z * this.creature.speed * 1.5;
      }
    } else {
      // No food nearby, wander
      this.wander();
    }
  }

  findNearestFood(world) {
    let nearest = null;
    let minDist = Infinity;

    for (const food of world.foodEntities) {
      if (food.isConsumed) continue;

      const dist = this.distanceTo(food);
      if (dist < this.creature.perceptionRadius && dist < minDist) {
        minDist = dist;
        nearest = food;
      }
    }

    return nearest;
  }

  distanceTo(entity) {
    const dx = entity.position.x - this.creature.position.x;
    const dz = entity.position.z - this.creature.position.z;
    return Math.sqrt(dx*dx + dz*dz);
  }

  directionTo(entity) {
    const dx = entity.position.x - this.creature.position.x;
    const dz = entity.position.z - this.creature.position.z;
    const length = Math.sqrt(dx*dx + dz*dz);
    return { x: dx/length, z: dz/length };
  }

  randomDirection() {
    const angle = Math.random() * Math.PI * 2;
    return { x: Math.cos(angle), z: Math.sin(angle) };
  }
}
```

**Checkpoint**: Creatures should wander randomly, then seek and eat food when hungry.

---

### Phase 4: World Management

**4.1 - World Class**

*File: `src/core/World.js`*

Manages all entities and simulation loop:

```javascript
export class World {
  constructor(renderer) {
    this.renderer = renderer;
    this.creatures = [];
    this.foodEntities = [];
    this.time = 0;
    this.isPaused = false;
    this.lastTimestamp = 0;
  }

  start() {
    // Spawn initial entities
    this.spawnInitialFood(20); // 20 food sources scattered
    this.spawnCreature(0, 0); // One creature at center

    // Start update loop
    this.lastTimestamp = performance.now();
    this.update();
  }

  update(timestamp = performance.now()) {
    if (!this.isPaused) {
      const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
      this.lastTimestamp = timestamp;

      // Update all creatures
      for (let i = this.creatures.length - 1; i >= 0; i--) {
        const creature = this.creatures[i];
        creature.update(deltaTime, this);

        // Remove dead creatures
        if (creature.isDead) {
          this.removeCreature(creature);
        }
      }

      // Update all food
      for (const food of this.foodEntities) {
        food.update(deltaTime, this);
      }

      this.time += deltaTime;
    }

    requestAnimationFrame((t) => this.update(t));
  }

  spawnCreature(x, z, species = 'herbivore') {
    const creature = new Creature(x, z, species);
    this.creatures.push(creature);
    this.renderer.addMesh(creature.mesh);
    return creature;
  }

  spawnFood(x, z) {
    const food = new Food(x, z);
    this.foodEntities.push(food);
    this.renderer.addMesh(food.mesh);
    return food;
  }

  spawnInitialFood(count) {
    for (let i = 0; i < count; i++) {
      // Random position on island
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 40; // Keep away from edge
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      this.spawnFood(x, z);
    }
  }

  removeCreature(creature) {
    const index = this.creatures.indexOf(creature);
    if (index > -1) {
      this.creatures.splice(index, 1);
      this.renderer.removeMesh(creature.mesh);
    }
  }

  getStats() {
    return {
      population: this.creatures.length,
      foodCount: this.foodEntities.filter(f => !f.isConsumed).length,
      simulationTime: Math.floor(this.time)
    };
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTimestamp = performance.now(); // Reset to avoid time jump
    }
  }
}
```

**Checkpoint**: Multiple creatures and food sources should coexist, creatures seeking food when hungry.

---

### Phase 5: User Interface

**5.1 - Control Panel**

*File: `src/ui/ControlPanel.js`*

Create a simple overlay panel in HTML:

```javascript
export class ControlPanel {
  constructor(world) {
    this.world = world;
    this.createPanel();
    this.startStatsUpdate();
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'control-panel';
    panel.innerHTML = `
      <h3>Island Control</h3>

      <div class="stats">
        <div class="stat-item">
          <span class="label">Population:</span>
          <span id="stat-population">0</span>
        </div>
        <div class="stat-item">
          <span class="label">Food Available:</span>
          <span id="stat-food">0</span>
        </div>
        <div class="stat-item">
          <span class="label">Time:</span>
          <span id="stat-time">0s</span>
        </div>
      </div>

      <div class="controls">
        <button id="btn-spawn-creature">Spawn Creature</button>
        <button id="btn-spawn-food">Spawn Food</button>
        <button id="btn-pause">Pause</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('btn-spawn-creature').addEventListener('click', () => {
      this.world.spawnCreature(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
    });

    document.getElementById('btn-spawn-food').addEventListener('click', () => {
      this.world.spawnFood(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      this.world.togglePause();
      document.getElementById('btn-pause').textContent =
        this.world.isPaused ? 'Resume' : 'Pause';
    });
  }

  startStatsUpdate() {
    setInterval(() => {
      const stats = this.world.getStats();
      document.getElementById('stat-population').textContent = stats.population;
      document.getElementById('stat-food').textContent = stats.foodCount;
      document.getElementById('stat-time').textContent = stats.simulationTime + 's';
    }, 100); // Update 10 times per second
  }
}
```

**5.2 - UI Styling**

*File: `styles/ui.css`*

```css
#control-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 250px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

#control-panel h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  border-bottom: 2px solid #4a7c59;
  padding-bottom: 5px;
}

.stats {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  color: #aaa;
}

.controls button {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  background: #4a7c59;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.controls button:hover {
  background: #5a8c69;
}

.controls button:active {
  background: #3a6c49;
}
```

Link this in your `index.html`:
```html
<link rel="stylesheet" href="styles/ui.css">
```

**Checkpoint**: UI panel appears with live stats and working spawn/pause buttons.

---

### Phase 6: Polish and Tweaks

**6.1 - Visual Enhancements**

Add small touches:
- **Rotation**: Creatures face their movement direction
  ```javascript
  // In Creature.update()
  const angle = Math.atan2(this.velocity.z, this.velocity.x);
  this.mesh.rotation.y = angle;
  ```

- **Shadows**: Enable in renderer for depth
  ```javascript
  renderer.shadowMap.enabled = true;
  directionalLight.castShadow = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  ```

- **FPS Counter**: Show in UI (you already have one)

**6.2 - Boundary Handling**

Improve island edge behavior:
```javascript
// In Entity.update()
const distFromCenter = Math.sqrt(this.position.x**2 + this.position.z**2);
const islandRadius = 48;

if (distFromCenter > islandRadius) {
  // Push back toward center
  const angle = Math.atan2(this.position.z, this.position.x);
  this.position.x = Math.cos(angle) * islandRadius;
  this.position.z = Math.sin(angle) * islandRadius;

  // Reflect velocity (bounce)
  const normal = { x: -Math.cos(angle), z: -Math.sin(angle) };
  const dot = this.velocity.x * normal.x + this.velocity.z * normal.z;
  this.velocity.x -= 2 * dot * normal.x;
  this.velocity.z -= 2 * dot * normal.z;
}
```

**6.3 - Reproduction (Optional but Fun)**

Add simple reproduction when creatures are healthy:
```javascript
// In Creature.update()
if (this.energy > 80 && this.age > 10) {
  // Chance to reproduce
  if (Math.random() < 0.01) { // 1% per frame when conditions met
    this.reproduce(world);
    this.energy -= 40; // Cost to reproduce
  }
}

reproduce(world) {
  const offsetX = (Math.random() - 0.5) * 3;
  const offsetZ = (Math.random() - 0.5) * 3;
  world.spawnCreature(
    this.position.x + offsetX,
    this.position.z + offsetZ,
    this.species
  );
}
```

---

## Testing the MVP

### Success Criteria
1. ✅ Island visible with camera controls working
2. ✅ Creatures spawn and wander around
3. ✅ Creatures seek food when hungry
4. ✅ Energy decreases over time, creatures die when starved
5. ✅ Food respawns after being eaten
6. ✅ UI shows accurate stats
7. ✅ Spawn buttons create new entities
8. ✅ Pause button works

### Expected Emergent Behavior
- Creatures cluster around food sources
- Population stabilizes based on food availability
- If too many creatures, some starve (population crash)
- If too much food, population grows (population boom)

### Tuning Knobs (Adjust these for fun dynamics)
- Energy decay rate (creatures die faster/slower)
- Food nutrition value (how much energy per food)
- Food respawn time (scarcity)
- Creature perception radius (how easily they find food)
- Reproduction threshold and cost

---

## Update index.html

Add to importmap:
```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
```

Update main script tag:
```html
<script type="module" src="src/main.js"></script>
```

---

## Implementation Order (Step-by-Step)

1. **Day 1**: Renderer + Terrain + Camera controls
2. **Day 2**: Entity base class + Food entity (spawn and render)
3. **Day 3**: Creature entity + wandering behavior
4. **Day 4**: Seeking behavior + eating mechanics
5. **Day 5**: World class + update loop integration
6. **Day 6**: UI panel + stats + spawn buttons
7. **Day 7**: Polish, reproduction, tuning

---

## Future Expansion Ideas (Not for MVP)

Once MVP is working, consider:
- **Server integration**: Save/load simulation state
- **Multiple species**: Predator creatures that hunt herbivores
- **Terrain variation**: Height map for hills/valleys
- **More complex behaviors**: Pack hunting, fleeing, mating dances
- **Genetics**: Creatures pass traits to offspring
- **Visual improvements**: Better models, animations, particle effects
- **Sound**: Ambient nature sounds, creature noises

---

## Common Pitfalls to Avoid

1. **Don't over-engineer**: Keep classes simple, no fancy patterns yet
2. **Hard-code values initially**: Magic numbers are fine for MVP, extract to config later
3. **Fixed timestep not critical yet**: Variable deltaTime is fine for now
4. **Skip optimization**: Don't worry about performance until you have 100+ entities
5. **Visual > Simulation**: Get something rendering before perfecting AI logic
6. **One feature at a time**: Don't add reproduction until eating works perfectly

---

## Estimated Effort

- **Experienced dev**: 6-10 hours
- **Learning as you go**: 15-20 hours
- **Complete beginner**: 25-30 hours

The key is to build incrementally and test at each checkpoint. Don't move to the next phase until the current one works.

---

## Final Notes

This MVP is intentionally minimal. The goal is to create a foundation that:
- **Works end-to-end** (you can show it to someone)
- **Demonstrates the core concept** (creatures with emergent behavior)
- **Is extensible** (easy to add features later)

Build this first, get it working, play with it, then decide what to add next. A simple thing that works is infinitely more valuable than a complex thing that's 80% done.

Good luck! 🏝️
