# WebGL Island

An island ecosystem simulation with creatures that live, eat, and evolve.

## Project Structure

```
.
├── index.html       # Main HTML entry point (GitHub Pages compatible)
├── client/          # Client-side WebGL application
│   ├── styles.css   # UI styling and control panel
│   ├── ITERATION_1.md   # Island and camera controls
│   ├── ITERATION_2.md   # Entities and movement
│   ├── ITERATION_3.md   # AI behavior and food seeking
│   ├── ITERATION_4.md   # Enhanced UI and statistics
│   └── src/
│       ├── config.js         # Centralized configuration (all sim parameters)
│       ├── main.js           # Entry point and animation loop
│       ├── renderer.js       # Three.js renderer and scene setup
│       ├── core/
│       │   ├── Entity.js     # Base entity class
│       │   └── World.js      # Simulation manager with reset
│       ├── entities/
│       │   ├── Creature.js   # Living creatures with AI and visual feedback
│       │   └── Food.js       # Food resources
│       ├── behaviors/
│       │   └── SimpleBrain.js  # AI state machine for creatures
│       ├── ui/
│       │   └── ControlPanel.js # Interactive control panel
│       ├── utils/
│       │   └── SoundManager.js # Procedural sound effects (Web Audio API)
│       └── rendering/
│           ├── Terrain.js    # Island terrain geometry
│           └── Tree.js       # Decorative trees
├── server/          # Development server
│   └── server.py
├── PROJECT_PLAN.md  # Full architectural vision
└── MVP_PLAN.md      # Minimal viable product implementation plan
```

## Configuration

All simulation parameters are centralized in [client/src/config.js](client/src/config.js). This includes:
- **Default populations**: Food count (80), creature count (12)
- **Creature behavior**: Energy levels, hunger thresholds, movement speeds
- **World settings**: Island size, boundaries
- **UI ranges**: Slider min/max values
- **Audio/visual settings**: Colors, sound parameters

To adjust the simulation, edit values in config.js and refresh the browser.

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
- ✅ **Visual hunger feedback**: Creatures change color from blue (healthy) to red (hungry)
- ✅ **Color-coded states**: Bright red when actively seeking food, blue/orange when wandering
- ✅ **Procedural sound effects**: Death sounds and eating chirps using Web Audio API
- ✅ **Balanced food consumption**: Creatures need multiple food items to become satisfied
- ✅ **Dynamic starting conditions**: Creatures spawn with randomized hunger levels (50-70%)
- ✅ **Improved food distribution**: Even grid-based placement with natural jitter
- ✅ **Centralized configuration**: All parameters in config.js for easy tweaking

### Iteration 4: Enhanced UI and Statistics
- ✅ **Live statistics display**: Real-time population, food count, and simulation time
- ✅ **Quick action buttons**: Spawn individual creatures or food items on demand
- ✅ **Pause/resume control**: Freeze simulation while maintaining camera controls
- ✅ **Organized control panel**: Logical sections for monitoring and interaction
- ✅ **Visual polish**: Hover effects, smooth animations, color-coded interface
- ✅ **Reset functionality**: Adjust population sliders and restart simulation

### Interactive Controls
- ✅ **Statistics section**: Monitor population, available food, and elapsed time (updates 10x/sec)
- ✅ **Spawn creature**: Add single creature at random location
- ✅ **Spawn food**: Add single food item at random location
- ✅ **Pause/resume**: Freeze/unfreeze simulation time
- ✅ **Food slider**: Adjust food count (10-100) for resets
- ✅ **Creature slider**: Adjust creature count (1-20) for resets
- ✅ **Reset simulation**: Restart with custom parameters

## How to Use

1. **Camera Controls**:
   - Left click + drag: Rotate view around island
   - Right click + drag: Pan camera
   - Scroll wheel: Zoom in/out

2. **Simulation Controls**:
   - Monitor live statistics in the control panel (upper left)
   - Use quick action buttons to spawn entities or pause the simulation
   - Adjust sliders and click "Reset Simulation" to restart with new parameters

3. **Visual Indicators**:
   - **Blue creatures**: Healthy and wandering
   - **Red creatures**: Hungry and seeking food
   - **Green spheres**: Available food
   - **Smaller creatures**: Lower energy (shrink as they starve)

## Next Steps

See [MVP_PLAN.md](MVP_PLAN.md) for the full implementation roadmap. Potential future additions:
- **Reproduction system**: Creatures spawn offspring when well-fed
- **Multiple species**: Predator/prey dynamics
- **Speed controls**: Slow-motion or fast-forward simulation
- **Population graphs**: Visual history of population over time
- **Advanced statistics**: Average lifespan, death counter, behavior metrics
