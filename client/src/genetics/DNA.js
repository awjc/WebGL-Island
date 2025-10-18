import { GENETICS_CONFIG } from '../config.js';

/**
 * DNA class - Encodes genetic traits for creatures
 * Genes control various heritable characteristics
 */
export class DNA {
    constructor(genes = null) {
        if (genes) {
            // Clone existing genes (inheritance)
            this.genes = { ...genes };
        } else {
            // Generate random genes (first generation)
            this.genes = {
                speed: 0.8 + Math.random() * 0.4,           // 0.8 - 1.2 multiplier
                perception: 0.8 + Math.random() * 0.4,      // 0.8 - 1.2 multiplier
                efficiency: 0.8 + Math.random() * 0.4,      // 0.8 - 1.2 multiplier (affects energy drain)
                size: 0.8 + Math.random() * 0.4,            // 0.8 - 1.2 multiplier
                hue: Math.random(),                         // 0.0 - 1.0 (color variation)
                jumpPower: 0.8 + Math.random() * 0.4,       // 0.8 - 1.2 multiplier (affects jump height)
            };
        }
    }

    /**
     * Create offspring DNA with mutation
     */
    mutate() {
        const mutatedGenes = { ...this.genes };

        // Each gene has a chance to mutate
        for (const gene in mutatedGenes) {
            if (Math.random() < GENETICS_CONFIG.MUTATION_RATE) {
                // Apply mutation
                if (gene === 'hue') {
                    // Hue can shift in any direction, wraps around
                    mutatedGenes[gene] += (Math.random() - 0.5) * GENETICS_CONFIG.MUTATION_AMOUNT;
                    mutatedGenes[gene] = (mutatedGenes[gene] + 1) % 1; // Wrap to 0-1
                } else if (gene === 'size') {
                    // Size has wider range than other genes
                    mutatedGenes[gene] += (Math.random() - 0.5) * GENETICS_CONFIG.MUTATION_AMOUNT;
                    mutatedGenes[gene] = Math.max(0.5, Math.min(2.0, mutatedGenes[gene])); // Clamp 0.5 - 2.0
                } else if (gene === 'jumpPower') {
                    // Jump power has same range as size (can vary widely for evolutionary pressure)
                    mutatedGenes[gene] += (Math.random() - 0.5) * GENETICS_CONFIG.MUTATION_AMOUNT;
                    mutatedGenes[gene] = Math.max(0.5, Math.min(1.5, mutatedGenes[gene])); // Clamp 0.5 - 1.5
                } else {
                    // Other genes mutate within bounds
                    mutatedGenes[gene] += (Math.random() - 0.5) * GENETICS_CONFIG.MUTATION_AMOUNT;
                    mutatedGenes[gene] = Math.max(0.5, Math.min(1.5, mutatedGenes[gene])); // Clamp 0.5 - 1.5
                }
            }
        }

        return new DNA(mutatedGenes);
    }

    /**
     * Get color based on genetic hue
     * Creature gets darker when hungrier, but maintains its genetic hue
     */
    getColor(energyPercent, state) {
        // Base color from genetics (hue shifts the base color)
        const baseHue = this.genes.hue * 360; // Convert to degrees

        // Color based on genetic hue and energy level
        // Lower energy = darker (lower lightness), maintaining same hue
        const saturation = 50 + energyPercent * 30; // More saturated when healthy
        const lightness = 10 + energyPercent * 50;  // Very dark when hungry (10-60 range)
        return this.hslToHex(baseHue, saturation, lightness);
    }

    /**
     * Convert HSL to hex color
     */
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        const r = f(0);
        const g = f(8);
        const b = f(4);
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Get fitness score (for future use in natural selection)
     */
    getFitness() {
        // Simple fitness calculation: average of all genes
        const values = Object.values(this.genes).filter(v => v !== this.genes.hue);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
}
