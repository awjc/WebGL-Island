import { WORLD_CONFIG, UI_CONFIG } from '../config.js';

/**
 * ControlPanel - UI overlay for simulation controls
 */
export class ControlPanel {
    constructor(world) {
        this.world = world;
        this.foodCount = WORLD_CONFIG.DEFAULT_FOOD_COUNT;
        this.creatureCount = WORLD_CONFIG.DEFAULT_CREATURE_COUNT;
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

            <div class="control-group">
                <label for="food-slider">Food Count: <span id="food-value">${WORLD_CONFIG.DEFAULT_FOOD_COUNT}</span></label>
                <input type="range" id="food-slider" min="${UI_CONFIG.FOOD_SLIDER_MIN}" max="${UI_CONFIG.FOOD_SLIDER_MAX}" value="${WORLD_CONFIG.DEFAULT_FOOD_COUNT}" step="${UI_CONFIG.FOOD_SLIDER_STEP}">
            </div>

            <div class="control-group">
                <label for="creature-slider">Creatures: <span id="creature-value">${WORLD_CONFIG.DEFAULT_CREATURE_COUNT}</span></label>
                <input type="range" id="creature-slider" min="${UI_CONFIG.CREATURE_SLIDER_MIN}" max="${UI_CONFIG.CREATURE_SLIDER_MAX}" value="${WORLD_CONFIG.DEFAULT_CREATURE_COUNT}" step="${UI_CONFIG.CREATURE_SLIDER_STEP}">
            </div>

            <button id="reset-button">Reset Simulation</button>
        `;

        document.body.appendChild(panel);

        // Set up event listeners
        this.setupEventListeners();
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
    }

    /**
     * Reset the simulation with current slider values
     */
    resetSimulation() {
        console.log(`Resetting simulation: ${this.creatureCount} creatures, ${this.foodCount} food`);
        this.world.reset(this.creatureCount, this.foodCount);
    }
}
