import { Creature } from '../entities/Creature.js';
import { Food } from '../entities/Food.js';
import { soundManager } from '../utils/SoundManager.js';
import { WORLD_CONFIG, UI_CONFIG } from '../config.js';

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
        this.timeScale = 1.0; // Simulation speed multiplier
        this.soundManager = soundManager;
        this.showStateIcons = UI_CONFIG.SHOW_STATE_ICONS; // Track icon visibility state

        // Statistics tracking
        this.totalBirths = 0;
        this.totalDeaths = 0;
    }

    /**
     * Start the simulation - begin update loop (entities spawned separately by reset())
     */
    start() {
        console.log('Starting world simulation...');

        // Start update loop (entities will be spawned by ControlPanel calling reset())
        this.lastTimestamp = performance.now();
        this.update();
    }

    /**
     * Main update loop - called every frame
     */
    update(timestamp = performance.now()) {
        if (!this.isPaused) {
            const rawDeltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
            const deltaTime = rawDeltaTime * this.timeScale; // Apply time scale
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
        creature.setShowStateIcon(this.showStateIcons); // Apply current icon setting
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
     * Spawn offspring from parent DNA
     */
    spawnOffspring(x, z, parentDNA) {
        const offspring = new Creature(x, z, 'herbivore', parentDNA);
        offspring.setShowStateIcon(this.showStateIcons); // Apply current icon setting
        this.creatures.push(offspring);
        this.renderer.addMesh(offspring.mesh);
        this.totalBirths++;

        // Play birth sound
        this.soundManager.playBirthSound();

        console.log(`Birth! Generation ${offspring.generation}, Population: ${this.creatures.length}`);
        return offspring;
    }

    /**
     * Spawn initial food scattered evenly on island using jittered grid
     */
    spawnInitialFood(count) {
        // Calculate grid dimensions for even distribution
        // Oversample to ensure we get enough valid positions
        const gridSize = Math.ceil(Math.sqrt(count * 1.5));
        const islandSize = WORLD_CONFIG.ISLAND_RADIUS * 2;
        const cellSize = islandSize / gridSize;
        const offset = -islandSize / 2; // Start from corner

        // Generate all valid positions first
        const validPositions = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                // Grid position with random jitter for natural look
                const jitterX = (Math.random() - 0.5) * cellSize * 0.8;
                const jitterZ = (Math.random() - 0.5) * cellSize * 0.8;
                const x = offset + (i + 0.5) * cellSize + jitterX;
                const z = offset + (j + 0.5) * cellSize + jitterZ;

                // Only include if within island radius
                const distFromCenter = Math.sqrt(x * x + z * z);
                if (distFromCenter < WORLD_CONFIG.ISLAND_USABLE_RADIUS) {
                    validPositions.push({ x, z });
                }
            }
        }

        // Shuffle positions for randomness
        for (let i = validPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validPositions[i], validPositions[j]] = [validPositions[j], validPositions[i]];
        }

        // Spawn exactly count food items
        for (let i = 0; i < Math.min(count, validPositions.length); i++) {
            const pos = validPositions[i];
            this.spawnFood(pos.x, pos.z);
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
            this.totalDeaths++;
            console.log(`Creature ${creature.id} died at age ${creature.age.toFixed(1)}s, Gen ${creature.generation}`);

            // Play death sound
            this.soundManager.playDeathSound();
        }
    }

    /**
     * Get current simulation statistics
     */
    getStats() {
        return {
            population: this.creatures.length,
            foodCount: this.foodEntities.filter(f => !f.isConsumed).length,
            simulationTime: Math.floor(this.time),
            totalBirths: this.totalBirths,
            totalDeaths: this.totalDeaths
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

    /**
     * Set simulation speed (time scale multiplier)
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(10.0, scale)); // Clamp between 0.1x and 10x
    }

    /**
     * Toggle visibility of state icons on creatures
     */
    setShowStateIcons(show) {
        this.showStateIcons = show; // Store the state
        for (const creature of this.creatures) {
            creature.setShowStateIcon(show);
        }
    }

    /**
     * Reset simulation with new parameters
     */
    reset(creatureCount, foodCount) {
        // Remove all existing creatures
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];
            this.renderer.removeMesh(creature.mesh);
        }
        this.creatures = [];

        // Remove all existing food
        for (let i = this.foodEntities.length - 1; i >= 0; i--) {
            const food = this.foodEntities[i];
            this.renderer.removeMesh(food.mesh);
        }
        this.foodEntities = [];

        // Reset simulation time and statistics
        this.time = 0;
        this.totalBirths = 0;
        this.totalDeaths = 0;

        // Spawn new food
        this.spawnInitialFood(foodCount);

        // Spawn new creatures in a grid pattern
        const spacing = 20;
        const gridSize = Math.ceil(Math.sqrt(creatureCount));
        const offset = -(gridSize - 1) * spacing / 2;

        let spawned = 0;
        for (let i = 0; i < gridSize && spawned < creatureCount; i++) {
            for (let j = 0; j < gridSize && spawned < creatureCount; j++) {
                const x = offset + i * spacing;
                const z = offset + j * spacing;
                this.spawnCreature(x, z);
                spawned++;
            }
        }

        console.log(`Simulation reset: ${this.creatures.length} creatures, ${this.foodEntities.length} food`);
    }
}
