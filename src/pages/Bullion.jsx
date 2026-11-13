import { useState } from 'react';
import Three from '../components/Three';
import ProductImage from '../components/ProductImage';
import { useIsMobile } from '../lib/media';
import Reveal from '../components/Reveal';
import { SectionTitle, Divider } from '../components/Ornament';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { priceBullion } from '../lib/pricing';
import { grams, rupee, rupee2, timeAgo } from '../lib/format';
import { BULLION } from '../data/bullion';


function Calculator() {
  const { rates, settings } = useRates();
  const [metal, setMetal] = useState('silver');
  const [weight, setWeight] = useState(100);
  const [mode, setMode] = useState('buy');
  const b = { metal, weight: +weight || 0, purity: 999, premium: 0 };
  const r = priceBullion(b, rates, settings);
  return (
    <div className="calc">
      <div className="calc-tabs">
        {['silver', 'gold'].map((m) => (
          <button key={m} className={metal === m ? 'on' : ''} onClick={() => setMetal(m)}>
            {m === 'silver' ? 'Silver 999' : 'Gold 24K'}
          </button>
        ))}
      </div>
      <div className="calc-tabs sm">
        {[['buy', 'I want to buy'], ['sell', 'I want to sell']].map(([m, l]) => (
          <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
            {l}
          </button>
        ))}
      </div>
      <label className="f-label">Weight (grams)</label>
      <input className="input big" type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <div className="calc-presets">
        {(metal === 'gold' ? [1, 8, 10, 50, 100] : [10, 100, 500, 1000, 5000]).map((w) => (
          <button key={w} className="chip" onClick={() => setWeight(w)}>
            {grams(w)}
          </button>
        ))}
      </div>
      <div className="calc-out">
        <div>
          <span>Metal value</span>
          <b>{rupee(r.base)}</b>
        </div>
        {mode === 'buy' ? (
          <>
            <div>
              <span>GST 3%</span>
              <b>{rupee(r.gst)}</b>
            </div>
            <div className="t">
              <span>You pay (approx.)</span>
              <b>{rupee(r.total)}</b>
            </div>
            <p className="tiny muted">Coin / bar premium is added per product below. Metal value at {metal === 'gold' ? `${rupee(rates.gold24)}/10 g` : `${rupee2(rates.silver)}/g`}.</p>
          </>
        ) : (
          <>
            <div>
              <span>Buyback spread</span>
              <b>−{(r.spread * 100).toFixed(1)}%</b>
            </div>
            <div className="t">
              <span>We pay you</span>
              <b>{rupee(r.buyback)}</b>
            </div>
            <p className="tiny muted">For sealed VCH / recognised refinery bullion. Others are tested by XRF before purchase.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Bullion() {
  const { rates, settings, status, updatedAt, spot } = useRates();
  const { addToCart } = useStore();
  const [metal, setMetal] = useState('all');
  const mobile = useIsMobile();
  const [show3d, setShow3d] = useState(false);
  const heroItem = BULLION.find((x) => x.id === 'ag-bar-1000');
  const list = BULLION.filter((b) => metal === 'all' || b.metal === metal);
  return (
    <div className="page bullion-page">
      <section className="bullion-hero">
        <div className="container bh-grid">
          <div>
            <div className="eyebrow">VCH Bullion Desk</div>
            <h1>
              <span className="gold-text">Gold</span> &amp; <span className="silver-text">Silver</span> Bullion
            </h1>
            <Divider className="left" />
            <p className="lead">Sealed, serial-numbered coins and bars, priced to the minute on the international spot rate — and bought back the same way.</p>
            <div className="bh-rates">
              <div className="bh-rate silver">
                <small>Silver 999</small>
                <strong>{rupee(rates.silver * 1000)}</strong>
                <em>per kg · {rupee2(rates.silver)}/g</em>
              </div>
              <div className="bh-rate gold">
                <small>Gold 24K 999</small>
                <strong>{rupee(rates.gold24)}</strong>
                <em>per 10 g · {rupee(rates.gold24 / 10)}/g</em>
              </div>
            </div>
            <p className="tiny muted" style={{ marginTop: 12 }}>
              <span className={`dot ${status}`} /> {status === 'live' ? 'Live' : status === 'manual' ? 'Store rate' : 'Indicative'} · updated {timeAgo(updatedAt)} · spot XAG ${spot.xagUsd.toFixed(2)} · XAU $
              {spot.xauUsd.toFixed(0)} · USD/INR {spot.usdInr.toFixed(2)} · excl. GST
            </p>
          </div>
          <div className="bh-3d">
            {mobile && !show3d ? (
              <>
                <ProductImage p={heroItem} eager sizes="100vw" className="bh-photo" />
                <button className="btn btn-sm btn-ghost view3d" onClick={() => setShow3d(true)}>
                  ⟲ View in 3D
                </button>
              </>
            ) : (
              <>
                <Three scene="bullion" fallback={<ProductImage p={heroItem} eager sizes="50vw" className="bh-photo" />} />
                <span className="pd-hint">Drag to turn the stack</span>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <SectionTitle eyebrow="Buy at live rate" title="Coins & Bars" sub="Price = metal value at live rate + minting premium + 3% GST. Buyback = metal value − small spread, no GST." />
          <div className="calc-tabs center">
            {[['all', 'All'], ['gold', 'Gold'], ['silver', 'Silver']].map(([m, l]) => (
              <button key={m} className={metal === m ? 'on' : ''} onClick={() => setMetal(m)}>
                {l}
              </button>
            ))}
          </div>
          <div className="bullion-grid">
            {list.map((b, i) => {
              const r = priceBullion(b, rates, settings);
              return (
                <Reveal key={b.id} delay={(i % 4) * 70} className={`bcard ${b.metal}`}>
                  <div className="bcard-art">
                    <ProductImage p={b} sizes="(max-width: 760px) 50vw, 25vw" />
                  </div>
                  <div className="bcard-body">
                    <h3>{b.name}</h3>
                    <span className="tiny muted">
                      {b.metal === 'gold' ? '24K · 999.9 fine' : '999 fine silver'} · {b.note}
                    </span>
                    <div className="bcard-rows">
                      <div>
                        <span>Metal value</span>
                        <b>{rupee(r.base)}</b>
                      </div>
                      <div>
                        <span>Premium</span>
                        <b>{rupee(r.premium)}</b>
                      </div>
                      <div>
                        <span>GST 3%</span>
                        <b>{rupee(r.gst)}</b>
                      </div>
                    </div>
                    <div className="bcard-price">
                      <div>
                        <small>Buy</small>
                        <strong>{rupee(r.total)}</strong>
                      </div>
                      <div>
                        <small>We buy back</small>
                        <strong className="muted">{rupee(r.buyback)}</strong>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-gold" onClick={() => addToCart(b.id, { kind: 'bullion' })}>
                      Add to bag
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="section split">
          <Reveal>
            <SectionTitle align="left" eyebrow="Plan your purchase" title="Bullion calculator" sub="Check the value of any weight, for buying or selling, at this minute’s rate." />
            <div className="rules">
              <div>
                <b>PAN mandatory</b>
                <span>For purchases of ₹2,00,000 and above (Rule 114B).</span>
              </div>
              <div>
                <b>No cash ≥ ₹2 lakh</b>
                <span>Payments of ₹2 lakh or more are accepted only by UPI / NEFT / RTGS / card (Sec. 269ST).</span>
              </div>
              <div>
                <b>Assured buyback</b>
                <span>Sealed VCH bullion bought back at live rate − {(0.01 * 100).toFixed(0)}% (gold) / 2.5% (silver).</span>
              </div>
              <div>
                <b>Insured delivery</b>
                <span>Free insured delivery in Hyderabad for orders above ₹50,000; pan-India via secure logistics.</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <Calculator />
          </Reveal>
        </section>
      </div>
    </div>
  );
}
