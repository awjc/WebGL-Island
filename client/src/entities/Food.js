import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { FOOD_CONFIG, VISUAL_CONFIG } from '../config.js';

/**
 * Food entity - static resource that creatures can eat
 * Respawns after being consumed
 */
export class Food extends Entity {
    constructor(x, z) {
        super(x, z);

        this.nutrition = FOOD_CONFIG.NUTRITION;
        this.isConsumed = false;
        this.respawnTimer = 0;
        this.respawnDelay = FOOD_CONFIG.RESPAWN_DELAY;

        // Visual: small light green sphere
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: VISUAL_CONFIG.FOOD_COLOR,
            roughness: 0.6,
            metalness: 0.0
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0.5, z); // Slightly above ground
        this.mesh.castShadow = true;

        this.position.y = 0.5; // Update entity position to match
    }

    /**
     * Mark food as consumed and make it invisible
     */
    consume() {
        this.isConsumed = true;
        this.mesh.visible = false;
    }

    /**
     * Update food state - handles respawn timer
     */
    update(deltaTime, world) {
        super.update(deltaTime, world);

        if (this.isConsumed) {
            this.respawnTimer += deltaTime;

            // Respawn after delay
            if (this.respawnTimer >= this.respawnDelay) {
                this.isConsumed = false;
                this.mesh.visible = true;
                this.respawnTimer = 0;
            }
        }
    }
}
