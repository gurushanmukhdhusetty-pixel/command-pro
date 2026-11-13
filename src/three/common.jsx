import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Offline studio lighting (no HDR download needed) — gives metals real reflections.
export function StudioEnv({ intensity = 1 }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}

export const METAL3D = {
  silver: { color: '#eef0f4', metalness: 1, roughness: 0.14 },
  oxidised: { color: '#8b8d8b', metalness: 1, roughness: 0.38 },
  gold: { color: '#f2c86e', metalness: 1, roughness: 0.18 },
  gold24: { color: '#ffc94d', metalness: 1, roughness: 0.12 },
};
export const GEM3D = {
  ruby: '#e0103a',
  emerald: '#0fa968',
  sapphire: '#2457e0',
  diamond: '#ffffff',
  pearl: '#f6efe2',
  kundan: '#fff4cc',
  none: '#ffffff',
};

export function Metal({ finish = 'silver', ...rest }) {
  const m = METAL3D[finish] || METAL3D.silver;
  return <meshPhysicalMaterial {...m} clearcoat={0.35} clearcoatRoughness={0.2} envMapIntensity={1.3} {...rest} />;
}
export function Gem({ gem = 'ruby' }) {
  if (gem === 'pearl') return <meshPhysicalMaterial color="#f8f2e6" roughness={0.18} metalness={0} sheen={1} sheenColor="#ffe9f2" clearcoat={1} />;
  return (
    <meshPhysicalMaterial
      color={GEM3D[gem] || '#fff'}
      metalness={0}
      roughness={0.02}
      transmission={gem === 'diamond' || gem === 'none' ? 1 : 0.6}
      thickness={0.6}
      ior={gem === 'diamond' || gem === 'none' ? 2.4 : 1.77}
      clearcoat={1}
      envMapIntensity={2.5}
      flatShading
    />
  );
}

function drawCircleText(ctx, text, cx, cy, r, size) {
  ctx.save();
  ctx.font = `600 ${size}px Cinzel, Georgia, serif`;
  const chars = [...text];
  const total = chars.reduce((s, c) => s + ctx.measureText(c).width, 0) + chars.length * size * 0.18;
  let a = -Math.PI / 2 - total / r / 2;
  for (const c of chars) {
    const w = ctx.measureText(c).width + size * 0.18;
    a += w / 2 / r;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(c, -ctx.measureText(c).width / 2, 0);
    ctx.restore();
    a += w / 2 / r;
  }
  ctx.restore();
}

export function useCoinTexture(finish = 'silver', label = '10 g') {
  return useMemo(() => {
    const S = 1024;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');
    const gold = finish.startsWith('gold');
    const base = gold ? ['#fff0b8', '#e2ae3e'] : ['#ffffff', '#c3c8cf'];
    const ink = gold ? '#7a520c' : '#5b616a';
    const g = ctx.createRadialGradient(S * 0.4, S * 0.35, 40, S / 2, S / 2, S * 0.6);
    g.addColorStop(0, base[0]);
    g.addColorStop(1, base[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S * 0.46, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(S / 2 + Math.cos(a) * S * 0.43, S / 2 + Math.sin(a) * S * 0.43, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    drawCircleText(ctx, 'VCH JEWELLERS · HYDERABAD', S / 2, S / 2, S * 0.36, 58);
    ctx.save();
    ctx.translate(S / 2, S * 0.4);
    ctx.lineWidth = 6;
    for (const a of [-60, -30, 0, 30, 60]) {
      ctx.save();
      ctx.rotate((a * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.bezierCurveTo(-34, -6, -30, -64, 0, -96);
      ctx.bezierCurveTo(30, -64, 34, -6, 0, 30);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.font = '700 120px Cinzel, Georgia, serif';
    ctx.fillText(gold ? '999.9' : '999', S / 2, S * 0.6);
    ctx.font = '600 44px Cinzel, Georgia, serif';
    ctx.fillText(gold ? 'FINE GOLD' : 'FINE SILVER', S / 2, S * 0.67);
    ctx.font = '700 64px Cinzel, Georgia, serif';
    ctx.fillText(label, S / 2, S * 0.76);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [finish, label]);
}

export function useBarTexture(finish = 'silver', label = '1 kg') {
  return useMemo(() => {
    const W = 1024, H = 480;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const gold = finish.startsWith('gold');
    const ink = gold ? 'rgba(110,70,8,.9)' : 'rgba(70,76,86,.9)';
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.textAlign = 'center';
    ctx.font = '700 64px Cinzel, Georgia, serif';
    ctx.fillText('VCH JEWELLERS', W / 2, 140);
    ctx.font = '600 56px Cinzel, Georgia, serif';
    ctx.fillText(gold ? 'FINE GOLD 999.9' : 'FINE SILVER 999.0', W / 2, 240);
    ctx.font = '700 96px Cinzel, Georgia, serif';
    ctx.fillText(label, W / 2, 360);
    ctx.font = '500 32px Manrope, Arial, sans-serif';
    ctx.fillText('No. VC 2026 004127', W / 2, 415);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [finish, label]);
}
