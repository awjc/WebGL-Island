import { Renderer } from './renderer.js';
import { Terrain } from './rendering/Terrain.js';
import { Tree } from './rendering/Tree.js';

let renderer;
let terrain;
let trees = [];
let fpsCounter;
let lastTime = performance.now();
let frames = 0;

/**
 * Initialize the application
 */
function init() {
    const canvas = document.getElementById('glCanvas');
    fpsCounter = document.getElementById('fps-counter');

    try {
        // Initialize renderer
        renderer = new Renderer(canvas);

        // Create and add terrain (island)
        terrain = new Terrain();
        renderer.addMesh(terrain.mesh);

        // Create and add decorative trees
        trees = Tree.createForest(15); // 15 trees scattered on island
        trees.forEach(tree => {
            renderer.addMesh(tree.mesh);
        });

        console.log('Island ecosystem initialized successfully');
        console.log(`Added ${trees.length} trees to the island`);

        // Start animation loop
        animate();
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

/**
 * Update FPS counter
 */
function updateFPS() {
    frames++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    // Update FPS display every second
    if (deltaTime >= 1000) {
        const fps = Math.round((frames * 1000) / deltaTime);
        fpsCounter.textContent = `${fps} FPS`;
        frames = 0;
        lastTime = currentTime;
    }
}

/**
 * Main animation loop
 */
function animate() {
    updateFPS();
    renderer.render();
    requestAnimationFrame(animate);
}

// Start when DOM is ready
window.addEventListener('DOMContentLoaded', init);
