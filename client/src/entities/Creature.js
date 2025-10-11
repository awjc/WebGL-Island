import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { SimpleBrain } from '../behaviors/SimpleBrain.js';
import { soundManager } from '../utils/SoundManager.js';
import { CREATURE_CONFIG, VISUAL_CONFIG } from '../config.js';

/**
 * Creature entity - living being that moves, eats, and has energy
 */
export class Creature extends Entity {
    constructor(x, z, species = 'herbivore') {
        super(x, z);

        this.species = species;
        this.energy = CREATURE_CONFIG.STARTING_ENERGY_MIN +
                      Math.random() * (CREATURE_CONFIG.STARTING_ENERGY_MAX - CREATURE_CONFIG.STARTING_ENERGY_MIN);
        this.maxEnergy = CREATURE_CONFIG.MAX_ENERGY;
        this.speed = CREATURE_CONFIG.SPEED;
        this.perceptionRadius = CREATURE_CONFIG.PERCEPTION_RADIUS;
        this.state = 'wandering';
        this.age = 0;
        this.isDead = false;

        // AI brain for decision making
        this.brain = new SimpleBrain(this);

        // Visual: colored cube (blue for herbivore)
        const color = species === 'herbivore' ? '#4169e1' : '#e14141';
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0.5, z);
        this.mesh.castShadow = true;

        this.position.y = 0.5; // Update entity position to match
    }

    /**
     * Update creature - handles aging, energy, and AI behavior
     */
    update(deltaTime, world) {
        // Age and lose energy over time
        this.age += deltaTime;
        this.energy -= CREATURE_CONFIG.ENERGY_DRAIN_RATE * deltaTime;

        // Die if out of energy
        if (this.energy <= 0) {
            this.isDead = true;
            return;
        }

        // Run AI brain to decide behavior
        this.brain.think(deltaTime, world);

        // Apply velocity from brain decisions
        super.update(deltaTime, world);

        // Update visual based on energy
        const energyPercent = this.energy / this.maxEnergy;

        // Scale changes with energy
        const scale = CREATURE_CONFIG.MIN_SCALE +
                      energyPercent * (CREATURE_CONFIG.MAX_SCALE - CREATURE_CONFIG.MIN_SCALE);
        this.mesh.scale.set(scale, scale, scale);

        // Color changes based on state with sharper transition
        let color;
        if (this.state === 'seeking_food') {
            // Bright red when actively seeking food
            const hungerIntensity = 1 - (this.energy / CREATURE_CONFIG.HUNGER_THRESHOLD);
            color = VISUAL_CONFIG.CREATURE_HUNGRY_COLOR;
        } else {
            // Blue when wandering, fades toward orange as energy drops
            const t = 1 - energyPercent; // 0 (full energy) to 1 (low energy)

            // Extract RGB components from config colors
            const healthyR = (VISUAL_CONFIG.CREATURE_HEALTHY_COLOR >> 16) & 0xff;
            const healthyG = (VISUAL_CONFIG.CREATURE_HEALTHY_COLOR >> 8) & 0xff;
            const healthyB = VISUAL_CONFIG.CREATURE_HEALTHY_COLOR & 0xff;

            const fadeR = (VISUAL_CONFIG.CREATURE_WANDERING_FADE >> 16) & 0xff;
            const fadeG = (VISUAL_CONFIG.CREATURE_WANDERING_FADE >> 8) & 0xff;
            const fadeB = VISUAL_CONFIG.CREATURE_WANDERING_FADE & 0xff;

            // Interpolate
            const red = Math.floor(healthyR + (fadeR - healthyR) * t);
            const green = Math.floor(healthyG + (fadeG - healthyG) * t);
            const blue = Math.floor(healthyB + (fadeB - healthyB) * t);
            color = (red << 16) | (green << 8) | blue;
        }

        this.mesh.material.color.setHex(color);

        // Face movement direction
        if (this.velocity.x !== 0 || this.velocity.z !== 0) {
            const angle = Math.atan2(this.velocity.z, this.velocity.x);
            this.mesh.rotation.y = -angle;
        }
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
