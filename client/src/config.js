/**
 * Central configuration file for all simulation parameters
 * Modify values here to affect the entire simulation
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse hex color string to integer
 * @param {string} hexColor - Color in format '#RRGGBB' or '#RRGGBBAA'
 * @returns {number} Integer representation of the color (alpha stripped if present)
 */
function parseColor(hexColor) {
    // Remove '#' and optional alpha channel (last 2 characters)
    const hex = hexColor.replace('#', '').slice(0, 6);
    return parseInt(hex, 16);
}

// ============================================================================
// WORLD SETTINGS
// ============================================================================

export const WORLD_CONFIG = {
    // Island dimensions
    ISLAND_RADIUS: 50,              // Radius of the circular island
    ISLAND_USABLE_RADIUS: 48,       // Safe zone for entities (slightly inside edge)

    // Initial population
    DEFAULT_FOOD_COUNT: 80,         // Starting number of food items
    DEFAULT_CREATURE_COUNT: 12,     // Starting number of creatures
};

// ============================================================================
// CREATURE SETTINGS
// ============================================================================

export const CREATURE_CONFIG = {
    // Energy system
    STARTING_ENERGY_MIN: 50,        // Minimum starting energy
    STARTING_ENERGY_MAX: 70,        // Maximum starting energy
    MAX_ENERGY: 100,                // Maximum energy capacity
    ENERGY_DRAIN_RATE: 2,           // Energy lost per second

    // Movement
    SPEED: 5,                       // Base movement speed (units/second)
    SEEK_SPEED_MULTIPLIER: 1.5,     // Speed boost when seeking food

    // AI behavior
    PERCEPTION_RADIUS: 15,          // How far creature can "see" food
    HUNGER_THRESHOLD: 40,           // Energy level to start seeking food
    SATISFIED_THRESHOLD: 95,        // Energy level to stop seeking food
    EATING_DISTANCE: 1.5,           // How close to be to eat food

    // Wandering behavior
    WANDER_DIRECTION_CHANGE: 3,     // Seconds between direction changes

    // Visual
    MIN_SCALE: 0.5,                 // Scale when energy is 0%
    MAX_SCALE: 1.0,                 // Scale when energy is 100%
};

// ============================================================================
// FOOD SETTINGS
// ============================================================================

export const FOOD_CONFIG = {
    NUTRITION: 15,                  // Energy restored when eaten
    RESPAWN_DELAY: 20,              // Seconds until food respawns
};

// ============================================================================
// UI SETTINGS
// ============================================================================

export const UI_CONFIG = {
    // Control panel sliders
    FOOD_SLIDER_MIN: 5,
    FOOD_SLIDER_MAX: 1000,
    FOOD_SLIDER_STEP: 5,

    CREATURE_SLIDER_MIN: 1,
    CREATURE_SLIDER_MAX: 50,
    CREATURE_SLIDER_STEP: 1,

    // Simulation speed
    SPEED_SLIDER_MIN: 0.1,
    SPEED_SLIDER_MAX: 10.0,
    SPEED_SLIDER_STEP: 0.1,
    DEFAULT_SPEED: 1.0,

    // Audio volume
    VOLUME_SLIDER_MIN: 0,
    VOLUME_SLIDER_MAX: 1.0,
    VOLUME_SLIDER_STEP: 0.05,
    DEFAULT_VOLUME: 0.5,

    // Visual features
    SHOW_STATE_ICONS: true,         // Show floating icons above creatures
};

// ============================================================================
// VISUAL SETTINGS
// ============================================================================

export const VISUAL_CONFIG = {
    // Tree decoration
    TREE_COUNT: 15,                 // Number of decorative trees on island

    // Colors (hex strings parsed to integers for Three.js)
    // Format: '#RRGGBB' or '#RRGGBBAA' (alpha will be stripped)
    TERRAIN_COLOR: parseColor('#104420ff'),       // Grass green
    FOOD_COLOR: parseColor('#90ee90'),          // Light green

    // Creature colors
    CREATURE_HEALTHY_COLOR: parseColor('#4169e1'),   // Blue when healthy
    CREATURE_HUNGRY_COLOR: parseColor('#ff3333'),    // Red when seeking food
    CREATURE_WANDERING_FADE: parseColor('#ff8833'),  // Orange transition when wandering but low energy
};

// ============================================================================
// GENETICS SETTINGS
// ============================================================================

export const GENETICS_CONFIG = {
    MUTATION_RATE: 0.15,            // 15% chance per gene to mutate
    MUTATION_AMOUNT: 0.2,           // Max change per mutation (±0.1)

    // Reproduction settings
    REPRODUCTION_ENERGY_THRESHOLD: 85,  // Energy needed to reproduce
    REPRODUCTION_ENERGY_COST: 40,       // Energy lost when reproducing
    REPRODUCTION_COOLDOWN: 30,          // Seconds between reproductions

    // Offspring settings
    OFFSPRING_STARTING_ENERGY: 60,      // Baby creatures start with this energy
    OFFSPRING_SPAWN_DISTANCE: 2,        // How far from parent to spawn
};

// ============================================================================
// AUDIO SETTINGS
// ============================================================================

export const AUDIO_CONFIG = {
    DEATH_SOUND_VOLUME: 0.08,
    DEATH_SOUND_FREQ_START: 200,
    DEATH_SOUND_FREQ_END: 100,
    DEATH_SOUND_DURATION: 0.5,

    EAT_SOUND_VOLUME: 0.50,
    EAT_SOUND_FREQ_START: 200,
    EAT_SOUND_FREQ_END: 600,
    EAT_SOUND_DURATION: 0.1,

    BIRTH_SOUND_VOLUME: 0.15,
    BIRTH_SOUND_FREQ_START: 400,
    BIRTH_SOUND_FREQ_END: 800,
    BIRTH_SOUND_DURATION: 0.2,
};
