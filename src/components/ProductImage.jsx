import { useState } from 'react';
import { productImages } from '../lib/media';

// Real studio photograph of a product (or bullion item). `n` = view index (0 = hero shot).
export default function ProductImage({ p, n = 0, sizes = '(max-width: 760px) 50vw, 25vw', className = '', eager = false, alt }) {
  const imgs = productImages(p);
  const img = imgs[n] || imgs[0];
  const [loaded, setLoaded] = useState(false);
  if (!img) return null;
  if (img.placeholder)
    return (
      <div className={`pimg-ph ${className}`} role="img" aria-label={alt || p.name}>
        <span className="ph-mark">VCH</span>
        <span className="ph-name">{p.name}</span>
        <span className="ph-note">Studio photo coming soon</span>
      </div>
    );
  return (
    <img
      className={`pimg ${loaded ? 'is-loaded' : ''} ${className}`}
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      alt={alt || p.name}
      width="1000"
      height="1000"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
    />
  );
}
