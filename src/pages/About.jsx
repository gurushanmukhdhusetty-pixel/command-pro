import ProductArt from '../components/ProductArt';
import Reveal from '../components/Reveal';
import Charminar from '../components/Charminar';
import { SectionTitle, Divider } from '../components/Ornament';
import { Link } from 'react-router-dom';

const STEPS = [
  ['Assay & melt', 'Every lot of silver is XRF-tested, then melted and refined to 99.9 or alloyed to 92.5 with copper.', { kind: 'bar', finish: 'silver', variant: 'cast', label: '1 kg' }],
  ['Cast & draw', 'Wire is drawn, sheets are rolled and components are cast in our Pathergatti workshop.', { kind: 'pendant', variant: 'blackbeads', finish: 'silver' }],
  ['Chase & engrave', 'Repoussé and chasing by hand — the Ashtalakshmi kalash alone takes four days.', { kind: 'kalash', finish: 'silver' }],
  ['Set & polish', 'Kundan, rubies and pearls are set; pieces are oxidised or gold-polished as designed.', { kind: 'choker', finish: 'gold', gem: 'ruby' }],
  ['Hallmark', 'Sent to a BIS assaying centre for hallmarking and a unique 6-digit HUID.', { kind: 'coin', finish: 'silver', label: 'HUID' }],
];

export default function About() {
  return (
    <div className="page about">
      <section className="about-hero">
        <Charminar className="about-charminar" />
        <div className="container">
          <div className="eyebrow">Our heritage</div>
          <h1>
            Three generations <span className="silver-text">beside the Charminar</span>
          </h1>
          <Divider className="left" />
          <p className="lead">
            VCH Jewellers began as a single workbench near Pathergatti, making anklets and pooja silver for the families of the Old City. Today our
            karigars still work by hand — and we still believe a customer should see exactly what they are paying for.
          </p>
        </div>
      </section>
      <div className="container">
        <section className="section">
          <SectionTitle eyebrow="From metal to heirloom" title="How a VCH piece is made" />
          <div className="process">
            {STEPS.map(([h, t, art], i) => (
              <Reveal key={h} delay={i * 100} className="step">
                <div className="step-art">
                  <ProductArt art={art} line={i % 3 === 0 ? 'bridal' : i % 3 === 1 ? 'home' : 'casual'} title={h} />
                  <span className="step-n">0{i + 1}</span>
                </div>
                <h3>{h}</h3>
                <p className="muted small">{t}</p>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="values">
            {[
              ['Honest weight', 'Every piece is weighed in front of you on a legal-metrology certified scale.'],
              ['Open pricing', 'Metal, making, stones, hallmark and GST — always itemised, never “all-inclusive”.'],
              ['Lifetime exchange', 'Exchange any VCH piece at the day’s silver value, minus only melting loss.'],
              ['Old City craft', 'We employ and train karigars from families that have worked silver for generations.'],
            ].map(([h, t], i) => (
              <Reveal key={h} delay={i * 80} className="value">
                <b>{h}</b>
                <span>{t}</span>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <Link to="/contact" className="btn btn-gold">
              Visit the workshop
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
