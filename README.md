# WebGL Island

A blank Three.js starter template with basic WebGL setup.

## Project Structure

```
.
├── index.html       # Main HTML entry point (GitHub Pages compatible)
├── client/          # Client-side WebGL application
│   ├── styles.css   # Basic styling
│   └── src/
│       ├── renderer.js  # Three.js renderer and scene setup
│       └── main.js      # Entry point and animation loop
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

## Requirements

- Python 3.x
- Modern web browser with WebGL support

## Technologies

- [Three.js](https://threejs.org/) - 3D graphics library
- WebGL - Hardware-accelerated graphics
- Vanilla JavaScript (ES6 modules)
