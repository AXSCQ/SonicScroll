# 📜 SonicScroll
**Scroll-Triggered Animation Library with Audio-Aware Mode**

![npm bundle size](https://img.shields.io/bundlephobia/minzip/sonicscroll)
![npm version](https://img.shields.io/npm/v/sonicscroll)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

**SonicScroll** is a lightweight, zero-dependency JavaScript library for scroll-triggered animations powered by the `IntersectionObserver` API. It's a modern, framework-agnostic alternative to AOS (Animate On Scroll) — with an **AudioAware** helper that tells you which elements are on screen, so the effects you drive with [SonicMotion](https://www.npmjs.com/package/sonicmotion) only touch those.

---

## ✨ Features

- 👀 **IntersectionObserver-based**: No scroll event listeners — performant by default.
- 🎬 **Built-in Animations**: `slideUp`, `fadeIn`, `scaleIn`, `slideLeft`, `slideRight`, `flipIn` — out of the box.
- 🎶 **AudioAware**: Tracks which elements are in the viewport; your audio-reactive code asks it before animating (it applies no effect by itself).
- 🧩 **Declarative API**: Use `data-scroll` HTML attributes — no JavaScript setup required for basic use.
- 🔩 **Fully Customizable**: Register custom animation functions and combine with any Web Audio API source.
- ⚡ **Zero Dependencies**: Pure JavaScript, no build tool required.

---

## 💻 Installation

```bash
npm install sonicscroll
```

```javascript
import SonicScroll from 'sonicscroll';
```

---

## 🚀 Quick Start

### Option 1: Declarative HTML (Simplest)

```html
<!-- Fades in when scrolled into view -->
<div data-scroll="fadeIn">Hello World</div>

<!-- Slides up with a 200ms delay -->
<section data-scroll="slideUp" data-scroll-delay="200">
  Delayed Section
</section>

<!-- Scales in from center -->
<img data-scroll="scaleIn" data-scroll-duration="800" src="photo.jpg" />
```

```javascript
import SonicScroll from 'sonicscroll';

const scroll = SonicScroll.create();
scroll.init(); // Scans DOM for [data-scroll] automatically
```

### Option 2: JavaScript API

```javascript
import SonicScroll from 'sonicscroll';

const scroll = SonicScroll.create({ once: true, threshold: 0.2 });

scroll.animate('#hero', 'slideUp', { delay: 100 });
scroll.animate('.card', 'fadeIn', { duration: 600 });
scroll.animate('.logo', 'scaleIn');
```

### Option 3: AudioAware (with SonicMotion)

AudioAware only knows which tracked elements are visible; the effect is yours:

```javascript
import SonicScroll from 'sonicscroll';

const scroll = SonicScroll.create();
scroll.init();

const audioAware = scroll.createAudioAware({ threshold: 0.1 }); // rootMargin, threshold
audioAware.trackAll('.pulse');                                  // or audioAware.track(element)

sonic.onFrame((data) => {
    const kick = data.drums?.bands?.bass?.punch ?? 0;
    // only the elements on screen are touched
    for (const el of audioAware.getVisible()) {
        el.style.transform = `scale(${1 + kick * 0.08})`;
    }
});
```

---

## 📐 HTML Attributes

| Attribute | Values | Description |
|---|---|---|
| `data-scroll` | animation name | Triggers animation on scroll-into-view |
| `data-scroll-delay` | milliseconds | Delay before animation triggers |
| `data-scroll-duration` | milliseconds | Duration of the animation (`0`: no animation, it just appears) |
| `data-scroll-distance` | pixels | Distance the element travels (for slide animations) |

---

## 🎞️ Built-in Animations

| Animation | Description | Defaults |
|---|---|---|
| `slideUp` | Fades in while sliding up from `distance` px below | `distance: 40`, `duration: 700` |
| `fadeIn` | Fades element in from invisible | `duration: 700` |
| `scaleIn` | Fades in while scaling from `from` (`0.8`, not 0) to full size | `from: 0.8`, `duration: 500` |
| `slideLeft` | Slides in **from the left** (starts `distance` px to the left, moves right) | `distance: 60`, `duration: 700` |
| `slideRight` | Slides in **from the right** (starts `distance` px to the right, moves left) | `distance: 60`, `duration: 700` |
| `flipIn` | Flips in from a 90° perspective angle (`axis: 'X'` or `'Y'`) | `duration: 600` |

The initial states of all the elements prepared in the same task are written first and the browser lays out **once** for all of them (not once per element). With `prefers-reduced-motion: reduce` elements are shown at once (opt out with `respectReducedMotion: false`).

### Register Custom Animations

```javascript
import { ANIMATIONS } from 'sonicscroll';

ANIMATIONS['myAnimation'] = (element, config) => {
    element.style.opacity = '0';
    element.style.transform = 'rotate(45deg)';

    return () => {
        // Called when element enters viewport
        element.style.transition = 'all 0.5s ease';
        element.style.opacity = '1';
        element.style.transform = 'rotate(0deg)';
    };
};
```

---

## 🔌 JavaScript API

```javascript
const scroll = SonicScroll.create({
    rootMargin: '50px', threshold: 0.1, once: true, respectReducedMotion: true
});

scroll.init()                                    // Auto-parse [data-scroll] elements
scroll.animate(selector, animation, config)      // selector, element, NodeList or array; { delay, duration, distance, ... }
scroll.createAudioAware(config)                  // AudioAware (a second call replaces the first)
scroll.destroy()                                 // Clean up observers and delay timers; elements not shown yet appear in their final state

// AudioAware
audioAware.track(el); audioAware.trackAll(selector);
audioAware.isVisible(el); audioAware.getVisible(); audioAware.filterVisible(list);
audioAware.destroy();
```

Without `IntersectionObserver` (very old browsers) the elements are shown right away; creating an instance during SSR does not throw.

---

## 🎵 Works Best With

- **[sonicmotion](https://www.npmjs.com/package/sonicmotion)** — Audio stem analysis and DOM animation engine
- **[sonicfx](https://www.npmjs.com/package/sonicfx)** — Advanced audio-reactive visual effects
- **[sonicwave](https://www.npmjs.com/package/sonicwave)** — Canvas waveform and spectrum visualizations

---

## 📄 License

MIT © 2025 axscq

## Cambios v1.2.0

- **Un solo reflujo**: los estados iniciales de todos los elementos preparados en la misma tarea se escriben primero y la transición se pone después de un único reflujo (antes cada elemento leía `offsetWidth`: 30 tarjetas de la Guía de LaPazPixelArt eran 30 recálculos de diseño sincrónicos; ahora 1). Si un elemento se anima en la misma tarea en que se preparó, el reflujo se adelanta y la animación sigue saliendo.
- **`destroy()`** limpia los temporizadores de `delay` y muestra en su estado final lo que no llegó a verse (antes quedaba en `opacity: 0`).
- **`animate()`** trata un `<form>` o un `<select>` como un elemento (antes, por tener `length`, animaba sus controles).
- **Sin `IntersectionObserver` o en SSR** el constructor ya no lanza (el observador se crea al primer `animate()`); sin él, los elementos se muestran en el acto.
- **`data-scroll-duration="0"`** (y `delay`/`distance` 0) son valores válidos, no el valor por defecto.
- `createAudioAware()` dos veces destruye el anterior.
- README: el "modo audio" con `selector`/`stem`/`effect` y `update(data)` no existía (AudioAware solo sabe qué está en pantalla); `slideLeft`/`slideRight` estaban invertidas y `scaleIn` empieza en 0,8, no en 0.

## Cambios v1.1.0

- **`once: false`** ahora repite de verdad: al salir de la vista el elemento vuelve a su estado inicial y se anima otra vez al volver.
- **`animate`** acepta un selector, un elemento, un array o un NodeList (antes un NodeList daba error).
- **`prefers-reduced-motion`**: si el sistema pide menos movimiento, los elementos se muestran al instante (desactivable con `respectReducedMotion: false`).
- Cada preset devuelve `trigger` con `trigger.reset()` y `trigger.show()`.
- Pruebas: `npm test` (node:test).
