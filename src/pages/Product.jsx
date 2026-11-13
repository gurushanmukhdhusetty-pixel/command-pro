import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { productImages, useIsMobile } from '../lib/media';
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

function Zoomable({ p, n }) {
  const ref = useRef();
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div className="pd-zoom" ref={ref} onMouseMove={move}>
      <ProductImage p={p} n={n} eager sizes="(max-width: 760px) 100vw, 55vw" />
    </div>
  );
}

function Gallery({ p, view, setView }) {
  const mobile = useIsMobile();
  const imgs = productImages(p);
  const track = useRef();
  const [slide, setSlide] = useState(0);
  const on3d = view === '3d' && p.model;
  if (mobile && !on3d) {
    return (
      <>
        <div className="pd-swipe" ref={track} onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {imgs.map((_, i) => (
            <div className="pd-slide" key={i}>
              <ProductImage p={p} n={i} eager={i === 0} sizes="100vw" />
            </div>
          ))}
        </div>
        <div className="pd-dots">
          {imgs.map((_, i) => (
            <i key={i} className={slide === i ? 'on' : ''} />
          ))}
          {p.model && (
            <button className="btn btn-sm btn-ghost view3d-inline" onClick={() => setView('3d')}>
              ⟲ View in 3D
            </button>
          )}
        </div>
      </>
    );
  }
  return (
    <>
      <div className={`pd-stage ${on3d ? 'is3d' : ''}`}>
        {on3d ? (
          <>
            <Three scene="viewer" kind={p.model} finish={p.art.finish} gem={p.art.gem} variant={p.art.variant} label={p.art.label} className="pd-three" fallback={<ProductImage p={p} eager />} />
            <span className="pd-hint">Drag to rotate · pinch or scroll to zoom</span>
            {mobile && (
              <button className="btn btn-sm btn-ghost view3d" onClick={() => setView(0)}>
                ✕ Photos
              </button>
            )}
          </>
        ) : (
          <Zoomable p={p} n={typeof view === 'number' ? view : 0} />
        )}
      </div>
      {!mobile && (
        <div className="pd-thumbs">
          {imgs.map((_, i) => (
            <button key={i} className={`pd-thumb ${view === i ? 'on' : ''}`} onClick={() => setView(i)}>
              <ProductImage p={p} n={i} sizes="120px" />
            </button>
          ))}
          {p.model && (
            <button className={`pd-thumb t3d ${on3d ? 'on' : ''}`} onClick={() => setView('3d')}>
              <span>3D</span>
              <small>Rotate</small>
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default function Product() {
  const { id } = useParams();
  const { rates, settings, status } = useRates();
  const { products, addToCart, toggleWish, wish } = useStore();
  const p = products.find((x) => x.id === id);
  const [view, setView] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  useEffect(() => {
    setView(0);
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
            <Gallery p={p} view={view} setView={setView} />
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
              <strong className="flash" key={price.total}>{rupee(price.total * qty)}</strong>
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

        <div className="buybar">
          <div>
            <small>{p.name}</small>
            <strong>{rupee(price.total * qty)}</strong>
          </div>
          <button className="btn btn-gold" onClick={() => addToCart(p.id, { size, qty })}>
            Add to bag
          </button>
        </div>

        {related.length > 0 && (
          <section className="section">
            <SectionTitle eyebrow="From the same house" title="You may also love" />
            <div className="grid-products m-hscroll">
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
