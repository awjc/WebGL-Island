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
        this.volumeBeforeMute = UI_CONFIG.DEFAULT_VOLUME;

        // Start minimized on mobile devices
        this.isMinimized = this.isMobileDevice();

        this.createPanel();

        // Initialize simulation with default values
        this.resetSimulation();
    }

    /**
     * Detect if user is on a mobile device
     */
    isMobileDevice() {
        // Check if screen width is mobile-sized or if it's a touch device
        return window.innerWidth <= 768 ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    /**
     * Create the control panel HTML
     */
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'control-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Island Control</h3>
                <button id="btn-toggle-panel" class="toggle-button" title="Minimize/Maximize">−</button>
            </div>

            <div id="panel-content" class="panel-content">
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
                    <span class="stat-label">Total Births:</span>
                    <span id="stat-births" class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Deaths:</span>
                    <span id="stat-deaths" class="stat-value">0</span>
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

                <div class="control-group speed-control">
                    <label for="speed-slider">Simulation Speed: <span id="speed-value">${UI_CONFIG.DEFAULT_SPEED}x</span></label>
                    <input type="range" id="speed-slider" min="${UI_CONFIG.SPEED_SLIDER_MIN}" max="${UI_CONFIG.SPEED_SLIDER_MAX}" value="${UI_CONFIG.DEFAULT_SPEED}" step="${UI_CONFIG.SPEED_SLIDER_STEP}">
                </div>

                <div class="control-group volume-control">
                    <label for="volume-slider">
                        Volume: <span id="volume-value">${Math.round(UI_CONFIG.DEFAULT_VOLUME * 100)}%</span>
                        <button id="btn-mute" class="mute-toggle" title="Mute/Unmute">🔊</button>
                    </label>
                    <input type="range" id="volume-slider" min="${UI_CONFIG.VOLUME_SLIDER_MIN}" max="${UI_CONFIG.VOLUME_SLIDER_MAX}" value="${UI_CONFIG.DEFAULT_VOLUME}" step="${UI_CONFIG.VOLUME_SLIDER_STEP}">
                </div>
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
            </div>
        `;

        document.body.appendChild(panel);

        // Apply initial minimized state if on mobile
        if (this.isMinimized) {
            const panelContent = document.getElementById('panel-content');
            const toggleBtn = document.getElementById('btn-toggle-panel');
            const controlPanel = document.getElementById('control-panel');

            panelContent.style.display = 'none';
            toggleBtn.textContent = '+';
            controlPanel.classList.add('minimized');
        }

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

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            soundManager.setVolume(volume);
            volumeValue.textContent = Math.round(volume * 100) + '%';

            // Update mute button if volume is changed while muted
            if (this.isMuted && volume > 0) {
                this.isMuted = false;
                soundManager.setEnabled(true);
                document.getElementById('btn-mute').textContent = '🔊';
            }
        });

        // Mute toggle button
        const muteBtn = document.getElementById('btn-mute');
        muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;

            if (this.isMuted) {
                // Mute: save current volume and set to 0
                this.volumeBeforeMute = parseFloat(volumeSlider.value);
                soundManager.setEnabled(false);
                muteBtn.textContent = '🔇';
            } else {
                // Unmute: restore previous volume
                soundManager.setEnabled(true);
                muteBtn.textContent = '🔊';
            }
        });

        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.world.setTimeScale(speed);
            speedValue.textContent = speed.toFixed(1) + 'x';
        });

        // Toggle panel - clicking header or button
        const toggleBtn = document.getElementById('btn-toggle-panel');
        const panelHeader = document.querySelector('.panel-header');
        const panelContent = document.getElementById('panel-content');
        const controlPanel = document.getElementById('control-panel');

        const togglePanel = () => {
            this.isMinimized = !this.isMinimized;
            if (this.isMinimized) {
                panelContent.style.display = 'none';
                toggleBtn.textContent = '+';
                controlPanel.classList.add('minimized');
            } else {
                panelContent.style.display = 'block';
                toggleBtn.textContent = '−';
                controlPanel.classList.remove('minimized');
            }
        };

        // Make entire header clickable
        panelHeader.addEventListener('click', togglePanel);
        panelHeader.style.cursor = 'pointer';
    }

    /**
     * Update statistics display
     */
    startStatsUpdate() {
        setInterval(() => {
            const stats = this.world.getStats();
            document.getElementById('stat-population').textContent = stats.population;
            document.getElementById('stat-food').textContent = stats.foodCount;
            document.getElementById('stat-births').textContent = stats.totalBirths;
            document.getElementById('stat-deaths').textContent = stats.totalDeaths;
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
