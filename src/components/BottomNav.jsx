import { NavLink } from 'react-router-dom';
import { useStore } from '../lib/store';

const I = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  shop: 'M4 7h16l-1.5 12.5a1 1 0 0 1-1 .5h-11a1 1 0 0 1-1-.5zM8 7V5.5a4 4 0 0 1 8 0V7',
  bullion: 'M3 18l2.5-6h13L21 18zM7 12l2-5h6l2 5',
  rates: 'M3 17l5-5 4 3 8-8M15 7h5v5',
  bag: 'M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8zM8 8V6.5a4 4 0 0 1 8 0V8',
};

export default function BottomNav() {
  const { cart } = useStore();
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const items = [['/', 'Home', 'home'], ['/shop', 'Shop', 'shop'], ['/bullion', 'Bullion', 'bullion'], ['/rates', 'Rates', 'rates'], ['/cart', 'Bag', 'bag']];
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(([to, l, k]) => (
        <NavLink key={to} to={to} end={to === '/'}>
          <svg viewBox="0 0 24 24"><path d={I[k]} /></svg>
          {l}
          {k === 'bag' && count > 0 && <b>{count}</b>}
        </NavLink>
      ))}
    </nav>
  );
}
