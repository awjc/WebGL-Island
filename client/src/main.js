import { Renderer } from './renderer.js';

let renderer;

function init() {
    const canvas = document.getElementById('glCanvas');

    try {
        renderer = new Renderer(canvas);
        animate();
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

function animate() {
    renderer.render();
    requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', init);
