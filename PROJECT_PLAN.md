# Island Ecosystem Simulation - Project Plan

## Overview

A persistent, server-authoritative island ecosystem simulation where creatures live and interact in a shared world. The simulation runs continuously on a server, with thin clients (browser, mobile, VR) connecting to observe and interact with the living world. The system supports state persistence, sharing, and checkpoint-based time travel.

## Core Philosophy

- **Server Authority**: All simulation logic runs on the server; clients are purely presentational
- **Persistence First**: The world continues to exist and evolve independent of observers
- **Deterministic Simulation**: Given the same initial state and random seed, simulation produces identical results
- **Scalability**: Architecture supports horizontal scaling for larger worlds and more concurrent clients
- **Developer Experience**: Rich tooling for debugging, experimentation, and creative iteration

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Browser  │  │  Mobile  │  │    VR    │  │  Tools  ││
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘│
└────────┼────────────┼─────────────┼──────────────┼─────┘
         │            │             │              │
         └────────────┴─────────────┴──────────────┘
                           │
                    [WebSocket/WebRTC]
                           │
┌──────────────────────────┼──────────────────────────────┐
│                    CONNECTION LAYER                      │
│              ┌───────────────────────┐                   │
│              │  Gateway/Load Balancer │                  │
│              └───────────┬───────────┘                   │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│                   SIMULATION LAYER                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Simulation Server(s)                     │   │
│  │  ┌──────────────┐  ┌────────────────────────┐   │   │
│  │  │ ECS Engine   │  │  Spatial Partitioning  │   │   │
│  │  ├──────────────┤  ├────────────────────────┤   │   │
│  │  │ Physics      │  │  Behavior Trees/AI     │   │   │
│  │  ├──────────────┤  ├────────────────────────┤   │   │
│  │  │ Ecosystem    │  │  Event System          │   │   │
│  │  └──────────────┘  └────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│                   PERSISTENCE LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   State DB   │  │  Checkpoint  │  │   Metrics    │  │
│  │   (Redis)    │  │  Storage     │  │  (InfluxDB)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Core Systems

### 1. Entity-Component-System (ECS) Architecture

**Entities**: Unique identifiers for all objects (creatures, plants, terrain features)

**Components**: Pure data containers
- `Transform`: position, rotation, scale
- `Creature`: species, age, health, energy, hunger
- `Movement`: velocity, acceleration, max_speed
- `Brain`: behavior tree reference, decision state
- `Renderable`: model_id, texture, animations
- `Collider`: shape, size, collision layers
- `Genetics`: DNA string, traits, mutations
- `Inventory`: held items, resources
- `Social`: relationships, pack affiliation
- `Reproduction`: fertility, gestation state

**Systems**: Logic processors that operate on components
- `MovementSystem`: Updates positions based on velocity/steering
- `BehaviorSystem`: Executes AI decision trees
- `PhysicsSystem`: Collision detection and resolution
- `EcosystemSystem`: Food chains, resource consumption
- `ReproductionSystem`: Mating, birth, death cycles
- `GeneticsSystem`: Trait inheritance, mutations
- `TerrainSystem`: Dynamic terrain modification
- `WeatherSystem`: Environmental effects

### 2. Simulation Loop

```javascript
class SimulationServer {
  constructor(tickRate = 20) { // 20 ticks per second
    this.tickRate = tickRate;
    this.deltaTime = 1000 / tickRate;
    this.simulationTime = 0;
    this.fixedTimeStep = true; // For determinism
  }

  async run() {
    while (this.running) {
      const startTime = performance.now();

      // 1. Process input from clients (interactions, spawns)
      this.processClientCommands();

      // 2. Run simulation systems in order
      this.behaviorSystem.update(this.deltaTime);
      this.movementSystem.update(this.deltaTime);
      this.physicsSystem.update(this.deltaTime);
      this.ecosystemSystem.update(this.deltaTime);
      this.reproductionSystem.update(this.deltaTime);
      this.weatherSystem.update(this.deltaTime);

      // 3. Spatial partitioning update
      this.spatialHash.rebuild();

      // 4. Generate state updates for clients
      this.generateClientUpdates();

      // 5. Checkpoint if needed
      if (this.shouldCheckpoint()) {
        await this.createCheckpoint();
      }

      this.simulationTime += this.deltaTime;

      // 6. Sleep to maintain tick rate
      const elapsed = performance.now() - startTime;
      await sleep(Math.max(0, this.deltaTime - elapsed));
    }
  }
}
```

### 3. State Serialization & Checkpointing

**Snapshot Format** (JSON-based, could migrate to binary):
```json
{
  "version": "1.0.0",
  "timestamp": 1234567890,
  "simulation_time": 1000000,
  "random_seed": 42,
  "world": {
    "terrain": { /* heightmap, biome data */ },
    "weather": { /* current weather state */ },
    "resources": { /* resource pools */ }
  },
  "entities": [
    {
      "id": "creature_001",
      "components": {
        "Transform": { "x": 10, "y": 5, "z": 20 },
        "Creature": { "species": "herbivore_a", "health": 100 },
        "Genetics": { "dna": "ACTG..." }
      }
    }
  ],
  "metadata": {
    "entity_count": 150,
    "species_distribution": {},
    "population_stats": {}
  }
}
```

**Checkpoint Strategy**:
- **Auto-checkpoints**: Every N minutes or M simulation ticks
- **Named checkpoints**: User-created savepoints with descriptions
- **Incremental saves**: Delta compression against previous checkpoint
- **Cloud storage**: S3/B2 compatible for sharing
- **Version control**: Git-like branching for alternate timelines

### 4. Client-Server Communication

**Protocol**: WebSocket with binary message packing (MessagePack/Protobuf)

**Message Types**:

*Server → Client*:
- `STATE_SNAPSHOT`: Full world state (initial connection)
- `ENTITY_UPDATE`: Position/component updates (10-20Hz)
- `ENTITY_SPAWN`: New entity created
- `ENTITY_DESPAWN`: Entity removed
- `EVENT_BROADCAST`: Significant events (birth, death, etc)
- `SYNC_CORRECTION`: Time sync adjustment

*Client → Server*:
- `CLIENT_COMMAND`: User interaction (spawn, move camera)
- `SUBSCRIPTION`: Request updates for spatial region
- `HEARTBEAT`: Connection keepalive

**Update Optimization**:
- **Spatial subscriptions**: Clients only receive updates for entities in their view frustum
- **Priority queuing**: Important updates sent first
- **Delta encoding**: Only send changed components
- **Update frequency tiers**: Fast entities (moving) update more often than static
- **Interest management**: Entities near clients update more frequently

### 5. Spatial Partitioning

**Grid-based spatial hash** for efficient queries:
```javascript
class SpatialHash {
  constructor(cellSize = 10) {
    this.cellSize = cellSize;
    this.grid = new Map(); // Map<cellKey, Set<entityId>>
  }

  query(x, y, z, radius) {
    // Returns entities in radius quickly
  }

  nearestNeighbors(x, y, z, count) {
    // Returns N closest entities
  }
}
```

Use cases:
- Collision detection (only check entities in same/adjacent cells)
- Behavior queries ("find nearest food", "avoid predators")
- Client interest management (which entities to send to which client)

### 6. AI & Behavior

**Hierarchical Behavior Trees** for creature AI:

```javascript
// Example: Herbivore behavior tree
{
  type: "Selector", // Try children until one succeeds
  children: [
    {
      type: "Sequence", // All must succeed
      name: "FleeFromDanger",
      children: [
        { type: "Condition", check: "isPredatorNearby" },
        { type: "Action", execute: "fleeFromPredator" }
      ]
    },
    {
      type: "Sequence",
      name: "SeekFood",
      children: [
        { type: "Condition", check: "isHungry" },
        { type: "Action", execute: "findAndEatNearestPlant" }
      ]
    },
    {
      type: "Sequence",
      name: "Reproduce",
      children: [
        { type: "Condition", check: "isFertile" },
        { type: "Action", execute: "seekMate" }
      ]
    },
    {
      type: "Action", name: "Wander", execute: "randomWalk" }
  ]
}
```

**Behavior Tree Library**:
- Reusable nodes for common behaviors
- Visual editor for designing behaviors (dev tool)
- Hot-reload capability for iteration

### 7. Genetics & Evolution System

**DNA Representation**:
```javascript
class Genetics {
  constructor(dna = null) {
    this.dna = dna || this.generateRandomDNA();
    this.traits = this.expressTraits();
  }

  generateRandomDNA() {
    // Generate random gene sequence
    return Array(100).fill(0).map(() =>
      Math.floor(Math.random() * 4) // 0-3 representing A,C,T,G
    );
  }

  expressTraits() {
    // Map DNA to phenotype traits
    return {
      speed: this.decodeGene(0, 10),
      size: this.decodeGene(10, 20),
      color: this.decodeGene(20, 30),
      aggression: this.decodeGene(30, 40),
      intelligence: this.decodeGene(40, 50),
      // ... more traits
    };
  }

  crossover(otherDNA, mutationRate = 0.01) {
    // Sexual reproduction with mutation
    const childDNA = [];
    for (let i = 0; i < this.dna.length; i++) {
      // Random gene from parent
      const gene = Math.random() < 0.5 ? this.dna[i] : otherDNA[i];
      // Mutation chance
      childDNA.push(
        Math.random() < mutationRate
          ? Math.floor(Math.random() * 4)
          : gene
      );
    }
    return new Genetics(childDNA);
  }
}
```

### 8. Ecosystem Dynamics

**Resource Management**:
- Plants grow and spread based on soil fertility, water, sunlight
- Herbivores consume plants
- Carnivores hunt herbivores
- Decomposition returns nutrients to soil
- Dynamic equilibrium emergent from simple rules

**Environmental Factors**:
- Day/night cycle affects behavior and visibility
- Weather patterns (rain increases plant growth)
- Seasons (if desired)
- Natural disasters (fire, flood) for drama

---

## Scalability Architecture

### Horizontal Scaling Strategies

1. **World Sharding**: Divide island into regions, each simulated by different server
   - Seamless handoff when creatures cross boundaries
   - Share state via Redis/message queue

2. **System Distribution**: Different servers handle different systems
   - Server A: Movement + Physics
   - Server B: Behavior + AI
   - Server C: Ecosystem + Genetics
   - Communicate via event bus

3. **Load Balancing**:
   - Gateway distributes client connections
   - Health checks and automatic failover
   - Sticky sessions for client consistency

### Performance Optimization

- **Octree/BVH** for 3D spatial queries
- **Entity pooling** to reduce GC pressure
- **Dirty flag optimization** for unchanged entities
- **Level of Detail (LOD)**: Reduce simulation fidelity for distant entities
- **Sleep system**: Entities far from all clients use simplified simulation
- **Web Workers/Worker Threads** for parallel system execution

---

## Developer Features & Tools

### 1. Web-Based Dev Console

**Live Simulation Control**:
- Pause/resume/step simulation
- Adjust time scale (slow-mo, fast-forward)
- Spawn entities at cursor
- Edit entity components in real-time
- Visualize behavior tree execution

**Debug Visualizations**:
- Show spatial hash grid
- Render AI perception radius
- Display pathfinding debug info
- Show collision shapes
- Visualize energy/health bars
- Family tree/relationship graphs

### 2. Metrics & Analytics

**Real-time Dashboards**:
- Population over time (per species)
- Birth/death rates
- Average lifespan
- Genetic diversity (trait distribution)
- Resource availability
- Server performance (tick rate, entity count)

**Data Export**:
- CSV export for external analysis
- Integration with Grafana/Prometheus
- API endpoints for custom tools

### 3. Modding System

**Plugin Architecture**:
```javascript
// Example mod
class CustomCreatureMod {
  register(simulation) {
    // Add new component type
    simulation.registerComponent('Wings', {
      wingSpan: 0,
      flightSpeed: 0
    });

    // Add new system
    simulation.registerSystem('FlightSystem', (dt) => {
      // Custom flight logic
    });

    // Add new creature type
    simulation.registerSpecies('bird', {
      components: ['Transform', 'Creature', 'Wings'],
      behavior: customBirdBehavior
    });
  }
}
```

**Mod Distribution**:
- NPM-style package manager for mods
- Version compatibility checking
- Hot-reload during development
- Sandboxed execution for safety

### 4. Visual Editors

**Terrain Editor**:
- Brush-based heightmap editing
- Biome painting
- Resource node placement

**Behavior Tree Editor**:
- Node-based visual programming
- Test behaviors on single entity
- Save/load behavior templates

**Genetics Editor**:
- Visualize DNA → trait mapping
- Breed creatures with specific traits
- Create "designer" species

### 5. Replay & Time Travel

**Timeline Scrubbing**:
- Load any checkpoint and resume from there
- Compare two timelines side-by-side
- Export simulation as video/timelapse

**Event Log**:
- Record all significant events
- Filter by entity, species, event type
- Click event to jump to that moment

---

## Technology Stack Recommendations

### Server (Node.js/TypeScript)
- **Runtime**: Node.js 20+ or Bun for performance
- **Language**: TypeScript for type safety
- **WebSocket**: `ws` or `uWebSockets.js` (faster)
- **Serialization**: `msgpack` or `protobuf.js`
- **State Management**: `Redis` for shared state, `DuckDB` for analytics
- **File Storage**: Local filesystem + S3 for cloud backups

### Client (Browser/Mobile/VR)
- **Renderer**: Three.js or Babylon.js (already using WebGL)
- **State Sync**: Custom interpolation system for smooth visuals
- **UI**: React/Vue for dev tools, simple HTML/CSS for game UI
- **Mobile**: React Native or Progressive Web App
- **VR**: WebXR API integration

### Infrastructure
- **Containerization**: Docker for consistent deployment
- **Orchestration**: Docker Compose (simple) or Kubernetes (complex)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + Elasticsearch/Loki

---

## Data Structures & Formats

### World State Schema
```typescript
interface WorldState {
  version: string;
  timestamp: number;
  simulationTime: number;
  randomSeed: number;

  terrain: {
    heightmap: Float32Array;
    biomeMap: Uint8Array;
    dimensions: { width: number; height: number };
  };

  entities: Map<EntityId, {
    components: Map<ComponentType, ComponentData>;
  }>;

  resources: {
    plantCoverage: number;
    waterLevel: number;
    nutrientPool: number;
  };

  weather: {
    temperature: number;
    rainfall: number;
    windSpeed: number;
  };
}
```

### Network Protocol
```typescript
// Efficient binary format
enum MessageType {
  STATE_SNAPSHOT = 0,
  ENTITY_UPDATE = 1,
  ENTITY_SPAWN = 2,
  ENTITY_DESPAWN = 3,
  // ...
}

interface EntityUpdateMessage {
  type: MessageType.ENTITY_UPDATE;
  tick: number;
  updates: Array<{
    entityId: EntityId;
    changedComponents: Map<ComponentType, Partial<ComponentData>>;
  }>;
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
- [ ] Basic ECS implementation
- [ ] Simple creature with movement
- [ ] Server-client WebSocket connection
- [ ] Manual state sync (no optimization)
- [ ] Basic terrain rendering

### Phase 2: Core Simulation (Weeks 4-6)
- [ ] Behavior tree system
- [ ] Basic AI (wander, seek food)
- [ ] Food chain (plants → herbivores → carnivores)
- [ ] Reproduction system
- [ ] Death and respawn

### Phase 3: Persistence (Weeks 7-8)
- [ ] State serialization
- [ ] Checkpoint save/load
- [ ] File-based storage
- [ ] Load checkpoint on server restart

### Phase 4: Genetics & Evolution (Weeks 9-10)
- [ ] DNA system
- [ ] Trait inheritance
- [ ] Mutation
- [ ] Natural selection emergent from ecosystem

### Phase 5: Optimization (Weeks 11-12)
- [ ] Spatial partitioning
- [ ] Delta encoding for network
- [ ] Client interest management
- [ ] Entity pooling and LOD

### Phase 6: Developer Tools (Weeks 13-14)
- [ ] Web-based dev console
- [ ] Debug visualizations
- [ ] Metrics dashboard
- [ ] Behavior tree editor

### Phase 7: Scalability (Weeks 15-16)
- [ ] World sharding support
- [ ] Load balancing
- [ ] Redis integration
- [ ] Multi-server deployment

### Phase 8: Advanced Features (Weeks 17+)
- [ ] Mod system
- [ ] Visual editors
- [ ] Timeline/replay system
- [ ] VR support
- [ ] Mobile client

---

## Interesting Feature Ideas

### 1. **Emergent Storytelling**
- Track "legendary" creatures (oldest, most offspring, etc)
- Generate narrative events ("The Great Migration of 2025")
- Achievement system for ecosystem milestones

### 2. **Player Interaction Modes**
- **God Mode**: Spawn creatures, modify terrain, control weather
- **Shepherd Mode**: Gentle guidance (food placement, threat removal)
- **Observer Mode**: Pure spectator, zero intervention
- **Scientist Mode**: Experiment with isolated populations

### 3. **Social Features**
- Share checkpoint files via URL
- Leaderboard for longest-running ecosystems
- Collaborative worlds (multiple admins)
- "Adopt" a creature and follow its lineage

### 4. **Educational Tools**
- Visualize evolution in real-time
- Export data for science projects
- Simplified controls for classroom use
- Pre-built scenarios (island colonization, invasive species, etc)

### 5. **Procedural Content**
- Evolve creature appearances based on genetics
- Procedural creature sounds
- Dynamic music based on ecosystem health

### 6. **Advanced Ecosystem**
- Disease spread mechanics
- Symbiotic relationships
- Pack hunting behavior
- Tool use evolution
- Simple communication between creatures

### 7. **Environmental Simulation**
- Erosion and terrain change
- Forest fires and regrowth
- Tidal effects on coastline
- Volcanic activity

### 8. **Performance Challenges**
- Optimize to support 10,000+ simultaneous entities
- 100+ concurrent spectators
- Run on low-power devices (Raspberry Pi server?)

---

## Security & Reliability Considerations

### Authentication & Authorization
- Token-based auth for client connections
- Role-based access (admin, editor, viewer)
- Rate limiting on client commands

### Data Integrity
- Checksum validation for state files
- Atomic checkpoint writes
- Backup rotation (keep last N checkpoints)
- Corruption detection and recovery

### Fault Tolerance
- Graceful degradation if systems fail
- Automatic checkpoint on crash
- Health monitoring and alerts
- Rollback to last good state

---

## Success Metrics

**Technical**:
- Maintain 20 TPS with 1000+ entities
- < 100ms network latency for updates
- Support 50+ concurrent clients
- Checkpoint save/load < 5 seconds

**Creative**:
- Ecosystem reaches stable equilibrium
- Observable evolution over time
- Emergent behaviors not explicitly programmed
- Replayability (different seeds → different outcomes)

**Developer Experience**:
- Modify behavior trees without server restart
- Add new creature type in < 1 hour
- Debug issues with visual tools
- Share interesting simulations easily

---

## Next Steps

1. **Set up project structure**: Server/Client folders, shared types
2. **Choose tech stack**: Finalize libraries and frameworks
3. **Implement minimal ECS**: Get one creature moving
4. **Establish WebSocket pipeline**: See creature move on client
5. **Iterate rapidly**: Add features, test, refine

The architecture is designed to support both quick experimentation and long-term scalability. Start simple, validate core concepts, then layer in complexity as needed.

---

## Appendix: File Structure Suggestion

```
island-ecosystem/
├── server/
│   ├── src/
│   │   ├── ecs/
│   │   │   ├── Entity.ts
│   │   │   ├── Component.ts
│   │   │   ├── System.ts
│   │   │   └── World.ts
│   │   ├── components/
│   │   │   ├── Transform.ts
│   │   │   ├── Creature.ts
│   │   │   └── ...
│   │   ├── systems/
│   │   │   ├── MovementSystem.ts
│   │   │   ├── BehaviorSystem.ts
│   │   │   └── ...
│   │   ├── ai/
│   │   │   ├── BehaviorTree.ts
│   │   │   └── behaviors/
│   │   ├── network/
│   │   │   ├── WebSocketServer.ts
│   │   │   ├── Protocol.ts
│   │   │   └── ClientManager.ts
│   │   ├── persistence/
│   │   │   ├── Checkpoint.ts
│   │   │   └── Storage.ts
│   │   ├── simulation/
│   │   │   └── SimulationServer.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── rendering/
│   │   │   ├── Scene.ts
│   │   │   ├── EntityRenderer.ts
│   │   │   └── TerrainRenderer.ts
│   │   ├── network/
│   │   │   ├── WebSocketClient.ts
│   │   │   └── StateSync.ts
│   │   ├── ui/
│   │   │   ├── HUD.ts
│   │   │   └── DevConsole.ts
│   │   └── index.ts
│   ├── index.html
│   └── package.json
│
├── shared/
│   ├── types/
│   │   ├── Components.ts
│   │   ├── Messages.ts
│   │   └── State.ts
│   └── utils/
│       └── Math.ts
│
├── tools/
│   ├── behavior-editor/
│   ├── terrain-editor/
│   └── analytics-dashboard/
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── MODDING.md
│
├── docker-compose.yml
├── README.md
└── PROJECT_PLAN.md (this file)
```

This structure supports:
- Shared type definitions between client/server
- Clear separation of concerns
- Easy testing and development
- Modular growth as features are added

Good luck building your island ecosystem! 🏝️
