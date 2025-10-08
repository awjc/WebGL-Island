import { Renderer } from './renderer.js';

let renderer;
let fpsCounter;
let lastTime = performance.now();
let frames = 0;

function init() {
    const canvas = document.getElementById('glCanvas');
    fpsCounter = document.getElementById('fps-counter');

    try {
        renderer = new Renderer(canvas);
        animate();
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

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

function animate() {
    updateFPS();
    renderer.render();
    requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', init);
