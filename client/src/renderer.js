import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WORLD_CONFIG, VISUAL_CONFIG } from './config.js';

/**
 * Renderer class - manages Three.js scene, camera, lights, and rendering
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;

        // Create Three.js renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(VISUAL_CONFIG.SKY_COLOR_LIGHT); // Default to light theme
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Track current theme
        this.isDarkTheme = false;

        // Create scene
        this.scene = new THREE.Scene();

        // Create camera - positioned above and angled down at island
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 50, 50);
        this.camera.lookAt(0, 0, 0);

        // Set up OrbitControls for camera movement
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true; // Smooth camera movement
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground

        // Set initial camera limits based on island size
        this.updateCameraLimits(WORLD_CONFIG.ISLAND_RADIUS);

        // Configure mouse buttons - middle button same as right (pan)
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,      // Left: pan
            MIDDLE: THREE.MOUSE.PAN,    // Middle: pan (same as left)
            RIGHT: THREE.MOUSE.ROTATE,   // Right: orbit
        };

        // Add lights
        this.setupLights();

        // Handle window resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun) for shadows and definition
        const directionalLight = new THREE.DirectionalLight('#ffffff', 0.8);
        directionalLight.position.set(50, 100, 30);
        directionalLight.castShadow = true;

        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;

        this.scene.add(directionalLight);
    }

    resizeCanvas() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Update camera zoom limits based on island size
     */
    updateCameraLimits(islandRadius) {
        // Scale camera limits with island size
        // Min distance: close enough to see details (0.4x radius)
        this.controls.minDistance = islandRadius * 0.4;

        // Max distance: far enough to see entire island (3x radius)
        this.controls.maxDistance = islandRadius * 3;
    }

    render() {
        // Update controls for damping
        this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }

    addMesh(mesh) {
        this.scene.add(mesh);
    }

    removeMesh(mesh) {
        this.scene.remove(mesh);
    }

    /**
     * Toggle between dark and light themes
     * @param {boolean} isDark - True for dark theme, false for light theme
     */
    setDarkTheme(isDark) {
        this.isDarkTheme = isDark;
        const skyColor = isDark ? VISUAL_CONFIG.SKY_COLOR_DARK : VISUAL_CONFIG.SKY_COLOR_LIGHT;
        this.renderer.setClearColor(skyColor);
    }
}
