import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SectionTitle } from '../components/Ornament';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { priceProduct } from '../lib/pricing';
import { rupee } from '../lib/format';
import { LINES } from '../data/products';

export function ProductBrowser({ fixedLine }) {
  const { rates, settings } = useRates();
  const { products } = useStore();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [line, setLine] = useState(fixedLine || params.get('line') || 'all');
  const [cat, setCat] = useState('all');
  const [purity, setPurity] = useState('all');
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState('featured');
  const [only3d, setOnly3d] = useState(false);

  const priced = useMemo(() => products.map((p) => ({ p, price: priceProduct(p, rates, settings).total })), [products, rates, settings]);
  const pool = priced.filter(({ p }) => (fixedLine ? p.line === fixedLine : line === 'all' || p.line === line));
  const cats = [...new Set(pool.map(({ p }) => p.category))];
  const ceiling = Math.ceil(Math.max(1000, ...pool.map((x) => x.price)) / 1000) * 1000;
  const limit = maxPrice || ceiling;

  const list = pool
    .filter(({ p }) => cat === 'all' || p.category === cat)
    .filter(({ p }) => purity === 'all' || String(p.purity) === purity)
    .filter(({ p }) => !only3d || p.model)
    .filter(({ price }) => price <= limit)
    .filter(({ p }) => !q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      if (sort === 'weight') return b.p.weight - a.p.weight;
      if (sort === 'rating') return (b.p.rating || 0) - (a.p.rating || 0);
      return 0;
    });

  return (
    <div className="browser">
      <aside className="filters">
        <div className="f-group">
          <label className="f-label">Search</label>
          <input className="input" placeholder="jhumka, kalash, payal…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {!fixedLine && (
          <div className="f-group">
            <label className="f-label">Collection</label>
            <div className="chips">
              {[['all', 'All'], ...Object.values(LINES).map((l) => [l.id, l.short])].map(([v, l]) => (
                <button key={v} className={`chip ${line === v ? 'on' : ''}`} onClick={() => { setLine(v); setCat('all'); }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="f-group">
          <label className="f-label">Category</label>
          <div className="chips">
            {['all', ...cats].map((c) => (
              <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
        <div className="f-group">
          <label className="f-label">Purity</label>
          <div className="chips">
            {[['all', 'Any'], ['925', '92.5 Sterling'], ['999', '99.9 Fine']].map(([v, l]) => (
              <button key={v} className={`chip ${purity === v ? 'on' : ''}`} onClick={() => setPurity(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="f-group">
          <label className="f-label">
            Max price <b>{rupee(limit)}</b>
          </label>
          <input type="range" min={1000} max={ceiling} step={500} value={limit} onChange={(e) => setMaxPrice(+e.target.value)} />
        </div>
        <label className="check">
          <input type="checkbox" checked={only3d} onChange={(e) => setOnly3d(e.target.checked)} /> Only pieces with 3D view
        </label>
      </aside>
      <div>
        <div className="browser-bar">
          <span className="muted">{list.length} designs · prices update live</span>
          <select className="input select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="weight">Heaviest first</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
        {list.length ? (
          <div className="grid-products cols-3">
            {list.map(({ p }) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="empty">No pieces match these filters.</div>
        )}
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="container">
          <SectionTitle eyebrow="The full vault" title="Shop All Silver" sub="Every price below is recalculated from the live silver rate." />
        </div>
      </div>
      <div className="container">
        <ProductBrowser />
      </div>
    </div>
  );
}
