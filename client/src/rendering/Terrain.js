import * as THREE from 'three';
import { WORLD_CONFIG, VISUAL_CONFIG } from '../config.js';

/**
 * Terrain class - creates a simple circular island
 */
export class Terrain {
    constructor() {
        this.mesh = this.createIsland();
    }

    createIsland() {
        // Create a circular island geometry
        const geometry = new THREE.CircleGeometry(WORLD_CONFIG.ISLAND_RADIUS, 32);

        // Grass-green material with some roughness
        const material = new THREE.MeshStandardMaterial({
            color: VISUAL_CONFIG.TERRAIN_COLOR, // Already parsed to integer
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
