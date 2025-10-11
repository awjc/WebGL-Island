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
│   └── src/
│       ├── main.js           # Entry point and animation loop
│       ├── renderer.js       # Three.js renderer and scene setup
│       ├── core/
│       │   ├── Entity.js     # Base entity class
│       │   └── World.js      # Simulation manager
│       ├── entities/
│       │   ├── Creature.js   # Living creatures
│       │   └── Food.js       # Food resources
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
