/**
 * AudioAware — Bridge between SonicScroll and SonicMotion.
 * Only applies audio effects when elements are visible in the viewport.
 */
import { IntersectionEngine } from './intersection-engine.js';

export class AudioAware {
    /**
     * @param {object} config
     * @param {string} [config.rootMargin='0px']
     * @param {number} [config.threshold=0.1]
     */
    constructor(config = {}) {
        this._engine = new IntersectionEngine({
            rootMargin: config.rootMargin || '0px',
            threshold: config.threshold ?? 0.1,
            once: false  // Need to track enter/leave
        });

        /** @type {Set<HTMLElement>} */
        this._visibleElements = new Set();
    }

    /**
     * Register an element to be audio-aware
     * Audio effects should only fire when element is visible
     * @param {HTMLElement} element
     */
    track(element) {
        this._engine.observe(
            element,
            (el) => this._visibleElements.add(el),
            (el) => this._visibleElements.delete(el)
        );
        return this;
    }

    /**
     * Track all elements matching a selector
     */
    trackAll(selector) {
        document.querySelectorAll(selector).forEach(el => this.track(el));
        return this;
    }

    /**
     * Check if an element is currently visible
     */
    isVisible(element) {
        return this._visibleElements.has(element);
    }

    /**
     * Get all currently visible tracked elements
     */
    getVisible() {
        return Array.from(this._visibleElements);
    }

    /**
     * Filter a list of elements to only include visible ones
     */
    filterVisible(elements) {
        return elements.filter(el => this._visibleElements.has(el));
    }

    destroy() {
        this._engine.destroy();
        this._visibleElements.clear();
    }
}
