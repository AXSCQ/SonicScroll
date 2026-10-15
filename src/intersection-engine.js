/**
 * IntersectionEngine — IntersectionObserver wrapper for scroll-triggered operations.
 *
 * El IntersectionObserver se crea al observar el primer elemento, no en el
 * constructor: crear la instancia en SSR o en un navegador sin
 * IntersectionObserver ya no lanza. Sin IntersectionObserver no se puede
 * saber cuándo entra un elemento: se da por visible en el acto (mejor
 * mostrarlo que dejarlo oculto para siempre).
 */

export class IntersectionEngine {
    /**
     * @param {object} config
     * @param {string} [config.rootMargin='50px'] - Observer root margin
     * @param {number} [config.threshold=0.1] - Visibility threshold
     * @param {boolean} [config.once=true] - Run animation only once
     */
    constructor(config = {}) {
        this._rootMargin = config.rootMargin || '50px';
        this._threshold = config.threshold ?? 0.1;
        this._once = config.once ?? true;

        /** @type {Map<HTMLElement, {onEnter?: Function, onLeave?: Function}>} */
        this._callbacks = new Map();

        /** @type {IntersectionObserver|null} */
        this._observer = null;
    }

    _ensureObserver() {
        if (this._observer || typeof IntersectionObserver === 'undefined') return this._observer;
        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const cbs = this._callbacks.get(entry.target);
                if (!cbs) return;

                if (entry.isIntersecting) {
                    if (cbs.onEnter) cbs.onEnter(entry.target, entry);
                    if (this._once) {
                        this._observer?.unobserve(entry.target);
                        this._callbacks.delete(entry.target);
                    }
                } else {
                    if (cbs.onLeave) cbs.onLeave(entry.target, entry);
                }
            });
        }, {
            rootMargin: this._rootMargin,
            threshold: this._threshold
        });
        return this._observer;
    }

    /**
     * Observe an element
     * @param {HTMLElement} element
     * @param {Function} onEnter
     * @param {Function} [onLeave]
     */
    observe(element, onEnter, onLeave) {
        const observer = this._ensureObserver();
        if (!observer) {
            if (onEnter) onEnter(element, null);
            return this;
        }
        this._callbacks.set(element, { onEnter, onLeave });
        observer.observe(element);
        return this;
    }

    unobserve(element) {
        this._observer?.unobserve(element);
        this._callbacks.delete(element);
    }

    destroy() {
        this._observer?.disconnect();
        this._observer = null;
        this._callbacks.clear();
    }
}
