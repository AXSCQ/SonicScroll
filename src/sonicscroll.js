/**
 * SonicScroll — Scroll-triggered animation library with audio-aware mode.
 * Lightweight replacement for AOS (Animate On Scroll) with SonicMotion integration.
 * 
 * @version 1.0.0
 */

import { IntersectionEngine } from './intersection-engine.js';
import { ANIMATIONS, slideUp, fadeIn, scaleIn, slideLeft, slideRight, flipIn } from './animations/presets.js';
import { AudioAware } from './audio-aware.js';

class SonicScrollInstance {
    /**
     * @param {object} config
     * @param {string} [config.rootMargin='50px'] - Observer root margin
     * @param {number} [config.threshold=0.1] - Visibility threshold
     * @param {boolean} [config.once=true] - Animate only once
     */
    constructor(config = {}) {
        this._engine = new IntersectionEngine({
            rootMargin: config.rootMargin || '50px',
            threshold: config.threshold ?? 0.1,
            once: config.once ?? true
        });
        this._audioAware = null;
        this._triggers = [];
    }

    /**
     * Parse DOM for [data-scroll] elements and set up animations
     */
    init() {
        const elements = document.querySelectorAll('[data-scroll]');

        elements.forEach(el => {
            const animationName = el.getAttribute('data-scroll') || 'slideUp';
            const delay = parseInt(el.getAttribute('data-scroll-delay')) || 0;
            const duration = parseInt(el.getAttribute('data-scroll-duration')) || undefined;
            const distance = parseInt(el.getAttribute('data-scroll-distance')) || undefined;

            this.animate(el, animationName, { delay, duration, distance });
        });

        return this;
    }

    /**
     * Apply a scroll-triggered animation to an element
     * @param {HTMLElement|string} selector
     * @param {string|Function} animation - Animation name or custom function
     * @param {object} config - { delay, duration, distance, ... }
     */
    animate(selector, animation, config = {}) {
        const elements = typeof selector === 'string'
            ? Array.from(document.querySelectorAll(selector))
            : [selector];

        const animFn = typeof animation === 'function'
            ? animation
            : ANIMATIONS[animation];

        if (!animFn) {
            console.warn(`SonicScroll: Unknown animation "${animation}"`);
            return this;
        }

        elements.forEach(el => {
            const trigger = animFn(el, config);
            const delay = config.delay || 0;

            this._engine.observe(el, () => {
                if (delay > 0) {
                    setTimeout(() => trigger(), delay);
                } else {
                    trigger();
                }
            });

            this._triggers.push({ element: el, trigger });
        });

        return this;
    }

    /**
     * Create an AudioAware instance for viewport-based audio effects
     */
    createAudioAware(config = {}) {
        this._audioAware = new AudioAware(config);
        return this._audioAware;
    }

    /**
     * Clean up all observers
     */
    destroy() {
        this._engine.destroy();
        if (this._audioAware) this._audioAware.destroy();
        this._triggers = [];
    }
}

// Static factory
const SonicScroll = {
    create(config = {}) {
        return new SonicScrollInstance(config);
    },
    animations: ANIMATIONS,
    AudioAware,
    IntersectionEngine,
    version: '1.0.0'
};

export default SonicScroll;
export {
    SonicScroll,
    SonicScrollInstance,
    IntersectionEngine,
    AudioAware,
    slideUp, fadeIn, scaleIn, slideLeft, slideRight, flipIn,
    ANIMATIONS
};
