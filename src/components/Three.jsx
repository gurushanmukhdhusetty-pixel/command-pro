import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Scenes = {
  hero: lazy(() => import('../three/Scenes').then((m) => ({ default: m.HeroScene }))),
  viewer: lazy(() => import('../three/Scenes').then((m) => ({ default: m.ProductViewer }))),
  bullion: lazy(() => import('../three/Scenes').then((m) => ({ default: m.BullionScene }))),
};

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

// Lazily mounts a 3D scene only when it scrolls into view (and only if WebGL exists).
export default function Three({ scene, fallback = null, className = '', ...props }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [ok] = useState(webglOK);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '200px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const S = Scenes[scene];
  return (
    <div ref={ref} className={`three ${className}`}>
      {ok && visible ? (
        <Suspense fallback={<div className="three-loading"><span /></div>}>
          <S {...props} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
