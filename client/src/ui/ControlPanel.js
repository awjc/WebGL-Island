import { WORLD_CONFIG, UI_CONFIG } from '../config.js';
import { soundManager } from '../utils/SoundManager.js';

/**
 * ControlPanel - UI overlay for simulation controls
 */
export class ControlPanel {
    constructor(world) {
        this.world = world;
        this.foodCount = WORLD_CONFIG.DEFAULT_FOOD_COUNT;
        this.creatureCount = WORLD_CONFIG.DEFAULT_CREATURE_COUNT;
        this.isMuted = false;
        this.createPanel();

        // Initialize simulation with default values
        this.resetSimulation();
    }

    /**
     * Create the control panel HTML
     */
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'control-panel';
        panel.innerHTML = `
            <h3>Island Control</h3>

            <div class="stats-section">
                <h4>Statistics</h4>
                <div class="stat-item">
                    <span class="stat-label">Population:</span>
                    <span id="stat-population" class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Food Available:</span>
                    <span id="stat-food" class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Simulation Time:</span>
                    <span id="stat-time" class="stat-value">0s</span>
                </div>
            </div>

            <div class="controls-section">
                <h4>Quick Actions</h4>
                <button id="btn-spawn-creature" class="action-button">Spawn Creature</button>
                <button id="btn-spawn-food" class="action-button">Spawn Food</button>
                <button id="btn-pause" class="action-button">Pause</button>
                <button id="btn-mute" class="action-button">Mute</button>
            </div>

            <div class="reset-section">
                <h4>Reset Simulation</h4>
                <div class="control-group">
                    <label for="food-slider">Food Count: <span id="food-value">${WORLD_CONFIG.DEFAULT_FOOD_COUNT}</span></label>
                    <input type="range" id="food-slider" min="${UI_CONFIG.FOOD_SLIDER_MIN}" max="${UI_CONFIG.FOOD_SLIDER_MAX}" value="${WORLD_CONFIG.DEFAULT_FOOD_COUNT}" step="${UI_CONFIG.FOOD_SLIDER_STEP}">
                </div>

                <div class="control-group">
                    <label for="creature-slider">Creatures: <span id="creature-value">${WORLD_CONFIG.DEFAULT_CREATURE_COUNT}</span></label>
                    <input type="range" id="creature-slider" min="${UI_CONFIG.CREATURE_SLIDER_MIN}" max="${UI_CONFIG.CREATURE_SLIDER_MAX}" value="${WORLD_CONFIG.DEFAULT_CREATURE_COUNT}" step="${UI_CONFIG.CREATURE_SLIDER_STEP}">
                </div>

                <button id="reset-button" class="reset-button">Reset Simulation</button>
            </div>
        `;

        document.body.appendChild(panel);

        // Set up event listeners
        this.setupEventListeners();

        // Start statistics update loop
        this.startStatsUpdate();
    }

    /**
     * Set up event listeners for controls
     */
    setupEventListeners() {
        // Food slider
        const foodSlider = document.getElementById('food-slider');
        const foodValue = document.getElementById('food-value');
        foodSlider.addEventListener('input', (e) => {
            this.foodCount = parseInt(e.target.value);
            foodValue.textContent = this.foodCount;
        });

        // Creature slider
        const creatureSlider = document.getElementById('creature-slider');
        const creatureValue = document.getElementById('creature-value');
        creatureSlider.addEventListener('input', (e) => {
            this.creatureCount = parseInt(e.target.value);
            creatureValue.textContent = this.creatureCount;
        });

        // Reset button
        const resetButton = document.getElementById('reset-button');
        resetButton.addEventListener('click', () => {
            this.resetSimulation();
        });

        // Spawn creature button
        const spawnCreatureBtn = document.getElementById('btn-spawn-creature');
        spawnCreatureBtn.addEventListener('click', () => {
            // Spawn at random position within usable radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 30;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            this.world.spawnCreature(x, z);
        });

        // Spawn food button
        const spawnFoodBtn = document.getElementById('btn-spawn-food');
        spawnFoodBtn.addEventListener('click', () => {
            // Spawn at random position within usable radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 40;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            this.world.spawnFood(x, z);
        });

        // Pause button
        const pauseBtn = document.getElementById('btn-pause');
        pauseBtn.addEventListener('click', () => {
            this.world.togglePause();
            pauseBtn.textContent = this.world.isPaused ? 'Resume' : 'Pause';
        });

        // Mute button
        const muteBtn = document.getElementById('btn-mute');
        muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            soundManager.setEnabled(!this.isMuted);
            muteBtn.textContent = this.isMuted ? 'Unmute' : 'Mute';
        });
    }

    /**
     * Update statistics display
     */
    startStatsUpdate() {
        setInterval(() => {
            const stats = this.world.getStats();
            document.getElementById('stat-population').textContent = stats.population;
            document.getElementById('stat-food').textContent = stats.foodCount;
            document.getElementById('stat-time').textContent = stats.simulationTime + 's';
        }, 100); // Update 10 times per second
    }

    /**
     * Reset the simulation with current slider values
     */
    resetSimulation() {
        console.log(`Resetting simulation: ${this.creatureCount} creatures, ${this.foodCount} food`);
        this.world.reset(this.creatureCount, this.foodCount);
    }
}
