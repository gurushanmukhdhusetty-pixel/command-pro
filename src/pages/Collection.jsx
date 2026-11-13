import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductArt from '../components/ProductArt';
import { Divider } from '../components/Ornament';
import Reveal from '../components/Reveal';
import { ProductBrowser } from './Shop';
import { LINES } from '../data/products';
import { useStore } from '../lib/store';
import NotFound from './NotFound';

const NOTES = {
  bridal: [
    ['Trousseau appointments', 'Private viewing with our bridal stylist — bring your saree and we’ll match the set.'],
    ['Gold polish, not gold price', '1-micron gold polish over 92.5 silver gives the temple-jewellery look at a fraction of gold cost.'],
    ['Made to order', 'Custom chokers and vaddanams in 18–25 days, priced on the day of billing.'],
  ],
  home: [
    ['99.9 fine silver', 'Pooja and tableware silver is made from 999 silver — the purest form, ideal for ritual use.'],
    ['Free engraving', 'Names, dates and family deities engraved free on all Devalayam pieces.'],
    ['Gift-ready', 'Every article ships in our maroon velvet box with a hallmark certificate.'],
  ],
  casual: [
    ['Anti-tarnish rhodium', 'A thin rhodium coat keeps everyday pieces bright for years.'],
    ['Featherweight', 'Most pieces under 10 g — easy on the ear, easy on the budget.'],
    ['Care', 'Wipe with a soft cloth; store in the zip pouch provided. Free re-polishing anytime.'],
  ],
};

export default function Collection() {
  const { line } = useParams();
  const L = LINES[line];
  const { products } = useStore();
  useEffect(() => {
    if (L) document.title = `${L.name} · VCH Jewellers`;
  }, [L]);
  if (!L) return <NotFound />;
  const showcase = products.filter((p) => p.line === line).slice(0, 3);
  return (
    <div className={`page collection c-${line}`}>
      <section className="coll-hero">
        <div className="container coll-grid">
          <div>
            <Link to="/shop" className="crumb">
              ← All collections
            </Link>
            <div className="eyebrow">{L.short}</div>
            <h1>{L.name}</h1>
            <Divider className="left" />
            <p className="lead">{L.tagline}</p>
            <p className="muted">{L.blurb}</p>
          </div>
          <div className="coll-stack">
            {showcase.map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`} className={`cs cs-${i}`}>
                <ProductArt art={p.art} line={p.line} title={p.name} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="container">
        <div className="notes">
          {NOTES[line].map(([h, t], i) => (
            <Reveal key={h} delay={i * 100} className="note">
              <b>{h}</b>
              <span>{t}</span>
            </Reveal>
          ))}
        </div>
        <ProductBrowser fixedLine={line} key={line} />
      </div>
    </div>
  );
}
