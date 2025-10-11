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
        this.wanderChangeInterval = 3; // Seconds between direction changes
    }

    /**
     * Main thinking loop - decides what action to take
     */
    think(deltaTime, world) {
        const c = this.creature;
        const previousState = c.state;

        // State transitions based on energy level
        if (c.energy < 40) {
            c.state = 'seeking_food';
        } else if (c.energy > 70) {
            c.state = 'wandering';
        }

        // Log state changes
        if (previousState !== c.state) {
            console.log(`State change: ${previousState} -> ${c.state} (energy: ${c.energy.toFixed(1)})`);
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
     * Seek food behavior - move toward nearest visible food
     */
    seekFood(deltaTime, world) {
        // Find nearest food within perception radius
        const nearestFood = this.findNearestFood(world);

        if (nearestFood) {
            const distance = this.distanceTo(nearestFood);

            if (distance < 1.5) {
                // Close enough to eat
                console.log(`Creature eating! Distance: ${distance.toFixed(2)}, Energy before: ${this.creature.energy.toFixed(1)}`);
                this.creature.eat(nearestFood);
                console.log(`Energy after: ${this.creature.energy.toFixed(1)}, State: ${this.creature.state}`);
                // Continue seeking if still hungry, otherwise return to wandering
                if (this.creature.energy > 70) {
                    this.creature.state = 'wandering';
                }
            } else {
                // Move toward food at increased speed
                const direction = this.directionTo(nearestFood);
                const seekSpeedMultiplier = 1.5; // Move faster when hungry
                this.creature.velocity.x = direction.x * this.creature.speed * seekSpeedMultiplier;
                this.creature.velocity.z = direction.z * this.creature.speed * seekSpeedMultiplier;
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
     * Calculate distance to another entity
     */
    distanceTo(entity) {
        const dx = entity.position.x - this.creature.position.x;
        const dz = entity.position.z - this.creature.position.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Get normalized direction vector toward entity
     */
    directionTo(entity) {
        const dx = entity.position.x - this.creature.position.x;
        const dz = entity.position.z - this.creature.position.z;
        const length = Math.sqrt(dx * dx + dz * dz);

        // Return normalized direction
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
