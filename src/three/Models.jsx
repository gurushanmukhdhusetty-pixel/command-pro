// Detailed procedural jewellery models used for the 3D viewers and the studio photo renders.
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { bandCanvas, Enamel, Metal, Pearl, PearlMaterial, Stone, tileCanvas, useEngrave, GemMaterial, brilliantGeo, cabochonGeo } from './jewel';

const X = new THREE.Vector3(1, 0, 0);
const D2R = Math.PI / 180;
const V2 = (a) => new THREE.Vector2(a[0], a[1]);

// ───────── helpers ─────────
function useLathe(profile, segs = 128) {
  return useMemo(() => {
    const pts = new THREE.SplineCurve(profile.map(V2)).getSpacedPoints(220);
    const g = new THREE.LatheGeometry(pts, segs);
    g.computeVertexNormals();
    return { geo: g, pts };
  }, [profile, segs]);
}

function Lathe({ profile, finish, bands, bumpScale = 2.2, segs, ...rest }) {
  const { geo, pts } = useLathe(profile, segs);
  const vb = useMemo(
    () =>
      (bands || []).map((b) => {
        // first contiguous run of profile points inside the band's height range (= outer wall)
        let lo = -1, hi = -1;
        for (let i = 0; i < pts.length; i++) {
          const inside = pts[i].y >= b.y0 && pts[i].y <= b.y1;
          if (inside && lo < 0) lo = i;
          if (lo >= 0 && !inside) break;
          if (inside) hi = i;
        }
        const n = pts.length - 1;
        return { ...b, v0: Math.max(0, lo) / n, v1: Math.max(0, hi) / n };
      }),
    [bands, pts],
  );
  const tex = useEngrave(
    'lathe' + JSON.stringify(profile) + JSON.stringify(bands) + finish,
    bands?.length ? () => bandCanvas(vb) : null,
    { oxidised: finish === 'oxidised' },
  );
  return (
    <mesh geometry={geo} castShadow {...rest}>
      <Metal finish={finish} tex={tex} bumpScale={bumpScale} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Instances({ positions, children, scale = 1 }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      m.compose(p, new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [positions, scale]);
  return (
    <instancedMesh ref={ref} args={[null, null, positions.length]} castShadow>
      {children}
    </instancedMesh>
  );
}

function Beads({ positions, r = 0.03, finish }) {
  return (
    <Instances positions={positions}>
      <sphereGeometry args={[r, 14, 12]} />
      <Metal finish={finish} />
    </Instances>
  );
}

function Chain({ curve, count, finish, size = 0.05, closed = false }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion();
    const s = new THREE.Vector3(1.55, 1, 1);
    for (let i = 0; i < count; i++) {
      const t = closed ? i / count : i / (count - 1);
      q.setFromUnitVectors(X, curve.getTangentAt(t));
      q2.setFromAxisAngle(X, i % 2 ? Math.PI / 2 : 0);
      q.multiply(q2);
      m.compose(curve.getPointAt(t), q, s);
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [curve, count, closed]);
  return (
    <instancedMesh ref={ref} args={[null, null, count]} castShadow>
      <torusGeometry args={[size, size * 0.3, 10, 20]} />
      <Metal finish={finish} />
    </instancedMesh>
  );
}

function Wire({ from, to, r = 0.006, finish }) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, len, 6]} />
      <Metal finish={finish} />
    </mesh>
  );
}

function Extrude({ shape, depth = 0.04, bevel = 0.015, finish, tex, ...p }) {
  const geo = useMemo(
    () => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 5, curveSegments: 40 }),
    [shape, depth, bevel],
  );
  return (
    <mesh geometry={geo} castShadow {...p}>
      <Metal finish={finish} tex={tex} />
    </mesh>
  );
}

const petalShape = (w = 0.1, h = 0.25) => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-w, h * 0.3, -w * 0.6, h * 0.85, 0, h);
  s.bezierCurveTo(w * 0.6, h * 0.85, w, h * 0.3, 0, 0);
  return s;
};
const leafShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-0.16, 0.25, -0.12, 0.62, 0, 0.82);
  s.bezierCurveTo(0.12, 0.62, 0.16, 0.25, 0, 0);
  return s;
};

const neckCurve = (rx, ry, depth = 0.35, a0 = -14, a1 = 194) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: 48 }, (_, i) => {
      const a = (a0 + ((a1 - a0) * i) / 47) * D2R;
      return new THREE.Vector3(rx * Math.cos(a), -ry * Math.sin(a), depth * Math.sin(a));
    }),
  );
const loopCurve = (rx, rz, wobble = 0) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: 64 }, (_, i) => {
      const a = (i / 64) * Math.PI * 2;
      const k = 1 + wobble * Math.sin(a * 3 + 0.7);
      return new THREE.Vector3(rx * k * Math.cos(a), 0, rz * k * Math.sin(a));
    }),
    true,
  );

function Flower({ r = 0.12, finish, gem = 'diamond', petals = 8, center = true }) {
  const shape = useMemo(() => petalShape(r * 0.45, r), [r]);
  return (
    <group>
      {Array.from({ length: petals }, (_, i) => (
        <Extrude key={i} shape={shape} depth={r * 0.12} bevel={r * 0.06} finish={finish} rotation={[0, 0, (i / petals) * Math.PI * 2]} position={[0, 0, -r * 0.1]} />
      ))}
      {center && (gem === 'none' ? <Beads positions={[new THREE.Vector3(0, 0, r * 0.1)]} r={r * 0.32} finish={finish} /> : <Stone r={r * 0.36} gem={gem} finish={finish} cut={gem === 'ruby' || gem === 'emerald' ? 'cab' : 'brilliant'} position={[0, 0, r * 0.08]} />)}
    </group>
  );
}

// ───────── necklaces ─────────
function Choker({ finish, gem, flat }) {
  const curve = useMemo(() => neckCurve(1.15, 1.05, flat ? 0 : 0.5), [flat]);
  const silk = useMemo(() => {
    const p0 = curve.getPointAt(0.12), p1 = curve.getPointAt(0.88);
    const zb = flat ? -0.02 : -0.7;
    return [
      new THREE.CatmullRomCurve3([p0, p0.clone().add(new THREE.Vector3(-0.08, 0.3, flat ? 0 : -0.25)), new THREE.Vector3(-0.75, 0.9, zb), new THREE.Vector3(-0.6, 1.35, zb)]),
      new THREE.CatmullRomCurve3([p1, p1.clone().add(new THREE.Vector3(0.08, 0.3, flat ? 0 : -0.25)), new THREE.Vector3(0.75, 0.9, zb), new THREE.Vector3(0.6, 1.35, zb)]),
    ];
  }, [curve, flat]);
  const items = useMemo(() => Array.from({ length: 17 }, (_, i) => 0.13 + (i / 16) * 0.74), []);
  return (
    <group>
      {silk.map((c, i) => (
        <mesh key={i} castShadow>
          <tubeGeometry args={[c, 60, 0.014, 10]} />
          <meshPhysicalMaterial color="#4a0614" roughness={0.55} sheen={1} sheenColor="#c0405f" />
        </mesh>
      ))}
      <Instances positions={Array.from({ length: 70 }, (_, i) => curve.getPointAt(0.13 + (i / 69) * 0.74).clone().multiplyScalar(0.9).setZ(0.01))}>
        <sphereGeometry args={[0.022, 16, 12]} />
        <PearlMaterial />
      </Instances>
      {items.map((t, i) => {
        const p = curve.getPointAt(t);
        const c = i === 8;
        const r = c ? 0.15 : 0.085 + (1 - Math.abs(i - 8) / 8) * 0.02;
        const nrm = new THREE.Vector3(p.x, p.y, 0).normalize();
        return (
          <group key={i} position={p}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[r, r * 1.05, r * 0.25, 40]} />
              <Metal finish={finish} />
            </mesh>
            <Beads finish={finish} r={r * 0.085} positions={Array.from({ length: 18 }, (_, j) => new THREE.Vector3(Math.cos((j / 18) * Math.PI * 2) * r * 0.97, Math.sin((j / 18) * Math.PI * 2) * r * 0.97, r * 0.12))} />
            <Stone r={r * 0.72} gem={c || i % 2 ? gem : 'kundan'} cut="cab" finish={finish} position={[0, 0, r * 0.14]} bezel={false} />
            {[0, 1, 2].map((k) => {
              const d = r + 0.05 + k * 0.075;
              return <Pearl key={k} r={0.034 - k * 0.004} position={[nrm.x * d, nrm.y * d, 0]} />;
            })}
            {c && (
              <group position={[0, -r - 0.32, 0.02]}>
                <mesh geometry={cabochonGeo()} scale={[0.1, 0.08, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                  <GemMaterial gem={gem} />
                </mesh>
                <mesh position={[0, 0, -0.01]} scale={[1, 1.4, 1]}>
                  <torusGeometry args={[0.105, 0.016, 10, 40]} />
                  <Metal finish={finish} />
                </mesh>
                <Pearl r={0.05} position={[0, -0.24, 0]} />
                <Pearl r={0.04} position={[0, -0.33, 0]} />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

function coinCanvas(label = 'lakshmi') {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.fillRect(0, 0, S, S);
  x.fillStyle = '#fff';
  x.strokeStyle = '#fff';
  x.lineWidth = 10;
  x.beginPath();
  x.arc(S / 2, S / 2, S * 0.44, 0, Math.PI * 2);
  x.stroke();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    x.beginPath();
    x.arc(S / 2 + Math.cos(a) * S * 0.36, S / 2 + Math.sin(a) * S * 0.36, 5, 0, Math.PI * 2);
    x.fill();
  }
  if (label === 'lakshmi') {
    x.beginPath();
    x.arc(S / 2, S * 0.36, S * 0.07, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(S * 0.38, S * 0.7);
    x.quadraticCurveTo(S * 0.4, S * 0.42, S / 2, S * 0.44);
    x.quadraticCurveTo(S * 0.6, S * 0.42, S * 0.62, S * 0.7);
    x.closePath();
    x.fill();
    x.fillRect(S * 0.3, S * 0.48, S * 0.4, S * 0.04);
    x.beginPath();
    x.ellipse(S / 2, S * 0.72, S * 0.16, S * 0.05, 0, 0, Math.PI * 2);
    x.fill();
  }
  return c;
}

function KasuCoin({ finish, r = 0.1, ...p }) {
  const tex = useEngrave('kasu' + finish, () => coinCanvas('lakshmi'), { rough: [0.35, 0.08], tint: false, blur: 2 });
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow {...p}>
      <cylinderGeometry args={[r, r, r * 0.12, 40]} />
      <Metal attach="material-0" finish={finish} />
      <Metal attach="material-1" finish={finish} tex={tex} bumpScale={3} />
      <Metal attach="material-2" finish={finish} tex={tex} bumpScale={3} />
    </mesh>
  );
}

function LotusPendant({ finish, gem, scale = 1, drops = true }) {
  const shape = useMemo(() => petalShape(0.11, 0.3), []);
  const shape2 = useMemo(() => petalShape(0.08, 0.2), []);
  return (
    <group scale={scale}>
      {[-66, -33, 0, 33, 66].map((a) => (
        <Extrude key={a} shape={shape} depth={0.03} bevel={0.016} finish={finish} rotation={[0, 0, a * D2R]} position={[0, -0.12, 0]} />
      ))}
      {[-48, -16, 16, 48].map((a) => (
        <Extrude key={'b' + a} shape={shape2} depth={0.03} bevel={0.014} finish={finish} rotation={[0, 0, a * D2R]} position={[0, -0.12, 0.04]} />
      ))}
      <mesh position={[0, -0.15, 0.02]} rotation={[0, 0, 0]} scale={[1, 0.35, 0.4]} castShadow>
        <sphereGeometry args={[0.24, 32, 16]} />
        <Metal finish={finish} />
      </mesh>
      <Stone r={0.075} gem={gem} cut={gem === 'diamond' || gem === 'sapphire' ? 'brilliant' : 'cab'} finish={finish} position={[0, 0.02, 0.09]} />
      {drops &&
        [-0.14, 0, 0.14].map((x, i) => (
          <group key={x} position={[x, -0.27 - (i === 1 ? 0.06 : 0), 0]}>
            <mesh geometry={cabochonGeo()} scale={[0.04, 0.03, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
              <GemMaterial gem={i === 1 ? 'emerald' : 'ruby'} />
            </mesh>
            <Pearl r={0.025} position={[0, -0.1, 0]} />
          </group>
        ))}
    </group>
  );
}

function Temple({ finish, gem, flat }) {
  const curve = useMemo(() => neckCurve(0.95, 1.75, flat ? 0 : 0.45), [flat]);
  const coins = useMemo(() => Array.from({ length: 29 }, (_, i) => 0.12 + (i / 28) * 0.76), []);
  return (
    <group position={[0, 0.6, 0]}>
      <Chain curve={curve} count={210} finish={finish} size={0.03} />
      {coins.map((t, i) => {
        const p = curve.getPointAt(t);
        return (
          <group key={i} position={[p.x, p.y - 0.1, p.z + 0.01]}>
            <Wire finish={finish} from={[0, 0.1, 0]} to={[0, 0.02, 0]} r={0.008} />
            <KasuCoin finish={finish} r={0.095} />
          </group>
        );
      })}
      <group position={[0, -2.08, flat ? 0.03 : 0.46]}>
        <LotusPendant finish={finish} gem={gem} scale={1.25} />
      </group>
    </group>
  );
}

function Pendant({ finish, gem, variant, flat }) {
  const curve = useMemo(() => neckCurve(0.85, 1.35, flat ? 0 : 0.4), [flat]);
  const curve2 = useMemo(() => neckCurve(0.76, 1.22, flat ? 0 : 0.36), [flat]);
  const heart = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.25);
    s.bezierCurveTo(-0.32, -0.02, -0.22, 0.24, 0, 0.1);
    s.bezierCurveTo(0.22, 0.24, 0.32, -0.02, 0, -0.25);
    const h = new THREE.Path();
    h.moveTo(0, -0.17);
    h.bezierCurveTo(-0.22, -0.02, -0.15, 0.15, 0, 0.04);
    h.bezierCurveTo(0.15, 0.15, 0.22, -0.02, 0, -0.17);
    s.holes.push(h);
    return s;
  }, []);
  const discTex = useEngrave('disc' + finish, () => tileCanvas('repousse', 256, 256), { rough: [0.1, 0.35], tint: finish === 'oxidised' });
  const bottom = curve.getPointAt(0.5);
  return (
    <group position={[0, 0.55, 0]}>
      <Chain curve={curve} count={220} finish={finish} size={0.022} />
      {variant === 'blackbeads' && (
        <>
          <Chain curve={curve2} count={200} finish={finish} size={0.02} />
          <Instances
            positions={Array.from({ length: 56 }, (_, i) => (i % 2 ? curve : curve2).getPointAt(0.14 + (Math.floor(i / 2) / 27) * 0.72))}>
            <sphereGeometry args={[0.032, 16, 12]} />
            <meshPhysicalMaterial color="#030303" roughness={0.04} clearcoat={1} />
          </Instances>
        </>
      )}
      <group position={[bottom.x, bottom.y - 0.08, bottom.z]}>
        <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0.02, 0]} castShadow>
          <torusGeometry args={[0.04, 0.011, 8, 24]} />
          <Metal finish={finish} />
        </mesh>
        {variant === 'lotus' && (
          <group position={[0, -0.2, 0]}>
            <LotusPendant finish={finish} gem={gem} scale={0.65} drops={false} />
          </group>
        )}
        {variant === 'heart' && (
          <group position={[0, -0.12, 0]}>
            <Extrude shape={heart} depth={0.035} bevel={0.012} finish={finish} position={[0, -0.05, -0.02]} />
            <Stone r={0.035} gem={gem} finish={finish} position={[0, 0.06, 0.04]} />
          </group>
        )}
        {variant === 'blackbeads' && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.03, 48]} />
            <Metal attach="material-0" finish={finish} />
            <Metal attach="material-1" finish={finish} tex={discTex} />
            <Metal attach="material-2" finish={finish} tex={discTex} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// ───────── loops (bracelet / anklet) — lie flat in the XZ plane ─────────
function EvilEye({ finish }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {[
        [0.13, '#1d47c9', 0.02],
        [0.085, '#ffffff', 0.026],
        [0.058, '#4aa3ff', 0.03],
        [0.026, '#050505', 0.034],
      ].map(([r, c, z]) => (
        <mesh key={c} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z]}>
          <cylinderGeometry args={[r, r, 0.012, 40]} />
          <Enamel color={c} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.02]} castShadow>
        <torusGeometry args={[0.135, 0.018, 12, 48]} />
        <Metal finish={finish} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.03, 40]} />
        <Metal finish={finish} />
      </mesh>
    </group>
  );
}

function Bracelet({ finish }) {
  const curve = useMemo(() => loopCurve(1.05, 0.95, 0.04), []);
  return (
    <group>
      <Chain curve={curve} count={150} finish={finish} size={0.035} closed />
      {[0.18, 0.25, 0.32].map((t) => {
        const p = curve.getPointAt(t);
        const out = new THREE.Vector3(p.x, 0, p.z).normalize().multiplyScalar(0.2);
        return (
          <group key={t} position={[p.x + out.x, 0.02, p.z + out.z]}>
            <EvilEye finish={finish} />
          </group>
        );
      })}
      <mesh position={[-1.06, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.06, 0.018, 10, 24, Math.PI * 1.7]} />
        <Metal finish={finish} />
      </mesh>
    </group>
  );
}

function Bell({ r = 0.06, finish }) {
  const slit = useEngrave('slit', () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.fillRect(0, 0, 256, 128);
    x.fillStyle = '#000';
    x.fillRect(0, 74, 256, 6);
    x.fillRect(60, 74, 8, 50);
    x.fillRect(188, 74, 8, 50);
    return c;
  }, { oxidised: true });
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[r, 24, 18]} />
        <Metal finish={finish} tex={slit} bumpScale={3} />
      </mesh>
      <mesh position={[0, r * 1.05, 0]} castShadow>
        <torusGeometry args={[r * 0.3, r * 0.1, 8, 16]} />
        <Metal finish={finish} />
      </mesh>
    </group>
  );
}

function Anklet({ finish, variant }) {
  const heavy = variant === 'heavy';
  const curve = useMemo(() => loopCurve(1.2, 1.0, 0.03), []);
  const n = heavy ? 30 : 16;
  return (
    <group>
      <Chain curve={curve} count={170} finish={finish} size={0.036} closed />
      {heavy && (
        <Beads
          finish={finish}
          r={0.03}
          positions={Array.from({ length: 90 }, (_, i) => {
            const p = curve.getPointAt(i / 90);
            const o = new THREE.Vector3(p.x, 0, p.z).normalize().multiplyScalar(0.08);
            return p.clone().add(o);
          })}
        />
      )}
      {Array.from({ length: n }, (_, i) => {
        const p = curve.getPointAt(i / n);
        const o = new THREE.Vector3(p.x, 0, p.z).normalize();
        const d = heavy ? (i % 2 ? 0.2 : 0.3) : 0.16;
        return (
          <group key={i}>
            <Wire finish={finish} from={[p.x, 0.0, p.z]} to={[p.x + o.x * (d - 0.05), 0.0, p.z + o.z * (d - 0.05)]} r={0.007} />
            <group position={[p.x + o.x * d, 0.0, p.z + o.z * d]} rotation={[Math.PI / 2, 0, -Math.atan2(o.x, o.z)]}>
              <Bell r={heavy ? 0.06 : 0.045} finish={finish} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

// ───────── bangles / rings (axis = Y, lying flat) ─────────
function Kada({ finish, gem, thin }) {
  const R = 1.0, tube = thin ? 0.07 : 0.15;
  const tex = useEngrave(
    'kada' + finish + !!thin,
    thin ? null : () => bandCanvas([{ v0: 0.38, v1: 0.62, type: 'floral', count: 16 }, { v0: 0.3, v1: 0.36, type: 'dots', count: 120 }, { v0: 0.64, v1: 0.7, type: 'dots', count: 120 }]),
    { oxidised: finish === 'oxidised', offset: [0, 0.5] },
  );
  const n = thin ? 28 : 60;
  return [0, 1].map((k) => (
    <group key={k} position={[0, k * (tube * 2 + 0.03), 0]} rotation={[0, k * 0.7, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[R, tube, 48, 220]} />
        <Metal finish={finish} tex={tex} bumpScale={4} />
      </mesh>
      {!thin &&
        [-1, 1].map((s) => (
          <Beads key={s} finish={finish} r={0.032} positions={Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(a) * (R + 0.04), s * (tube + 0.01), Math.sin(a) * (R + 0.04));
          })} />
        ))}
      {thin &&
        Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * (R + tube * 0.9), 0, Math.sin(a) * (R + tube * 0.9)]} rotation={[0, -a + Math.PI / 2, 0]}>
              <Stone r={0.045} gem={gem} finish={finish} cut="brilliant" />
            </group>
          );
        })}
    </group>
  ));
}

function Ring({ finish, gem }) {
  return (
    <group>
      <mesh castShadow>
        <torusGeometry args={[0.62, 0.065, 32, 160]} />
        <Metal finish={finish} />
      </mesh>
      <group position={[0, 0.7, 0]}>
        <mesh geometry={brilliantGeo()} scale={0.24} position={[0, 0.14, 0]}>
          <GemMaterial gem={gem} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return <Wire key={i} finish={finish} from={[Math.cos(a) * 0.12, -0.04, Math.sin(a) * 0.12]} to={[Math.cos(a) * 0.235, 0.21, Math.sin(a) * 0.235]} r={0.018} />;
        })}
        <mesh position={[0, 0.0, 0]} castShadow>
          <torusGeometry args={[0.13, 0.02, 10, 40]} />
          <Metal finish={finish} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}>
          <torusGeometry args={[0.13, 0.02, 10, 40]} />
          <Metal finish={finish} />
        </mesh>
      </group>
    </group>
  );
}

function Studs({ finish, gem }) {
  return [-0.55, 0.55].map((x, k) => (
    <group key={x} position={[x, 0, 0]} rotation={[0, 0, k * 0.4]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.05]} castShadow>
        <cylinderGeometry args={[0.36, 0.33, 0.05, 48]} />
        <Metal finish={finish} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <Stone key={i} r={0.11} gem={gem} finish={finish} position={[Math.cos(a) * 0.23, Math.sin(a) * 0.23, 0]} />;
      })}
      <Stone r={0.12} gem={gem} finish={finish} position={[0, 0, 0.02]} />
      <Beads finish={finish} r={0.022} positions={Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return new THREE.Vector3(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.05);
      })} />
    </group>
  ));
}

function ToeRing({ finish }) {
  return [-0.55, 0.55].map((x, k) => (
    <group key={x} position={[x, 0, k * 0.15]}>
      {[0, 0.07, 0.14].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.38, 0.032, 16, 80, Math.PI * 1.85]} />
          <Metal finish={finish} />
        </mesh>
      ))}
      <group position={[0, 0.12, 0.4]} rotation={[0, 0, 0]}>
        <Flower r={0.09} finish={finish} gem="none" petals={6} />
      </group>
    </group>
  ));
}

function Nazariya({ finish }) {
  return [-0.5, 0.5].map((x, k) => (
    <group key={x} position={[x, 0, k * 0.2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.48, 0.05, 20, 100]} />
        <Metal finish={finish} />
      </mesh>
      <Instances positions={Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        return new THREE.Vector3(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55);
      })}>
        <sphereGeometry args={[0.06, 20, 16]} />
        <meshPhysicalMaterial color="#040404" roughness={0.04} clearcoat={1} />
      </Instances>
      {[1.3, 3.4, 5.4].map((a) => (
        <group key={a} position={[Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62]} rotation={[Math.PI / 2, 0, -a + Math.PI / 2]}>
          <Bell r={0.045} finish={finish} />
        </group>
      ))}
    </group>
  ));
}

// ───────── earrings ─────────
const JHUMKA = [[0.01, 0.55], [0.1, 0.53], [0.22, 0.42], [0.36, 0.17], [0.47, -0.12], [0.53, -0.3], [0.56, -0.36], [0.5, -0.37], [0.47, -0.33]];
function OneJhumka({ finish, gem }) {
  const rim = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const a = (i / 30) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 0.565, -0.36, Math.sin(a) * 0.565);
  }), []);
  return (
    <group>
      <Lathe
        profile={JHUMKA}
        finish={finish}
        bands={[
          { y0: -0.3, y1: 0.12, type: 'arches', count: 10 },
          { y0: 0.18, y1: 0.4, type: 'floral', count: 8 },
        ]}
      />
      <Beads positions={rim} r={0.028} finish={finish} />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const l = i % 2 ? 0.09 : 0.17;
        const x = Math.cos(a) * 0.55, z = Math.sin(a) * 0.55;
        return (
          <group key={i}>
            <Wire finish={finish} from={[x, -0.38, z]} to={[x, -0.38 - l, z]} r={0.006} />
            {gem === 'ruby' && i % 2 === 0 ? (
              <mesh position={[x, -0.4 - l - 0.03, z]} scale={[0.03, 0.045, 0.03]}>
                <sphereGeometry args={[1, 16, 12]} />
                <GemMaterial gem="ruby" />
              </mesh>
            ) : (
              <Pearl r={0.038} position={[x, -0.4 - l - 0.02, z]} />
            )}
          </group>
        );
      })}
      <Beads finish={finish} r={0.05} positions={[new THREE.Vector3(0, 0.62, 0), new THREE.Vector3(0, 0.74, 0)]} />
      <group position={[0, 0.98, 0]}>
        <Flower r={0.16} finish={finish} gem={gem === 'pearl' || gem === 'none' ? 'none' : gem} petals={9} />
        <mesh position={[0, 0.02, -0.06]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.07, 0.012, 8, 24, Math.PI]} />
          <Metal finish={finish} />
        </mesh>
      </group>
    </group>
  );
}
function Jhumka({ finish, gem, variant }) {
  const s = variant === 'mini' ? 0.8 : 1;
  return [-0.66, 0.66].map((x, i) => (
    <group key={x} position={[x, 0, 0]} scale={s} rotation={[0, i ? -0.3 : 0.3, 0]}>
      <OneJhumka finish={finish} gem={gem} />
    </group>
  ));
}

function Tikka({ finish, gem }) {
  const crescent = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 0.46, Math.PI * 1.05, Math.PI * 1.95, false);
    s.absarc(0, 0.12, 0.38, Math.PI * 1.92, Math.PI * 1.08, true);
    return s;
  }, []);
  const chain = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(0.02, 0.9, 0), new THREE.Vector3(0, 0.35, 0)]), []);
  const tex = useEngrave('tikkacr' + finish, () => tileCanvas('floral', 512, 128), { repeat: [3, 1] });
  return (
    <group position={[0, -0.2, 0]}>
      <Chain curve={chain} count={60} finish={finish} size={0.025} />
      <mesh position={[0, 1.56, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.07, 0.014, 8, 24, Math.PI * 1.5]} />
        <Metal finish={finish} />
      </mesh>
      <group position={[0, 0.25, 0]}>
        <Flower r={0.1} finish={finish} gem="none" petals={8} />
      </group>
      <Extrude shape={crescent} depth={0.05} bevel={0.02} finish={finish} tex={tex} position={[0, -0.05, -0.03]} />
      <group position={[0, -0.33, 0.04]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.03]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 40]} />
          <Metal finish={finish} />
        </mesh>
        <Beads finish={finish} r={0.016} positions={Array.from({ length: 18 }, (_, i) => new THREE.Vector3(Math.cos((i / 18) * Math.PI * 2) * 0.15, Math.sin((i / 18) * Math.PI * 2) * 0.15, 0))} />
        <Stone r={0.1} gem={gem} cut="cab" finish={finish} bezel={false} position={[0, 0, 0]} />
      </group>
      {Array.from({ length: 11 }, (_, i) => {
        const a = Math.PI * 1.1 + (i / 10) * Math.PI * 0.8;
        const x = Math.cos(a) * 0.48, y = Math.sin(a) * 0.48 - 0.05;
        const l = i % 2 ? 0.08 : 0.15;
        return (
          <group key={i}>
            <Wire finish={finish} from={[x, y, 0]} to={[x, y - l, 0]} r={0.006} />
            <Pearl r={0.035} position={[x, y - l - 0.03, 0]} />
          </group>
        );
      })}
    </group>
  );
}

function Vaddanam({ finish, gem }) {
  const R = 2.4, n = 15;
  const tex = useEngrave('vad' + finish, () => tileCanvas('repousse', 256, 512), { oxidised: finish === 'oxidised', rough: [0.1, 0.4] });
  const span = 1.5;
  return (
    <group position={[0, 0, R - 0.4]}>
      {Array.from({ length: n }, (_, i) => {
        const a = -span / 2 + (i / (n - 1)) * span;
        if (i === 7) return null;
        return (
          <group key={i} position={[Math.sin(a) * R, 0, -Math.cos(a) * R]} rotation={[0, -a, 0]}>
            <RoundedBox args={[0.3, 0.5, 0.06]} radius={0.02} smoothness={3} castShadow>
              <Metal finish={finish} tex={tex} bumpScale={4} />
            </RoundedBox>
            <Stone r={0.035} gem={i % 2 ? 'ruby' : 'emerald'} cut="cab" finish={finish} position={[0, 0, 0.04]} />
          </group>
        );
      })}
      {[-1, 1].map((s) => (
        <Beads key={s} finish={finish} r={0.03} positions={Array.from({ length: 90 }, (_, i) => {
          const a = -span / 2 - 0.02 + (i / 89) * (span + 0.04);
          return new THREE.Vector3(Math.sin(a) * (R + 0.02), s * 0.27, -Math.cos(a) * (R + 0.02));
        })} />
      ))}
      <group position={[0, -0.02, -R + 0.06]}>
        <mesh scale={[0.4, 0.5, 0.08]} castShadow>
          <sphereGeometry args={[1, 48, 24]} />
          <Metal finish={finish} tex={tex} bumpScale={4} />
        </mesh>
        <Beads finish={finish} r={0.025} positions={Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * 0.32, Math.sin(a) * 0.41, 0.06);
        })} />
        <Stone r={0.13} gem={gem} cut="cab" finish={finish} position={[0, 0, 0.08]} />
        {Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI * 1.25 + (i / 6) * Math.PI * 0.5;
          const x = Math.cos(a) * 0.4, y = Math.sin(a) * 0.5;
          return (
            <group key={i}>
              <Wire finish={finish} from={[x, y, 0]} to={[x, y - 0.12, 0]} r={0.006} />
              <Pearl r={0.035} position={[x, y - 0.15, 0]} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

// ───────── home & pooja (lathe-turned, stand upright on Y) ─────────
const KALASH = [[0, 0], [0.52, 0], [0.58, 0.04], [0.5, 0.14], [0.5, 0.2], [0.74, 0.45], [0.92, 0.85], [0.84, 1.25], [0.48, 1.55], [0.36, 1.68], [0.4, 1.76], [0.5, 1.82], [0.46, 1.86], [0.34, 1.78]];
function Kalash({ finish }) {
  const leaf = useMemo(() => leafShape(), []);
  const coco = useEngrave('coco', () => tileCanvas('hammered', 256, 256), { repeat: [3, 2], rough: [0.25, 0.5], tint: false });
  return (
    <group>
      <Lathe profile={KALASH} finish={finish} bands={[{ y0: 0.05, y1: 0.18, type: 'beads', count: 50 }, { y0: 0.5, y1: 1.12, type: 'arches', count: 8 }, { y0: 1.2, y1: 1.4, type: 'lotus', count: 16 }]} bumpScale={3} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.3, 1.8, Math.sin(a) * 0.3]} rotation={[0, -a + Math.PI / 2, 0]}>
            <Extrude shape={leaf} depth={0.01} bevel={0.012} finish={finish} rotation={[-1.0, 0, 0]} scale={[1.25, 1.2, 1]} />
          </group>
        );
      })}
      <mesh position={[0, 2.12, 0]} scale={[0.3, 0.36, 0.3]} castShadow>
        <sphereGeometry args={[1, 48, 32]} />
        <Metal finish={finish} tex={coco} />
      </mesh>
    </group>
  );
}

const DIYA = [[0, 0], [0.3, 0], [0.33, 0.04], [0.2, 0.1], [0.17, 0.2], [0.42, 0.3], [0.72, 0.46], [0.8, 0.54], [0.74, 0.55], [0.42, 0.4], [0, 0.36]];
function OneDiya({ finish }) {
  return (
    <group>
      <Lathe profile={DIYA} finish={finish} bands={[{ y0: 0.25, y1: 0.5, type: 'lotus', count: 16 }]} />
      <mesh position={[0.82, 0.55, 0]} rotation={[0, 0, -1.15]} castShadow>
        <coneGeometry args={[0.1, 0.36, 24, 1, true]} />
        <Metal finish={finish} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 48]} />
        <meshPhysicalMaterial color="#5a3d0c" roughness={0.05} metalness={0} clearcoat={1} />
      </mesh>
      <mesh position={[0.86, 0.66, 0]} rotation={[0, 0, -0.9]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.2, 10]} />
        <meshStandardMaterial color="#f5efe4" roughness={1} />
      </mesh>
    </group>
  );
}
function Diya({ finish }) {
  return (
    <group>
      <group position={[-0.7, 0, -0.45]} rotation={[0, 0.5, 0]} scale={0.85}>
        <OneDiya finish={finish} />
      </group>
      <group position={[0.55, 0, 0.25]} rotation={[0, -0.4, 0]}>
        <OneDiya finish={finish} />
      </group>
    </group>
  );
}

const GLASS = [[0, 0], [0.5, 0], [0.54, 0.05], [0.62, 1.8], [0.66, 1.9], [0.6, 1.9], [0.57, 1.8], [0.48, 0.1], [0, 0.08]];
const PANCHA = [[0, 0], [0.45, 0], [0.4, 0.08], [0.32, 0.25], [0.42, 0.5], [0.55, 1.1], [0.6, 1.2], [0.55, 1.2], [0.5, 1.1], [0.36, 0.5], [0.26, 0.28], [0, 0.26]];
function Glass({ finish, variant }) {
  if (variant === 'panchapatra')
    return (
      <group>
        <Lathe profile={PANCHA} finish={finish} bands={[{ y0: 0.55, y1: 0.95, type: 'floral', count: 6 }]} />
        <group position={[0.34, 1.05, 0]} rotation={[0, 0, -0.42]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, 1.1, 12]} />
            <Metal finish={finish} />
          </mesh>
          <mesh position={[0, -0.32, 0]} scale={[0.13, 0.06, 0.1]} castShadow>
            <sphereGeometry args={[1, 24, 16]} />
            <Metal finish={finish} />
          </mesh>
          <Beads finish={finish} r={0.05} positions={[new THREE.Vector3(0, 0.82, 0)]} />
        </group>
      </group>
    );
  return (
    <group>
      <group position={[-0.7, 0, -0.4]} scale={0.88}>
        <Lathe profile={GLASS} finish={finish} bands={[{ y0: 0.25, y1: 0.35, type: 'beads', count: 60 }, { y0: 0.45, y1: 1.15, type: 'arches', count: 10 }, { y0: 1.62, y1: 1.72, type: 'beads', count: 60 }]} />
      </group>
      <group position={[0.55, 0, 0.2]}>
        <Lathe profile={GLASS} finish={finish} bands={[{ y0: 0.25, y1: 0.35, type: 'beads', count: 60 }, { y0: 0.45, y1: 1.15, type: 'arches', count: 10 }, { y0: 1.62, y1: 1.72, type: 'beads', count: 60 }]} />
      </group>
    </group>
  );
}

const BOWL = [[0, 0], [0.42, 0], [0.46, 0.05], [0.4, 0.12], [0.72, 0.3], [0.95, 0.65], [1.0, 0.8], [0.95, 0.8], [0.88, 0.65], [0.66, 0.33], [0, 0.2]];
function Bowl({ finish }) {
  return (
    <group>
      <Lathe profile={BOWL} finish={finish} bands={[{ y0: 0.38, y1: 0.7, type: 'floral', count: 8 }]} />
      <group position={[1.15, 0.05, 0.5]} rotation={[Math.PI / 2 - 0.08, 0, 0.9]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.9, 12]} />
          <Metal finish={finish} />
        </mesh>
        <mesh position={[0, -0.2, 0]} scale={[0.16, 0.24, 0.05]} castShadow>
          <sphereGeometry args={[1, 32, 16]} />
          <Metal finish={finish} />
        </mesh>
        <Beads finish={finish} r={0.06} positions={[new THREE.Vector3(0, 0.82, 0)]} />
      </group>
    </group>
  );
}

const LAMP = [[0, 0], [0.75, 0], [0.8, 0.08], [0.55, 0.2], [0.22, 0.34], [0.15, 0.5], [0.28, 0.62], [0.12, 0.74], [0.1, 1.0], [0.24, 1.12], [0.1, 1.24], [0.08, 1.55], [0.12, 1.62], [0.6, 1.72], [0.95, 1.85], [0.97, 1.92], [0.88, 1.9], [0.5, 1.78], [0.1, 1.76], [0, 1.78]];
const hamsa = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.3, 0);
  s.bezierCurveTo(-0.32, 0.16, 0.0, 0.2, 0.12, 0.1);
  s.bezierCurveTo(0.12, 0.3, 0.02, 0.38, 0.1, 0.5);
  s.bezierCurveTo(0.16, 0.58, 0.28, 0.56, 0.28, 0.48);
  s.lineTo(0.38, 0.46);
  s.lineTo(0.28, 0.42);
  s.bezierCurveTo(0.2, 0.36, 0.26, 0.2, 0.26, 0.08);
  s.bezierCurveTo(0.24, -0.08, -0.2, -0.1, -0.3, 0);
  return s;
};
function Lamp({ finish }) {
  const swan = useMemo(() => hamsa(), []);
  return (
    <group>
      <Lathe profile={LAMP} finish={finish} bands={[{ y0: 0.02, y1: 0.16, type: 'lotus', count: 18 }, { y0: 1.66, y1: 1.86, type: 'beads', count: 70 }]} />
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.7, 16]} />
        <Metal finish={finish} />
      </mesh>
      <Beads finish={finish} r={0.07} positions={[new THREE.Vector3(0, 1.95, 0), new THREE.Vector3(0, 2.3, 0)]} />
      <Extrude shape={swan} depth={0.08} bevel={0.03} finish={finish} position={[-0.04, 2.42, -0.04]} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.9, 1.95, Math.sin(a) * 0.9]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]}>
            <cylinderGeometry args={[0.02, 0.03, 0.18, 10]} />
            <meshStandardMaterial color="#f5efe4" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

const KUMKUM = [[0, 0], [0.72, 0], [0.76, 0.06], [0.7, 0.14], [0.7, 0.78], [0.8, 0.84], [0.78, 0.9], [0.6, 1.08], [0.32, 1.28], [0.14, 1.36], [0.1, 1.44], [0.16, 1.54], [0.08, 1.68], [0, 1.72]];
function Kumkum({ finish }) {
  return (
    <group>
      <Lathe profile={KUMKUM} finish={finish} bands={[{ y0: 0.2, y1: 0.72, type: 'peacock', count: 10 }, { y0: 0.92, y1: 1.24, type: 'lotus', count: 14 }]} bumpScale={3} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.705, 0.47, Math.sin(a) * 0.705]} rotation={[0, -a + Math.PI / 2, 0]} scale={[0.05, 0.08, 0.02]}>
            <sphereGeometry args={[1, 16, 12]} />
            <Enamel color={i % 2 ? '#0f6b58' : '#1f3fa8'} />
          </mesh>
        );
      })}
    </group>
  );
}

const THALI = [[0, 0], [1.5, 0], [1.62, 0.1], [1.66, 0.16], [1.58, 0.15], [1.4, 0.05], [0, 0.04]];
const SMALL_BOWL = [[0, 0], [0.18, 0], [0.26, 0.16], [0.28, 0.22], [0.24, 0.22], [0.2, 0.12], [0, 0.06]];
const BELL = [[0, 0.05], [0.3, 0], [0.32, 0.03], [0.26, 0.2], [0.16, 0.42], [0.1, 0.5], [0, 0.52]];
function Powder({ color, r = 0.2 }) {
  return (
    <mesh scale={[r, r * 0.45, r]}>
      <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}
function Thali({ finish }) {
  return (
    <group>
      <Lathe profile={THALI} finish={finish} bands={[{ y0: 0.08, y1: 0.16, type: 'floral', count: 24 }]} />
      <Beads finish={finish} r={0.035} positions={Array.from({ length: 80 }, (_, i) => {
        const a = (i / 80) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * 1.64, 0.17, Math.sin(a) * 1.64);
      })} />
      {[[0.3, -0.5, '#a3102a'], [0.85, 0.05, '#e8a90f']].map(([x, z, c]) => (
        <group key={x} position={[x, 0.04, z]}>
          <Lathe profile={SMALL_BOWL} finish={finish} />
          <group position={[0, 0.12, 0]}>
            <Powder color={c} r={0.21} />
          </group>
        </group>
      ))}
      <group position={[-0.55, 0.04, -0.2]} scale={0.5}>
        <OneDiya finish={finish} />
      </group>
      <group position={[-0.15, 0.04, 0.75]}>
        <Lathe profile={BELL} finish={finish} />
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.6, 12]} />
          <Metal finish={finish} />
        </mesh>
        <Beads finish={finish} r={0.06} positions={[new THREE.Vector3(0, 1.12, 0)]} />
      </group>
      <group position={[0.6, 0.04, 0.75]} rotation={[Math.PI / 2 - 0.06, 0, 1.2]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.7, 10]} />
          <Metal finish={finish} />
        </mesh>
        <mesh position={[0, -0.1, 0]} scale={[0.1, 0.13, 0.04]} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
          <Metal finish={finish} />
        </mesh>
      </group>
    </group>
  );
}

// ───────── bullion ─────────
function coinFace(finish, label, gold) {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.fillRect(0, 0, S, S);
  x.fillStyle = '#fff';
  x.strokeStyle = '#fff';
  x.lineWidth = 16;
  x.beginPath();
  x.arc(S / 2, S / 2, S * 0.47, 0, Math.PI * 2);
  x.stroke();
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    x.beginPath();
    x.arc(S / 2 + Math.cos(a) * S * 0.43, S / 2 + Math.sin(a) * S * 0.43, 6, 0, Math.PI * 2);
    x.fill();
  }
  x.lineWidth = 6;
  x.beginPath();
  x.arc(S / 2, S / 2, S * 0.3, 0, Math.PI * 2);
  x.stroke();
  const txt = 'VCH JEWELLERS · HYDERABAD · ';
  x.font = '600 50px Cinzel, Georgia, serif';
  let a = -Math.PI;
  for (const ch of txt) {
    const w = x.measureText(ch).width + 6;
    a += w / 2 / (S * 0.37);
    x.save();
    x.translate(S / 2 + Math.cos(a) * S * 0.37, S / 2 + Math.sin(a) * S * 0.37);
    x.rotate(a + Math.PI / 2);
    x.fillText(ch, -w / 2, 0);
    x.restore();
    a += w / 2 / (S * 0.37);
    if (a > 0.02) break;
  }
  x.save();
  x.translate(S / 2, S * 0.4);
  x.lineWidth = 8;
  for (const r of [-60, -30, 0, 30, 60]) {
    x.save();
    x.rotate((r * Math.PI) / 180);
    x.beginPath();
    x.moveTo(0, 30);
    x.bezierCurveTo(-36, -6, -32, -70, 0, -104);
    x.bezierCurveTo(32, -70, 36, -6, 0, 30);
    x.fill();
    x.restore();
  }
  x.restore();
  x.textAlign = 'center';
  x.font = '700 124px Cinzel, Georgia, serif';
  x.fillText(gold ? '999.9' : '999', S / 2, S * 0.62);
  x.font = '600 48px Cinzel, Georgia, serif';
  x.fillText(gold ? 'FINE GOLD 24K' : 'FINE SILVER', S / 2, S * 0.69);
  x.font = '700 70px Cinzel, Georgia, serif';
  x.fillText(label, S / 2, S * 0.79);
  return c;
}

export function CoinModel({ finish = 'silver', label = '10 g', r = 1.2, rotation = [Math.PI / 2, 0, 0], ...props }) {
  const gold = finish.startsWith('gold');
  const tex = useEngrave('coin' + finish + label, () => coinFace(finish, label, gold), { rough: [0.42, 0.04], tint: false, blur: 1.5 });
  const edge = useEngrave('reed', () => tileCanvas('ridges', 16, 64), { repeat: [1, 1], rough: [0.15, 0.3], tint: false });
  const edgeTex = useMemo(() => {
    if (!edge) return null;
    const t = { ...edge };
    t.bumpMap = edge.bumpMap.clone();
    t.bumpMap.rotation = Math.PI / 2;
    t.bumpMap.repeat.set(1, 140);
    t.bumpMap.needsUpdate = true;
    return t;
  }, [edge]);
  return (
    <mesh {...props} rotation={rotation} castShadow>
      <cylinderGeometry args={[r, r, r * 0.08, 128]} />
      <Metal attach="material-0" finish={finish} tex={edgeTex} bumpScale={2} />
      <Metal attach="material-1" finish={finish} tex={tex} bumpScale={4} />
      <Metal attach="material-2" finish={finish} tex={tex} bumpScale={4} />
    </mesh>
  );
}

function barFace(label, gold, minted) {
  const W = 1024, H = minted ? 1600 : 480;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = minted ? '#000' : '#808080';
  x.fillRect(0, 0, W, H);
  x.fillStyle = minted ? '#fff' : '#000';
  x.strokeStyle = x.fillStyle;
  x.lineWidth = 10;
  x.textAlign = 'center';
  if (minted) {
    x.strokeRect(60, 60, W - 120, H - 120);
    x.save();
    x.translate(W / 2, 330);
    x.rotate(Math.PI / 4);
    x.lineWidth = 14;
    x.strokeRect(-120, -120, 240, 240);
    x.restore();
    x.font = '700 92px Cinzel, Georgia, serif';
    x.fillText('VCH', W / 2, 362);
    const rows = [['VCH JEWELLERS', 640, 70], [gold ? 'FINE GOLD' : 'FINE SILVER', 790, 84], [label, 1010, 190], [gold ? '999.9' : '999.0', 1200, 110], ['No. VC 041287', 1380, 52]];
    for (const [t, y, s] of rows) {
      x.font = `700 ${s}px Cinzel, Georgia, serif`;
      x.fillText(t, W / 2, y);
    }
  } else {
    x.strokeRect(50, 50, W - 100, H - 100);
    x.font = '700 70px Cinzel, Georgia, serif';
    x.fillText('VCH JEWELLERS', W / 2, 150);
    x.font = '700 60px Cinzel, Georgia, serif';
    x.fillText(gold ? 'FINE GOLD 999.9' : 'FINE SILVER 999.0', W / 2, 250);
    x.font = '700 100px Cinzel, Georgia, serif';
    x.fillText(label, W / 2, 370);
    x.font = '600 36px Arial, sans-serif';
    x.fillText('No. VC 2026 004127', W / 2, 425);
  }
  return c;
}

export function BarModel({ finish = 'silver', label = '1 kg', minted = false, ...props }) {
  const gold = finish.startsWith('gold');
  const face = useEngrave('bar' + finish + label + minted, () => barFace(label, gold, minted), minted ? { rough: [0.04, 0.4], tint: false, blur: 1.5 } : { rough: [0.32, 0.5], tint: false, blur: 2 });
  const cast = useEngrave('cast', () => tileCanvas('hammered', 512, 512), { rough: [0.22, 0.38], tint: false, repeat: [2, 2], blur: 3 });
  const trap = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.2, 0);
    s.lineTo(1.2, 0);
    s.lineTo(1.05, 0.5);
    s.lineTo(-1.05, 0.5);
    s.closePath();
    return s;
  }, []);
  if (minted)
    return (
      <group {...props}>
        <RoundedBox args={[1.0, 1.6, 0.1]} radius={0.04} smoothness={4} castShadow>
          <Metal finish={finish} />
        </RoundedBox>
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[0.94, 1.54]} />
          <Metal finish={finish} tex={face} bumpScale={3} />
        </mesh>
      </group>
    );
  return (
    <group {...props}>
      <Extrude shape={trap} depth={1.0} bevel={0.06} finish={finish} tex={cast} position={[0, -0.25, -0.5]} />
      <mesh position={[0, 0.312, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 0.86]} />
        <Metal finish={finish} tex={face} bumpScale={5} />
      </mesh>
    </group>
  );
}

export const MODELS = {
  choker: Choker,
  temple: Temple,
  pendant: Pendant,
  bracelet: Bracelet,
  anklet: Anklet,
  kada: Kada,
  bangle: (p) => <Kada {...p} thin />,
  ring: Ring,
  studs: Studs,
  toering: ToeRing,
  nazariya: Nazariya,
  jhumka: Jhumka,
  tikka: Tikka,
  vaddanam: Vaddanam,
  kalash: Kalash,
  diya: Diya,
  glass: Glass,
  bowl: Bowl,
  lamp: Lamp,
  kumkum: Kumkum,
  thali: Thali,
  coin: ({ finish, label }) => <CoinModel finish={finish} label={label} />,
  bar: ({ finish, label, variant }) => <BarModel finish={finish} label={label} minted={variant === 'minted'} />,
};
