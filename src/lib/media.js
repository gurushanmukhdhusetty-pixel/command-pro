import { useEffect, useState } from 'react';
import { PHOTOS } from '../data/photos';

// Studio renders live in /public/products/<id>-<n>.webp (1000px) and <id>-<n>-sm.webp (500px).
export function productImages(p) {
  if (!p) return [];
  if (p.images?.length) return p.images.map((src) => ({ src, srcSet: undefined }));
  const base = p.imageOf || p.id;
  if (!PHOTOS.has(base)) return [{ placeholder: true }];
  return [1].map((n) => ({
    src: `/products/${base}-${n}.webp`,
    srcSet: `/products/${base}-${n}-sm.webp 500w, /products/${base}-${n}.webp 1000w`,
  }));
}

export function useIsMobile(q = '(max-width: 760px)') {
  const get = () => typeof window !== 'undefined' && window.matchMedia(q).matches;
  const [m, setM] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}
