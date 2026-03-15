/**
 * Scroll Animation Presets
 * Pre-defined animation functions for common scroll-triggered effects
 */

/**
 * Slide up animation  
 * Extracted from AstroPrueba animations.js
 */
export function slideUp(element, config = {}) {
    const duration = config.duration ?? 700;
    const distance = config.distance ?? 40;

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = `translateY(${distance}px)`;
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    return () => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    };
}

/**
 * Fade in animation
 */
export function fadeIn(element, config = {}) {
    const duration = config.duration ?? 700;

    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out`;

    return () => {
        element.style.opacity = '1';
    };
}

/**
 * Scale in animation
 */
export function scaleIn(element, config = {}) {
    const duration = config.duration ?? 500;
    const from = config.from ?? 0.8;

    element.style.opacity = '0';
    element.style.transform = `scale(${from})`;
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    return () => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
    };
}

/**
 * Slide from left
 */
export function slideLeft(element, config = {}) {
    const duration = config.duration ?? 700;
    const distance = config.distance ?? 60;

    element.style.opacity = '0';
    element.style.transform = `translateX(-${distance}px)`;
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    return () => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
    };
}

/**
 * Slide from right
 */
export function slideRight(element, config = {}) {
    const duration = config.duration ?? 700;
    const distance = config.distance ?? 60;

    element.style.opacity = '0';
    element.style.transform = `translateX(${distance}px)`;
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    return () => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
    };
}

/**
 * Flip in animation
 */
export function flipIn(element, config = {}) {
    const duration = config.duration ?? 600;
    const axis = config.axis || 'X';

    element.style.opacity = '0';
    element.style.transform = `perspective(600px) rotate${axis}(90deg)`;
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    return () => {
        element.style.opacity = '1';
        element.style.transform = `perspective(600px) rotate${axis}(0)`;
    };
}

export const ANIMATIONS = {
    slideUp,
    fadeIn,
    scaleIn,
    slideLeft,
    slideRight,
    flipIn
};
