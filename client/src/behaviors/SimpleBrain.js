import { CREATURE_CONFIG, JUMPING_CONFIG, PHYSICS_CONFIG } from '../config.js';

/**
 * SimpleBrain - AI state machine for creature behavior
 *
 * States:
 * - wandering: Random movement when energy is sufficient
 * - seeking_food: Move toward nearest food when hungry
 */
export class SimpleBrain {
    constructor(creature) {
        this.creature = creature;
        this.wanderTimer = 0;
        this.wanderDirection = this.randomDirection();

        // Add ±20% randomness to wander interval to prevent resonance
        const fuzzFactor = 0.8 + Math.random() * 0.4; // Range: 0.8 to 1.2 (±20%)
        this.wanderChangeInterval = CREATURE_CONFIG.WANDER_DIRECTION_CHANGE * fuzzFactor;
    }

    /**
     * Main thinking loop - decides what action to take
     */
    think(deltaTime, world) {
        const c = this.creature;

        // State transitions based on energy level
        if (c.energy < CREATURE_CONFIG.HUNGER_THRESHOLD) {
            c.state = 'seeking_food';
        } else if (c.energy > CREATURE_CONFIG.SATISFIED_THRESHOLD) {
            c.state = 'wandering';
        }

        // Execute behavior based on current state
        switch (c.state) {
            case 'wandering':
                this.wander(deltaTime);
                break;
            case 'seeking_food':
                this.seekFood(deltaTime, world);
                break;
        }
    }

    /**
     * Wander behavior - random movement
     */
    wander(deltaTime) {
        this.wanderTimer += deltaTime;

        // Change direction every few seconds
        if (this.wanderTimer > this.wanderChangeInterval) {
            this.wanderDirection = this.randomDirection();
            this.wanderTimer = 0;
        }

        // Set velocity in wander direction
        this.creature.velocity.x = this.wanderDirection.x * this.creature.speed;
        this.creature.velocity.z = this.wanderDirection.z * this.creature.speed;
    }

    /**
     * Seek food behavior - move toward nearest visible food (now in 3D!)
     */
    seekFood(deltaTime, world) {
        // Find nearest food within perception radius
        const nearestFood = this.findNearestFood(world);

        if (nearestFood) {
            const horizontalDist = this.distanceTo(nearestFood); // 2D horizontal distance
            const verticalDist = nearestFood.position.y - this.creature.position.y;
            const totalDist = this.distance3DTo(nearestFood); // Full 3D distance

            // Check if we're close enough to eat (3D distance check)
            const eatingRadius = CREATURE_CONFIG.EATING_DISTANCE + this.creature.dna.genes.size * 0.5;
            if (totalDist < eatingRadius) {
                // Close enough to eat
                this.creature.eat(nearestFood);
                // Continue seeking if still hungry, otherwise return to wandering
                if (this.creature.energy > CREATURE_CONFIG.SATISFIED_THRESHOLD) {
                    this.creature.state = 'wandering';
                }
            } else {
                // Food is out of reach - decide whether to jump or move horizontally

                // If food is above us and we're close horizontally
                if (JUMPING_CONFIG.ENABLED &&
                    verticalDist > 1.0 &&
                    horizontalDist < CREATURE_CONFIG.EATING_DISTANCE * 3) {

                    // Check if we can reach it with our jump ability
                    if (this.canReachFood(nearestFood)) {
                        // Try to jump (will fail if on cooldown or not enough energy)
                        this.creature.jump();
                    }
                }

                // Move toward food horizontally (whether jumping or not)
                const direction = this.directionTo(nearestFood);
                this.creature.velocity.x = direction.x * this.creature.speed * CREATURE_CONFIG.SEEK_SPEED_MULTIPLIER;
                this.creature.velocity.z = direction.z * this.creature.speed * CREATURE_CONFIG.SEEK_SPEED_MULTIPLIER;
            }
        } else {
            // No food nearby, wander instead
            this.wander(deltaTime);
        }
    }

    /**
     * Find nearest food within perception radius
     */
    findNearestFood(world) {
        let nearest = null;
        let minDist = Infinity;

        for (const food of world.foodEntities) {
            // Skip consumed food
            if (food.isConsumed) continue;

            const dist = this.distanceTo(food);

            // Check if within perception radius and closer than previous
            if (dist < this.creature.perceptionRadius && dist < minDist) {
                minDist = dist;
                nearest = food;
            }
        }

        return nearest;
    }

    /**
     * Calculate horizontal (2D) distance to another entity
     */
    distanceTo(entity) {
        const dx = entity.position.x - this.creature.position.x;
        const dz = entity.position.z - this.creature.position.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Calculate full 3D distance to another entity
     */
    distance3DTo(entity) {
        const dx = entity.position.x - this.creature.position.x;
        const dy = entity.position.y - this.creature.position.y;
        const dz = entity.position.z - this.creature.position.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Check if creature can reach food with its jump ability
     */
    canReachFood(food) {
        if (!JUMPING_CONFIG.ENABLED) return false;

        // Calculate required jump height to reach food
        const foodHeight = food.position.y;
        const creatureHeight = this.creature.position.y;
        const requiredJumpHeight = foodHeight - creatureHeight;

        // Can reach if max jump height >= required height
        return this.creature.maxJumpHeight >= requiredJumpHeight;
    }

    /**
     * Get normalized direction vector toward entity (horizontal only)
     */
    directionTo(entity) {
        const dx = entity.position.x - this.creature.position.x;
        const dz = entity.position.z - this.creature.position.z;
        const length = Math.sqrt(dx * dx + dz * dz);

        // Return normalized direction (or zero if already at position)
        if (length < 0.001) {
            return { x: 0, z: 0 };
        }

        return {
            x: dx / length,
            z: dz / length
        };
    }

    /**
     * Generate random direction vector
     */
    randomDirection() {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(angle),
            z: Math.sin(angle)
        };
    }
}
