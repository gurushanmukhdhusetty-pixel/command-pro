import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { rupee, timeAgo } from '../lib/format';
import { Logo } from './Ornament';

function Delta({ now, prev }) {
  if (!prev || Math.abs(now - prev) < 0.005) return null;
  const up = now > prev;
  return <span className={`delta ${up ? 'up' : 'down'}`}>{up ? '▲' : '▼'}</span>;
}

export function RateTicker() {
  const { rates, prev, status, updatedAt } = useRates();
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 15000);
    return () => clearInterval(id);
  }, []);
  const items = [
    ['Silver 999', `${rupee(rates.silver)}/g`, rates.silver, prev?.silver],
    ['Silver 999', `${rupee(rates.silver * 1000)}/kg`, rates.silver, prev?.silver],
    ['Silver 92.5', `${rupee(rates.silver * 0.925)}/g`, rates.silver, prev?.silver],
    ['Gold 24K', `${rupee(rates.gold24)}/10g`, rates.gold24, prev?.gold24],
    ['Gold 22K', `${rupee(rates.gold22)}/10g`, rates.gold22, prev?.gold22],
  ];
  const label = { live: 'LIVE', cached: 'CACHED', fallback: 'INDICATIVE', loading: 'LOADING', manual: 'STORE RATE' }[status];
  const row = (
    <>
      {items.map(([k, v, n, p], i) => (
        <span className="tick" key={i}>
          <b>{k}</b> {v} <Delta now={n} prev={p} />
        </span>
      ))}
      <span className="tick muted">{rates.source || 'Hyderabad'} · excl. GST · updated {timeAgo(updatedAt)}</span>
    </>
  );
  return (
    <div className="ticker">
      <Link to="/rates" className={`live-pill ${status}`}>
        <i /> {label}
      </Link>
      <div className="ticker-track">
        <div className="ticker-move">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}

const NAV = [
  ['/collections/bridal', 'Bridal'],
  ['/collections/home', 'Home & Pooja'],
  ['/collections/casual', 'Everyday'],
  ['/shop', 'Shop All'],
  ['/bullion', 'Bullion'],
  ['/rates', 'Live Rates'],
];

export default function Header() {
  const { cart, wish } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const count = cart.reduce((s, x) => s + x.qty, 0);
  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <RateTicker />
      <div className="nav-bar container">
        <Link to="/" className="brand" aria-label="VCH Jewellers home">
          <Logo size={42} />
          <span>
            <strong>VCH</strong> <em>Jewellers</em>
            <small>Royal Silver · Hyderabad</small>
          </span>
        </Link>
        <nav className={`nav ${open ? 'open' : ''}`}>
          {NAV.map(([to, l]) => (
            <NavLink key={to} to={to}>
              {l}
            </NavLink>
          ))}
          <NavLink to="/contact" className="nav-cta-m">
            Visit Store
          </NavLink>
        </nav>
        <div className="nav-icons">
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z" /></svg>
            {wish.length > 0 && <b>{wish.length}</b>}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Bag">
            <svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8zm3 0V6.5a4 4 0 0 1 8 0V8" /></svg>
            {count > 0 && <b>{count}</b>}
          </Link>
          <Link to="/contact" className="btn btn-sm btn-gold hide-m">
            Book Visit
          </Link>
          <button className={`burger ${open ? 'x' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
