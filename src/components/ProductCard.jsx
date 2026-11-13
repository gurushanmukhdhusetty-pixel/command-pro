import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { priceProduct } from '../lib/pricing';
import { grams, rupee } from '../lib/format';

const productHasAlt = (p) => p.images?.length > 1;

export function useTilt(max = 10) {
  const ref = useRef();
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

export default function ProductCard({ p }) {
  const { rates, settings } = useRates();
  const { wish, toggleWish, addToCart } = useStore();
  const tilt = useTilt(12);
  const price = priceProduct(p, rates, settings);
  const liked = wish.includes(p.id);
  return (
    <article className="pcard" {...tilt}>
      <div className="pcard-inner">
        <Link to={`/product/${p.id}`} className="pcard-img">
          <ProductImage p={p} />
          {productHasAlt(p) && <ProductImage p={p} n={1} className="pimg-alt" />}
          <span className="pcard-shine" />
          {p.badge && <span className="pcard-badge">{p.badge}</span>}
          {p.model && <span className="pcard-3d">3D</span>}
        </Link>
        <button className={`pcard-wish ${liked ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-label="Toggle wishlist">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z" /></svg>
        </button>
        <div className="pcard-body">
          <div className="pcard-meta">
            <span>{p.category}</span>
            <span>
              {grams(p.weight)} · {p.purity === 999 ? '99.9' : '92.5'}
            </span>
          </div>
          <Link to={`/product/${p.id}`} className="pcard-name">
            {p.name}
          </Link>
          <div className="pcard-foot">
            <div>
              <div className="pcard-price flash" key={price.total}>{rupee(price.total)}</div>
              <div className="tiny muted">incl. GST · live rate</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => addToCart(p.id, { size: p.sizes?.[1] || p.sizes?.[0] })}>
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
