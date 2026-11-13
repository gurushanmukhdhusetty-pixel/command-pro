import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Three from '../components/Three';
import ProductImage from '../components/ProductImage';
import { useIsMobile } from '../lib/media';
import { BULLION } from '../data/bullion';
import ProductCard, { useTilt } from '../components/ProductCard';
import Reveal from '../components/Reveal';
import Charminar from '../components/Charminar';
import { SectionTitle, Divider } from '../components/Ornament';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { priceProduct } from '../lib/pricing';
import { rupee, rupee2 } from '../lib/format';
import { LINES } from '../data/products';

function Counter({ to, suffix = '' }) {
  const ref = useRef();
  const [v, setV] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1600);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {v.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

function LineCard({ line, hero, count, from, i }) {
  const tilt = useTilt(9);
  return (
    <Reveal delay={i * 120}>
      <Link to={`/collections/${line.id}`} className={`line-card lc-${line.id}`} {...tilt}>
        <div className="lc-art">
          <ProductImage p={hero} sizes="(max-width: 760px) 80vw, 33vw" />
        </div>
        <div className="lc-body">
          <span className="eyebrow">{line.short}</span>
          <h3>{line.name}</h3>
          <p>{line.tagline}</p>
          <div className="lc-foot">
            <span>
              {count} designs · from <b>{rupee(from)}</b>
            </span>
            <span className="arrow">→</span>
          </div>
        </div>
        <span className="pcard-shine" />
      </Link>
    </Reveal>
  );
}

function Rotunda({ items }) {
  const n = items.length;
  return (
    <div className="rotunda-stage">
      <div className="rotunda" style={{ '--n': n }}>
        {items.map((p, i) => (
          <Link key={p.id} to={`/product/${p.id}`} className="rot-card" style={{ '--i': i }}>
            <ProductImage p={p} sizes="220px" />
            <span>{p.name}</span>
          </Link>
        ))}
      </div>
      <div className="rotunda-floor" />
    </div>
  );
}

export default function Home() {
  const { rates, status, settings } = useRates();
  const mobile = useIsMobile();
  const { products } = useStore();
  const lines = Object.values(LINES);
  const byLine = (id) => products.filter((p) => p.line === id);
  const heroOf = { bridal: 'nizami-kundan-choker', home: 'ashtalakshmi-kalash', casual: 'everyday-choker-jhumka-set' };
  const best = products.filter((p) => p.badge === 'Bestseller' || p.rating >= 4.9).slice(0, 8);
  const rot = ['kasulaperu-temple-haaram', 'charminar-oxidised-jhumkas', 'ashtalakshmi-kalash', 'royal-carved-kada', 'peacock-kumkum-bharani', 'solitaire-stack-ring', 'royal-pooja-thali-set', 'chandbali-maang-tikka', 'ghungroo-bridal-payal', 'akhand-silver-diya']
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);
  const demo = products.find((p) => p.id === 'charminar-oxidised-jhumkas');
  const demoPrice = demo && priceProduct(demo, rates, settings);

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="orb o1" />
          <div className="orb o2" />
          <Charminar className="hero-charminar" />
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow fade-up">Old City · Hyderabad · Royal Silver</div>
            <h1 className="fade-up d1">
              Silver fit for <span className="silver-text">a Nizam’s court</span>
            </h1>
            <p className="lead fade-up d2">
              Bridal heirlooms, pure pooja silver and featherweight everyday pieces — handcrafted by Hyderabad karigars, BIS hallmarked, and priced
              live on today’s silver rate with every rupee shown.
            </p>
            <div className="hero-ctas fade-up d3">
              <Link to="/collections/bridal" className="btn btn-gold">
                Explore Bridal
              </Link>
              <Link to="/shop" className="btn btn-ghost">
                Shop all silver
              </Link>
            </div>
            <Link to="/rates" className="rate-glass fade-up d4">
              <div>
                <span className={`dot ${status}`} />
                <small>Silver 999 · today</small>
                <strong>{rupee2(rates.silver)}</strong>
                <em>per gram</em>
              </div>
              <div>
                <small>Per kg</small>
                <strong>{rupee(rates.silver * 1000)}</strong>
                <em>excl. GST</em>
              </div>
              <div>
                <small>Gold 24K</small>
                <strong>{rupee(rates.gold24)}</strong>
                <em>per 10 g</em>
              </div>
            </Link>
          </div>
          <div className="hero-3d">
            <div className="hero-ring" aria-hidden="true" />
            {mobile ? (
              <div className="hero-photo">
                <ProductImage p={products.find((x) => x.id === 'mandala-oxidised-bridal-set')} eager sizes="100vw" />
              </div>
            ) : (
              <Three
                scene="hero"
                fallback={
                  <div className="hero-photo">
                    <ProductImage p={products.find((x) => x.id === 'royal-carved-kada')} eager sizes="50vw" />
                  </div>
                }
              />
            )}
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ───────── TRUST MARQUEE ───────── */}
      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k}>
              {['BIS Hallmarked 92.5 & 99.9', 'HUID on every piece', 'Live market pricing', 'Lifetime exchange & buyback', 'Free polishing for life', 'Handcrafted in the Old City', 'Insured shipping across India'].map((t) => (
                <span key={t}>
                  ✦ {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ───────── THREE LINES ───────── */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Three houses of silver" title="Our Collections" sub="From the wedding mandap to the pooja room to your everyday — one standard of craft." />
          <div className="lines-grid m-hscroll">
            {lines.map((l, i) => {
              const items = byLine(l.id);
              const from = Math.min(...items.map((p) => priceProduct(p, rates, settings).total));
              const hero = items.find((p) => p.id === heroOf[l.id]) || items[0];
              return <LineCard key={l.id} line={l} hero={hero} count={items.length} from={from} i={i} />;
            })}
          </div>
        </div>
      </section>

      {/* ───────── 3D ROTUNDA ───────── */}
      <section className="section rotunda-section">
        <div className="container">
          <SectionTitle eyebrow="The signature rotunda" title="Masterpieces in the round" sub={mobile ? 'Swipe through our signature pieces' : 'Hover to pause · click any piece to see it in 3D'} />
        </div>
        {mobile ? (
          <div className="container">
            <div className="hscroll">
              {rot.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="snap-card">
                  <ProductImage p={p} sizes="70vw" />
                  <span>{p.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Rotunda items={rot} />
        )}
      </section>

      {/* ───────── PRICE TRANSPARENCY ───────── */}
      {demo && (
        <section className="section transparency">
          <div className="container split">
            <Reveal className="split-art">
              <div className="float-card">
                <ProductImage p={demo} sizes="(max-width: 760px) 100vw, 45vw" />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="eyebrow">Honest silver pricing</div>
              <h2>
                Every rupee, <span className="silver-text">on the label</span>
              </h2>
              <Divider className="left" />
              <p className="muted">
                Our prices are computed live: the international silver price is converted to rupees, import duty is added, and then we show you exactly
                what you pay for metal, craftsmanship, stones, hallmarking and GST. No hidden “wastage”.
              </p>
              <div className="mini-bd">
                <div>
                  <span>Silver value ({demo.weight} g × 92.5%)</span>
                  <b>{rupee(demoPrice.metal)}</b>
                </div>
                <div>
                  <span>Making (₹{demo.making}/g)</span>
                  <b>{rupee(demoPrice.making)}</b>
                </div>
                <div>
                  <span>Pearls + hallmark</span>
                  <b>{rupee(demoPrice.extras.reduce((s, e) => s + e.amount, 0) + demoPrice.hallmark)}</b>
                </div>
                <div>
                  <span>GST 3%</span>
                  <b>{rupee(demoPrice.gst)}</b>
                </div>
                <div className="t">
                  <span>{demo.name}</span>
                  <b>{rupee(demoPrice.total)}</b>
                </div>
              </div>
              <Link to="/rates" className="btn btn-ghost" style={{ marginTop: 22 }}>
                How today’s rate is calculated →
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ───────── BESTSELLERS ───────── */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Loved in Hyderabad" title="Bestsellers" />
          <div className="grid-products m-hscroll">
            {best.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 90}>
                <ProductCard p={p} />
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/shop" className="btn btn-ghost">
              View all {products.length} designs
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── BULLION TEASER ───────── */}
      <section className="section bullion-teaser">
        <div className="container split">
          <Reveal>
            <div className="eyebrow">Invest in metal</div>
            <h2>
              Gold &amp; silver <span className="gold-text">bullion</span>
            </h2>
            <Divider className="left" />
            <p className="muted">
              24K 999.9 gold coins from 1 g to 100 g bars, and 999 silver coins and bars up to 1 kg — sealed, serial-numbered and bought back at the live
              rate.
            </p>
            <div className="bt-rates">
              <div>
                <small>Silver 1 kg bar</small>
                <b>{rupee(rates.silver * 1000)}</b>
              </div>
              <div>
                <small>Gold 24K · 10 g</small>
                <b>{rupee(rates.gold24)}</b>
              </div>
            </div>
            <Link to="/bullion" className="btn btn-gold" style={{ marginTop: 24 }}>
              Explore bullion
            </Link>
          </Reveal>
          <Reveal delay={150} className="bt-art">
            <div className="bt-stack">
              <div className="bt-a">
                <ProductImage p={BULLION.find((b) => b.id === 'au-bar-100')} sizes="(max-width: 760px) 70vw, 30vw" />
              </div>
              <div className="bt-b">
                <ProductImage p={BULLION.find((b) => b.id === 'ag-coin-100')} sizes="(max-width: 760px) 70vw, 30vw" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── HERITAGE ───────── */}
      <section className="section heritage">
        <Charminar className="heritage-bg" />
        <div className="container">
          <SectionTitle eyebrow="Since generations" title="A family of silversmiths" sub="Three generations of VCH have worked silver in the shadow of the Charminar. The tools have changed; the hand has not." />
          <div className="stats">
            <div>
              <b>
                <Counter to={60} suffix="+" />
              </b>
              <span>years of craft</span>
            </div>
            <div>
              <b>
                <Counter to={42} />
              </b>
              <span>master karigars</span>
            </div>
            <div>
              <b>
                <Counter to={18000} suffix="+" />
              </b>
              <span>families served</span>
            </div>
            <div>
              <b>100%</b>
              <span>BIS hallmarked</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIALS ───────── */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Kind words" title="From our families" />
          <div className="testimonials">
            {[
              ['Sravani R.', 'Banjara Hills', 'My entire bridal set — choker, vaddanam and jhumkas — came from VCH. They showed us the price breakdown for every piece, which no other shop did.'],
              ['Mohammed Irfan', 'Tolichowki', 'Bought a 1 kg silver bar. Rate was exactly the live rate plus the premium they quoted — sealed pack with serial number and a proper GST invoice.'],
              ['Lakshmi P.', 'Kukatpally', 'The pooja thali set is stunning and properly heavy. They engraved my daughter’s name for free for her gruhapravesam gift.'],
            ].map(([n, a, t], i) => (
              <Reveal key={n} delay={i * 120} className="tcard">
                <div className="stars">★★★★★</div>
                <p>“{t}”</p>
                <div className="who">
                  <b>{n}</b>
                  <span>{a}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── VISIT CTA ───────── */}
      <section className="section cta-band">
        <div className="container">
          <Reveal className="cta-card">
            <div>
              <div className="eyebrow">Bridal trousseau appointments</div>
              <h2>Visit our Old City showroom</h2>
              <p className="muted">Private viewing room, chai on the house, and our master karigar on hand for custom work.</p>
            </div>
            <Link to="/contact" className="btn btn-gold">
              Book a visit
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
