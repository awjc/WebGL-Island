import { WORLD_CONFIG } from '../config.js';

/**
 * Base Entity class - represents any object in the world
 * All entities have position, velocity, and can update each frame
 */

let nextEntityId = 0;

export class Entity {
    constructor(x, z) {
        this.id = nextEntityId++;
        this.position = { x, y: 0, z }; // y=0 for ground level
        this.velocity = { x: 0, z: 0 };
        this.mesh = null; // Set by subclass
    }

    /**
     * Update entity state - called every frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {World} world - Reference to world for entity queries
     */
    update(deltaTime, world) {
        // Apply velocity to position
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Keep entities on island (simple boundary check)
        const distFromCenter = Math.sqrt(this.position.x ** 2 + this.position.z ** 2);

        if (distFromCenter > WORLD_CONFIG.ISLAND_USABLE_RADIUS) {
            // Push back toward center
            const angle = Math.atan2(this.position.z, this.position.x);
            this.position.x = Math.cos(angle) * WORLD_CONFIG.ISLAND_USABLE_RADIUS;
            this.position.z = Math.sin(angle) * WORLD_CONFIG.ISLAND_USABLE_RADIUS;

            // Reflect velocity (bounce)
            const normal = { x: -Math.cos(angle), z: -Math.sin(angle) };
            const dot = this.velocity.x * normal.x + this.velocity.z * normal.z;
            this.velocity.x -= 2 * dot * normal.x;
            this.velocity.z -= 2 * dot * normal.z;
        }

        // Update mesh position if it exists
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    /**
     * Clean up entity resources
     */
    destroy() {
        // Subclasses can override to clean up resources
    }
}
