import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { SimpleBrain } from '../behaviors/SimpleBrain.js';
import { soundManager } from '../utils/SoundManager.js';
import { DNA } from '../genetics/DNA.js';
import { CREATURE_CONFIG, GENETICS_CONFIG, UI_CONFIG, JUMPING_CONFIG, PHYSICS_CONFIG, PREDATOR_CONFIG } from '../config.js';
import { PredatorBrain } from '../behaviors/PredatorBrain.js';

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
            this.energy = (species === 'carnivore')
                ? PREDATOR_CONFIG.OFFSPRING_STARTING_ENERGY
                : GENETICS_CONFIG.OFFSPRING_STARTING_ENERGY;
            this.generation = parentDNA.generation ? parentDNA.generation + 1 : 1;
        } else {
            // First generation: random DNA (species-aware for correct hue range)
            this.dna = new DNA(null, species);
            this.dna.generation = 0;
            this.energy = CREATURE_CONFIG.STARTING_ENERGY_MIN +
                          Math.random() * (CREATURE_CONFIG.STARTING_ENERGY_MAX - CREATURE_CONFIG.STARTING_ENERGY_MIN);
            this.generation = 0;
        }

        this.maxEnergy = CREATURE_CONFIG.MAX_ENERGY;

        // Apply genetic modifiers to traits (predators get base speed/perception boost)
        const speedBase = (species === 'carnivore')
            ? CREATURE_CONFIG.SPEED * PREDATOR_CONFIG.SPEED_MULTIPLIER
            : CREATURE_CONFIG.SPEED;
        const perceptionBase = (species === 'carnivore')
            ? PREDATOR_CONFIG.DETECTION_RADIUS
            : CREATURE_CONFIG.PERCEPTION_RADIUS;

        this.speed = speedBase * this.dna.genes.speed;
        this.perceptionRadius = perceptionBase * this.dna.genes.perception;

        // Size-based energy modifier: size gene (0.5-2.0) directly maps to energy multiplier
        // Predators also pay an extra baseline cost for being apex predators
        const sizeEnergyMultiplier = this.dna.genes.size;
        const speciesDrainMultiplier = (species === 'carnivore') ? PREDATOR_CONFIG.ENERGY_DRAIN_MULTIPLIER : 1.0;

        this.energyDrainRate = (CREATURE_CONFIG.ENERGY_DRAIN_RATE / this.dna.genes.efficiency)
            * sizeEnergyMultiplier
            * speciesDrainMultiplier;

        this.state = 'wandering';
        this.age = 0;
        this.isDead = false;
        this.timeSinceReproduction = 0; // Cooldown timer
        this.showStateIcon = UI_CONFIG.SHOW_STATE_ICONS; // Control icon visibility

        // Jumping mechanics
        this.jumpCooldown = 0;          // Time until can jump again
        this.maxJumpHeight = this.calculateMaxJumpHeight(); // Calculated from genetics

        // AI brain: predators use PredatorBrain, herbivores use SimpleBrain
        this.brain = (species === 'carnivore') ? new PredatorBrain(this) : new SimpleBrain(this);

        // Visual geometry: predators are cones (pointy, menacing), herbivores are cubes
        const baseSize = this.dna.genes.size;
        let geometry;
        if (species === 'carnivore') {
            // Tall, sharp cone - visually menacing
            geometry = new THREE.ConeGeometry(baseSize * 0.5, baseSize * 1.4, 6);
        } else {
            geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
        }

        const material = new THREE.MeshStandardMaterial({
            color: this.dna.getColor(1.0, 'wandering'),
            roughness: 0.5,
            metalness: 0.3,
            transparent: true,
            opacity: 1.0
        });

        this.mesh = new THREE.Mesh(geometry, material);
        // Predator cone tip points up, center it so base sits on ground
        const meshYOffset = (species === 'carnivore') ? baseSize * 0.7 : 0.5 * baseSize;
        this.mesh.position.set(x, meshYOffset, z);
        this.mesh.castShadow = true;

        this.position.y = meshYOffset; // Update entity position to match

        // Create state indicator: "!" for hungry herbivores, "◆" for hunting predators
        this.createStateIndicator(baseSize);
    }

    /**
     * Create a floating state indicator sprite above the creature.
     * Herbivores show "!" when hungry; predators show "◆" when hunting.
     */
    createStateIndicator(baseSize) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 128, 128);

        // Background circle
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(64, 64, 50, 0, Math.PI * 2);
        ctx.fill();

        if (this.species === 'carnivore') {
            // Red diamond for hunting predator
            ctx.fillStyle = '#CC0000';
            ctx.font = 'bold 90px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('◆', 64, 64);
        } else {
            // Red "!" for hungry herbivore
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 100px Impact, Arial Black, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', 64, 64);
            ctx.fillText('!', 64.5, 64);
            ctx.fillText('!', 63.5, 64);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });

        this.seekingIndicator = new THREE.Sprite(material);
        this.seekingIndicator.scale.set(1.0, 1.0, 1.0);
        this.seekingIndicator.position.y = baseSize * 2.0;
        this.seekingIndicator.visible = false;

        this.mesh.add(this.seekingIndicator);
    }

    /**
     * Get ground height for creature (resting Y position above ground)
     */
    getGroundHeight() {
        if (this.species === 'carnivore') {
            return this.dna.genes.size * 0.7; // Cone center is 70% of base size up
        }
        return 0.5 * this.dna.genes.size;
    }

    /**
     * Kill a prey herbivore and gain energy from the kill
     * Called by PredatorBrain when within kill range
     */
    killPrey(prey, world) {
        if (prey.isDead) return; // Already dead (another predator got there first)

        prey.isDead = true;
        this.energy = Math.min(this.maxEnergy, this.energy + PREDATOR_CONFIG.ENERGY_FROM_KILL);

        // Play kill sound
        soundManager.playKillSound();

        world.totalDeaths++;
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

        // Show state indicator when actively seeking food (herbivores) or hunting (predators)
        if (this.seekingIndicator) {
            const isActiveState = (this.species === 'carnivore')
                ? this.state === 'hunting'
                : (this.state === 'seeking_food' || this.state === 'fleeing');
            this.seekingIndicator.visible = this.showStateIcon && isActiveState;
            this.seekingIndicator.material.opacity = opacity;
        }

        // Face movement direction
        if (this.velocity.x !== 0 || this.velocity.z !== 0) {
            const angle = Math.atan2(this.velocity.z, this.velocity.x);
            this.mesh.rotation.y = -angle;
        }
    }

    /**
     * Check if creature can reproduce (thresholds differ by species)
     */
    canReproduce() {
        const threshold = (this.species === 'carnivore')
            ? PREDATOR_CONFIG.REPRODUCTION_ENERGY_THRESHOLD
            : GENETICS_CONFIG.REPRODUCTION_ENERGY_THRESHOLD;
        const cooldown = (this.species === 'carnivore')
            ? PREDATOR_CONFIG.REPRODUCTION_COOLDOWN
            : GENETICS_CONFIG.REPRODUCTION_COOLDOWN;
        return this.energy >= threshold && this.timeSinceReproduction >= cooldown;
    }

    /**
     * Reproduce: create offspring with mutated DNA
     */
    reproduce(world) {
        // Cost energy (differs by species)
        const cost = (this.species === 'carnivore')
            ? PREDATOR_CONFIG.REPRODUCTION_ENERGY_COST
            : GENETICS_CONFIG.REPRODUCTION_ENERGY_COST;
        this.energy -= cost;
        this.timeSinceReproduction = 0;

        // Calculate spawn position near parent
        const angle = Math.random() * Math.PI * 2;
        const distance = GENETICS_CONFIG.OFFSPRING_SPAWN_DISTANCE;
        const offsetX = Math.cos(angle) * distance;
        const offsetZ = Math.sin(angle) * distance;

        // Request world to spawn offspring (same species as parent)
        world.spawnOffspring(
            this.position.x + offsetX,
            this.position.z + offsetZ,
            this.dna,
            this.species
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
