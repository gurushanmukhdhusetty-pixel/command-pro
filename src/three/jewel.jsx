// Photoreal material & texture kit: engraved metal (bump + roughness + oxidised recesses),
// faceted gems with dispersion, iridescent pearls, velvet.
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const METAL = {
  silver: { color: '#f4f3f0', roughness: 0.16 },
  oxidised: { color: '#e4e2de', roughness: 0.26 },
  gold: { color: '#e9c07a', roughness: 0.17 },
  gold24: { color: '#ffc44d', roughness: 0.1 },
};

const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

// ───────── pattern tiles (white = raised/polished, black = engraved) ─────────
const TILES = {
  arches(ctx, w, h) {
    ctx.lineWidth = w * 0.05;
    ctx.lineJoin = 'round';
    const x0 = w * 0.18, x1 = w * 0.82, top = h * 0.12, sp = h * 0.45, bot = h * 0.86;
    ctx.beginPath();
    ctx.moveTo(x0, bot);
    ctx.lineTo(x0, sp);
    ctx.quadraticCurveTo(x0, top + h * 0.12, w / 2, top);
    ctx.quadraticCurveTo(x1, top + h * 0.12, x1, sp);
    ctx.lineTo(x1, bot);
    ctx.stroke();
    ctx.lineWidth = w * 0.025;
    ctx.beginPath();
    ctx.moveTo(x0 + w * 0.12, bot);
    ctx.lineTo(x0 + w * 0.12, sp + h * 0.05);
    ctx.quadraticCurveTo(x0 + w * 0.12, top + h * 0.22, w / 2, top + h * 0.13);
    ctx.quadraticCurveTo(x1 - w * 0.12, top + h * 0.22, x1 - w * 0.12, sp + h * 0.05);
    ctx.lineTo(x1 - w * 0.12, bot);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(w / 2, sp + h * 0.08 + i * h * 0.07, w * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillRect(0, h * 0.93, w, h * 0.04);
  },
  floral(ctx, w, h) {
    ctx.lineWidth = h * 0.035;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + Math.sin((x / w) * Math.PI * 2) * h * 0.22;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const x = (k + 0.5) * (w / 4);
      const y = h / 2 + Math.sin(((x / w) * Math.PI * 2)) * h * 0.22;
      const up = k % 2 ? 1 : -1;
      ctx.save();
      ctx.translate(x, y + up * h * 0.16);
      ctx.rotate(up * 0.6);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.05, h * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const t of [0.25, 0.75]) {
      const x = t * w, y = h / 2 + Math.sin(t * Math.PI * 2) * h * 0.22;
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * h * 0.08, y - Math.sign(Math.sin(t * Math.PI * 2)) * h * 0.02 + Math.sin(a) * h * 0.08, h * 0.045, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillRect(0, 0, w, h * 0.05);
    ctx.fillRect(0, h * 0.95, w, h * 0.05);
  },
  lotus(ctx, w, h) {
    ctx.lineWidth = w * 0.03;
    for (const [a, s] of [[0, 1], [-0.5, 0.8], [0.5, 0.8]]) {
      ctx.save();
      ctx.translate(w / 2, h * 0.85);
      ctx.rotate(a);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-w * 0.22, -h * 0.25, -w * 0.12, -h * 0.6, 0, -h * 0.72);
      ctx.bezierCurveTo(w * 0.12, -h * 0.6, w * 0.22, -h * 0.25, 0, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillRect(0, h * 0.88, w, h * 0.05);
  },
  peacock(ctx, w, h) {
    ctx.lineWidth = w * 0.02;
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.4, w * 0.2, h * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.42, w * 0.1, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2, h * 0.95);
      ctx.quadraticCurveTo(w / 2 + i * w * 0.03, h * 0.7, w / 2 + i * w * 0.04, h * 0.7 - Math.abs(i) * 2);
      ctx.stroke();
    }
  },
  beads(ctx, w, h) {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2 - w * 0.08, h / 2 - h * 0.08, 1, w / 2, h / 2, w * 0.42);
    g.addColorStop(0, '#fff');
    g.addColorStop(1, '#333');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2);
    ctx.fill();
  },
  ridges(ctx, w, h) {
    for (let y = 0; y < h; y++) {
      const v = 0.5 + 0.5 * Math.cos((y / h) * Math.PI * 2 * 3);
      ctx.fillStyle = `rgb(${v * 255},${v * 255},${v * 255})`;
      ctx.fillRect(0, y, w, 1);
    }
  },
  repousse(ctx, w, h) {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, w, h);
    const blob = (x, y, r) => {
      const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 1, x, y, r);
      g.addColorStop(0, '#fff');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(w / 2, h / 2, w * 0.22);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      blob(w / 2 + Math.cos(a) * w * 0.27, h / 2 + Math.sin(a) * h * 0.27, w * 0.12);
    }
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) blob(x, y, w * 0.16);
  },
  hammered(ctx, w, h) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
      const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 18;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(40,40,40,.55)');
      g.addColorStop(0.7, 'rgba(160,160,160,.25)');
      g.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  dots(ctx, w, h) {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.25 + i * 0.5), h / 2, Math.min(w, h) * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

function drawTile(type, w, h) {
  const c = mk(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';
  TILES[type](ctx, w, h);
  return c;
}

// bands: [{ v0, v1, type, count }] in texture v (0 bottom → 1 top). Areas outside bands are plain polished.
export function bandCanvas(bands, W = 2048, H = 1024) {
  const c = mk(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  for (const b of bands) {
    const y0 = (1 - b.v1) * H, y1 = (1 - b.v0) * H;
    const bh = Math.max(4, y1 - y0);
    const n = b.count || 24;
    const tw = W / n;
    const tile = drawTile(b.type, Math.max(16, Math.round(tw)), Math.max(16, Math.round(bh)));
    for (let i = 0; i < n; i++) ctx.drawImage(tile, i * tw, y0, tw, bh);
  }
  return c;
}

export function tileCanvas(type, w = 512, h = 512) {
  return drawTile(type, w, h);
}

function toTextures(src, { oxidised = false, rough = [0.1, 0.45], blur = 1.2, repeat = [1, 1], offset = [0, 0], tint = true } = {}) {
  const W = src.width, H = src.height;
  const b = mk(W, H);
  const bctx = b.getContext('2d');
  bctx.filter = `blur(${blur}px)`;
  bctx.drawImage(src, 0, 0);
  const img = bctx.getImageData(0, 0, W, H);
  const col = new ImageData(W, H);
  const rgh = new ImageData(W, H);
  const dark = oxidised ? 0.12 : 0.42;
  for (let i = 0; i < img.data.length; i += 4) {
    const g = img.data[i] / 255;
    const cv = (dark + (1 - dark) * Math.pow(g, oxidised ? 1.4 : 1)) * 255;
    col.data[i] = col.data[i + 1] = col.data[i + 2] = cv;
    col.data[i + 3] = 255;
    const rv = (rough[0] + (rough[1] - rough[0]) * (1 - g)) * 255;
    rgh.data[i] = rgh.data[i + 1] = rgh.data[i + 2] = rv;
    rgh.data[i + 3] = 255;
  }
  const cc = mk(W, H);
  cc.getContext('2d').putImageData(col, 0, 0);
  const rc = mk(W, H);
  rc.getContext('2d').putImageData(rgh, 0, 0);
  const tex = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
    t.offset.set(...offset);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { bumpMap: tex(b), map: tint ? tex(cc, true) : null, roughnessMap: tex(rc) };
}

const texCache = new Map();
export function useEngrave(key, makeCanvas, opts) {
  return useMemo(() => {
    if (!makeCanvas) return null;
    const k = key + JSON.stringify(opts || {});
    if (!texCache.has(k)) texCache.set(k, toTextures(makeCanvas(), opts));
    return texCache.get(k);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function Metal({ finish = 'silver', tex, bumpScale = 2.2, ...rest }) {
  const m = METAL[finish] || METAL.silver;
  const t = tex || {};
  return (
    <meshPhysicalMaterial
      color={m.color}
      metalness={1}
      roughness={t.roughnessMap ? 1 : m.roughness}
      roughnessMap={t.roughnessMap || null}
      map={t.map || null}
      bumpMap={t.bumpMap || null}
      bumpScale={bumpScale}
      envMapIntensity={1.5}
      userData={{ envI: 1.5 }}
      {...rest}
    />
  );
}

export const GEMS = {
  ruby: { color: '#ff2a55', att: '#9e0022', ior: 1.77 },
  emerald: { color: '#2bd48a', att: '#03673a', ior: 1.58 },
  sapphire: { color: '#3d6bff', att: '#0b2a9e', ior: 1.77 },
  diamond: { color: '#ffffff', att: '#ffffff', ior: 2.17 },
  kundan: { color: '#fffaf0', att: '#fff2d0', ior: 1.6 },
  none: { color: '#ffffff', att: '#ffffff', ior: 2.17 },
};

export function GemMaterial({ gem = 'diamond' }) {
  const g = GEMS[gem] || GEMS.diamond;
  const clear = gem === 'diamond' || gem === 'none';
  return (
    <meshPhysicalMaterial
      color={g.color}
      metalness={0}
      roughness={0}
      transmission={1}
      thickness={0.8}
      ior={g.ior}
      dispersion={clear ? 4 : 1}
      attenuationColor={g.att}
      attenuationDistance={clear ? 10 : 0.35}
      specularIntensity={1}
      clearcoat={1}
      envMapIntensity={clear ? 3 : 2.2}
      userData={{ envI: clear ? 3 : 2.2 }}
      flatShading
    />
  );
}

let _brilliant;
export function brilliantGeo() {
  if (!_brilliant) {
    const pts = [[0, 0.34], [0.56, 0.34], [0.82, 0.2], [1, 0.02], [1, -0.03], [0.5, -0.45], [0, -0.86]].map(([x, y]) => new THREE.Vector2(x, y));
    _brilliant = new THREE.LatheGeometry(pts, 16).toNonIndexed();
    _brilliant.computeVertexNormals();
  }
  return _brilliant;
}
let _cab;
export function cabochonGeo() {
  if (!_cab) _cab = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  return _cab;
}

// faceted stone sitting in a metal bezel / prong setting
export function Stone({ r = 0.1, gem = 'diamond', cut = 'brilliant', finish = 'silver', bezel = true, ...p }) {
  if (gem === 'pearl') return <Pearl r={r} {...p} />;
  return (
    <group {...p}>
      {cut === 'brilliant' ? (
        <mesh geometry={brilliantGeo()} scale={[r, r, r]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, r * 0.05]}>
          <GemMaterial gem={gem} />
        </mesh>
      ) : (
        <mesh geometry={cabochonGeo()} scale={[r, r * 0.55, r]} rotation={[Math.PI / 2, 0, 0]}>
          <GemMaterial gem={gem} />
        </mesh>
      )}
      {bezel && (
        <mesh position={[0, 0, -r * 0.05]}>
          <torusGeometry args={[r * 1.04, r * 0.14, 12, 40]} />
          <Metal finish={finish} />
        </mesh>
      )}
      {bezel && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -r * 0.45]}>
          <cylinderGeometry args={[r * 0.98, r * 0.85, r * 0.7, 32]} />
          <Metal finish={finish} />
        </mesh>
      )}
    </group>
  );
}

export function PearlMaterial() {
  return <meshPhysicalMaterial color="#f5eee2" roughness={0.22} metalness={0} clearcoat={1} clearcoatRoughness={0.15} sheen={0.6} sheenColor="#ffe6f0" iridescence={0.8} iridescenceIOR={1.45} iridescenceThicknessRange={[200, 600]} envMapIntensity={1.4} userData={{ envI: 1.4 }} />;
}
export function Pearl({ r = 0.05, ...p }) {
  return (
    <mesh {...p}>
      <sphereGeometry args={[r, 28, 20]} />
      <PearlMaterial />
    </mesh>
  );
}

let _fabric;
function fabricNormal() {
  if (_fabric) return _fabric;
  const S = 512;
  const c = mk(S, S);
  const x = c.getContext('2d');
  const img = x.createImageData(S, S);
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < S * S; i++) {
    const nx = (rnd() - 0.5) * 70, ny = (rnd() - 0.5) * 70;
    img.data[i * 4] = 128 + nx;
    img.data[i * 4 + 1] = 128 + ny;
    img.data[i * 4 + 2] = 255;
    img.data[i * 4 + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  _fabric = new THREE.CanvasTexture(c);
  _fabric.wrapS = _fabric.wrapT = THREE.RepeatWrapping;
  _fabric.repeat.set(40, 40);
  return _fabric;
}

export function Velvet({ color = '#4a0d1a', sheen = '#c25a78' }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={1}
      metalness={0}
      sheen={1}
      sheenRoughness={0.8}
      sheenColor={sheen}
      envMapIntensity={0.35}
      userData={{ envI: 0.35 }}
      normalMap={fabricNormal()}
      normalScale={[0.08, 0.08]}
    />
  );
}

export function Enamel({ color }) {
  return <meshPhysicalMaterial color={color} roughness={0.08} metalness={0} clearcoat={1} clearcoatRoughness={0.05} />;
}

// three.js only honours material.envMapIntensity when material.envMap is set explicitly,
// so bind the scene environment onto every tagged material.
export function EnvBinder() {
  const { scene } = useThree();
  const last = useRef({ env: null, n: 0 });
  useFrame(() => {
    const env = scene.environment;
    if (!env) return;
    if (last.current.env === env && last.current.n > 30) return;
    if (last.current.env !== env) last.current = { env, n: 0 };
    last.current.n++;
    scene.traverse((o) => {
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) {
        if (m.userData?.envI !== undefined && m.envMap !== env) {
          m.envMap = env;
          m.envMapIntensity = m.userData.envI;
          m.needsUpdate = true;
        }
      }
    });
  });
  return null;
}
