import { Renderer } from './renderer.js';
import { Terrain } from './rendering/Terrain.js';
import { World } from './core/World.js';
import { ControlPanel } from './ui/ControlPanel.js';

let renderer;
let terrain;
let world;
let controlPanel;
let fpsCounter;
let lastTime = performance.now();
let frames = 0;

/**
 * Initialize the application
 */
function init() {
    alert('DEBUG: init() called');
    const canvas = document.getElementById('glCanvas');
    fpsCounter = document.getElementById('fps-counter');

    try {
        alert('DEBUG: creating Renderer...');
        renderer = new Renderer(canvas);

        alert('DEBUG: creating Terrain...');
        terrain = new Terrain();
        renderer.addMesh(terrain.mesh);

        alert('DEBUG: creating World...');
        world = new World(renderer, terrain);
        world.start();

        alert('DEBUG: creating ControlPanel...');
        controlPanel = new ControlPanel(world);

        // Set up extinction overlay restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                controlPanel.resetSimulation();
            });
        }

        alert('DEBUG: starting animation loop...');
        animate();
    } catch (error) {
        alert('ERROR in init(): ' + error.message + '\n' + error.stack?.slice(0, 200));
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
