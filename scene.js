// Lexicon core: instanced glyph quads that morph between two formations.
import * as THREE from 'three';

const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?';
const FOREIGN =
  'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' +
  'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' +
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん' +
  'アイウエオカキクケコサシスセソタチツテト' +
  '語言文字訳読書話辞典翻意味声音記号' +
  '가나다라마바사아자차카타파하글말언어번역' +
  'ابتثجحخدذرزسشصضطظعغفقكلمنهوي' +
  'אבגדהש';

const GRID = 16;
const N_LATIN = 64;
const N_FOREIGN = GRID * GRID - N_LATIN;
const FOV = 35;
const CAM_DIST = 11; // camera-to-formation distance at both ends of the flight
const B_Z = -17; // depth of the second formation

function buildAtlas(size) {
  const cell = size / GRID;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${Math.floor(cell * 0.62)}px "Segoe UI","Yu Gothic UI","Malgun Gothic","Hiragino Sans","Apple SD Gothic Neo","Noto Sans","Noto Sans CJK JP",system-ui,sans-serif`;
  const latin = Array.from(LATIN).slice(0, N_LATIN);
  const src = Array.from(FOREIGN);
  const glyphs = latin.slice();
  for (let i = 0; i < N_FOREIGN; i++) glyphs.push(src[i % src.length]);
  glyphs.forEach((g, i) => {
    ctx.fillText(g, ((i % GRID) + 0.5) * cell, (Math.floor(i / GRID) + 0.54) * cell);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

// Formation A: an elongated octahedral crystal ruled with rows of glyphs, two inner shells, a tilted ring, dust.
function buildA(density) {
  const s = 0.066 * density;
  const R = 1.9;
  const YS = 1.28;
  const A = [];
  const cx = [1, 0, -1, 0];
  const cz = [0, 1, 0, -1];
  const shell = (r) => {
    for (let y = -r + s * 0.5; y < r; y += s * 1.15) {
      const h = r - Math.abs(y);
      const n = Math.max(1, Math.floor((h * Math.SQRT2 * 4) / s));
      const off = Math.random();
      for (let i = 0; i < n; i++) {
        const t = (((i + off) / n) * 4) % 4;
        const k = Math.floor(t);
        const f = t - k;
        const k2 = (k + 1) % 4;
        A.push((cx[k] + (cx[k2] - cx[k]) * f) * h, y * YS, (cz[k] + (cz[k2] - cz[k]) * f) * h);
      }
    }
  };
  shell(R);
  shell(R * 0.62);
  shell(R * 0.3);
  const tilt = 0.42;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  for (let j = 0; j < 4; j++) {
    const r = 3.05 + j * s * 1.3;
    const n = Math.floor((Math.PI * 2 * r) / s);
    for (let i = 0; i < n; i++) {
      if ((i + j * 7) % 23 > 18) continue; // gaps, so the ring reads as broken lines of text
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      A.push(x * ct, x * st, z);
    }
  }
  const solid = A.length / 3;
  const nDust = Math.floor(solid * 0.2);
  for (let i = 0; i < nDust; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 3.6 + Math.pow(Math.random(), 1.6) * 7;
    A.push(Math.cos(a) * r, (Math.random() - 0.5) * 7, Math.sin(a) * r);
  }
  return { A, solid, nDust };
}

function lineSlots(x0, x1, y0, y1, sp) {
  const out = [];
  for (let l = 0; l < 3; l++) {
    const z = B_Z - l * 2.6;
    const k = (CAM_DIST + l * 2.6) / CAM_DIST;
    let row = 0;
    for (let y = y1; y > y0; y -= sp * 2.1, row++) {
      const short = row % 6 === 5;
      const end = x0 + (x1 - x0) * (short ? 0.25 + Math.random() * 0.3 : 0.72 + Math.random() * 0.28);
      let x = x0;
      while (x < end) {
        let w = 2 + Math.floor(Math.random() * 8);
        while (w-- > 0 && x < end) {
          out.push(x * k + l * 0.13, y * k, z);
          x += sp;
        }
        x += sp;
      }
    }
  }
  return out;
}

// Formation B: aligned lines of text (translator) and streams converging on one point (download manager).
function buildB(count, solid, density, aspect) {
  const W = Math.tan((FOV * Math.PI) / 360) * CAM_DIST * aspect; // visible half-width at the formation
  const portrait = aspect < 1;
  const B = new Float32Array(count * 3);
  const type = new Float32Array(count);
  const lines = portrait
    ? { x0: -0.86 * W, x1: 0.86 * W, y0: 0.5, y1: 3.1 }
    : { x0: -0.88 * W, x1: -0.12 * W, y0: -2.4, y1: 2.4 };
  const streams = portrait
    ? { x0: -0.86 * W, x1: 0.86 * W, top: -0.2, conv: new THREE.Vector3(0, -3.1, B_Z) }
    : { x0: 0.1 * W, x1: 0.9 * W, top: 3.7, conv: new THREE.Vector3(0.5 * W, -3.0, B_Z) };

  const slots = lineSlots(lines.x0, lines.x1, lines.y0, lines.y1, 0.075 * density);
  const nLines = Math.min(slots.length / 3, Math.floor(solid * 0.5));
  const order = new Uint32Array(solid);
  for (let i = 0; i < solid; i++) order[i] = i;
  for (let i = solid - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = order[i];
    order[i] = order[j];
    order[j] = t;
  }
  const nStreams = portrait ? 14 : 26;
  const sx = [];
  const sz = [];
  for (let j = 0; j < nStreams; j++) {
    sx.push(streams.x0 + ((j + 0.2 + Math.random() * 0.6) / nStreams) * (streams.x1 - streams.x0));
    sz.push(B_Z + 1 - Math.random() * 4);
  }
  for (let n = 0; n < solid; n++) {
    const i = order[n];
    if (n < nLines) {
      B[i * 3] = slots[n * 3];
      B[i * 3 + 1] = slots[n * 3 + 1];
      B[i * 3 + 2] = slots[n * 3 + 2];
      type[i] = 0;
    } else {
      const j = Math.floor(Math.random() * nStreams);
      B[i * 3] = sx[j] + (Math.random() - 0.5) * 0.03;
      B[i * 3 + 1] = streams.top;
      B[i * 3 + 2] = sz[j];
      type[i] = 1;
    }
  }
  for (let i = solid; i < count; i++) {
    B[i * 3] = (Math.random() - 0.5) * 2.8 * Math.max(W, 3);
    B[i * 3 + 1] = (Math.random() - 0.5) * 9;
    B[i * 3 + 2] = B_Z + 7 - Math.random() * 16;
    type[i] = 2;
  }
  return { B, type, conv: streams.conv, sweep: [lines.x0, lines.x1 * 1.5 - lines.x0 * 0.5 + 0.4] };
}

const VERT = /* glsl */ `
uniform float uTime, uMorph, uIntro, uRot, uSize, uFocus, uScaleA, uBurst;
uniform vec3 uOffset, uMouse, uConv;
uniform vec2 uSweep;
attribute vec3 aA;
attribute vec3 aB;
attribute vec4 aRand;
attribute vec3 aMeta; // x: 0 line, 1 stream, 2 dust | y: glyph seed | z: latin glyph
varying vec2 vUv;
varying vec2 vCell;
varying float vAlpha;
varying float vAccent;
varying float vFlash;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  vUv = uv;
  float isLine = 1.0 - step(0.5, aMeta.x);
  float isStream = step(0.5, aMeta.x) * (1.0 - step(1.5, aMeta.x));
  float isDust = step(1.5, aMeta.x);

  vec3 a = aA * uScaleA;
  a.xz = rot(uRot * (1.0 - isDust * 0.7)) * a.xz;
  a.yz = rot(0.2) * a.yz;
  a.xy = rot(-0.14) * a.xy;
  a += uOffset;
  a.y += sin(uTime * 0.6 + aRand.x * 6.283) * 0.02;

  vec3 b = aB;
  float bAlpha = 1.0;
  if (isStream > 0.5) {
    float t = fract(aRand.x + uTime * (0.03 + aRand.y * 0.035));
    float e = t * t * (3.0 - 2.0 * t);
    b = vec3(mix(aB.x, uConv.x, e), mix(aB.y, uConv.y, t), mix(aB.z, uConv.z, e));
    bAlpha = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.88, 1.0, t));
  }

  float m = clamp(uMorph * 1.5 - aRand.w * 0.5, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 dir = aRand.xyz - 0.5;
  vec3 p = mix(a, b, m);
  p += dir * sin(m * 3.14159) * vec3(8.0, 8.0, 5.0) * uBurst;

  float k = clamp((1.0 - uIntro) * 1.35 - aRand.w * 0.35, 0.0, 1.0);
  p += dir * k * k * 16.0;

  vec2 dm = p.xy - uMouse.xy;
  float push = (1.0 - smoothstep(0.0, 1.15, length(dm))) * uMouse.z;
  p.xy += normalize(dm + vec2(1e-4)) * push * 0.34;
  p.z += push * (aRand.z - 0.5) * 1.3;

  // glyph choice: periodic script switch; lines resolve to Latin inside the sweep window
  float ph = uTime * (0.1 + aRand.y * 0.5) + aRand.x * 20.0;
  float flash = exp(-fract(ph) * 8.0);
  float sw = floor(ph) * 37.0 + aMeta.y;
  float settled = step(0.97, m);
  float wob = sin(aB.y * 2.3) * 0.35;
  float resolved = isLine * settled * step(aB.x, uSweep.x + wob) * step(uSweep.y + wob, aB.x);
  float edge = isLine * settled * exp(-abs(aB.x - uSweep.x - wob) * 5.0);
  float idx = mix(mod(sw, 256.0), 64.0 + mod(sw, 192.0), isLine * settled);
  idx = mix(idx, aMeta.z, resolved);
  flash = mix(flash, 0.0, resolved);
  vCell = vec2(mod(idx, 16.0), floor(idx / 16.0));

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  float sz = uSize * (0.8 + aRand.z * 0.5) * (1.0 + edge * 0.5);
  mv.xy += position.xy * sz;
  gl_Position = projectionMatrix * mv;

  float al = smoothstep(0.5, 2.8, depth) * (1.0 - smoothstep(22.0, 36.0, depth));
  al *= 1.0 - 0.62 * smoothstep(-1.2, 2.6, depth - uFocus);
  al *= mix(1.0, bAlpha, m) * (1.0 - k);
  al *= mix(1.0, 0.45, isDust);
  al *= 0.78 + 0.22 * sin(uTime * 1.3 + aRand.x * 40.0);
  al *= 1.0 + resolved * 0.35;
  vAlpha = al;
  vAccent = max(step(0.955, aRand.w) * (1.0 - resolved), edge);
  vFlash = min(1.0, flash + push * 0.8);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec3 uCold;
uniform vec3 uAccent;
uniform float uDim;
varying vec2 vUv;
varying vec2 vCell;
varying float vAlpha;
varying float vAccent;
varying float vFlash;

void main() {
  vec2 q = (vUv - 0.5) * 1.4 + 0.5;
  float inside = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
  q = clamp(q, 0.0, 1.0);
  vec2 st = vec2((vCell.x + q.x) / 16.0, 1.0 - (vCell.y + 1.0 - q.y) / 16.0);
  float g = texture2D(uAtlas, st).r * inside;
  float halo = 1.0 - smoothstep(0.0, 0.5, length(vUv - 0.5));
  halo *= halo;
  vec3 col = mix(uCold, uAccent, vAccent);
  col = mix(col, vec3(1.0), vFlash * 0.5 * (1.0 - vAccent));
  float a = (g * (0.6 + vFlash * 0.7) + halo * (0.045 + vFlash * 0.12)) * vAlpha * uDim;
  gl_FragColor = vec4(col, a);
}
`;

export function createScene(canvas) {
  const vmin = Math.min(window.innerWidth, window.innerHeight);
  const small = (vmin > 0 && vmin < 720) || window.matchMedia('(pointer: coarse)').matches;
  const density = small ? 1.45 : 1.0;
  const maxDpr = small ? 1.5 : 2;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x05070a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);

  const { A, solid, nDust } = buildA(density);
  const count = solid + nDust;
  // a page opened in a background tab can report a 0x0 viewport: never let that reach the layout maths
  const viewAspect = () => {
    const a = window.innerWidth / window.innerHeight;
    return Number.isFinite(a) && a > 0 ? a : 16 / 9;
  };
  let aspect = viewAspect();
  let builtAspect = aspect;
  let { B, type, conv, sweep } = buildB(count, solid, density, aspect);

  const rand = new Float32Array(count * 4);
  const meta = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    rand[i * 4] = Math.random();
    rand[i * 4 + 1] = Math.random();
    rand[i * 4 + 2] = Math.random();
    rand[i * 4 + 3] = Math.random();
    meta[i * 3] = type[i];
    meta[i * 3 + 1] = Math.floor(Math.random() * 256);
    meta[i * 3 + 2] = Math.floor(Math.random() * 52); // letters only once resolved
  }

  const quad = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = quad.index;
  geo.setAttribute('position', quad.attributes.position);
  geo.setAttribute('uv', quad.attributes.uv);
  geo.setAttribute('aA', new THREE.InstancedBufferAttribute(new Float32Array(A), 3));
  geo.setAttribute('aB', new THREE.InstancedBufferAttribute(B, 3));
  geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 4));
  geo.setAttribute('aMeta', new THREE.InstancedBufferAttribute(meta, 3));
  geo.instanceCount = count;

  const atlas = buildAtlas(small ? 1024 : 2048);
  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uIntro: { value: 0 },
    uRot: { value: 0 },
    uSize: { value: 0.066 * density * 1.25 * 1.4 },
    uFocus: { value: CAM_DIST },
    uScaleA: { value: 1 },
    uBurst: { value: 1 },
    uOffset: { value: new THREE.Vector3() },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uConv: { value: conv },
    uSweep: { value: new THREE.Vector2(-999, -999) },
    uDim: { value: 1 },
    uAtlas: { value: atlas },
    uCold: { value: new THREE.Color(0.66, 0.82, 0.93) },
    uAccent: { value: new THREE.Color(1.0, 0.35, 0.21) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  // layout that depends on the viewport
  // The crystal is placed inside a "free box" (in CSS pixels) that the page measures next to / above its text.
  const HALF_H = 1.9 * 1.28; // crystal half height in world units
  const hero = { offset: new THREE.Vector3(), scale: 1, dim: 1 };
  const end = { offset: new THREE.Vector3(0, 0, B_Z), scale: 1, dim: 1 };
  let heroBox = null;
  let endBox = null;
  function place(box, out) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const upp = (2 * Math.tan((FOV * Math.PI) / 360) * CAM_DIST) / h; // world units per CSS pixel at the focus plane
    const b = box || { cx: w * 0.69, cy: h * 0.5, hw: w * 0.31, hh: h * 0.5 - 30, fit: 3.3, dim: 1 };
    let s = Math.min(1, (b.hh * upp) / HALF_H, (b.hw * upp) / (b.fit || 2.0));
    let cx = b.cx;
    let cy = b.cy;
    let dim = b.dim;
    if (!(s >= 0.5)) {
      // not enough free room: sit behind the text instead, dimmed so the text keeps its contrast
      cx = w * 0.5;
      cy = h * 0.44;
      s = Math.max(0.3, Math.min(0.9, (h * 0.4 * upp) / HALF_H, (w * 0.5 * upp) / 2.0));
      dim = 0.42;
    }
    out.offset.x = (cx - w * 0.5) * upp;
    out.offset.y = (h * 0.5 - cy) * upp;
    out.scale = s;
    out.dim = dim;
  }
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    aspect = viewAspect();
    renderer.setSize(w, h, false);
    // second formation is laid out for a given aspect: rebuild it when the viewport changes shape noticeably
    if (Math.abs(aspect - builtAspect) / builtAspect > 0.18 || aspect < 1 !== builtAspect < 1) {
      builtAspect = aspect;
      const nb = buildB(count, solid, density, aspect);
      geo.attributes.aB.array.set(nb.B);
      geo.attributes.aB.needsUpdate = true;
      for (let i = 0; i < count; i++) meta[i * 3] = nb.type[i];
      geo.attributes.aMeta.needsUpdate = true;
      uniforms.uConv.value.copy(nb.conv);
      sweep = nb.sweep;
    }
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    place(heroBox, hero);
    place(endBox, end);
  }
  resize();
  window.addEventListener('resize', resize);

  // pointer
  const mTarget = new THREE.Vector2();
  const m = new THREE.Vector2();
  let mStrength = 0;
  let mActive = 0;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mTarget.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    mActive = 1;
  });
  document.addEventListener('pointerleave', () => { mActive = 0; });

  let pTarget = 0;
  let p = 0;
  let retTarget = 0; // 0..1: the core re-assembles at the end of the page
  let ret = 0;
  // per-section mood, eased over time: brightness and a small camera move
  const moodTarget = { dim: 0.34, x: 0, dolly: 0, roll: 0 };
  const mood = { dim: 0.34, x: 0, dolly: 0, roll: 0 };
  let time = 0;
  let last = 0;
  let introAt = -1;
  let raf = 0;
  let slowFrames = 0;
  let frames = 0;
  const tmp = new THREE.Vector3();
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    time += dt;

    // adaptive resolution: step the pixel ratio down if frames stay slow
    frames++;
    if (dt > 0.024) slowFrames++;
    if (frames >= 90) {
      if (slowFrames > 45 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.5);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight, false);
      }
      frames = 0;
      slowFrames = 0;
    }

    p += (pTarget - p) * Math.min(1, dt * 9);
    m.x += (mTarget.x - m.x) * Math.min(1, dt * 4);
    m.y += (mTarget.y - m.y) * Math.min(1, dt * 4);
    mStrength += (mActive - mStrength) * Math.min(1, dt * 3);

    ret += (retTarget - ret) * Math.min(1, dt * 7);
    const ek = Math.min(1, dt * 2.4);
    mood.dim += (moodTarget.dim - mood.dim) * ek;
    mood.x += (moodTarget.x - mood.x) * ek;
    mood.dolly += (moodTarget.dolly - mood.dolly) * ek;
    mood.roll += (moodTarget.roll - mood.roll) * ek;

    const flown = smooth(0.4, 0.86, p); // first flight: crystal -> lines + streams (done before #apps enters)
    const back = ret > 0.001 ? smooth(0.05, 0.95, ret) : 0;
    const morph = flown * (1 - back);
    const settled = smooth(0.8, 1, p) * (1 - back); // how much the section mood applies
    const camZ = CAM_DIST + B_Z * smooth(0, 1, p) + mood.dolly * settled; // 11 -> -6
    const focusZ = B_Z * flown;

    camera.position.set(m.x * 0.55 + mood.x * settled, m.y * 0.32, camZ);
    camera.lookAt(m.x * 0.12 + mood.x * settled, 0, camZ - CAM_DIST);
    camera.rotation.z += Math.sin(p * Math.PI) * 0.24 + mood.roll * settled;
    camera.updateMatrixWorld();

    // pointer ray hit on the focus plane
    tmp.set(m.x, m.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const hit = (focusZ - camera.position.z) / tmp.z;
    uniforms.uMouse.value.set(camera.position.x + tmp.x * hit, camera.position.y + tmp.y * hit, mStrength);

    const u = uniforms;
    u.uTime.value = time;
    u.uRot.value = time * 0.13;
    u.uMorph.value = morph;
    u.uFocus.value = Math.max(2, camZ - focusZ);
    if (back > 0) {
      // closing: the same particles fold back into the crystal, in the plane the camera is already facing
      u.uOffset.value.copy(end.offset);
      u.uScaleA.value = end.scale;
      u.uBurst.value = 0.07;
    } else {
      u.uOffset.value.copy(hero.offset).multiplyScalar(1 - smooth(0, 0.34, p));
      u.uScaleA.value = hero.scale;
      u.uBurst.value = 1;
    }
    // brightness: hero -> flight -> section mood (already reached when #apps enters) -> closing crystal
    let dim = hero.dim + (0.6 - hero.dim) * smooth(0.3, 0.7, p);
    dim += (mood.dim - dim) * smooth(0.74, 0.97, p);
    dim += (end.dim - dim) * smooth(0.45, 1, back);
    u.uDim.value = dim;
    if (introAt >= 0) {
      const t = Math.min(1, (time - introAt) / 2.6);
      u.uIntro.value = 1 - Math.pow(1 - t, 3);
    }
    // a "resolved" window travels across the lines: foreign scripts -> Latin -> back
    const span = sweep[1] - sweep[0];
    const f1 = sweep[0] + span * (((time * 0.085) % 1) * 2.3 - 0.1);
    u.uSweep.value.set(f1, f1 - span * 1.2);

    renderer.render(scene, camera);
  }

  function play() {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }
  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  play();

  return {
    count,
    setProgress(v) { pTarget = Math.min(1, Math.max(0, v)); },
    setReturn(v) { retTarget = Math.min(1, Math.max(0, v)); },
    setMood(o) { Object.assign(moodTarget, o); },
    setBoxes(h, e) {
      heroBox = h || null;
      endBox = e || null;
      place(heroBox, hero);
      place(endBox, end);
    },
    setAccent(hex) {
      const n = parseInt(String(hex).replace('#', ''), 16);
      if (Number.isFinite(n)) uniforms.uAccent.value.setRGB(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
    },
    start() { if (introAt < 0) introAt = time; },
    onPointer(cb) { window.addEventListener('pointermove', (e) => cb(mTarget.x, mTarget.y, e)); },
  };
}
