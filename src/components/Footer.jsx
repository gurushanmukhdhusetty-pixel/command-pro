import { Link } from 'react-router-dom';
import { STORE } from '../config';
import { Logo } from './Ornament';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-arch" aria-hidden="true" />
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand">
            <Logo size={46} />
            <span>
              <strong>VCH</strong> <em>Jewellers</em>
              <small>Royal Silver · Hyderabad</small>
            </span>
          </Link>
          <p className="muted small" style={{ marginTop: 16, maxWidth: 320 }}>
            Handcrafted 92.5 sterling and 999 fine silver from the lanes of the Old City. Every piece BIS hallmarked, priced live on the day’s silver rate.
          </p>
          <div className="badges">
            <span>BIS Hallmarked</span>
            <span>HUID Traceable</span>
            <span>Lifetime Buyback</span>
          </div>
        </div>
        <div>
          <h4>Collections</h4>
          <Link to="/collections/bridal">Nizam Royal Bridal</Link>
          <Link to="/collections/home">Devalayam Home &amp; Pooja</Link>
          <Link to="/collections/casual">Lite Everyday</Link>
          <Link to="/bullion">Gold &amp; Silver Bullion</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/rates">Today’s Rates</Link>
          <Link to="/faq">FAQ &amp; Policies</Link>
          <Link to="/contact">Book a Store Visit</Link>
          <Link to="/admin">Store Admin</Link>
        </div>
        <div>
          <h4>Visit Us</h4>
          {STORE.address.map((l) => (
            <div key={l} className="muted small">
              {l}
            </div>
          ))}
          <a href={`tel:${STORE.phone}`} className="small" style={{ marginTop: 10 }}>
            {STORE.phoneDisplay}
          </a>
          <a href={`mailto:${STORE.email}`} className="small">
            {STORE.email}
          </a>
          {STORE.hours.map(([d, h]) => (
            <div key={d} className="muted small">
              {d}: {h}
            </div>
          ))}
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} VCH Jewellers, Hyderabad · GSTIN {STORE.gstin}</span>
        <span>Prices are computed live from international spot rates + import duty + GST and may change until billed. Final invoice on actual weight.</span>
      </div>
    </footer>
  );
}
