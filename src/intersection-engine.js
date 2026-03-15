/**
 * IntersectionEngine — IntersectionObserver wrapper for scroll-triggered operations.
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

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const cbs = this._callbacks.get(entry.target);
                if (!cbs) return;

                if (entry.isIntersecting) {
                    if (cbs.onEnter) cbs.onEnter(entry.target, entry);
                    if (this._once) {
                        this._observer.unobserve(entry.target);
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
    }

    /**
     * Observe an element
     * @param {HTMLElement} element
     * @param {Function} onEnter
     * @param {Function} [onLeave]
     */
    observe(element, onEnter, onLeave) {
        this._callbacks.set(element, { onEnter, onLeave });
        this._observer.observe(element);
        return this;
    }

    unobserve(element) {
        this._observer.unobserve(element);
        this._callbacks.delete(element);
    }

    destroy() {
        this._observer.disconnect();
        this._callbacks.clear();
    }
}
