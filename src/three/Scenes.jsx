import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { StudioEnv, Metal, Gem } from './common';
import { BarModel, CoinModel, MODELS } from './Models';

function Parallax({ children, strength = 0.35 }) {
  const ref = useRef();
  useFrame(({ pointer }, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, pointer.x * strength, 3, dt);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, -pointer.y * strength * 0.5, 3, dt);
  });
  return <group ref={ref}>{children}</group>;
}

function Spin({ speed = 0.3, axis = 'y', children, ...p }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation[axis] += dt * speed;
  });
  return (
    <group ref={ref} {...p}>
      {children}
    </group>
  );
}

function RoyalKada() {
  return (
    <group>
      <mesh>
        <torusGeometry args={[1.25, 0.2, 48, 200]} />
        <Metal finish="silver" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.18]}>
          <torusGeometry args={[1.33, 0.035, 16, 200]} />
          <Metal finish="gold" />
        </mesh>
      ))}
      {Array.from({ length: 44 }, (_, i) => {
        const a = (i / 44) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.46, Math.sin(a) * 1.46, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <Metal finish="silver" />
          </mesh>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={'g' + i} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0.2]}>
            <icosahedronGeometry args={[0.085, 1]} />
            <Gem gem={i % 2 ? 'emerald' : 'ruby'} />
          </mesh>
        );
      })}
    </group>
  );
}

export function HeroScene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 35 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Suspense fallback={null}>
        <StudioEnv intensity={1.1} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff4e0" />
        <pointLight position={[-4, -2, 3]} intensity={30} color="#c9183f" />
        <pointLight position={[4, 2, -2]} intensity={25} color="#d4b06a" />
        <Parallax>
          <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
            <Spin speed={0.25} axis="y" rotation={[0.5, 0, 0.2]}>
              <RoyalKada />
            </Spin>
          </Float>
          <Float speed={2} rotationIntensity={1} floatIntensity={1.2}>
            <Spin speed={0.6} axis="y" position={[-1.95, 1.35, -0.6]} scale={0.55}>
              <CoinModel finish="gold24" label="10 g" />
            </Spin>
          </Float>
          <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1}>
            <group position={[1.9, -1.55, 0.4]} rotation={[0.5, -0.6, 0.15]} scale={0.6}>
              <BarModel finish="silver" label="1 kg" />
            </group>
          </Float>
          <Float speed={2.4} rotationIntensity={0.5} floatIntensity={1.4}>
            <group position={[2.3, 1.45, -0.4]} scale={0.6}>
              <MODELS.jhumka finish="gold" gem="ruby" />
            </group>
          </Float>
          <Float speed={3} rotationIntensity={2} floatIntensity={2}>
            <Spin speed={0.8} position={[-1.8, -1.35, 1]}>
              <mesh>
                <octahedronGeometry args={[0.28, 0]} />
                <Gem gem="ruby" />
              </mesh>
            </Spin>
          </Float>
          <Float speed={2.6} rotationIntensity={2} floatIntensity={2}>
            <Spin speed={-0.6} position={[0.4, 2.0, -1]}>
              <mesh>
                <octahedronGeometry args={[0.18, 0]} />
                <Gem gem="emerald" />
              </mesh>
            </Spin>
          </Float>
        </Parallax>
        <Sparkles count={70} scale={[9, 6, 4]} size={2.4} speed={0.35} color="#f6e7c1" opacity={0.8} />
      </Suspense>
    </Canvas>
  );
}

export function ProductViewer({ kind, finish = 'silver', gem = 'none', variant, label }) {
  const Model = MODELS[kind];
  if (!Model) return null;
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.6, 5.2], fov: 38 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Suspense fallback={null}>
        <StudioEnv intensity={1.15} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} />
        <pointLight position={[-3, -1, 3]} intensity={12} color="#ffd9a8" />
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
          <Model finish={finish} gem={gem} variant={variant} label={label} />
        </Float>
        <ContactShadows position={[0, -1.55, 0]} opacity={0.55} scale={7} blur={2.6} far={3} />
        <OrbitControls autoRotate autoRotateSpeed={1.6} enablePan={false} minDistance={3} maxDistance={8} />
      </Suspense>
    </Canvas>
  );
}

export function BullionScene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 2.4, 7.2], fov: 36 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Suspense fallback={null}>
        <StudioEnv intensity={1.2} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 4]} intensity={1.6} />
        <pointLight position={[-4, 1, 3]} intensity={25} color="#ffcf6b" />
        <Spin speed={0.18} position={[0, -0.6, 0]}>
          <BarModel finish="silver" label="1 kg" position={[0, 0, 0]} />
          <BarModel finish="silver" label="1 kg" position={[0, 0, 1.22]} />
          <BarModel finish="silver" label="1 kg" position={[0, 0, -1.22]} />
          <BarModel finish="gold24" label="100 g" position={[0.05, 0.52, 0.6]} rotation={[0, 0.08, 0]} scale={[0.75, 1, 0.9]} />
          <BarModel finish="silver" label="1 kg" position={[0, 0.52, -0.62]} rotation={[0, -0.04, 0]} />
          {Array.from({ length: 6 }, (_, i) => (
            <CoinModel key={i} finish="gold24" label="10 g" r={0.5} position={[1.9, -0.22 + i * 0.052, 0.9]} rotation={[0, i * 0.3, 0]} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <CoinModel key={'s' + i} finish="silver" label="100 g" r={0.62} position={[-1.95, -0.2 + i * 0.065, -0.7]} rotation={[0, i * 0.2, 0]} />
          ))}
        </Spin>
        <Float speed={2} rotationIntensity={0.6} floatIntensity={1}>
          <Spin speed={0.9} position={[0, 1.9, 0]} scale={0.6}>
            <CoinModel finish="gold24" label="8 g" />
          </Spin>
        </Float>
        <ContactShadows position={[0, -0.86, 0]} opacity={0.6} scale={10} blur={2.4} far={3} />
        <Sparkles count={40} scale={[8, 4, 4]} size={2} speed={0.3} color="#ffe9b0" />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0.8} maxPolarAngle={1.45} />
      </Suspense>
    </Canvas>
  );
}

export default HeroScene;
