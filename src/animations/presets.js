/**
 * Scroll Animation Presets
 * Pre-defined animation functions for common scroll-triggered effects.
 *
 * Each preset puts the element in its initial state and returns a `trigger`
 * that plays the entrance. The trigger also carries `trigger.reset()`, which
 * puts the element back in the initial state — used by `once: false` so the
 * animation plays again every time the element comes back into view.
 */

/**
 * Build a preset from its initial and final styles.
 * @param {HTMLElement} element
 * @param {object} config
 * @param {object} from - initial inline styles
 * @param {object} to - final inline styles
 * @param {number} defaultDuration
 */
function preset(element, config, from, to, defaultDuration) {
    const duration = config.duration ?? defaultDuration;
    const props = Object.keys(to).map(p => p.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`));
    const apply = (styles) => { for (const [k, v] of Object.entries(styles)) element.style[k] = v; };

    const reset = () => {
        element.style.transition = 'none';
        apply(from);
        // force the initial state before re-enabling the transition
        void element.offsetWidth;
        element.style.transition = props.map(p => `${p} ${duration}ms ease-out`).join(', ');
    };
    reset();

    const trigger = () => apply(to);
    trigger.reset = reset;
    trigger.show = () => { element.style.transition = 'none'; apply(to); };
    return trigger;
}

/**
 * Slide up animation
 * Extracted from AstroPrueba animations.js
 */
export function slideUp(element, config = {}) {
    const distance = config.distance ?? 40;
    return preset(element, config,
        { opacity: '0', transform: `translateY(${distance}px)` },
        { opacity: '1', transform: 'translateY(0)' }, 700);
}

/** Fade in animation */
export function fadeIn(element, config = {}) {
    return preset(element, config, { opacity: '0' }, { opacity: '1' }, 700);
}

/** Scale in animation */
export function scaleIn(element, config = {}) {
    const from = config.from ?? 0.8;
    return preset(element, config,
        { opacity: '0', transform: `scale(${from})` },
        { opacity: '1', transform: 'scale(1)' }, 500);
}

/** Slide from left */
export function slideLeft(element, config = {}) {
    const distance = config.distance ?? 60;
    return preset(element, config,
        { opacity: '0', transform: `translateX(-${distance}px)` },
        { opacity: '1', transform: 'translateX(0)' }, 700);
}

/** Slide from right */
export function slideRight(element, config = {}) {
    const distance = config.distance ?? 60;
    return preset(element, config,
        { opacity: '0', transform: `translateX(${distance}px)` },
        { opacity: '1', transform: 'translateX(0)' }, 700);
}

/** Flip in animation */
export function flipIn(element, config = {}) {
    const axis = config.axis || 'X';
    return preset(element, config,
        { opacity: '0', transform: `perspective(600px) rotate${axis}(90deg)` },
        { opacity: '1', transform: `perspective(600px) rotate${axis}(0)` }, 600);
}

export const ANIMATIONS = {
    slideUp,
    fadeIn,
    scaleIn,
    slideLeft,
    slideRight,
    flipIn
};
