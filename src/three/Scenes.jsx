// Live, interactive 3D scenes (desktop hero, product viewer, bullion desk).
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, N8AO, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { BarModel, CoinModel, MODELS } from './Models';
import { BACKDROP, EarStand, Lights, Sweep } from './Studio';

function Turntable({ speed = 0.12, children, ...p }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return (
    <group ref={ref} {...p}>
      {children}
    </group>
  );
}

function CameraDrift({ base = [0, 2.2, 7.5], target = [0, 0.6, 0], amount = 0.5 }) {
  useFrame(({ camera, pointer }, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, base[0] + pointer.x * amount, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, base[1] + pointer.y * amount * 0.4, 2.5, dt);
    camera.lookAt(...target);
  });
  return null;
}

const GL = { antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 };

export function HeroScene() {
  const look = BACKDROP.hero;
  return (
    <Canvas dpr={[1, 1.75]} shadows camera={{ position: [0, 2.2, 7.5], fov: 30 }} gl={GL}>
      <Suspense fallback={null}>
        <color attach="background" args={[look.bg]} />
        <fog attach="fog" args={[look.bg, 9, 24]} />
        <Lights />
        <spotLight position={[1.5, 10, 5]} angle={0.4} penumbra={1} intensity={95} decay={1.5} color="#fff4e6" />
        <Sweep look={look} />
        <Turntable speed={0.1}>
          <group position={[-0.25, 0, 0.2]} scale={0.95}>
            <MODELS.kada finish="silver" />
          </group>
          <group position={[1.75, 0, -0.9]} scale={0.55}>
            <EarStand look={look} height={2.75} />
            <group position={[0, 1.5, -0.25]}>
              <MODELS.jhumka finish="gold" gem="ruby" />
            </group>
          </group>
          <group position={[-1.9, 0.05, 1.0]} rotation={[0, 0.5, 0]}>
            <CoinModel finish="gold24" label="10 g" r={0.5} rotation={[0, 0, 0]} />
          </group>
          <group position={[-1.45, 0.25, -1.3]} rotation={[0, 0.6, 0]} scale={0.55}>
            <BarModel finish="silver" label="1 kg" />
          </group>
        </Turntable>
        <ContactShadows position={[0, 0.002, 0]} opacity={0.75} scale={10} blur={2.2} far={2.5} resolution={1024} />
        <CameraDrift />
        <EffectComposer multisampling={4} disableNormalPass>
          <N8AO aoRadius={0.35} intensity={2} quality="performance" />
          <Vignette offset={0.25} darkness={0.6} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

export function ProductViewer({ kind, finish = 'silver', gem = 'none', variant, label }) {
  const Model = MODELS[kind];
  if (!Model) return null;
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.8, 5.6], fov: 36 }} gl={GL}>
      <Suspense fallback={null}>
        <color attach="background" args={['#120b0d']} />
        <Lights />
        <group position={[0, -0.2, 0]}>
          <Model finish={finish} gem={gem} variant={variant} label={label} />
        </group>
        <ContactShadows position={[0, -1.6, 0]} opacity={0.6} scale={8} blur={2.6} far={3} />
        <OrbitControls autoRotate autoRotateSpeed={1.2} enablePan={false} minDistance={2.5} maxDistance={9} />
      </Suspense>
    </Canvas>
  );
}

export function BullionScene() {
  const look = BACKDROP.bullion;
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 2.6, 7.4], fov: 34 }} gl={GL}>
      <Suspense fallback={null}>
        <color attach="background" args={[look.bg]} />
        <fog attach="fog" args={[look.bg, 9, 24]} />
        <Lights />
        <spotLight position={[1.5, 10, 5]} angle={0.45} penumbra={1} intensity={95} decay={1.5} color="#fff4e6" />
        <Sweep look={look} />
        <Turntable speed={0.12}>
          <BarModel finish="silver" label="1 kg" position={[0, 0.25, 0]} />
          <BarModel finish="silver" label="1 kg" position={[0, 0.25, 1.15]} />
          <BarModel finish="silver" label="1 kg" position={[0, 0.25, -1.15]} />
          <BarModel finish="silver" label="1 kg" position={[0, 0.81, -0.58]} rotation={[0, 0.05, 0]} />
          <BarModel finish="gold24" label="100 g" minted position={[0.1, 0.87, 0.6]} rotation={[-Math.PI / 2, 0, 0.15]} />
          {Array.from({ length: 6 }, (_, i) => (
            <CoinModel key={i} finish="gold24" label="10 g" r={0.5} position={[1.95, 0.02 + i * 0.041, 0.9]} rotation={[0, i * 0.4, 0]} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <CoinModel key={'s' + i} finish="silver" label="100 g" r={0.62} position={[-2.0, 0.025 + i * 0.05, -0.6]} rotation={[0, i * 0.3, 0]} />
          ))}
        </Turntable>
        <ContactShadows position={[0, 0.002, 0]} opacity={0.75} scale={10} blur={2.2} far={2} resolution={1024} />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0.8} maxPolarAngle={1.35} target={[0, 0.5, 0]} />
        <EffectComposer multisampling={4} disableNormalPass>
          <N8AO aoRadius={0.35} intensity={2} quality="performance" />
          <Vignette offset={0.25} darkness={0.6} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

export default HeroScene;
