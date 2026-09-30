// node --test — SonicScroll con IntersectionObserver simulado.
import test from 'node:test';
import assert from 'node:assert/strict';

const observers = [];
globalThis.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; this.els = new Set(); observers.push(this); }
    observe(el) { this.els.add(el); }
    unobserve(el) { this.els.delete(el); }
    disconnect() { this.els.clear(); }
};
/** Simula que `el` entra (true) o sale (false) de la vista. */
const view = (el, inView) => observers.forEach(o => o.els.has(el) && o.cb([{ target: el, isIntersecting: inView }]));
let reduce = false;
globalThis.window = { matchMedia: () => ({ matches: reduce }) };
globalThis.document = { querySelectorAll: () => [] };
const el = () => ({ style: {}, offsetWidth: 0 });

const { SonicScroll } = await import('../src/sonicscroll.js');

test('entra en vista → animación al estado final', () => {
    const e = el();
    SonicScroll.create().animate(e, 'slideUp');
    assert.equal(e.style.opacity, '0');
    view(e, true);
    assert.equal(e.style.opacity, '1');
    assert.equal(e.style.transform, 'translateY(0)');
});

test('once: false → al salir vuelve al inicio y se repite al volver', () => {
    const e = el();
    SonicScroll.create({ once: false }).animate(e, 'fadeIn');
    view(e, true); assert.equal(e.style.opacity, '1');
    view(e, false); assert.equal(e.style.opacity, '0');
    view(e, true); assert.equal(e.style.opacity, '1');
});

test('acepta un array (o NodeList) de elementos', () => {
    const a = el(), b = el();
    SonicScroll.create().animate([a, b], 'scaleIn');
    view(a, true); view(b, true);
    assert.equal(a.style.opacity, '1');
    assert.equal(b.style.opacity, '1');
});

test('prefers-reduced-motion: se muestra al instante, sin transición', () => {
    reduce = true;
    const e = el();
    SonicScroll.create().animate(e, 'slideLeft');
    assert.equal(e.style.opacity, '1');
    assert.equal(e.style.transition, 'none');
    reduce = false;
});
