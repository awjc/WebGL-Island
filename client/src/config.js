/**
 * Central configuration file for all simulation parameters
 * Modify values here to affect the entire simulation
 */

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
    SATISFIED_THRESHOLD: 70,        // Energy level to stop seeking food
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
};

// ============================================================================
// VISUAL SETTINGS
// ============================================================================

export const VISUAL_CONFIG = {
    // Tree decoration
    TREE_COUNT: 15,                 // Number of decorative trees on island

    // Colors
    TERRAIN_COLOR: '#4a7c59',       // Grass green
    FOOD_COLOR: '#90ee90',          // Light green

    // Creature colors
    CREATURE_HEALTHY_COLOR: 0x4169e1,   // Blue when healthy
    CREATURE_HUNGRY_COLOR: 0xff3333,    // Red when seeking food
    CREATURE_WANDERING_FADE: 0xff8833,  // Orange transition when wandering but low energy
};

// ============================================================================
// AUDIO SETTINGS
// ============================================================================

export const AUDIO_CONFIG = {
    DEATH_SOUND_VOLUME: 0.12,
    DEATH_SOUND_FREQ_START: 200,
    DEATH_SOUND_FREQ_END: 100,
    DEATH_SOUND_DURATION: 0.5,

    EAT_SOUND_VOLUME: 0.2,
    EAT_SOUND_FREQ_START: 200,
    EAT_SOUND_FREQ_END: 600,
    EAT_SOUND_DURATION: 0.1,
};
