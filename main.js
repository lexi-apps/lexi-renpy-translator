// Lexi Apps — page orchestration: accent, menu, viewer, smooth scroll, scroll-driven scene.
const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const forceNoGl = new URLSearchParams(window.location.search).has('nogl'); // ?nogl shows the static version
const t0 = performance.now();
const clamp01 = (v) => Math.min(1, Math.max(0, v));

async function loadScene() {
  if (reduced || forceNoGl) return null;
  try {
    const mod = await import('./scene.js');
    return mod.createScene($('#gl'));
  } catch (err) {
    console.info('Lexi Apps: 3D scene unavailable, showing the static version.', err && err.message);
    return null;
  }
}

/* ---------- accent ---------- */
const ACCENTS = window.__lexiAccents || { ember: ['#ff5a36', '#0a0605'] };
let sceneRef = null;
function applyAccent(key, save) {
  const a = ACCENTS[key] || ACCENTS.ember;
  root.style.setProperty('--accent', a[0]);
  root.style.setProperty('--on-accent', a[1]);
  root.setAttribute('data-accent', key);
  const out = $('#accent-name');
  if (out) out.textContent = key.charAt(0).toUpperCase() + key.slice(1);
  $$('[data-accent-choice]').forEach((btn) => {
    btn.classList.toggle('is-on', btn.getAttribute('data-accent-choice') === key);
  });
  if (sceneRef) sceneRef.setAccent(a[0]);
  if (save) {
    try { localStorage.setItem('lexi-accent', key); } catch (e) { /* storage unavailable: the choice lasts for this visit */ }
  }
}
function setupAccent() {
  const current = root.getAttribute('data-accent') || 'ember';
  $$('.accent input').forEach((input) => {
    input.checked = input.value === current;
    input.addEventListener('change', () => { if (input.checked) applyAccent(input.value, true); });
  });
  $$('[data-accent-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyAccent(btn.getAttribute('data-accent-choice'), true);
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    });
  });
  applyAccent(current, false);
}

/* ---------- compact menu ---------- */
let closeMenu = () => {};
function setupMenu() {
  const btn = $('.menu-btn');
  const top = $('.top');
  if (!btn || !top) return;
  const set = (open) => {
    top.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  closeMenu = () => set(false);
  btn.addEventListener('click', () => set(!top.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && top.classList.contains('is-open')) {
      set(false);
      btn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (top.classList.contains('is-open') && !top.contains(e.target)) set(false);
  });
}

/* ---------- screenshot viewer (tabs) ---------- */
function setupViewer() {
  $$('[data-viewer]').forEach((viewer) => {
    const tabs = Array.from(viewer.querySelectorAll('[role="tab"]'));
    const shots = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const frame = viewer.querySelector('.viewer__frame');
    const select = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        shots[j].classList.toggle('is-on', on);
      });
      // restart the scan line
      frame.classList.remove('is-scan');
      void frame.offsetWidth;
      frame.classList.add('is-scan');
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false));
      t.addEventListener('keydown', (e) => {
        let j = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = tabs.length - 1;
        if (j < 0) return;
        e.preventDefault();
        select(j, true);
      });
    });
  });
}

/* ---------- scroll-linked details in the page itself ---------- */
function setupProgress() {
  const items = $$('[data-progress]');
  if (reduced || !items.length) return () => {};
  const steps = $$('.steps .step');
  const update = () => {
    const vh = window.innerHeight || 1;
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      // 0 when the top edge is at 88% of the viewport, 1 when the middle of the element reaches 45%
      const k = clamp01((vh * 0.88 - r.top) / Math.max(1, vh * 0.43 + r.height * 0.5));
      el.style.setProperty('--k', k.toFixed(3));
      if (el.classList.contains('steps')) {
        steps.forEach((s, i) => s.classList.toggle('is-lit', k > (i + 0.35) / steps.length));
      }
    });
  };
  root.classList.add('has-progress');
  update();
  return update;
}

function setupHud(scene) {
  const label = $('#hud-script');
  const names = ['Latin', 'Кириллица', 'かな', '漢字', '한글', 'العربية', 'Ελληνικά'];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % names.length;
    label.textContent = names[i];
  }, 1900);
  const xy = $('#hud-xy');
  const f = (v) => (v < 0 ? '-' : '+') + Math.abs(v).toFixed(2);
  scene.onPointer((x, y) => {
    xy.textContent = `X ${f(x)}   Y ${f(y)}`;
  });
}

// Where the crystal may sit: a free box (CSS px, viewport coordinates) beside or above a text block.
const stackedMq = window.matchMedia('(max-width: 700px), (max-aspect-ratio: 1/1)');
const narrowMq = window.matchMedia('(max-width: 900px)');
function freeBox(textEl, textTop, closing) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // side by side: `fit` is the half width (world units) that must fit, ring included
  if (!stackedMq.matches) {
    return closing
      ? { cx: w * 0.75, cy: h * 0.46, hw: w * 0.25, hh: h * 0.5 - 40, fit: 2.9, dim: 1 }
      : { cx: w * 0.69, cy: h * 0.5, hw: w * 0.31, hh: h * 0.5 - 30, fit: 3.3, dim: 1 };
  }
  // stacked: between the header and the text block, allowed to dip a little behind the first lines
  const top = 62;
  const bottom = Math.min(h, textTop + (textEl ? textEl.offsetHeight * 0.16 : 0));
  return { cx: w * 0.5, cy: (top + bottom) / 2, hw: w * 0.5, hh: (bottom - top) / 2, fit: 2.0, dim: 0.85 };
}

// what the scene does behind each part of the page (brightness, small camera move)
const MOODS = [
  ['#apps', { dim: 0.42, x: 0, dolly: 0, roll: 0 }],
  ['#screens', { dim: 0.36, x: -0.9, dolly: 1.5, roll: 0 }],
  ['#inside', { dim: 0.32, x: 0.9, dolly: 2.5, roll: 0.04 }],
  ['#support', { dim: 0.3, x: 0, dolly: 5, roll: 0.07 }],
  ['#faq', { dim: 0.28, x: 0, dolly: 6, roll: -0.06 }],
];

function setupScroll(scene, updateProgress) {
  const apps = $('#apps');
  const pct = $('#hud-pct');
  const bar = $('#hud-bar');
  const hud = $('.hud');
  const hero = $('.hero');
  const heroInner = $('.hero__inner');
  const fin = $('.final');
  const finInner = $('.final__inner');
  const moods = MOODS.map(([sel, m]) => [$(sel), m]).filter(([el]) => el);

  // the flight ends exactly when #apps reaches the bottom edge of the viewport: its text never meets the burst
  const endPx = () => Math.max(1, apps.offsetTop - window.innerHeight);
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const setP = (p) => {
    scene.setProgress(p);
    hud.style.setProperty('--hud', clamp01((0.6 - p) / 0.25).toFixed(3));
  };
  let mood = null;
  const onScroll = (y) => {
    const vh = window.innerHeight;
    const max = maxScroll();
    const total = clamp01(y / max);
    pct.textContent = String(Math.round(total * 100)).padStart(3, '0');
    bar.style.transform = `scaleY(${total.toFixed(4)})`;
    scene.setReturn((y - (max - vh * 0.85)) / (vh * 0.85));
    let next = moods[0][1];
    for (const [el, m] of moods) if (el.getBoundingClientRect().top <= vh * 0.6) next = m;
    if (next !== mood) {
      mood = next;
      // one column of text covers the whole width on narrow screens: keep the scene quieter there
      scene.setMood(narrowMq.matches ? { ...mood, dim: mood.dim * 0.6, x: 0 } : mood);
    }
    updateProgress();
  };
  const measure = () => {
    mood = null; // re-apply on the next scroll update (the narrow/wide rule may have changed)
    const finTop = fin.offsetTop - maxScroll(); // where the closing block rests at the very end of the page
    scene.setBoxes(
      freeBox(heroInner, hero.offsetTop + heroInner.offsetTop),
      freeBox(finInner, finTop + finInner.offsetTop, true)
    );
  };

  const { gsap, ScrollTrigger, Lenis } = window;
  let lenis = null;

  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (Lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    ScrollTrigger.create({
      start: 0,
      end: () => endPx(),
      invalidateOnRefresh: true,
      onUpdate: (self) => setP(self.progress),
    });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => onScroll(self.scroll()),
      onRefresh: (self) => {
        measure();
        onScroll(self.scroll());
      },
    });
    gsap.to('.hero__inner', {
      autoAlpha: 0,
      y: -70,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 50%', scrub: true },
    });
    gsap.to('.hero__scroll', {
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '12% top', scrub: true },
    });
    gsap
      .timeline({ scrollTrigger: { trigger: '.flight', start: 'top 55%', end: 'bottom 108%', scrub: true } })
      .fromTo('.flight__caption', { autoAlpha: 0, letterSpacing: '0.9em' }, { autoAlpha: 1, letterSpacing: '0.4em', duration: 1, ease: 'power2.out' })
      .to('.flight__caption', { autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, '+=0.5');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    const tick = () => {
      setP(Math.min(1, window.scrollY / endPx()));
      onScroll(window.scrollY);
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', () => { measure(); tick(); });
    window.addEventListener('load', () => { measure(); tick(); });
  }
  measure();
  onScroll(window.scrollY);
  // FAQ answers change the page height
  $$('details').forEach((d) => d.addEventListener('toggle', () => {
    if (ScrollTrigger) ScrollTrigger.refresh();
    else measure();
  }));
  return lenis;
}

// in-page anchors: let the smooth scroller fly there (native jump when it is not running)
function setupAnchors(lenis) {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      closeMenu();
      const target = document.querySelector(a.getAttribute('href'));
      if (!target || !lenis) return;
      e.preventDefault();
      const far = Math.abs(target.getBoundingClientRect().top) > window.innerHeight * 1.5;
      lenis.scrollTo(target, { duration: far ? 2.2 : 1.3 });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

function setupReveals() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
}

async function boot() {
  if (reduced) root.classList.add('reduced');
  setupAccent();
  setupMenu();
  setupViewer();
  const updateProgress = setupProgress();
  const scene = await loadScene();
  setupReveals();

  if (!scene) {
    root.classList.add('no-gl', 'is-ready');
    setupAnchors(null);
    let queued = false;
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; updateProgress(); });
    }, { passive: true });
    return;
  }
  sceneRef = scene;
  scene.setAccent((ACCENTS[root.getAttribute('data-accent')] || ACCENTS.ember)[0]);
  setupHud(scene);
  setupAnchors(setupScroll(scene, updateProgress));

  const wait = Math.max(0, 1700 - (performance.now() - t0));
  setTimeout(() => {
    root.classList.add('is-ready');
    scene.start();
  }, wait);
}

/* Lightbox: kart gorsellerini sayfadan ayrilmadan buyutur (kendi icinde kapali). */
function setupLightbox() {
  const links = document.querySelectorAll('.cards a.card');
  if (!links.length) return;
  const box = document.createElement('div');
  box.className = 'lb';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('data-lenis-prevent', '');
  const img = document.createElement('img');
  const x = document.createElement('button');
  x.type = 'button';
  x.className = 'lb__close';
  x.setAttribute('aria-label', 'Close');
  x.textContent = '×';
  box.append(img, x);
  document.body.appendChild(box);
  let opener = null;
  let prevOverflow = '';
  const close = () => {
    if (box.hidden) return;
    box.hidden = true;
    img.removeAttribute('src');
    document.body.style.overflow = prevOverflow;
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  };
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      opener = a;
      const thumb = a.querySelector('img');
      img.alt = thumb ? thumb.alt : '';
      img.src = a.getAttribute('href');
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      box.hidden = false;
      x.focus({ preventScroll: true });
    });
  });
  box.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  box.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  box.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener(
    'keydown',
    (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        x.focus({ preventScroll: true });
      } else if (e.key === ' ' || e.key.startsWith('Arrow') || e.key.startsWith('Page') || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
}
/* Promo video: hareket azaltma tercihi varsa otomatik oynatmayi kapatir. */
function setupPromoVideo() {
  const v = document.querySelector('.promo video');
  if (!v || !reduced) return;
  v.removeAttribute('autoplay');
  v.removeAttribute('loop');
  v.controls = true;
  v.pause();
}

setupLightbox();
setupPromoVideo();

boot();
