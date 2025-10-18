import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { FOOD_CONFIG, VISUAL_CONFIG } from '../config.js';

/**
 * Food entity - static resource that creatures can eat
 * Once consumed, it is removed from the world (trees spawn new food)
 */
export class Food extends Entity {
    constructor(x, z, y = 0.5) {
        super(x, z);

        this.nutrition = FOOD_CONFIG.NUTRITION;
        this.isConsumed = false;
        this.isAttachedToTree = false; // When true, food doesn't fall due to gravity

        // Visual: small light green sphere
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: VISUAL_CONFIG.FOOD_COLOR, // Already parsed to integer
            roughness: 0.6,
            metalness: 0.3
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;

        this.position.y = y; // Set initial height (may be above ground for tree food)
    }

    /**
     * Update food entity - respects tree attachment
     */
    update(deltaTime, world) {
        if (this.isAttachedToTree) {
            // Food attached to tree stays at fixed position (no gravity)
            // Just update mesh to match position (in case position changed externally)
            if (this.mesh) {
                this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            }
        } else {
            // Free food falls due to gravity
            super.update(deltaTime, world);
        }
    }

    /**
     * Get ground height for food (half the sphere radius above ground)
     */
    getGroundHeight() {
        return 0.3; // Sphere radius, so it rests on ground surface
    }

    /**
     * Mark food as consumed (will be removed from world)
     */
    consume() {
        this.isConsumed = true;
        this.mesh.visible = false;
    }
}
