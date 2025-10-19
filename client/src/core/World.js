import { Creature } from '../entities/Creature.js';
import { Food } from '../entities/Food.js';
import { Tree } from '../entities/Tree.js';
import { soundManager } from '../utils/SoundManager.js';
import { PopulationGraph } from '../ui/PopulationGraph.js';
import { WORLD_CONFIG, UI_CONFIG, TREE_CONFIG } from '../config.js';

/**
 * World class - manages all entities and simulation state
 * Handles spawning, updating, and removing entities
 */
export class World {
    constructor(renderer, terrain = null) {
        this.renderer = renderer;
        this.terrain = terrain; // Reference to terrain for resizing
        this.creatures = [];
        this.foodEntities = [];
        this.trees = [];
        this.time = 0;
        this.isPaused = false;
        this.lastTimestamp = 0;
        this.timeScale = 1.0; // Simulation speed multiplier
        this.soundManager = soundManager;
        this.showStateIcons = UI_CONFIG.SHOW_STATE_ICONS; // Track icon visibility state

        // Statistics tracking
        this.totalBirths = 0;
        this.totalDeaths = 0;

        // Extinction tracking
        this.isExtinct = false;
        this.extinctionOverlay = document.getElementById('extinction-overlay');
        this.onExtinctionCallback = null; // Callback to notify when extinction happens

        // Population graph
        this.populationGraph = new PopulationGraph();
    }

    /**
     * Start the simulation - begin update loop (entities spawned separately by reset())
     */
    start() {
        console.log('Starting world simulation...');

        // Initialize population graph
        const canvas = document.getElementById('population-graph');
        if (canvas) {
            this.populationGraph.init(canvas);
        }

        // Start update loop (entities will be spawned by ControlPanel calling reset())
        this.lastTimestamp = performance.now();
        this.update();
    }

    /**
     * Main update loop - called every frame
     */
    update(timestamp = performance.now()) {
        if (!this.isPaused && !this.isExtinct) {
            const rawDeltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
            this.lastTimestamp = timestamp;

            // Filter out large time deltas (e.g., when tabbing away)
            // This prevents discontinuities in the simulation
            if (rawDeltaTime > WORLD_CONFIG.MAX_DELTA_TIME) {
                // Skip this frame - too much time has passed
                requestAnimationFrame((t) => this.update(t));
                return;
            }

            const deltaTime = rawDeltaTime * this.timeScale; // Apply time scale

            // Update all creatures
            for (let i = this.creatures.length - 1; i >= 0; i--) {
                const creature = this.creatures[i];
                creature.update(deltaTime, this);

                // Remove dead creatures
                if (creature.isDead) {
                    this.removeCreature(creature);
                }
            }

            // Update all food and remove consumed or expired food
            for (let i = this.foodEntities.length - 1; i >= 0; i--) {
                const food = this.foodEntities[i];
                food.update(deltaTime, this);

                // Remove consumed or expired food permanently (trees will spawn new food)
                if (food.isConsumed || food.isExpired) {
                    this.foodEntities.splice(i, 1);
                    this.renderer.removeMesh(food.mesh);
                }
            }

            // Update all trees (they spawn food)
            for (const tree of this.trees) {
                tree.update(deltaTime, this);
            }

            this.time += deltaTime;

            // Check for extinction (triggers whenever all creatures die)
            if (!this.isExtinct && this.creatures.length === 0) {
                this.handleExtinction();
            }

            // Update population graph
            const stats = this.getStats();
            stats.elapsedTime = this.time;
            stats.creatureCount = this.creatures.length;
            this.populationGraph.update(deltaTime, stats);
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
     * Spawn food at specified position (with optional height)
     */
    spawnFood(x, z, y = 0.5) {
        const food = new Food(x, z, y);
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
        // Calculate average creature size and jump power
        let avgSize = 1.0; // Default if no creatures
        let avgJumpPower = 1.0; // Default if no creatures

        if (this.creatures.length > 0) {
            const totalSize = this.creatures.reduce((sum, c) => sum + c.dna.genes.size, 0);
            avgSize = totalSize / this.creatures.length;

            const totalJumpPower = this.creatures.reduce((sum, c) => sum + c.dna.genes.jumpPower, 0);
            avgJumpPower = totalJumpPower / this.creatures.length;
        }

        return {
            population: this.creatures.length,
            foodCount: this.foodEntities.filter(f => !f.isConsumed).length,
            simulationTime: Math.floor(this.time),
            totalBirths: this.totalBirths,
            totalDeaths: this.totalDeaths,
            avgSize: avgSize,
            avgJumpPower: avgJumpPower
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
     * Step forward by one frame (only works when paused)
     */
    stepForward() {
        if (!this.isPaused) return;

        // Use a fixed delta time for consistent single-frame steps
        const fixedDeltaTime = 1 / 20; // 1/20th of a second per step

        // Update all creatures
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];
            creature.update(fixedDeltaTime, this);

            // Remove dead creatures
            if (creature.isDead) {
                this.removeCreature(creature);
            }
        }

        // Update all food
        for (const food of this.foodEntities) {
            food.update(fixedDeltaTime, this);
        }

        this.time += fixedDeltaTime;
    }

    /**
     * Set simulation speed (time scale multiplier)
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(UI_CONFIG.CREATURE_SLIDER_MIN, Math.min(UI_CONFIG.SPEED_SLIDER_MAX, scale));
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
     * Toggle visibility of population graph
     */
    setShowGraph(show) {
        this.populationGraph.setVisible(show);
    }

    /**
     * Set graph time window (in seconds)
     */
    setGraphTimeWindow(seconds) {
        this.populationGraph.setTimeWindow(seconds);
    }

    /**
     * Toggle between dark and light themes
     */
    setDarkTheme(isDark) {
        this.renderer.setDarkTheme(isDark);
    }

    /**
     * Handle extinction event - pause simulation and show overlay
     */
    handleExtinction() {
        console.log('EXTINCTION: All creatures have died');
        this.isExtinct = true;
        this.isPaused = true;

        // Show extinction overlay
        if (this.extinctionOverlay) {
            this.extinctionOverlay.style.display = 'flex';
        }

        // Notify control panel (if callback is set)
        if (this.onExtinctionCallback) {
            this.onExtinctionCallback();
        }
    }

    /**
     * Hide extinction overlay
     */
    hideExtinctionOverlay() {
        if (this.extinctionOverlay) {
            this.extinctionOverlay.style.display = 'none';
        }
        this.isExtinct = false;
    }

    /**
     * Reset simulation with new parameters
     */
    reset(creatureCount, treeCount = TREE_CONFIG.COUNT, islandRadius = WORLD_CONFIG.ISLAND_RADIUS) {
        // Update world config with new island radius
        WORLD_CONFIG.ISLAND_RADIUS = islandRadius;
        WORLD_CONFIG.ISLAND_USABLE_RADIUS = islandRadius - 2; // Maintain 2-unit buffer from edge

        // Update terrain size if terrain reference exists
        if (this.terrain) {
            this.terrain.updateSize(islandRadius);
        }

        // Update camera zoom limits to match new island size
        this.renderer.updateCameraLimits(islandRadius);

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

        // Remove all existing trees
        for (let i = this.trees.length - 1; i >= 0; i--) {
            const tree = this.trees[i];
            this.renderer.removeMesh(tree.mesh);
        }
        this.trees = [];

        // Reset simulation time and statistics
        this.time = 0;
        this.totalBirths = 0;
        this.totalDeaths = 0;

        // Hide extinction overlay and unpause if extinct
        this.hideExtinctionOverlay();
        this.isPaused = false;

        // Reset population graph
        this.populationGraph.reset({ totalBirths: 0, totalDeaths: 0 });

        // Create trees and spawn initial food around them
        const newTrees = Tree.createForest(treeCount);
        for (const tree of newTrees) {
            this.trees.push(tree);
            this.renderer.addMesh(tree.mesh);
            tree.spawnInitialFood(this);
        }

        // Spawn creatures randomly throughout the island's available space
        for (let i = 0; i < creatureCount; i++) {
            // Generate random position within island radius using polar coordinates
            // This ensures uniform distribution across the circular area
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.sqrt(Math.random()) * WORLD_CONFIG.ISLAND_USABLE_RADIUS;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            this.spawnCreature(x, z);
        }

        console.log(`Simulation reset: ${this.creatures.length} creatures, ${this.trees.length} trees, ${islandRadius}m radius`);
    }
}
