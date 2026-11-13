import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { SectionTitle } from '../components/Ornament';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { priceBullion, priceProduct } from '../lib/pricing';
import { grams, rupee } from '../lib/format';
import { BULLION } from '../data/bullion';
import { STORE } from '../config';

export default function Cart() {
  const { rates, settings } = useRates();
  const { cart, products, setQty, clearCart } = useStore();
  const lines = cart
    .map((c) => {
      if (c.kind === 'bullion') {
        const b = BULLION.find((x) => x.id === c.id);
        if (!b) return null;
        const r = priceBullion(b, rates, settings);
        return { c, name: b.name, item: b, meta: `${b.metal === 'gold' ? '24K 999.9' : '999 silver'} · ${grams(b.weight)}`, unit: r.total, gst: r.gst, link: '/bullion' };
      }
      const p = products.find((x) => x.id === c.id);
      if (!p) return null;
      const r = priceProduct(p, rates, settings);
      return { c, name: p.name, item: p, meta: `${p.purity === 999 ? '99.9' : '92.5'} · ${grams(p.weight)}${c.size ? ` · Size ${c.size}` : ''}`, unit: r.total, gst: r.gst, link: `/product/${p.id}` };
    })
    .filter(Boolean);
  const total = lines.reduce((s, l) => s + l.unit * l.c.qty, 0);
  const gst = lines.reduce((s, l) => s + l.gst * l.c.qty, 0);
  const msg = encodeURIComponent(
    `Namaste VCH Jewellers! I'd like to place an order:\n\n${lines.map((l, i) => `${i + 1}. ${l.name} (${l.meta}) × ${l.c.qty} — ${rupee(l.unit * l.c.qty)}`).join('\n')}\n\nEstimated total: ${rupee(total)} (incl. GST)\nSilver rate: ₹${rates.silver.toFixed(2)}/g · Gold 24K: ${rupee(rates.gold24)}/10g`,
  );

  return (
    <div className="page">
      <div className="page-head">
        <div className="container">
          <SectionTitle eyebrow="Your selection" title="Shopping Bag" />
        </div>
      </div>
      <div className="container">
        {lines.length === 0 ? (
          <div className="empty big">
            <p>Your bag is empty.</p>
            <Link to="/shop" className="btn btn-gold">
              Discover silver
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-list">
              {lines.map((l) => (
                <div className="cart-row" key={l.c.key}>
                  <Link to={l.link} className="cart-img">
                    <ProductImage p={l.item} sizes="96px" />
                  </Link>
                  <div className="cart-info">
                    <Link to={l.link}>
                      <b>{l.name}</b>
                    </Link>
                    <span className="muted small">{l.meta}</span>
                    <div className="qty sm">
                      <button onClick={() => setQty(l.c.key, l.c.qty - 1)}>−</button>
                      <span>{l.c.qty}</span>
                      <button onClick={() => setQty(l.c.key, l.c.qty + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-price">
                    <b>{rupee(l.unit * l.c.qty)}</b>
                    <button className="link" onClick={() => setQty(l.c.key, 0)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button className="link" onClick={clearCart}>
                Clear bag
              </button>
            </div>
            <aside className="summary">
              <h3>Order summary</h3>
              <div>
                <span>Items</span>
                <b>{lines.reduce((s, l) => s + l.c.qty, 0)}</b>
              </div>
              <div>
                <span>Includes GST</span>
                <b>{rupee(gst)}</b>
              </div>
              <div>
                <span>Insured shipping</span>
                <b>{total >= 5000 ? 'Free' : rupee(150)}</b>
              </div>
              <div className="t">
                <span>Estimated total</span>
                <b>{rupee(total + (total >= 5000 ? 0 : 150))}</b>
              </div>
              <p className="tiny muted">
                Prices move with the live rate and are locked when you confirm and pay. Final invoice is on actual weight.
                {total >= 200000 && ' PAN is required for this order (₹2 lakh+).'}
              </p>
              <a className="btn btn-wa block" target="_blank" rel="noreferrer" href={`https://wa.me/${STORE.whatsapp}?text=${msg}`}>
                Confirm order on WhatsApp
              </a>
              <Link to="/contact" className="btn btn-ghost block">
                Reserve &amp; collect in store
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
