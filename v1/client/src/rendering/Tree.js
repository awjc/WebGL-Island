import * as THREE from 'three';
import { WORLD_CONFIG } from '../config.js';

/**
 * Tree class - creates simple decorative trees for the island
 */
export class Tree {
    constructor(x, z) {
        this.position = { x, y: 0, z };
        this.mesh = this.createTree();
    }

    createTree() {
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

        // Position the tree group
        treeGroup.position.set(this.position.x, this.position.y, this.position.z);

        return treeGroup;
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
