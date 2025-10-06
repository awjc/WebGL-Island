// Shader loader utility
async function loadShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader: ${url}`);
    }
    return response.text();
}

// Load shaders
let vertexShaderSource = null;
let fragmentShaderSource = null;

async function loadShaders() {
    [vertexShaderSource, fragmentShaderSource] = await Promise.all([
        loadShader('src/shaders/vertex.glsl'),
        loadShader('src/shaders/fragment.glsl')
    ]);
}
