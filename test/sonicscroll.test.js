// node --test — SonicScroll con IntersectionObserver simulado.
import test from 'node:test';
import assert from 'node:assert/strict';

const observers = [];
const FakeIO = class {
    constructor(cb) { this.cb = cb; this.els = new Set(); observers.push(this); }
    observe(el) { this.els.add(el); }
    unobserve(el) { this.els.delete(el); }
    disconnect() { this.els.clear(); }
};
globalThis.IntersectionObserver = FakeIO;
/** Simula que `el` entra (true) o sale (false) de la vista. */
const view = (el, inView) => observers.forEach(o => o.els.has(el) && o.cb([{ target: el, isIntersecting: inView }]));
let reduce = false;
globalThis.window = { matchMedia: () => ({ matches: reduce }) };
globalThis.document = { querySelectorAll: () => [] };
const el = () => ({ style: {}, offsetWidth: 0 });

/** Un elemento que cuenta las lecturas de offsetWidth (cada una, un reflujo forzado). */
let reflows = 0;
const counted = () => ({ nodeType: 1, style: {}, get offsetWidth() { reflows++; return 100; } });
/** Deja correr los microtasks pendientes (ahí se aplican las transiciones en lote). */
const settle = () => new Promise(r => setTimeout(r, 0));

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

test('prefers-reduced-motion: se muestra al instante, sin transición', async () => {
    reduce = true;
    const e = el();
    SonicScroll.create().animate(e, 'slideLeft');
    assert.equal(e.style.opacity, '1');
    assert.equal(e.style.transition, 'none');
    reduce = false;
    await settle();
    assert.equal(e.style.transition, 'none', 'el lote le puso una transición a un elemento ya mostrado');
});

// ── v1.2.0 ──────────────────────────────────────────────────────────────────

test('30 tarjetas animadas una por una (como la Guía): un solo reflujo, no uno por elemento', async () => {
    await settle();
    reflows = 0;
    const scroll = SonicScroll.create({ threshold: 0.15, rootMargin: '0px', once: true });
    const cards = Array.from({ length: 30 }, counted);
    cards.forEach((c, i) => scroll.animate(c, 'slideUp', { distance: 18, duration: 450, delay: (i % 3) * 60 }));
    // los estados iniciales ya están escritos, sin transición y sin leer el diseño
    assert.equal(reflows, 0);
    assert.ok(cards.every(c => c.style.opacity === '0' && c.style.transition === 'none'));
    await settle();
    assert.equal(reflows, 1, `reflujos forzados: ${reflows}`);
    assert.ok(cards.every(c => c.style.transition === 'opacity 450ms ease-out, transform 450ms ease-out'));
    scroll.destroy();
});

test('animado en la misma tarea en que se preparó: aplica el estado inicial antes (anima, no salta)', () => {
    reflows = 0;
    const c = counted();
    const trigger = SonicScroll.animations.fadeIn(c, {});
    assert.equal(c.style.transition, 'none');
    trigger();
    assert.equal(reflows, 1);
    assert.equal(c.style.transition, 'opacity 700ms ease-out');
    assert.equal(c.style.opacity, '1');
});

test('destroy(): limpia los temporizadores de delay y no deja nada en opacity 0', async () => {
    const scroll = SonicScroll.create();
    const conDelay = el(), fuera = el(), visto = el();
    let plays = 0;
    const custom = (e) => { e.style.opacity = '0'; const t = () => { plays++; e.style.opacity = '1'; }; t.show = () => { e.style.opacity = '1'; }; return t; };
    scroll.animate(conDelay, custom, { delay: 30 });
    scroll.animate(fuera, 'slideUp');
    scroll.animate(visto, 'fadeIn');
    view(visto, true);
    view(conDelay, true);                 // entra: espera su delay
    scroll.destroy();                      // el componente se cierra antes
    assert.equal(conDelay.style.opacity, '1');
    assert.equal(fuera.style.opacity, '1');
    assert.equal(fuera.style.transform, 'translateY(0)');
    assert.equal(visto.style.opacity, '1');
    await new Promise(r => setTimeout(r, 50));
    assert.equal(plays, 0, 'el temporizador de delay siguió vivo después de destroy()');
});

test('un <form> o un <select> (que tienen length) es UN elemento, no la lista de sus controles', () => {
    const input = el(), button = el();
    const form = { nodeType: 1, style: {}, offsetWidth: 0, length: 2, 0: input, 1: button };
    SonicScroll.create().animate(form, 'fadeIn');
    assert.equal(form.style.opacity, '0');
    assert.equal(input.style.opacity, undefined);
    assert.equal(button.style.opacity, undefined);
    view(form, true);
    assert.equal(form.style.opacity, '1');
});

test('sin IntersectionObserver (SSR, navegador viejo): el constructor no lanza y el elemento se muestra', async () => {
    delete globalThis.IntersectionObserver;
    const win = globalThis.window, doc = globalThis.document;
    try {
        delete globalThis.window;
        delete globalThis.document;
        SonicScroll.create({ once: false }).createAudioAware();   // SSR: sin window, document ni IntersectionObserver
        globalThis.window = win;
        globalThis.document = doc;

        const scroll = SonicScroll.create();
        const aware = scroll.createAudioAware();
        const e = el();
        scroll.animate(e, 'slideUp');
        assert.equal(e.style.opacity, '1');
        aware.track(e);
        assert.equal(aware.isVisible(e), true);
        scroll.destroy();
    } finally {
        globalThis.IntersectionObserver = FakeIO;
        globalThis.window = win;
        globalThis.document = doc;
    }
});

test('data-scroll-duration="0" (y delay/distance 0) son valores válidos, no el valor por defecto', async () => {
    const attrs = { 'data-scroll': 'slideUp', 'data-scroll-duration': '0', 'data-scroll-delay': '0', 'data-scroll-distance': '0' };
    const e = { ...el(), getAttribute: (n) => attrs[n] ?? null };
    const orig = document.querySelectorAll;
    document.querySelectorAll = (sel) => sel === '[data-scroll]' ? [e] : [];
    try {
        SonicScroll.create().init();
        assert.equal(e.style.transform, 'translateY(0px)');
        await settle();
        assert.equal(e.style.transition, 'opacity 0ms ease-out, transform 0ms ease-out');
    } finally {
        document.querySelectorAll = orig;
    }
});

test('createAudioAware dos veces destruye el anterior', () => {
    const scroll = SonicScroll.create();
    const a = scroll.createAudioAware();
    const e = el();
    a.track(e);
    view(e, true);
    assert.equal(a.isVisible(e), true);
    scroll.createAudioAware();
    assert.equal(a.isVisible(e), false);
    scroll.destroy();
});
