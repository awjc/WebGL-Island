# WebGL Island

An island ecosystem simulation with creatures that live, eat, and evolve.

## Project Structure

```
.
├── index.html       # Main HTML entry point (GitHub Pages compatible)
├── client/          # Client-side WebGL application
│   ├── styles.css   # Basic styling
│   ├── ITERATION_1.md   # Island and camera controls
│   ├── ITERATION_2.md   # Entities and movement
│   ├── ITERATION_3.md   # AI behavior and food seeking
│   └── src/
│       ├── main.js           # Entry point and animation loop
│       ├── renderer.js       # Three.js renderer and scene setup
│       ├── core/
│       │   ├── Entity.js     # Base entity class
│       │   └── World.js      # Simulation manager
│       ├── entities/
│       │   ├── Creature.js   # Living creatures with AI
│       │   └── Food.js       # Food resources
│       ├── behaviors/
│       │   └── SimpleBrain.js  # AI state machine for creatures
│       └── rendering/
│           ├── Terrain.js    # Island terrain geometry
│           └── Tree.js       # Decorative trees
├── server/          # Development server
│   └── server.py
├── PROJECT_PLAN.md  # Full architectural vision
└── MVP_PLAN.md      # Minimal viable product implementation plan
```

## Running the Application

### GitHub Pages (Live Demo)
Simply visit the GitHub Pages URL once deployed - the app runs entirely in the browser.

### Local Development

1. Start the server:
   ```bash
   cd server
   python3 server.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Requirements

- Python 3.x
- Modern web browser with WebGL support

## Technologies

- [Three.js](https://threejs.org/) - 3D graphics library
- WebGL - Hardware-accelerated graphics
- Vanilla JavaScript (ES6 modules)

## Current Features

### Iteration 1: Island and Camera
- ✅ 3D circular island with terrain
- ✅ Decorative trees scattered on island
- ✅ Interactive camera controls (orbit, pan, zoom)
- ✅ Lighting and shadows
- ✅ FPS counter

### Iteration 2: Entities and Movement
- ✅ Base entity system with physics
- ✅ Food entities that respawn after being consumed
- ✅ Creature entities with energy system
- ✅ Basic movement and boundary checking
- ✅ World simulation manager

### Iteration 3: AI and Behavior
- ✅ AI brain with state machine (wandering/seeking)
- ✅ Perception system (creatures can "see" food)
- ✅ Food seeking behavior when hungry
- ✅ Eating mechanics for survival
- ✅ Creatures can live indefinitely with food
- ✅ Emergent clustering around food sources

## Next Steps

See [MVP_PLAN.md](MVP_PLAN.md) for the full implementation roadmap. Upcoming iterations:
- **Iteration 4**: UI control panel with spawn buttons
- **Iteration 5**: Population statistics display
- **Iteration 6**: Pause/resume and simulation controls
