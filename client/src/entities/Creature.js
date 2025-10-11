import * as THREE from 'three';
import { Entity } from '../core/Entity.js';

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

        // Simple wandering behavior state
        this.wanderTimer = 0;
        this.wanderDirection = this.randomDirection();

        // Visual: colored cube (blue for herbivore)
        const color = species === 'herbivore' ? 0x4169e1 : 0xe14141;
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
     * Update creature - handles aging, energy, and basic movement
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

        // Simple wandering behavior (will be replaced with brain in next iteration)
        this.wander(deltaTime);

        // Apply velocity from wandering
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
     * Simple wandering behavior - changes direction randomly
     */
    wander(deltaTime) {
        this.wanderTimer += deltaTime;

        // Change direction every 3 seconds
        if (this.wanderTimer > 3) {
            this.wanderDirection = this.randomDirection();
            this.wanderTimer = 0;
        }

        // Set velocity in wander direction
        this.velocity.x = this.wanderDirection.x * this.speed;
        this.velocity.z = this.wanderDirection.z * this.speed;
    }

    /**
     * Generate random direction vector
     */
    randomDirection() {
        const angle = Math.random() * Math.PI * 2;
        return { x: Math.cos(angle), z: Math.sin(angle) };
    }

    /**
     * Eat food to restore energy
     */
    eat(food) {
        this.energy = Math.min(this.maxEnergy, this.energy + food.nutrition);
        food.consume();
    }
}
