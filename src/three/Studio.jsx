// Product-photography studio: velvet sweep, softbox environment, soft shadows, AO, auto-framed camera.
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AccumulativeShadows, Environment, Lightformer, RandomizedLight } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { MODELS } from './Models';
import { EnvBinder, Velvet } from './jewel';

export const BACKDROP = {
  bridal: { color: '#efe7da', sheen: '#ffffff', bg: '#f3ece1' },
  home: { color: '#ebe6dc', sheen: '#ffffff', bg: '#f1ece3' },
  casual: { color: '#eeeae4', sheen: '#ffffff', bg: '#f4f1ec' },
  bullion: { color: '#e9e4dc', sheen: '#ffffff', bg: '#efeae2' },
  hero: { color: '#efe7da', sheen: '#ffffff', bg: '#f3ece1' },
};

// how each kind is staged
export const POSE = {
  choker: { flat: true, rot: [-Math.PI / 2, 0, 0], el: 0.95, zoom: 0.8 },
  temple: { flat: true, rot: [-Math.PI / 2, 0, 0], el: 1.0, zoom: 0.85 },
  pendant: { flat: true, rot: [-Math.PI / 2, 0, 0], el: 1.0, zoom: 0.85 },
  tikka: { rot: [-Math.PI / 2, 0, 0.25], el: 1.05 },
  studs: { rot: [-Math.PI / 2, 0, 0], el: 0.95 },
  bracelet: { el: 0.85 },
  anklet: { el: 0.8 },
  toering: { el: 0.6 },
  nazariya: { el: 0.7 },
  kada: { stand: 'bangle', el: 0.35 },
  bangle: { stand: 'bangle', el: 0.35 },
  ring: { el: 0.25, rot: [0, 0.5, 0] },
  jhumka: { stand: 'ear', el: 0.12 },
  vaddanam: { el: 0.3 },
  kalash: { el: 0.28 },
  diya: { el: 0.45 },
  lamp: { el: 0.22 },
  glass: { el: 0.3 },
  bowl: { el: 0.5 },
  kumkum: { el: 0.32 },
  thali: { el: 0.75 },
  coin: { rot: [0, 0, 0], el: 0.95, coinFlat: true },
  bar: { el: 0.75 },
};

export const VIEWS = [
  { az: 0.32, del: 0, zoom: 1 },
  { az: -0.55, del: 0.12, zoom: 0.72 },
  { az: 0.05, del: 0.35, zoom: 0.9 },
];

export function Sweep({ look }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 40, 1, 120);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      if (z < -4) p.setY(i, Math.pow(-z - 4, 2) * 0.22);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow position={[0, -0.002, 0]}>
      <Velvet color={look.color} sheen={look.sheen} />
    </mesh>
  );
}

export function BangleStand({ look }) {
  return (
    <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.6, 0.95, 2.0, 64]} />
      <Velvet color={look.color} sheen={look.sheen} />
    </mesh>
  );
}

export function EarStand({ look, height }) {
  return (
    <group>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.06, 64]} />
        <Velvet color={look.color} sheen={look.sheen} />
      </mesh>
      <mesh position={[0, height / 2, -0.25]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, height, 24]} />
        <Velvet color={look.color} sheen={look.sheen} />
      </mesh>
      <mesh position={[0, height, -0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 24]} />
        <Velvet color={look.color} sheen={look.sheen} />
      </mesh>
    </group>
  );
}

// positions the subject on the floor and frames the camera around it
function Stage({ subject, view, look, onReady }) {
  const pose = POSE[subject.kind] || {};
  const Model = MODELS[subject.kind];
  const group = useRef();
  const inner = useRef();
  const { camera } = useThree();
  const [standH, setStandH] = useState(0);

  useLayoutEffect(() => {
    const g = inner.current;
    g.position.set(0, 0, 0);
    group.current.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g);
    const c = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    if (pose.stand === 'bangle') {
      g.position.set(-c.x, 0.55 - box.min.y, -c.z);
    } else if (pose.stand === 'ear') {
      g.position.set(-c.x, 0.2 - box.min.y, -c.z);
      setStandH(0.2 + size.y + 0.02);
    } else {
      g.position.set(-c.x, -box.min.y, -c.z);
    }
    group.current.updateMatrixWorld(true);
    const full = new THREE.Box3().setFromObject(group.current);
    if (pose.stand === 'bangle') full.expandByPoint(new THREE.Vector3(0, 0, 0));
    const sphere = full.getBoundingSphere(new THREE.Sphere());
    const v = VIEWS[view] || VIEWS[0];
    const el = Math.min(1.45, (pose.el ?? 0.5) + v.del);
    const fov = (camera.fov * Math.PI) / 180;
    const dist = (sphere.radius / Math.sin(fov / 2)) * 1.08 * v.zoom * (pose.zoom || 1);
    const t = sphere.center.clone();
    camera.position.set(t.x + dist * Math.cos(el) * Math.sin(v.az), t.y + dist * Math.sin(el), t.z + dist * Math.cos(el) * Math.cos(v.az));
    camera.lookAt(t);
    camera.near = dist / 20;
    camera.far = dist * 20;
    camera.updateProjectionMatrix();
    onReady?.();
  }, [subject, view]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group ref={group}>
      {pose.stand === 'bangle' && <BangleStand look={look} />}
      {pose.stand === 'ear' && standH > 0 && <EarStand look={look} height={standH} />}
      <group ref={inner}>
        <group rotation={pose.coinFlat ? [0, 0.3, 0] : pose.rot || [0, 0, 0]}>
          {subject.kind === 'coin' ? (
            <MODELS.coin finish={subject.finish} label={subject.label} />
          ) : (
            <Model finish={subject.finish} gem={subject.gem} variant={subject.variant} label={subject.label} flat={pose.flat} />
          )}
        </group>
      </group>
    </group>
  );
}

export function Lights() {
  return (
    <>
    <EnvBinder />
    <Environment resolution={512} frames={1}>
      <color attach="background" args={['#0d0d0d']} />
      <Lightformer form="rect" intensity={3} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
      <Lightformer form="rect" intensity={7} position={[-6, 2.5, 2]} rotation-y={Math.PI / 2} scale={[2, 10, 1]} />
      <Lightformer form="rect" intensity={6} position={[6, 2.5, 1]} rotation-y={-Math.PI / 2} scale={[2, 10, 1]} />
      <Lightformer form="rect" intensity={3.5} position={[0, 3, 8]} scale={[14, 4, 1]} />
      <Lightformer form="rect" intensity={2.5} position={[0, 3, -8]} rotation-y={Math.PI} scale={[14, 4, 1]} />
      <Lightformer form="ring" intensity={5} color="#fff2dc" position={[3, 5, -5]} scale={2.5} />
      <Lightformer form="rect" intensity={0.8} color="#d9b38c" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[14, 14, 1]} />
    </Environment>
    </>
  );
}

function ReadyFlag({ after = 6 }) {
  const n = useRef(0);
  useFrame(() => {
    n.current++;
    if (n.current === after) window.__RENDER_READY = true;
  });
  return null;
}

export function StudioShot({ subject, view = 0, line = 'bridal', quality = 'high' }) {
  const look = BACKDROP[line] || BACKDROP.bridal;
  return (
    <Canvas
      shadows
      dpr={1}
      camera={{ fov: 24, position: [0, 3, 8] }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}>
      <color attach="background" args={[look.bg]} />
      <fog attach="fog" args={[look.bg, 10, 30]} />
      <Lights />
      <spotLight position={[1.5, 10, 5]} angle={0.6} penumbra={1} intensity={28} decay={1.5} color="#fff4e6" />
      <spotLight position={[-6, 4, -3]} angle={0.5} penumbra={1} intensity={25} decay={1.5} color="#ffe2c4" />
      <Sweep look={look} />
      <Stage subject={subject} view={view} look={look} />
      <AccumulativeShadows temporal={false} frames={18} alphaTest={0.6} opacity={0.55} scale={12} resolution={1024} position={[0, 0.001, 0]} color="#000">
        <RandomizedLight amount={8} radius={5} ambient={0.55} intensity={1.1} position={[1.5, 9, 4]} bias={0.0005} mapSize={1024} />
      </AccumulativeShadows>
      <EffectComposer multisampling={4} disableNormalPass>
        <N8AO aoRadius={0.35} intensity={2.2} distanceFalloff={0.6} quality="medium" />
        <Bloom luminanceThreshold={0.98} intensity={0.15} mipmapBlur />
        <Vignette offset={0.35} darkness={0.18} />
      </EffectComposer>
      <ReadyFlag after={quality === 'high' ? 12 : 6} />
    </Canvas>
  );
}
