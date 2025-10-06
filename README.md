# WebGL Island

A Three.js-based 3D visualization featuring an animated torus knot with interactive controls.

## Features

- **3D Torus Knot**: Procedurally textured spinning geometry with normal mapping
- **Dynamic Lighting**: Multi-light setup with animated point light
- **Interactive Controls**: Real-time sliders to adjust:
  - Material metalness and roughness
  - Rotation speed
  - Light intensity

## Project Structure

```
.
├── index.html       # Main HTML with control panel UI (GitHub Pages entry point)
├── client/          # Client-side WebGL application
│   ├── styles.css   # Styling including control panel
│   └── src/
│       ├── renderer.js  # Three.js renderer and scene setup
│       └── main.js      # Entry point and control handlers
└── server/          # Development server
    └── server.py
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

3. Use the control panel in the top-right corner to experiment with visualization parameters

## Requirements

- Python 3.x
- Modern web browser with WebGL support

## Technologies

- [Three.js](https://threejs.org/) - 3D graphics library
- WebGL - Hardware-accelerated graphics
- Vanilla JavaScript (ES6 modules)
