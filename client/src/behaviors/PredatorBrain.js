import { PREDATOR_CONFIG } from '../config.js';

/**
 * PredatorBrain - AI state machine for carnivore creatures
 *
 * States:
 * - wandering: Patrol randomly when no prey is in sight
 * - hunting:   Chase nearest herbivore and attempt to kill it
 */
export class PredatorBrain {
    constructor(creature) {
        this.creature = creature;
        this.wanderTimer = 0;
        this.wanderDirection = this.randomDirection();

        // Add ±20% randomness to wander interval to desync predators from each other
        const fuzzFactor = 0.8 + Math.random() * 0.4;
        this.wanderChangeInterval = 2.5 * fuzzFactor;
    }

    /**
     * Main thinking loop - decides whether to hunt or wander
     */
    think(deltaTime, world) {
        const nearestPrey = this.findNearestPrey(world);

        if (nearestPrey) {
            this.creature.state = 'hunting';
            this.hunt(nearestPrey, world);
        } else {
            this.creature.state = 'wandering';
            this.wander(deltaTime);
        }
    }

    /**
     * Hunt behavior - chase and kill the nearest herbivore
     */
    hunt(prey, world) {
        const dist = this.distanceTo(prey);

        if (dist < PREDATOR_CONFIG.KILL_RANGE) {
            // In striking range - kill!
            this.creature.killPrey(prey, world);
        } else {
            // Chase prey at full sprint speed
            const direction = this.directionTo(prey);
            const speed = this.creature.speed * PREDATOR_CONFIG.CHASE_SPEED_MULTIPLIER;
            this.creature.velocity.x = direction.x * speed;
            this.creature.velocity.z = direction.z * speed;
        }
    }

    /**
     * Wander behavior - random patrol
     */
    wander(deltaTime) {
        this.wanderTimer += deltaTime;

        if (this.wanderTimer > this.wanderChangeInterval) {
            this.wanderDirection = this.randomDirection();
            this.wanderTimer = 0;
        }

        this.creature.velocity.x = this.wanderDirection.x * this.creature.speed;
        this.creature.velocity.z = this.wanderDirection.z * this.creature.speed;
    }

    /**
     * Find the nearest visible herbivore within detection radius
     */
    findNearestPrey(world) {
        let nearest = null;
        let minDist = Infinity;

        for (const creature of world.creatures) {
            if (creature.species !== 'herbivore') continue;
            if (creature.isDead) continue;

            const dist = this.distanceTo(creature);
            if (dist < this.creature.perceptionRadius && dist < minDist) {
                nearest = creature;
                minDist = dist;
            }
        }

        return nearest;
    }

    /**
     * Calculate horizontal (2D) distance to an entity
     */
    distanceTo(entity) {
        const dx = entity.position.x - this.creature.position.x;
        const dz = entity.position.z - this.creature.position.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Get normalized direction vector toward an entity (horizontal only)
     */
    directionTo(entity) {
        const dx = entity.position.x - this.creature.position.x;
        const dz = entity.position.z - this.creature.position.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length < 0.001) return { x: 0, z: 0 };
        return { x: dx / length, z: dz / length };
    }

    /**
     * Generate random direction vector
     */
    randomDirection() {
        const angle = Math.random() * Math.PI * 2;
        return { x: Math.cos(angle), z: Math.sin(angle) };
    }
}
