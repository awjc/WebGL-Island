let renderer;

async function init() {
    const canvas = document.getElementById('glCanvas');

    try {
        // Load shaders first
        await loadShaders();

        // Initialize renderer with loaded shaders
        renderer = new Renderer(canvas);
        animate();
    } catch (error) {
        console.error('Failed to initialize WebGL:', error);
    }
}

function animate() {
    renderer.render();
    requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', init);
