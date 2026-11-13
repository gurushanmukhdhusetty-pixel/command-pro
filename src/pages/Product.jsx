import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductArt from '../components/ProductArt';
import ProductCard from '../components/ProductCard';
import PriceBreakdown from '../components/PriceBreakdown';
import Three from '../components/Three';
import { SectionTitle } from '../components/Ornament';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { priceProduct, PURITY } from '../lib/pricing';
import { grams, rupee } from '../lib/format';
import { LINES } from '../data/products';
import { STORE } from '../config';
import NotFound from './NotFound';

const VIEWS = [
  { k: 'full', label: 'Front' },
  { k: 'zoom', label: 'Detail' },
  { k: 'close', label: 'Close-up' },
];

export default function Product() {
  const { id } = useParams();
  const { rates, settings, status } = useRates();
  const { products, addToCart, toggleWish, wish } = useStore();
  const p = products.find((x) => x.id === id);
  const [view, setView] = useState(p?.model ? '3d' : 'full');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  useEffect(() => {
    setView(p?.model ? '3d' : 'full');
    setSize(p?.sizes?.[1] || p?.sizes?.[0] || '');
    setQty(1);
    if (p) document.title = `${p.name} · VCH Jewellers`;
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return <NotFound />;
  const price = priceProduct(p, rates, settings);
  const related = products.filter((x) => x.line === p.line && x.id !== p.id).slice(0, 4);
  const liked = wish.includes(p.id);
  const waText = encodeURIComponent(
    `Namaste VCH Jewellers! I'd like to order:\n${p.name}${size ? ` (size ${size})` : ''} × ${qty}\nWeight ~${p.weight} g, ${PURITY[p.purity]?.label}\nShown price: ${rupee(price.total * qty)} (silver ₹${rates.silver.toFixed(2)}/g)\n${window.location.href}`,
  );

  return (
    <div className="page product-page">
      <div className="container">
        <div className="crumbs">
          <Link to="/">Home</Link> / <Link to={`/collections/${p.line}`}>{LINES[p.line]?.name}</Link> / <span>{p.name}</span>
        </div>
        <div className="pd-grid">
          <div className="pd-gallery">
            <div className={`pd-stage ${view}`}>
              {view === '3d' && p.model ? (
                <>
                  <Three scene="viewer" kind={p.model} finish={p.art.finish} gem={p.art.gem} variant={p.art.variant} label={p.art.label} className="pd-three" fallback={<ProductArt art={p.art} line={p.line} title={p.name} />} />
                  <span className="pd-hint">Drag to rotate · scroll to zoom</span>
                </>
              ) : (
                <div className={`pd-art v-${view}`}>
                  <ProductArt art={p.art} line={p.line} title={p.name} />
                </div>
              )}
            </div>
            <div className="pd-thumbs">
              {p.model && (
                <button className={`pd-thumb t3d ${view === '3d' ? 'on' : ''}`} onClick={() => setView('3d')}>
                  <span>3D</span>
                  <small>Rotate</small>
                </button>
              )}
              {VIEWS.map((v) => (
                <button key={v.k} className={`pd-thumb ${view === v.k ? 'on' : ''}`} onClick={() => setView(v.k)}>
                  <div className={`pd-art v-${v.k}`}>
                    <ProductArt art={p.art} line={p.line} title={v.label} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pd-info">
            <div className="eyebrow">
              {LINES[p.line]?.name} · {p.category}
            </div>
            <h1>{p.name}</h1>
            {p.rating && (
              <div className="pd-rating">
                <span className="stars">★★★★★</span> {p.rating} · {p.reviews} reviews
              </div>
            )}
            <div className="pd-price">
              <strong>{rupee(price.total * qty)}</strong>
              <span className={`live-chip ${status}`}>
                <i /> {status === 'live' ? 'Live price' : status === 'manual' ? 'Store rate' : 'Indicative'}
              </span>
            </div>
            <p className="muted small">Inclusive of 3% GST · price moves with the silver market until billed</p>
            <div className="specs">
              <div>
                <small>Weight</small>
                <b>{grams(p.weight)}</b>
              </div>
              <div>
                <small>Purity</small>
                <b>{PURITY[p.purity]?.label}</b>
              </div>
              <div>
                <small>Finish</small>
                <b style={{ textTransform: 'capitalize' }}>{p.art.finish === 'gold' ? 'Gold polish' : p.art.finish}</b>
              </div>
              <div>
                <small>Hallmark</small>
                <b>BIS · HUID</b>
              </div>
            </div>
            <p className="pd-desc">{p.description}</p>
            {p.sizes && (
              <div className="pd-opt">
                <label className="f-label">Size</label>
                <div className="chips">
                  {p.sizes.map((s) => (
                    <button key={s} className={`chip ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="pd-actions">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <button className="btn btn-gold grow" onClick={() => addToCart(p.id, { size, qty })}>
                Add to bag
              </button>
              <button className={`btn btn-icon ${liked ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-label="Wishlist">
                ♥
              </button>
            </div>
            <a className="btn btn-wa" href={`https://wa.me/${STORE.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer">
              Order / enquire on WhatsApp
            </a>
            <PriceBreakdown p={p} price={price} settings={settings} qty={qty} />
            <ul className="pd-details">
              {p.details?.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <div className="assure">
              <div>🛡️ BIS hallmark &amp; HUID</div>
              <div>♻️ Lifetime exchange</div>
              <div>🚚 Insured shipping</div>
              <div>✨ Free polishing</div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="section">
            <SectionTitle eyebrow="From the same house" title="You may also love" />
            <div className="grid-products">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
