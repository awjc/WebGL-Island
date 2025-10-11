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
│   └── src/
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

### Recent Enhancements
- ✅ **Visual hunger feedback**: Creatures change color from blue (healthy) to red (hungry)
- ✅ **Color-coded states**: Bright red when actively seeking food, blue/orange when wandering
- ✅ **Balanced food consumption**: Creatures need multiple food items to become satisfied
- ✅ **Dynamic starting conditions**: Creatures spawn with randomized hunger levels (50-70%)
- ✅ **Improved food distribution**: Even grid-based placement with natural jitter
- ✅ **Scalable population**: 5 creatures and 40 food items by default

### Interactive Controls
- ✅ **Control panel UI**: Real-time simulation controls in upper left corner
- ✅ **Food slider**: Adjust food count (10-100)
- ✅ **Creature slider**: Adjust creature count (1-20)
- ✅ **Reset simulation**: Restart with custom parameters instantly
- ✅ **Live value updates**: Slider values display in real-time

## How to Use

1. **Camera Controls**:
   - Left click + drag: Rotate view around island
   - Right click + drag: Pan camera
   - Scroll wheel: Zoom in/out

2. **Simulation Controls**:
   - Use the control panel (upper left) to adjust population settings
   - Drag sliders to set desired food and creature counts
   - Click "Reset Simulation" to apply changes

3. **Visual Indicators**:
   - **Blue creatures**: Healthy and wandering
   - **Red creatures**: Hungry and seeking food
   - **Green spheres**: Available food
   - **Smaller creatures**: Lower energy (shrink as they starve)

## Next Steps

See [MVP_PLAN.md](MVP_PLAN.md) for the full implementation roadmap. Potential future additions:
- **Population statistics**: Live counters for creatures, food, deaths
- **Reproduction system**: Creatures spawn offspring when well-fed
- **Multiple species**: Predator/prey dynamics
- **Pause/speed controls**: Fine-tune simulation playback
