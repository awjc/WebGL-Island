import * as THREE from 'three';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;

        // Create Three.js renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x1a1a1a);

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

        // Create spinner geometry
        this.setupSpinner();

        // Handle window resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupSpinner() {
        // Create a torus knot as the spinner
        const geometry = new THREE.TorusKnotGeometry(0.7, 0.2, 100, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x4db8ff,
            wireframe: false
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

    render() {
        // Rotate the spinner
        this.spinner.rotation.x += 0.01;
        this.spinner.rotation.y += 0.02;

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}
