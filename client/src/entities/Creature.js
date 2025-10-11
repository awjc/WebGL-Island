import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { SimpleBrain } from '../behaviors/SimpleBrain.js';

/**
 * Creature entity - living being that moves, eats, and has energy
 */
export class Creature extends Entity {
    constructor(x, z, species = 'herbivore') {
        super(x, z);

        this.species = species;
        this.energy = 60; // Start at 60% energy (hungry sooner for testing)
        this.maxEnergy = 100;
        this.speed = 5; // Units per second
        this.perceptionRadius = 15; // How far creature can "see"
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
        this.energy -= 2 * deltaTime; // Lose 2 energy per second

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
        const scale = 0.5 + energyPercent * 0.5;
        this.mesh.scale.set(scale, scale, scale);

        // Color changes with energy: blue (healthy) -> red (hungry)
        // Interpolate between blue (#4169e1) and red (#e14141)
        const red = Math.floor(0x41 + (0xe1 - 0x41) * (1 - energyPercent));
        const green = Math.floor(0x69 + (0x41 - 0x69) * (1 - energyPercent));
        const blue = Math.floor(0xe1 + (0x41 - 0xe1) * (1 - energyPercent));

        const color = (red << 16) | (green << 8) | blue;
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
    }
}
