import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { TREE_CONFIG, WORLD_CONFIG } from '../config.js';

/**
 * Tree entity - produces food periodically at random positions nearby
 * Each tree has a unique food production rate
 */
export class Tree extends Entity {
    constructor(x, z) {
        super(x, z);

        // Unique spawn rate for this tree (fruits per minute)
        this.spawnRate = TREE_CONFIG.FOOD_SPAWN_RATE_MIN +
                         Math.random() * (TREE_CONFIG.FOOD_SPAWN_RATE_MAX - TREE_CONFIG.FOOD_SPAWN_RATE_MIN);

        // Convert to seconds between spawns
        this.spawnInterval = 60 / this.spawnRate; // seconds
        this.timeSinceLastSpawn = Math.random() * this.spawnInterval; // Random initial offset

        // Track food items this tree has spawned (to enforce max limit)
        this.foodItems = [];

        // Calculate visual scale based on spawn rate (0.7x to 1.3x)
        // Higher spawn rate = larger tree
        const rateRange = TREE_CONFIG.FOOD_SPAWN_RATE_MAX - TREE_CONFIG.FOOD_SPAWN_RATE_MIN;
        const rateNormalized = (this.spawnRate - TREE_CONFIG.FOOD_SPAWN_RATE_MIN) / rateRange;
        this.visualScale = 0.7 + rateNormalized * 0.6; // Maps 0-1 to 0.7-1.3

        // Visual representation
        this.mesh = this.createTreeMesh();
    }

    /**
     * Create the 3D mesh for the tree
     */
    createTreeMesh() {
        // Create a group to hold trunk and foliage
        const treeGroup = new THREE.Group();

        // Trunk - brown cylinder
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: '#4a3728', // Dark brown
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5; // Half of trunk height
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage - green cone on top
        const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: '#2d5a3d', // Dark green
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 4; // On top of trunk
        foliage.castShadow = true;
        treeGroup.add(foliage);

        // Apply visual scale based on spawn rate
        treeGroup.scale.set(this.visualScale, this.visualScale, this.visualScale);

        // Position the tree group
        treeGroup.position.set(this.position.x, this.position.y, this.position.z);

        return treeGroup;
    }

    /**
     * Update tree - spawns food periodically
     */
    update(deltaTime, world) {
        super.update(deltaTime, world);

        this.timeSinceLastSpawn += deltaTime;

        // Remove references to food that has been consumed (permanently removed from world)
        this.foodItems = this.foodItems.filter(food =>
            !food.isConsumed && world.foodEntities.includes(food)
        );

        // Check if it's time to spawn food
        if (this.timeSinceLastSpawn >= this.spawnInterval) {
            // Check if we haven't exceeded max food limit
            if (this.foodItems.length < TREE_CONFIG.MAX_FOOD_PER_TREE) {
                this.spawnFood(world);
            }
            this.timeSinceLastSpawn = 0;
        }
    }

    /**
     * Spawn a food item at a random position near the tree
     */
    spawnFood(world) {
        // Random angle and distance within spawn radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * TREE_CONFIG.FOOD_SPAWN_RADIUS;

        const foodX = this.position.x + Math.cos(angle) * distance;
        const foodZ = this.position.z + Math.sin(angle) * distance;

        // Check if position is within island bounds
        const distFromCenter = Math.sqrt(foodX * foodX + foodZ * foodZ);
        if (distFromCenter < WORLD_CONFIG.ISLAND_USABLE_RADIUS) {
            const food = world.spawnFood(foodX, foodZ);
            this.foodItems.push(food);
        }
    }

    /**
     * Spawn initial food around the tree when it's first created
     */
    spawnInitialFood(world) {
        const count = Math.floor(
            TREE_CONFIG.INITIAL_FOOD_MIN +
            Math.random() * (TREE_CONFIG.INITIAL_FOOD_MAX - TREE_CONFIG.INITIAL_FOOD_MIN + 1)
        );

        for (let i = 0; i < count; i++) {
            this.spawnFood(world);
        }
    }

    /**
     * Create multiple trees scattered on the island
     */
    static createForest(count) {
        const trees = [];
        // Use slightly smaller radius to keep trees away from edge
        const placementRadius = WORLD_CONFIG.ISLAND_USABLE_RADIUS - 5;

        for (let i = 0; i < count; i++) {
            // Random angle and radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * placementRadius;

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            trees.push(new Tree(x, z));
        }

        return trees;
    }
}
