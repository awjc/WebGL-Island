import { AUDIO_CONFIG } from '../config.js';

/**
 * SoundManager - Handles all audio using Web Audio API
 * Creates procedural sound effects without external files
 */
export class SoundManager {
    constructor() {
        // Create audio context (will be activated on first user interaction)
        this.audioContext = null;
        this.enabled = true;
    }

    /**
     * Initialize audio context on first interaction
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * Play death sound - a descending tone with slight distortion
     */
    playDeathSound() {
        if (!this.enabled) return;

        try {
            const ctx = this.initAudioContext();
            const now = ctx.currentTime;

            // Create oscillator for the main tone
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            // Connect nodes: oscillator -> gain -> output
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Descending frequency
            oscillator.frequency.setValueAtTime(AUDIO_CONFIG.DEATH_SOUND_FREQ_START, now);
            oscillator.frequency.exponentialRampToValueAtTime(
                AUDIO_CONFIG.DEATH_SOUND_FREQ_END,
                now + AUDIO_CONFIG.DEATH_SOUND_DURATION
            );

            // Fade out envelope
            gainNode.gain.setValueAtTime(AUDIO_CONFIG.DEATH_SOUND_VOLUME, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_CONFIG.DEATH_SOUND_DURATION);

            // Use a slightly harsh wave for a "sad" effect
            oscillator.type = 'sawtooth';

            // Play sound
            oscillator.start(now);
            oscillator.stop(now + AUDIO_CONFIG.DEATH_SOUND_DURATION);

        } catch (error) {
            console.warn('Could not play death sound:', error);
            this.enabled = false; // Disable if audio fails
        }
    }

    /**
     * Play eating sound - a quick positive chirp
     */
    playEatSound() {
        if (!this.enabled) return;

        try {
            const ctx = this.initAudioContext();
            const now = ctx.currentTime;

            // Create oscillator
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Quick rising chirp
            oscillator.frequency.setValueAtTime(AUDIO_CONFIG.EAT_SOUND_FREQ_START, now);
            oscillator.frequency.exponentialRampToValueAtTime(
                AUDIO_CONFIG.EAT_SOUND_FREQ_END,
                now + AUDIO_CONFIG.EAT_SOUND_DURATION
            );

            // Quick fade in and out
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(AUDIO_CONFIG.EAT_SOUND_VOLUME, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_CONFIG.EAT_SOUND_DURATION);

            oscillator.type = 'sine';

            oscillator.start(now);
            oscillator.stop(now + AUDIO_CONFIG.EAT_SOUND_DURATION);

        } catch (error) {
            console.warn('Could not play eat sound:', error);
        }
    }

    /**
     * Play birth sound - a happy rising tone
     */
    playBirthSound() {
        if (!this.enabled) return;

        try {
            const ctx = this.initAudioContext();
            const now = ctx.currentTime;

            // Create oscillator
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Rising frequency for happy sound
            oscillator.frequency.setValueAtTime(AUDIO_CONFIG.BIRTH_SOUND_FREQ_START, now);
            oscillator.frequency.exponentialRampToValueAtTime(
                AUDIO_CONFIG.BIRTH_SOUND_FREQ_END,
                now + AUDIO_CONFIG.BIRTH_SOUND_DURATION
            );

            // Quick fade in and out
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(AUDIO_CONFIG.BIRTH_SOUND_VOLUME, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_CONFIG.BIRTH_SOUND_DURATION);

            oscillator.type = 'sine';

            oscillator.start(now);
            oscillator.stop(now + AUDIO_CONFIG.BIRTH_SOUND_DURATION);

        } catch (error) {
            console.warn('Could not play birth sound:', error);
        }
    }

    /**
     * Enable/disable all sounds
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Create singleton instance
export const soundManager = new SoundManager();
