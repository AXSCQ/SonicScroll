/**
 * SonicScroll — Scroll-triggered animation library with audio-aware mode.
 * Lightweight replacement for AOS (Animate On Scroll) with SonicMotion integration.
 *
 * @version 1.2.0
 */

import { IntersectionEngine } from './intersection-engine.js';
import { ANIMATIONS, slideUp, fadeIn, scaleIn, slideLeft, slideRight, flipIn, flushInitialStates } from './animations/presets.js';
import { AudioAware } from './audio-aware.js';

/** Número entero de un atributo; vacío o inválido → undefined (0 es válido). */
function intAttr(el, name) {
    const v = parseInt(el.getAttribute(name), 10);
    return Number.isFinite(v) ? v : undefined;
}

class SonicScrollInstance {
    /**
     * @param {object} config
     * @param {string} [config.rootMargin='50px'] - Observer root margin
     * @param {number} [config.threshold=0.1] - Visibility threshold
     * @param {boolean} [config.once=true] - Animate only once
     * @param {boolean} [config.respectReducedMotion=true] - con prefers-reduced-motion, mostrar sin animar
     */
    constructor(config = {}) {
        this._once = config.once ?? true;
        // el IntersectionObserver se crea al primer animate(): en SSR o sin
        // IntersectionObserver el constructor ya no lanza
        this._engine = new IntersectionEngine({
            rootMargin: config.rootMargin || '50px',
            threshold: config.threshold ?? 0.1,
            once: this._once
        });
        // prefers-reduced-motion: elements are shown at once, without moving
        this._reducedMotion = config.respectReducedMotion !== false
            && typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this._audioAware = null;
        /** @type {Array<{element: HTMLElement, trigger: Function, timer: any, shown: boolean}>} */
        this._triggers = [];
    }

    /**
     * Parse DOM for [data-scroll] elements and set up animations
     */
    init() {
        const elements = document.querySelectorAll('[data-scroll]');

        elements.forEach(el => {
            const animationName = el.getAttribute('data-scroll') || 'slideUp';
            // 0 es un valor válido (data-scroll-duration="0": sin animación);
            // `parseInt(...) || undefined` lo convertía en el valor por defecto
            const delay = intAttr(el, 'data-scroll-delay') ?? 0;
            const duration = intAttr(el, 'data-scroll-duration');
            const distance = intAttr(el, 'data-scroll-distance');

            this.animate(el, animationName, { delay, duration, distance });
        });

        return this;
    }

    /**
     * Apply a scroll-triggered animation to an element
     * @param {HTMLElement|string|NodeList|HTMLElement[]} selector
     * @param {string|Function} animation - Animation name or custom function
     * @param {object} config - { delay, duration, distance, ... }
     */
    animate(selector, animation, config = {}) {
        // a selector, one element, a NodeList or an array (a NodeList used to
        // be treated as a single element and threw). Un elemento va primero:
        // un <form> o un <select> también tienen `length` y se tomaban como
        // la lista de sus controles.
        const elements = typeof selector === 'string'
            ? Array.from(document.querySelectorAll(selector))
            : (selector && selector.nodeType === 1) ? [selector]
            : (typeof selector?.length === 'number' ? Array.from(selector) : [selector]).filter(Boolean);

        const animFn = typeof animation === 'function'
            ? animation
            : ANIMATIONS[animation];

        if (!animFn) {
            console.warn(`SonicScroll: Unknown animation "${animation}"`);
            return this;
        }

        elements.forEach(el => {
            const trigger = animFn(el, config);
            const record = { element: el, trigger, timer: null, shown: false };
            this._triggers.push(record);
            if (this._reducedMotion) {
                (trigger.show ?? trigger)();
                record.shown = true;
                return;
            }
            const delay = config.delay || 0;
            const play = () => {
                record.timer = null;
                record.shown = true;
                trigger();
            };

            this._engine.observe(el, () => {
                clearTimeout(record.timer);
                if (delay > 0) record.timer = setTimeout(play, delay);
                else play();
            }, this._once ? undefined : () => {
                // out of view: back to the initial state, so it plays again
                clearTimeout(record.timer);
                record.timer = null;
                if (typeof trigger.reset === 'function') {
                    trigger.reset();
                    record.shown = false;
                }
            });
        });

        return this;
    }

    /**
     * Create an AudioAware instance for viewport-based audio effects
     * (dice qué elementos están en pantalla; los efectos los pone quien lo usa)
     */
    createAudioAware(config = {}) {
        if (this._audioAware) this._audioAware.destroy();
        this._audioAware = new AudioAware(config);
        return this._audioAware;
    }

    /**
     * Clean up all observers
     * Lo que no llegó a mostrarse (fuera de la vista o esperando su `delay`)
     * queda en su estado final, sin transición: antes quedaba en opacity 0 y
     * los temporizadores de `delay` seguían vivos.
     */
    destroy() {
        this._engine.destroy();
        if (this._audioAware) this._audioAware.destroy();
        this._audioAware = null;
        for (const r of this._triggers) {
            clearTimeout(r.timer);
            r.timer = null;
            if (!r.shown) {
                r.shown = true;
                if (typeof r.trigger.show === 'function') r.trigger.show();
                else r.trigger();
            }
        }
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
    flushInitialStates,
    version: '1.2.0'
};

export default SonicScroll;
export {
    SonicScroll,
    SonicScrollInstance,
    IntersectionEngine,
    AudioAware,
    slideUp, fadeIn, scaleIn, slideLeft, slideRight, flipIn,
    ANIMATIONS,
    flushInitialStates
};
