import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Gem, Metal, useBarTexture, useCoinTexture } from './common';

const X = new THREE.Vector3(1, 0, 0);
const D2R = Math.PI / 180;

function useLathe(profile, segments = 96) {
  return useMemo(() => {
    const pts = new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(profile.length * 12);
    const g = new THREE.LatheGeometry(pts, segments);
    g.computeVertexNormals();
    return g;
  }, [profile, segments]);
}

function Lathe({ profile, finish, ...rest }) {
  const geo = useLathe(profile);
  return (
    <mesh geometry={geo} {...rest}>
      <Metal finish={finish} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Chain({ curve, count, finish, size = 0.05, closed = false }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion();
    const s = new THREE.Vector3(1.5, 1, 1);
    for (let i = 0; i < count; i++) {
      const t = closed ? i / count : i / (count - 1);
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      q.setFromUnitVectors(X, tan);
      q2.setFromAxisAngle(X, i % 2 ? Math.PI / 2 : 0);
      q.multiply(q2);
      m.compose(p, q, s);
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [curve, count, closed]);
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <torusGeometry args={[size, size * 0.28, 8, 18]} />
      <Metal finish={finish} />
    </instancedMesh>
  );
}

const neckCurve = (rx, ry, depth = 0.35) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: 40 }, (_, i) => {
      const a = (-14 + (208 * i) / 39) * D2R;
      return new THREE.Vector3(rx * Math.cos(a), -ry * Math.sin(a), depth * Math.sin(a));
    }),
  );
const loopCurve = (rx, rz) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      return new THREE.Vector3(rx * Math.cos(a), 0, rz * Math.sin(a));
    }),
    true,
  );

function Pearl({ r = 0.05, ...p }) {
  return (
    <mesh {...p}>
      <sphereGeometry args={[r, 20, 20]} />
      <Gem gem="pearl" />
    </mesh>
  );
}
function Stone({ r = 0.06, gem = 'ruby', detail = 1, ...p }) {
  return (
    <mesh {...p}>
      <icosahedronGeometry args={[r, detail]} />
      <Gem gem={gem} />
    </mesh>
  );
}
function Bead({ r = 0.04, finish, ...p }) {
  return (
    <mesh {...p}>
      <sphereGeometry args={[r, 16, 16]} />
      <Metal finish={finish} />
    </mesh>
  );
}
function Disc({ r = 0.12, h = 0.03, finish, ...p }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} {...p}>
      <cylinderGeometry args={[r, r, h, 40]} />
      <Metal finish={finish} />
    </mesh>
  );
}

// ───────────────────────── models ─────────────────────────
function Choker({ finish, gem }) {
  const curve = useMemo(() => neckCurve(1.25, 1.25), []);
  const items = useMemo(() => Array.from({ length: 11 }, (_, i) => 0.18 + (i / 10) * 0.64), []);
  return (
    <group position={[0, 0.55, 0]}>
      <Chain curve={curve} count={150} finish={finish} size={0.035} />
      {items.map((t, i) => {
        const p = curve.getPointAt(t);
        const c = i === 5;
        const r = c ? 0.2 : 0.13;
        return (
          <group key={i} position={[p.x, p.y - r * 0.6, p.z + 0.02]}>
            <Disc r={r} h={0.05} finish={finish} />
            <Stone r={r * 0.5} gem={gem} position={[0, 0, 0.05]} />
            {Array.from({ length: 8 }, (_, j) => (
              <Pearl key={j} r={r * 0.11} position={[Math.cos((j / 8) * Math.PI * 2) * r * 0.78, Math.sin((j / 8) * Math.PI * 2) * r * 0.78, 0.04]} />
            ))}
            <Pearl r={c ? 0.07 : 0.045} position={[0, -r - (c ? 0.16 : 0.09), 0]} />
          </group>
        );
      })}
    </group>
  );
}

function Temple({ finish, gem }) {
  const curve = useMemo(() => neckCurve(1.05, 1.9, 0.3), []);
  return (
    <group position={[0, 0.95, 0]} scale={0.85}>
      <Chain curve={curve} count={170} finish={finish} size={0.035} />
      {Array.from({ length: 23 }, (_, i) => {
        const t = 0.14 + (i / 22) * 0.72;
        const p = curve.getPointAt(t);
        return <Disc key={i} r={0.1} h={0.02} finish={finish} position={[p.x, p.y - 0.09, p.z + 0.01]} />;
      })}
      <group position={[0, -2.25, 0.3]}>
        {[-60, -30, 0, 30, 60].map((a) => (
          <mesh key={a} rotation={[0, 0, a * D2R]} position={[Math.sin(-a * D2R) * 0.18, Math.cos(a * D2R) * 0.18, 0]} scale={[0.1, 0.24, 0.04]}>
            <sphereGeometry args={[1, 24, 24]} />
            <Metal finish={finish} />
          </mesh>
        ))}
        <Stone r={0.11} gem={gem} position={[0, 0.12, 0.06]} />
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={x} position={[x, -0.2 - (i === 1 ? 0.1 : 0), 0]} scale={[0.05, 0.08, 0.05]}>
            <sphereGeometry args={[1, 20, 20]} />
            <Gem gem={i === 1 ? 'emerald' : 'ruby'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Pendant({ finish, gem, variant }) {
  const curve = useMemo(() => neckCurve(1.0, 1.5, 0.3), []);
  const curve2 = useMemo(() => neckCurve(0.9, 1.36, 0.28), []);
  const heart = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.25);
    s.bezierCurveTo(-0.32, -0.02, -0.22, 0.24, 0, 0.1);
    s.bezierCurveTo(0.22, 0.24, 0.32, -0.02, 0, -0.25);
    const hole = new THREE.Path();
    hole.moveTo(0, -0.17);
    hole.bezierCurveTo(-0.22, -0.02, -0.15, 0.15, 0, 0.04);
    hole.bezierCurveTo(0.15, 0.15, 0.22, -0.02, 0, -0.17);
    s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 4, curveSegments: 32 });
  }, []);
  return (
    <group position={[0, 0.75, 0]}>
      <Chain curve={curve} count={180} finish={finish} size={0.028} />
      {variant === 'blackbeads' && (
        <>
          <Chain curve={curve2} count={160} finish={finish} size={0.026} />
          {Array.from({ length: 40 }, (_, i) => {
            const c = i % 2 ? curve : curve2;
            const p = c.getPointAt(0.12 + (Math.floor(i / 2) / 19) * 0.76);
            return (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.04, 14, 14]} />
                <meshPhysicalMaterial color="#050505" roughness={0.05} clearcoat={1} />
              </mesh>
            );
          })}
        </>
      )}
      <group position={[0, -1.82, 0.3]}>
        <mesh position={[0, 0.16, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.05, 0.014, 8, 20]} />
          <Metal finish={finish} />
        </mesh>
        {variant === 'lotus' && (
          <>
            {[-64, -32, 0, 32, 64].map((a) => (
              <mesh key={a} rotation={[0, 0, a * D2R]} position={[Math.sin(-a * D2R) * 0.12, Math.cos(a * D2R) * 0.12 - 0.12, 0]} scale={[0.07, 0.16, 0.03]}>
                <sphereGeometry args={[1, 24, 24]} />
                <Metal finish={finish} />
              </mesh>
            ))}
            <Stone r={0.07} gem={gem} position={[0, -0.12, 0.05]} />
          </>
        )}
        {variant === 'heart' && (
          <>
            <mesh geometry={heart} position={[0, -0.05, -0.02]}>
              <Metal finish={finish} />
            </mesh>
            <Stone r={0.035} gem={gem} position={[0, 0.06, 0.05]} />
          </>
        )}
        {variant === 'blackbeads' && <Disc r={0.17} h={0.04} finish={finish} position={[0, -0.08, 0]} />}
      </group>
    </group>
  );
}

function Bracelet({ finish }) {
  const curve = useMemo(() => loopCurve(1.15, 1.15), []);
  return (
    <group rotation={[0.55, 0, 0]}>
      <Chain curve={curve} count={120} finish={finish} size={0.04} closed />
      {[60, 90, 120].map((a) => (
        <group key={a} position={[1.15 * Math.cos(a * D2R), -0.2, 1.15 * Math.sin(a * D2R)]} rotation={[-0.55, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.04, 40]} />
            <meshPhysicalMaterial color="#1d47c9" roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.012]}>
            <cylinderGeometry args={[0.11, 0.11, 0.03, 40]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.022]}>
            <cylinderGeometry args={[0.075, 0.075, 0.03, 40]} />
            <meshPhysicalMaterial color="#55a8ff" roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 24]} />
            <meshPhysicalMaterial color="#050505" roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.18, 0.018, 10, 48]} />
            <Metal finish={finish} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Anklet({ finish, variant }) {
  const curve = useMemo(() => loopCurve(1.25, 1.25), []);
  const curve2 = useMemo(() => loopCurve(1.32, 1.32), []);
  const heavy = variant === 'heavy';
  const n = heavy ? 26 : 14;
  return (
    <group rotation={[0.6, 0, 0]}>
      <Chain curve={curve} count={130} finish={finish} size={0.04} closed />
      {heavy && (
        <group position={[0, -0.08, 0]}>
          <Chain curve={curve2} count={140} finish={finish} size={0.03} closed />
        </group>
      )}
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const l = heavy && i % 2 ? 0.26 : 0.15;
        return (
          <group key={i} position={[1.25 * Math.cos(a), 0, 1.25 * Math.sin(a)]} rotation={[-0.6, 0, 0]}>
            <mesh position={[0, -l / 2, 0]}>
              <cylinderGeometry args={[0.006, 0.006, l, 6]} />
              <Metal finish={finish} />
            </mesh>
            <Bead r={heavy ? 0.075 : 0.055} finish={finish} position={[0, -l - 0.05, 0]} />
          </group>
        );
      })}
    </group>
  );
}

function Kada({ finish, gem, thin }) {
  const beads = thin ? 24 : 40;
  return (
    <group rotation={[0.9, 0, 0]}>
      {[[0, 0, 0], [0.2, -0.35, -0.35]].map((p, idx) => (
        <group key={idx} position={p}>
          <mesh>
            <torusGeometry args={[1.05, thin ? 0.07 : 0.15, 32, 160]} />
            <Metal finish={finish} />
          </mesh>
          {!thin &&
            [-1, 1].map((s) => (
              <mesh key={s} position={[0, 0, s * 0.13]}>
                <torusGeometry args={[1.12, 0.03, 12, 160]} />
                <Metal finish={finish} />
              </mesh>
            ))}
          {Array.from({ length: beads }, (_, i) => {
            const a = (i / beads) * Math.PI * 2;
            const r = thin ? 1.12 : 1.2;
            return thin ? (
              <Stone key={i} r={0.045} gem={gem} position={[Math.cos(a) * r, Math.sin(a) * r, 0.02]} detail={0} />
            ) : (
              <Bead key={i} r={0.035} finish={finish} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} />
            );
          })}
        </group>
      ))}
    </group>
  );
}

function Ring({ finish, gem }) {
  return (
    <group rotation={[0.25, 0, 0]} position={[0, -0.2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.085, 32, 128]} />
        <Metal finish={finish} />
      </mesh>
      <group position={[0, 0, 0.82]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.32, 0.1, 8]} />
          <Gem gem={gem} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.32, 0.3, 8]} />
          <Gem gem={gem} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3]} rotation={[Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]}>
              <cylinderGeometry args={[0.02, 0.025, 0.36, 8]} />
              <Metal finish={finish} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Studs({ finish, gem }) {
  return [-0.75, 0.75].map((x) => (
    <group key={x} position={[x, 0, 0]} rotation={[0, x * -0.3, 0]}>
      <Disc r={0.52} h={0.06} finish={finish} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <Stone key={i} r={0.15} gem={gem} position={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0.08]} />;
      })}
      <Stone r={0.17} gem={gem} position={[0, 0, 0.1]} />
    </group>
  ));
}

function ToeRing({ finish }) {
  return [-0.6, 0.6].map((x) => (
    <group key={x} position={[x, 0, 0]} rotation={[0.9, 0, 0]}>
      {[0, 0.09, 0.18].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <torusGeometry args={[0.45, 0.04, 16, 80]} />
          <Metal finish={finish} />
        </mesh>
      ))}
      <group position={[0, -0.47, -0.05]}>
        {Array.from({ length: 6 }, (_, i) => (
          <Bead key={i} r={0.055} finish={finish} position={[Math.cos((i / 6) * Math.PI * 2) * 0.09, 0, Math.sin((i / 6) * Math.PI * 2) * 0.09]} />
        ))}
      </group>
    </group>
  ));
}

function Nazariya({ finish }) {
  return [-0.55, 0.55].map((x, k) => (
    <group key={x} position={[x, k * 0.15, -k * 0.2]} rotation={[0.9, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.55, 0.06, 16, 80]} />
        <Metal finish={finish} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshPhysicalMaterial color="#050505" roughness={0.05} clearcoat={1} />
          </mesh>
        );
      })}
    </group>
  ));
}

const JHUMKA = [[0.0, 0.55], [0.1, 0.52], [0.24, 0.38], [0.38, 0.12], [0.48, -0.15], [0.54, -0.32], [0.56, -0.36], [0.5, -0.36]];
function Jhumka({ finish, gem, variant }) {
  const s = variant === 'mini' ? 0.8 : 1;
  return [-0.68, 0.68].map((x) => (
    <group key={x} position={[x, -0.1, 0]} scale={s}>
      <Lathe profile={JHUMKA} finish={finish} />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <Pearl key={i} r={0.045} position={[Math.cos(a) * 0.55, -0.48 - (i % 2) * 0.07, Math.sin(a) * 0.55]} />;
      })}
      <Bead r={0.06} finish={finish} position={[0, 0.66, 0]} />
      <Bead r={0.05} finish={finish} position={[0, 0.78, 0]} />
      <group position={[0, 1.02, 0]}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0]} rotation={[0, 0, a + Math.PI / 2]} scale={[0.06, 0.1, 0.03]}>
              <sphereGeometry args={[1, 16, 16]} />
              <Metal finish={finish} />
            </mesh>
          );
        })}
        {gem && gem !== 'none' ? <Stone r={0.08} gem={gem === 'pearl' ? 'ruby' : gem} position={[0, 0, 0.04]} /> : <Bead r={0.08} finish={finish} position={[0, 0, 0.03]} />}
      </group>
    </group>
  ));
}

const KALASH = [[0, -1.05], [0.5, -1.05], [0.56, -0.98], [0.5, -0.88], [0.72, -0.6], [0.9, -0.2], [0.82, 0.18], [0.45, 0.5], [0.36, 0.62], [0.4, 0.7], [0.5, 0.76], [0.46, 0.8], [0.34, 0.72]];
function Kalash({ finish }) {
  return (
    <group position={[0, -0.25, 0]}>
      <Lathe profile={KALASH} finish={finish} />
      {[-62, -31, 0, 31, 62, 180].map((a, i) => (
        <mesh key={i} position={[Math.sin(a * D2R) * 0.35, 1.05, i === 5 ? -0.25 : 0.05]} rotation={[0, 0, -a * D2R * 0.9]} scale={[0.13, 0.42, 0.03]}>
          <sphereGeometry args={[1, 24, 24]} />
          <Metal finish={finish} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]} scale={[0.32, 0.38, 0.32]}>
        <sphereGeometry args={[1, 40, 40]} />
        <Metal finish={finish} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Flame({ position, scale = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.y = scale * (1 + Math.sin(clock.elapsedTime * 13 + position[0] * 5) * 0.08);
  });
  return (
    <group position={position}>
      <mesh ref={ref} scale={scale}>
        <coneGeometry args={[0.07, 0.28, 16]} />
        <meshBasicMaterial color="#ffb02e" toneMapped={false} />
      </mesh>
      <pointLight color="#ff9a3c" intensity={1.2} distance={2.5} />
    </group>
  );
}

const DIYA = [[0, -0.42], [0.32, -0.42], [0.34, -0.38], [0.2, -0.3], [0.18, -0.2], [0.5, -0.1], [0.82, 0.08], [0.86, 0.14], [0.8, 0.14], [0.45, -0.03], [0, -0.06]];
function Diya({ finish }) {
  return [[-0.75, 0, -0.3, 0.8], [0.55, -0.1, 0.2, 1]].map(([x, y, z, s], i) => (
    <group key={i} position={[x, y, z]} scale={s}>
      <Lathe profile={DIYA} finish={finish} />
      <mesh position={[0.86, 0.12, 0]} rotation={[0, 0, -Math.PI / 2 + 0.3]}>
        <coneGeometry args={[0.1, 0.32, 24, 1, true]} />
        <Metal finish={finish} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 40]} />
        <meshStandardMaterial color="#6b4a12" roughness={0.2} metalness={0.3} />
      </mesh>
      <Flame position={[1.0, 0.32, 0]} />
    </group>
  ));
}

const GLASS = [[0, -0.95], [0.5, -0.95], [0.54, -0.9], [0.62, 0.85], [0.66, 0.95], [0.6, 0.95], [0.57, 0.85], [0.48, -0.85], [0, -0.87]];
const PANCHA = [[0, -0.7], [0.45, -0.7], [0.4, -0.62], [0.32, -0.45], [0.42, -0.2], [0.55, 0.4], [0.6, 0.5], [0.55, 0.5], [0.5, 0.4], [0.36, -0.2], [0.26, -0.42], [0, -0.44]];
function Glass({ finish, variant }) {
  if (variant === 'panchapatra')
    return (
      <group>
        <Lathe profile={PANCHA} finish={finish} />
        <mesh position={[0.35, 0.65, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 12]} />
          <Metal finish={finish} />
        </mesh>
      </group>
    );
  return [[-0.7, -0.05, -0.4, 0.85], [0.55, 0, 0.2, 1]].map(([x, y, z, s], i) => (
    <group key={i} position={[x, y, z]} scale={s}>
      <Lathe profile={GLASS} finish={finish} />
      {[-0.3, 0.35].map((yy) => (
        <mesh key={yy} position={[0, yy, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55 + (yy + 0.9) * 0.045, 0.012, 8, 96]} />
          <Metal finish={finish} roughness={0.35} />
        </mesh>
      ))}
    </group>
  ));
}

const BOWL = [[0, -0.55], [0.42, -0.55], [0.46, -0.5], [0.4, -0.42], [0.72, -0.25], [0.95, 0.1], [1.0, 0.25], [0.95, 0.25], [0.88, 0.1], [0.66, -0.22], [0, -0.34]];
function Bowl({ finish }) {
  return (
    <group position={[0, -0.1, 0]}>
      <Lathe profile={BOWL} finish={finish} />
      <group position={[0.5, 0.5, 0.2]} rotation={[0.2, 0, -0.75]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 1.3, 12]} />
          <Metal finish={finish} />
        </mesh>
        <mesh position={[0, -0.72, 0]} scale={[0.17, 0.24, 0.06]}>
          <sphereGeometry args={[1, 24, 24]} />
          <Metal finish={finish} />
        </mesh>
      </group>
    </group>
  );
}

const LAMP = [[0, -1.3], [0.7, -1.3], [0.76, -1.2], [0.5, -1.08], [0.2, -0.95], [0.14, -0.8], [0.26, -0.68], [0.12, -0.56], [0.1, -0.3], [0.22, -0.18], [0.1, -0.06], [0.08, 0.25], [0.12, 0.32], [0.6, 0.42], [0.92, 0.55], [0.94, 0.62], [0.86, 0.6], [0.5, 0.48], [0.1, 0.46], [0.06, 0.5]];
function Lamp({ finish }) {
  return (
    <group position={[0, 0.05, 0]} scale={0.95}>
      <Lathe profile={LAMP} finish={finish} />
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
        <Metal finish={finish} />
      </mesh>
      <mesh position={[0, 1.25, 0]} scale={[0.2, 0.14, 0.12]}>
        <sphereGeometry args={[1, 24, 24]} />
        <Metal finish={finish} />
      </mesh>
      <mesh position={[0.16, 1.42, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.035, 0.05, 0.36, 12]} />
        <Metal finish={finish} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return <Flame key={i} position={[Math.cos(a) * 0.9, 0.78, Math.sin(a) * 0.9]} scale={0.8} />;
      })}
    </group>
  );
}

const KUMKUM = [[0, -0.8], [0.72, -0.8], [0.76, -0.72], [0.7, -0.62], [0.7, 0.0], [0.8, 0.05], [0.78, 0.12], [0.6, 0.3], [0.32, 0.5], [0.14, 0.58], [0.1, 0.66], [0.16, 0.76], [0.08, 0.9], [0, 0.95]];
function Kumkum({ finish }) {
  return (
    <group position={[0, -0.05, 0]}>
      <Lathe profile={KUMKUM} finish={finish} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.71, -0.35, Math.sin(a) * 0.71]} rotation={[0, -a + Math.PI / 2, 0]} scale={[0.07, 0.12, 0.02]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhysicalMaterial color={i % 2 ? '#1a6b5a' : '#1b3d9c'} roughness={0.1} clearcoat={1} />
          </mesh>
        );
      })}
    </group>
  );
}

const THALI = [[0, -0.1], [1.5, -0.1], [1.62, 0.02], [1.66, 0.08], [1.58, 0.06], [1.4, -0.02], [0, -0.04]];
const SMALL_BOWL = [[0, -0.12], [0.18, -0.12], [0.26, 0.04], [0.28, 0.1], [0.24, 0.1], [0.2, 0.0], [0, -0.06]];
function Thali({ finish }) {
  return (
    <group rotation={[0.35, 0, 0]} position={[0, -0.2, 0]}>
      <Lathe profile={THALI} finish={finish} />
      {Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return <Bead key={i} r={0.04} finish={finish} position={[Math.cos(a) * 1.6, 0.08, Math.sin(a) * 1.6]} />;
      })}
      {[[0.15, -0.45, '#b3122c'], [0.7, 0.05, '#e6a312']].map(([x, z, c]) => (
        <group key={x} position={[x, 0.08, z]}>
          <Lathe profile={SMALL_BOWL} finish={finish} />
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.22, 32]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
        </group>
      ))}
      <group position={[-0.7, 0.15, 0]} scale={0.45}>
        <Lathe profile={DIYA} finish={finish} />
        <Flame position={[0.8, 0.3, 0]} />
      </group>
      <group position={[-0.1, 0.1, 0.65]}>
        <Lathe profile={[[0, -0.0], [0.2, 0], [0.18, 0.1], [0.12, 0.3], [0.06, 0.36], [0, 0.36]]} finish={finish} />
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
          <Metal finish={finish} />
        </mesh>
      </group>
    </group>
  );
}

export function CoinModel({ finish = 'silver', label = '10 g', r = 1.2, rotation = [Math.PI / 2, 0, 0], ...props }) {
  const tex = useCoinTexture(finish, label);
  return (
    <mesh {...props} rotation={rotation}>
      <cylinderGeometry args={[r, r, r * 0.1, 96]} />
      <Metal attach="material-0" finish={finish} />
      <Metal attach="material-1" finish={finish} map={tex} bumpMap={tex} bumpScale={1.5} />
      <Metal attach="material-2" finish={finish} map={tex} bumpMap={tex} bumpScale={1.5} />
    </mesh>
  );
}

export function BarModel({ finish = 'silver', label = '1 kg', ...props }) {
  const tex = useBarTexture(finish, label);
  return (
    <group {...props}>
      <RoundedBox args={[2.4, 0.5, 1.12]} radius={0.08} smoothness={4}>
        <Metal finish={finish} />
      </RoundedBox>
      <mesh position={[0, 0.252, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.1, 0.98]} />
        <meshStandardMaterial map={tex} transparent metalness={0.6} roughness={0.4} polygonOffset polygonOffsetFactor={-2} />
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
  kalash: Kalash,
  diya: Diya,
  glass: Glass,
  bowl: Bowl,
  lamp: Lamp,
  kumkum: Kumkum,
  thali: Thali,
  coin: ({ finish, label }) => <CoinModel finish={finish} label={label} />,
  bar: ({ finish, label }) => <BarModel finish={finish} label={label} />,
};
