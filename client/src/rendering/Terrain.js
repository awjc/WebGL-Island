import * as THREE from 'three';

/**
 * Terrain class - creates a simple circular island
 */
export class Terrain {
    constructor() {
        this.mesh = this.createIsland();
    }

    createIsland() {
        // Create a circular island geometry
        const geometry = new THREE.CircleGeometry(50, 32);

        // Grass-green material with some roughness
        const material = new THREE.MeshStandardMaterial({
            color: '#4a7c59', // Grass green
            roughness: 0.8,
            metalness: 0.0
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Rotate to make it horizontal (lay flat on XZ plane)
        mesh.rotation.x = -Math.PI / 2;

        // Enable shadows
        mesh.receiveShadow = true;

        return mesh;
    }
}
