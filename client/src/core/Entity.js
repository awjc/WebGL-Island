import { WORLD_CONFIG, PHYSICS_CONFIG } from '../config.js';

/**
 * Base Entity class - represents any object in the world
 * All entities have position, velocity, and can update each frame
 */

let nextEntityId = 0;

export class Entity {
    constructor(x, z) {
        this.id = nextEntityId++;
        this.position = { x, y: 0, z }; // y starts at ground level
        this.velocity = { x: 0, y: 0, z: 0 }; // Now includes y-component for vertical movement
        this.mesh = null; // Set by subclass
        this.isGrounded = true; // Track if entity is on the ground
        this.affectedByGravity = true; // Can be disabled for static entities
    }

    /**
     * Update entity state - called every frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {World} world - Reference to world for entity queries
     */
    update(deltaTime, world) {
        // Apply gravity to vertical velocity (if enabled and not grounded)
        if (this.affectedByGravity && !this.isGrounded) {
            this.velocity.y -= PHYSICS_CONFIG.GRAVITY * deltaTime;
        }

        // Apply velocity to position (now includes y-component)
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Ground collision check
        const groundHeight = this.getGroundHeight();
        if (this.position.y <= groundHeight) {
            this.position.y = groundHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        // Keep entities on island (horizontal boundary check)
        const distFromCenter = Math.sqrt(this.position.x ** 2 + this.position.z ** 2);

        if (distFromCenter > WORLD_CONFIG.ISLAND_USABLE_RADIUS) {
            // Push back toward center
            const angle = Math.atan2(this.position.z, this.position.x);
            this.position.x = Math.cos(angle) * WORLD_CONFIG.ISLAND_USABLE_RADIUS;
            this.position.z = Math.sin(angle) * WORLD_CONFIG.ISLAND_USABLE_RADIUS;

            // Reflect horizontal velocity (bounce)
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
     * Get the ground height at this entity's position
     * Subclasses can override for entity-specific ground heights
     * @returns {number} Ground height in world units
     */
    getGroundHeight() {
        return PHYSICS_CONFIG.GROUND_LEVEL;
    }

    /**
     * Clean up entity resources
     */
    destroy() {
        // Subclasses can override to clean up resources
    }
}
