import * as THREE from 'three';

// Helper to convert any hex format to THREE.Color
function parseColor(hex) {
    // Strip alpha channel if present (8-digit hex)
    if (hex.startsWith('#') && hex.length === 9) {
        hex = hex.slice(0, 7);
    }
    return new THREE.Color(hex);
}

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;

        // Control parameters
        this.rotationSpeed = 1.0;

        // Create Three.js renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(parseColor('#1a1a1a'));

        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 3;

        // Setup lighting
        this.setupLighting();

        // Create spinner geometry
        this.setupSpinner();

        // Handle window resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(parseColor('#ffffff'), 0.3);
        this.scene.add(ambientLight);

        // Main directional light
        this.directionalLight = new THREE.DirectionalLight(parseColor('#4db8ff'), 4.5);
        this.directionalLight.position.set(5, 5, 5);
        this.scene.add(this.directionalLight);

        // Secondary point light for dynamic effect
        this.pointLight = new THREE.PointLight(parseColor('#ff6b35'), 1, 10);
        this.pointLight.position.set(-3, 2, 3);
        this.scene.add(this.pointLight);

        // Accent light
        const accentLight = new THREE.PointLight(parseColor('#9d4edd'), 0.8, 8);
        accentLight.position.set(0, -3, 2);
        this.scene.add(accentLight);
    }

    setupSpinner() {
        // Create a torus knot as the spinner
        const geometry = new THREE.TorusKnotGeometry(0.7, 0.2, 100, 16);

        // Create a normal map texture procedurally
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create a textured pattern
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 127 + 128;
                ctx.fillStyle = `rgb(${noise}, ${noise}, ${255})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        const normalMap = new THREE.CanvasTexture(canvas);
        normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(4, 4);

        const material = new THREE.MeshStandardMaterial({
            color: parseColor('#0f9987ff'),
            metalness: 1.0,
            roughness: 0.25,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });

        this.spinner = new THREE.Mesh(geometry, material);
        this.scene.add(this.spinner);
    }

    resizeCanvas() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    // Control methods
    setMetalness(value) {
        this.spinner.material.metalness = value;
    }

    setRoughness(value) {
        this.spinner.material.roughness = value;
    }

    setRotationSpeed(value) {
        this.rotationSpeed = value;
    }

    setLightIntensity(value) {
        this.directionalLight.intensity = value;
    }

    render() {
        // Rotate the spinner with configurable speed
        this.spinner.rotation.x += 0.001 * this.rotationSpeed;
        this.spinner.rotation.y += 0.002 * this.rotationSpeed;

        // Animate the point light in a circular motion
        const time = Date.now() * 0.001;
        this.pointLight.position.x = Math.sin(time) * 3;
        this.pointLight.position.z = Math.cos(time) * 3;

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}
