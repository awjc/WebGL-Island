import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { FOOD_CONFIG, VISUAL_CONFIG } from '../config.js';

/**
 * Food entity - static resource that creatures can eat
 * Once consumed, it is removed from the world (trees spawn new food)
 */
export class Food extends Entity {
    constructor(x, z) {
        super(x, z);

        this.nutrition = FOOD_CONFIG.NUTRITION;
        this.isConsumed = false;

        // Visual: small light green sphere
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: VISUAL_CONFIG.FOOD_COLOR, // Already parsed to integer
            roughness: 0.6,
            metalness: 0.3
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0.5, z); // Slightly above ground
        this.mesh.castShadow = true;

        this.position.y = 0.5; // Update entity position to match
    }

    /**
     * Mark food as consumed (will be removed from world)
     */
    consume() {
        this.isConsumed = true;
        this.mesh.visible = false;
    }
}
