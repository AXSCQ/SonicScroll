# 📜 SonicScroll
**Scroll-Triggered Animation Library with Audio-Aware Mode**

![npm bundle size](https://img.shields.io/bundlephobia/minzip/sonicscroll)
![npm version](https://img.shields.io/npm/v/sonicscroll)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

**SonicScroll** is a lightweight, zero-dependency JavaScript library for scroll-triggered animations powered by the `IntersectionObserver` API. It's a modern, framework-agnostic alternative to AOS (Animate On Scroll) — with an optional **audio-aware mode** that lets scroll animations react to music via [SonicMotion](https://www.npmjs.com/package/sonicmotion).

---

## ✨ Features

- 👀 **IntersectionObserver-based**: No scroll event listeners — performant by default.
- 🎬 **Built-in Animations**: `slideUp`, `fadeIn`, `scaleIn`, `slideLeft`, `slideRight`, `flipIn` — out of the box.
- 🎶 **Audio-Aware Mode**: Elements in the viewport can pulse or react to audio energy when music is playing.
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

### Option 3: Audio-Aware Mode (with SonicMotion)

```javascript
import SonicScroll from 'sonicscroll';

const scroll = SonicScroll.create();
scroll.init();

// Elements in viewport will pulse with the music
const audioAware = scroll.createAudioAware({
    selector: '[data-scroll]',   // Elements to watch
    stem: 'kick',                // Audio stem to react to
    effect: 'pulse'              // Effect while in viewport
});

sonic.onFrame((data) => {
    audioAware.update(data);
});
```

---

## 📐 HTML Attributes

| Attribute | Values | Description |
|---|---|---|
| `data-scroll` | animation name | Triggers animation on scroll-into-view |
| `data-scroll-delay` | milliseconds | Delay before animation triggers |
| `data-scroll-duration` | milliseconds | Duration of the animation |
| `data-scroll-distance` | pixels | Distance the element travels (for slide animations) |

---

## 🎞️ Built-in Animations

| Animation | Description |
|---|---|
| `slideUp` | Slides element up from below |
| `fadeIn` | Fades element in from invisible |
| `scaleIn` | Scales element from 0 to full size |
| `slideLeft` | Slides in from the right side |
| `slideRight` | Slides in from the left side |
| `flipIn` | Flips in from a perspective angle |

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
const scroll = SonicScroll.create(config);

scroll.init()                                    // Auto-parse [data-scroll] elements
scroll.animate(selector, animation, config)      // Manually bind animation
scroll.createAudioAware(config)                  // Enable audio-aware mode
scroll.destroy()                                 // Clean up all observers
```

---

## 🎵 Works Best With

- **[sonicmotion](https://www.npmjs.com/package/sonicmotion)** — Audio stem analysis and DOM animation engine
- **[sonicfx](https://www.npmjs.com/package/sonicfx)** — Advanced audio-reactive visual effects
- **[sonicwave](https://www.npmjs.com/package/sonicwave)** — Canvas waveform and spectrum visualizations

---

## 📄 License

MIT © 2025 axscq
