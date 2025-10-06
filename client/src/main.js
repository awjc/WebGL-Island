import { Renderer } from './renderer.js';

let renderer;

function init() {
    const canvas = document.getElementById('glCanvas');

    try {
        renderer = new Renderer(canvas);
        setupControls();
        animate();
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

function setupControls() {
    // Metalness control
    const metalnessSlider = document.getElementById('metalness');
    const metalnessValue = document.getElementById('metalnessValue');
    metalnessSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        metalnessValue.textContent = value.toFixed(2);
        renderer.setMetalness(value);
    });

    // Roughness control
    const roughnessSlider = document.getElementById('roughness');
    const roughnessValue = document.getElementById('roughnessValue');
    roughnessSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        roughnessValue.textContent = value.toFixed(2);
        renderer.setRoughness(value);
    });

    // Rotation speed control
    const rotationSpeedSlider = document.getElementById('rotationSpeed');
    const rotationSpeedValue = document.getElementById('rotationSpeedValue');
    rotationSpeedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        rotationSpeedValue.textContent = value.toFixed(1);
        renderer.setRotationSpeed(value);
    });

    // Light intensity control
    const lightIntensitySlider = document.getElementById('lightIntensity');
    const lightIntensityValue = document.getElementById('lightIntensityValue');
    lightIntensitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        lightIntensityValue.textContent = value.toFixed(1);
        renderer.setLightIntensity(value);
    });
}

function animate() {
    renderer.render();
    requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', init);
