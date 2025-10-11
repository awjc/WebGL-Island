import { Creature } from '../entities/Creature.js';
import { Food } from '../entities/Food.js';

/**
 * World class - manages all entities and simulation state
 * Handles spawning, updating, and removing entities
 */
export class World {
    constructor(renderer) {
        this.renderer = renderer;
        this.creatures = [];
        this.foodEntities = [];
        this.time = 0;
        this.isPaused = false;
        this.lastTimestamp = 0;
    }

    /**
     * Start the simulation - spawn initial entities and begin update loop
     */
    start() {
        console.log('Starting world simulation...');

        // Spawn initial food scattered around island
        this.spawnInitialFood(20);

        // Spawn one creature at center to start
        this.spawnCreature(0, 0);

        console.log(`World started with ${this.foodEntities.length} food and ${this.creatures.length} creatures`);

        // Start update loop
        this.lastTimestamp = performance.now();
        this.update();
    }

    /**
     * Main update loop - called every frame
     */
    update(timestamp = performance.now()) {
        if (!this.isPaused) {
            const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
            this.lastTimestamp = timestamp;

            // Update all creatures
            for (let i = this.creatures.length - 1; i >= 0; i--) {
                const creature = this.creatures[i];
                creature.update(deltaTime, this);

                // Remove dead creatures
                if (creature.isDead) {
                    this.removeCreature(creature);
                }
            }

            // Update all food
            for (const food of this.foodEntities) {
                food.update(deltaTime, this);
            }

            this.time += deltaTime;
        }

        // Continue animation loop
        requestAnimationFrame((t) => this.update(t));
    }

    /**
     * Spawn a new creature at specified position
     */
    spawnCreature(x, z, species = 'herbivore') {
        const creature = new Creature(x, z, species);
        this.creatures.push(creature);
        this.renderer.addMesh(creature.mesh);
        return creature;
    }

    /**
     * Spawn food at specified position
     */
    spawnFood(x, z) {
        const food = new Food(x, z);
        this.foodEntities.push(food);
        this.renderer.addMesh(food.mesh);
        return food;
    }

    /**
     * Spawn initial food scattered randomly on island
     */
    spawnInitialFood(count) {
        for (let i = 0; i < count; i++) {
            // Random position on island (keep away from edge)
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 40;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            this.spawnFood(x, z);
        }
    }

    /**
     * Remove a creature from the world
     */
    removeCreature(creature) {
        const index = this.creatures.indexOf(creature);
        if (index > -1) {
            this.creatures.splice(index, 1);
            this.renderer.removeMesh(creature.mesh);
            console.log(`Creature ${creature.id} died at age ${creature.age.toFixed(1)}s`);
        }
    }

    /**
     * Get current simulation statistics
     */
    getStats() {
        return {
            population: this.creatures.length,
            foodCount: this.foodEntities.filter(f => !f.isConsumed).length,
            simulationTime: Math.floor(this.time)
        };
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTimestamp = performance.now(); // Reset to avoid time jump
        }
    }
}
