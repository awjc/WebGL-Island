import * as THREE from 'three';
import { Entity } from '../core/Entity.js';
import { TREE_CONFIG, WORLD_CONFIG, JUMPING_CONFIG } from '../config.js';

/**
 * Tree entity - produces food periodically at random positions nearby
 * Each tree has a unique food production rate, height, and width
 */
export class Tree extends Entity {
    constructor(x, z) {
        super(x, z);

        // Disable gravity for trees (they're rooted in place)
        this.affectedByGravity = false;

        // Unique spawn rate for this tree (fruits per minute)
        this.spawnRate = TREE_CONFIG.FOOD_SPAWN_RATE_MIN +
                         Math.random() * (TREE_CONFIG.FOOD_SPAWN_RATE_MAX - TREE_CONFIG.FOOD_SPAWN_RATE_MIN);

        // Convert to seconds between spawns
        this.spawnInterval = 60 / this.spawnRate; // seconds
        this.timeSinceLastSpawn = Math.random() * this.spawnInterval; // Random initial offset

        // Track food items this tree has spawned (to enforce max limit)
        this.foodItems = [];

        // Tree dimensions (separate height and width for evolutionary pressure)
        this.height = TREE_CONFIG.HEIGHT_MIN +
                      Math.random() * (TREE_CONFIG.HEIGHT_MAX - TREE_CONFIG.HEIGHT_MIN);

        // Width (canopy radius) varies from 1m to 3m
        this.width = 1 + Math.random() * 2;

        // Trunk dimensions scale with height
        this.trunkHeight = this.height * 0.6; // Trunk is 60% of total height
        this.trunkRadius = 0.2 + (this.height / 20); // Thicker trunk for taller trees

        // Visual representation
        this.mesh = this.createTreeMesh();
    }

    /**
     * Create the 3D mesh for the tree using actual height and width dimensions
     */
    createTreeMesh() {
        // Create a group to hold trunk and foliage
        const treeGroup = new THREE.Group();

        // Trunk - brown cylinder (tapered slightly)
        const trunkTopRadius = this.trunkRadius * 0.8;
        const trunkBottomRadius = this.trunkRadius;
        const trunkGeometry = new THREE.CylinderGeometry(
            trunkTopRadius,
            trunkBottomRadius,
            this.trunkHeight,
            8
        );
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: '#4a3728', // Dark brown
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = this.trunkHeight / 2; // Center at half height
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage - green cone on top (height is remaining 40% of tree)
        const foliageHeight = this.height - this.trunkHeight;
        const foliageGeometry = new THREE.ConeGeometry(this.width, foliageHeight, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: '#2d5a3d', // Dark green
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = this.trunkHeight + foliageHeight / 2; // On top of trunk
        foliage.castShadow = true;
        treeGroup.add(foliage);

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
     * Spawn a food item at a random position near and ON the tree (vertical placement)
     */
    spawnFood(world) {
        // Random angle and distance within spawn radius (horizontal)
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * TREE_CONFIG.FOOD_SPAWN_RADIUS;

        const foodX = this.position.x + Math.cos(angle) * distance;
        const foodZ = this.position.z + Math.sin(angle) * distance;

        // Check if position is within island bounds
        const distFromCenter = Math.sqrt(foodX * foodX + foodZ * foodZ);
        if (distFromCenter < WORLD_CONFIG.ISLAND_USABLE_RADIUS) {
            // Calculate food height based on configuration bias
            // bias = 0: all food at ground
            // bias = 0.5: uniform distribution
            // bias = 1: all food at top
            const heightDistribution = Math.pow(Math.random(), 2 - JUMPING_CONFIG.FOOD_HEIGHT_BIAS * 2);
            const minHeight = JUMPING_CONFIG.FOOD_HEIGHT_MIN * this.height;
            const maxHeight = JUMPING_CONFIG.FOOD_HEIGHT_MAX * this.height;
            const foodY = minHeight + heightDistribution * (maxHeight - minHeight);

            // Spawn food at the calculated height
            const food = world.spawnFood(foodX, foodZ, foodY);

            // Mark food as attached to tree (won't fall due to gravity)
            food.isAttachedToTree = true;

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
