import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { FOOD_CONFIG, VISUAL_CONFIG, gaussianRandom } from '../config.js';

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
        // Generate random respawn delay using Gaussian distribution
        this.respawnDelay = this.generateRespawnDelay();

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
     * Generate a random respawn delay using Gaussian distribution
     * Mean = 20s, StdDev = 5s, Min = 10s
     */
    generateRespawnDelay() {
        const delay = gaussianRandom(
            FOOD_CONFIG.RESPAWN_DELAY_MEAN,
            FOOD_CONFIG.RESPAWN_DELAY_STDDEV
        );
        // Clip to minimum value
        return Math.max(delay, FOOD_CONFIG.RESPAWN_DELAY_MIN);
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
                // Generate new random delay for next respawn
                this.respawnDelay = this.generateRespawnDelay();
            }
        }
    }
}
