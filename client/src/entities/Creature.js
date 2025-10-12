import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { SimpleBrain } from '../behaviors/SimpleBrain.js';
import { soundManager } from '../utils/SoundManager.js';
import { DNA } from '../genetics/DNA.js';
import { CREATURE_CONFIG, GENETICS_CONFIG } from '../config.js';

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
        this.energyDrainRate = CREATURE_CONFIG.ENERGY_DRAIN_RATE / this.dna.genes.efficiency;

        this.state = 'wandering';
        this.age = 0;
        this.isDead = false;
        this.timeSinceReproduction = 0; // Cooldown timer

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

        // Draw red "!" on canvas
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 96px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 64, 64);

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
     * Update creature - handles aging, energy, and AI behavior
     */
    update(deltaTime, world) {
        // Age and lose energy over time (affected by genetic efficiency)
        this.age += deltaTime;
        this.timeSinceReproduction += deltaTime;
        this.energy -= this.energyDrainRate * deltaTime;

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

        // Scale changes with energy
        const scale = CREATURE_CONFIG.MIN_SCALE +
                      energyPercent * (CREATURE_CONFIG.MAX_SCALE - CREATURE_CONFIG.MIN_SCALE);
        this.mesh.scale.set(scale, scale, scale);

        // Color from DNA based on state and energy
        const color = this.dna.getColor(energyPercent, this.state);
        this.mesh.material.color.setHex(color);

        // Opacity fades as creature gets hungrier (fading away from earth)
        const opacity = 0.3 + energyPercent * 0.7; // Range: 0.3 (very hungry) to 1.0 (full)
        this.mesh.material.opacity = opacity;

        // Show "!" indicator when actively seeking food
        if (this.seekingIndicator) {
            this.seekingIndicator.visible = (this.state === 'seeking_food');
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
}
