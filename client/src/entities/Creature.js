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
        this.energy = 100;
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

        // Update visual based on energy (scale changes with energy)
        const scale = 0.5 + (this.energy / this.maxEnergy) * 0.5;
        this.mesh.scale.set(scale, scale, scale);

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
