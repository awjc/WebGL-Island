import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { SimpleBrain } from '../behaviors/SimpleBrain.js';
import { soundManager } from '../utils/SoundManager.js';
import { DNA } from '../genetics/DNA.js';
import { CREATURE_CONFIG, GENETICS_CONFIG, UI_CONFIG, JUMPING_CONFIG, PHYSICS_CONFIG } from '../config.js';

/**
 * Creature entity - living being that moves, eats, and has energy
 */
export class Creature extends Entity {
    constructor(x, z, species = 'herbivore', parentDNA = null) {
        super(x, z);

        this.species = species;

        // Genetics: inherit or create new DNA
        if (parentDNA) {
            // Offspring: inherit and mutate
            this.dna = parentDNA.mutate();
            this.energy = GENETICS_CONFIG.OFFSPRING_STARTING_ENERGY;
            this.generation = parentDNA.generation ? parentDNA.generation + 1 : 1;
        } else {
            // First generation: random DNA
            this.dna = new DNA();
            this.dna.generation = 0;
            this.energy = CREATURE_CONFIG.STARTING_ENERGY_MIN +
                          Math.random() * (CREATURE_CONFIG.STARTING_ENERGY_MAX - CREATURE_CONFIG.STARTING_ENERGY_MIN);
            this.generation = 0;
        }

        this.maxEnergy = CREATURE_CONFIG.MAX_ENERGY;

        // Apply genetic modifiers to traits
        this.speed = CREATURE_CONFIG.SPEED * this.dna.genes.speed;
        this.perceptionRadius = CREATURE_CONFIG.PERCEPTION_RADIUS * this.dna.genes.perception;

        // Size-based energy modifier: size gene (0.5-2.0) directly maps to energy multiplier
        // Larger creatures use more energy (direct linear mapping: 0.5->0.5x, 1.0->1.0x, 2.0->2.0x)
        const sizeEnergyMultiplier = this.dna.genes.size;

        this.energyDrainRate = (CREATURE_CONFIG.ENERGY_DRAIN_RATE / this.dna.genes.efficiency) * sizeEnergyMultiplier;

        this.state = 'wandering';
        this.age = 0;
        this.isDead = false;
        this.timeSinceReproduction = 0; // Cooldown timer
        this.showStateIcon = UI_CONFIG.SHOW_STATE_ICONS; // Control icon visibility

        // Jumping mechanics
        this.jumpCooldown = 0;          // Time until can jump again
        this.maxJumpHeight = this.calculateMaxJumpHeight(); // Calculated from genetics

        // AI brain for decision making
        this.brain = new SimpleBrain(this);

        // Visual: colored cube with genetic variation
        const baseSize = this.dna.genes.size;
        const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
        const material = new THREE.MeshStandardMaterial({
            color: this.dna.getColor(1.0, 'wandering'),
            roughness: 0.7,
            metalness: 0.1,
            transparent: true,
            opacity: 1.0
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0.5 * baseSize, z);
        this.mesh.castShadow = true;

        this.position.y = 0.5 * baseSize; // Update entity position to match

        // Create "!" indicator for seeking food state
        this.createSeekingIndicator(baseSize);
    }

    /**
     * Create the "!" indicator that shows when seeking food
     */
    createSeekingIndicator(baseSize) {
        // Create a sprite for the "!" indicator
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Clear canvas with transparency
        ctx.clearRect(0, 0, 128, 128);

        // Draw white background circle for visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(64, 64, 50, 0, Math.PI * 2);
        ctx.fill();

        // Draw red "!" on canvas - bolder and wider
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 100px Impact, Arial Black, sans-serif'; // Wider, bolder font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw multiple times for extra boldness
        ctx.fillText('!', 64, 64);
        ctx.fillText('!', 64.5, 64); // Slight offset for extra thickness
        ctx.fillText('!', 63.5, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false // Always visible on top
        });

        this.seekingIndicator = new THREE.Sprite(material);
        this.seekingIndicator.scale.set(1.0, 1.0, 1.0); // Bigger scale
        this.seekingIndicator.position.y = baseSize * 2.0; // Higher above creature
        this.seekingIndicator.visible = false;

        this.mesh.add(this.seekingIndicator);
    }

    /**
     * Get ground height for creature (half its size above ground)
     */
    getGroundHeight() {
        return 0.5 * this.dna.genes.size;
    }

    /**
     * Calculate maximum jump height from genetics
     * Uses physics formula: height = velocity² / (2 * gravity)
     */
    calculateMaxJumpHeight() {
        if (!JUMPING_CONFIG.ENABLED) return 0;

        const jumpVelocity = JUMPING_CONFIG.BASE_JUMP_VELOCITY * this.dna.genes.jumpPower;
        return (jumpVelocity * jumpVelocity) / (2 * PHYSICS_CONFIG.GRAVITY);
    }

    /**
     * Attempt to jump (if conditions are met)
     * @returns {boolean} True if jump was successful
     */
    jump() {
        if (!JUMPING_CONFIG.ENABLED) return false;
        if (!this.isGrounded) return false;
        if (this.jumpCooldown > 0) return false;

        // Calculate energy cost (scales with jump power and size)
        const energyCost = JUMPING_CONFIG.JUMP_ENERGY_COST_BASE *
            this.dna.genes.jumpPower *
            JUMPING_CONFIG.JUMP_ENERGY_SCALING *
            this.dna.genes.size; // Larger creatures pay more

        // Check if enough energy
        if (this.energy < energyCost) return false;

        // Apply jump velocity
        const jumpVelocity = JUMPING_CONFIG.BASE_JUMP_VELOCITY * this.dna.genes.jumpPower;
        this.velocity.y = jumpVelocity;

        // Deduct energy
        this.energy -= energyCost;

        // Start cooldown
        this.jumpCooldown = JUMPING_CONFIG.JUMP_COOLDOWN;

        return true;
    }

    /**
     * Update creature - handles aging, energy, and AI behavior
     */
    update(deltaTime, world) {
        // Age and lose energy over time (affected by genetic efficiency)
        this.age += deltaTime;
        this.timeSinceReproduction += deltaTime;
        this.energy -= this.energyDrainRate * deltaTime;

        // Update jump cooldown
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= deltaTime;
        }

        // Die if out of energy
        if (this.energy <= 0) {
            this.isDead = true;
            return;
        }

        // Check for reproduction opportunity
        if (this.canReproduce()) {
            this.reproduce(world);
        }

        // Run AI brain to decide behavior
        this.brain.think(deltaTime, world);

        // Apply velocity from brain decisions
        super.update(deltaTime, world);

        // Update visual based on energy and genetics
        const energyPercent = this.energy / this.maxEnergy;

        // Size is fixed based on genetics (no energy-based scaling)
        // Scale is already set based on genetic size in constructor

        // Color from DNA based on state and energy
        const color = this.dna.getColor(energyPercent, this.state);
        this.mesh.material.color.setHex(color);

        // Opacity fades as creature gets hungrier (fading away from earth)
        const opacity = 0.3 + energyPercent * 0.7; // Range: 0.3 (very hungry) to 1.0 (full)
        this.mesh.material.opacity = opacity;

        // Show "!" indicator when actively seeking food (if icons are enabled)
        if (this.seekingIndicator) {
            this.seekingIndicator.visible = this.showStateIcon && (this.state === 'seeking_food');
            // Fade indicator opacity to match creature
            this.seekingIndicator.material.opacity = opacity;
        }

        // Face movement direction
        if (this.velocity.x !== 0 || this.velocity.z !== 0) {
            const angle = Math.atan2(this.velocity.z, this.velocity.x);
            this.mesh.rotation.y = -angle;
        }
    }

    /**
     * Check if creature can reproduce
     */
    canReproduce() {
        return this.energy >= GENETICS_CONFIG.REPRODUCTION_ENERGY_THRESHOLD &&
               this.timeSinceReproduction >= GENETICS_CONFIG.REPRODUCTION_COOLDOWN;
    }

    /**
     * Reproduce: create offspring with mutated DNA
     */
    reproduce(world) {
        // Cost energy
        this.energy -= GENETICS_CONFIG.REPRODUCTION_ENERGY_COST;
        this.timeSinceReproduction = 0;

        // Calculate spawn position near parent
        const angle = Math.random() * Math.PI * 2;
        const distance = GENETICS_CONFIG.OFFSPRING_SPAWN_DISTANCE;
        const offsetX = Math.cos(angle) * distance;
        const offsetZ = Math.sin(angle) * distance;

        // Request world to spawn offspring
        world.spawnOffspring(
            this.position.x + offsetX,
            this.position.z + offsetZ,
            this.dna
        );
    }

    /**
     * Eat food to restore energy
     */
    eat(food) {
        this.energy = Math.min(this.maxEnergy, this.energy + food.nutrition);
        food.consume();

        // Play eating sound
        soundManager.playEatSound();
    }

    /**
     * Set whether state icons should be shown
     */
    setShowStateIcon(show) {
        this.showStateIcon = show;
    }
}
