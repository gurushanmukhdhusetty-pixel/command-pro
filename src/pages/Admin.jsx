import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductArt, { ART_KINDS } from '../components/ProductArt';
import PriceBreakdown from '../components/PriceBreakdown';
import { SectionTitle } from '../components/Ornament';
import { useRates } from '../lib/rates';
import { useStore } from '../lib/store';
import { priceProduct } from '../lib/pricing';
import { rupee } from '../lib/format';
import { LINES, CATEGORIES } from '../data/products';
import { MODEL_KINDS } from '../data/models';

const VARIANTS = { jhumka: ['', 'mini'], anklet: ['light', 'heavy'], pendant: ['lotus', 'heart', 'blackbeads'], bowl: ['', 'panchapatra'], bar: ['cast', 'minted'] };
const blank = () => ({
  id: '',
  name: '',
  line: 'casual',
  category: 'Earrings',
  purity: 925,
  weight: 10,
  makingType: 'perGram',
  making: 200,
  extras: [{ label: '', amount: 0 }],
  art: { kind: 'jhumka', finish: 'silver', gem: 'none', variant: '' },
  description: '',
  details: [],
  sizes: null,
  badge: 'New',
  custom: true,
});

function ProductForm({ initial, onDone }) {
  const { rates, settings } = useRates();
  const { saveProduct, notify } = useStore();
  const [p, setP] = useState(initial || blank());
  const [sizes, setSizes] = useState((initial?.sizes || []).join(', '));
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const setArt = (k, v) => setP((x) => ({ ...x, art: { ...x.art, [k]: v } }));
  const price = priceProduct({ ...p, weight: +p.weight || 0, making: +p.making || 0 }, rates, settings);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) return notify('Image too large — please use one under 1.5 MB');
    const r = new FileReader();
    r.onload = () => setArt('image', r.result);
    r.readAsDataURL(f);
  };

  const submit = (e) => {
    e.preventDefault();
    const id = p.id || `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
    const model = p.art.image ? null : p.art.kind === 'bowl' && p.art.variant === 'panchapatra' ? 'glass' : MODEL_KINDS.includes(p.art.kind) ? p.art.kind : null;
    saveProduct({
      ...p,
      id,
      weight: +p.weight,
      making: +p.making,
      purity: +p.purity,
      extras: p.extras.filter((x) => x.label && +x.amount > 0).map((x) => ({ label: x.label, amount: +x.amount })),
      sizes: sizes.trim() ? sizes.split(',').map((s) => s.trim()).filter(Boolean) : null,
      model,
      rating: p.rating || null,
    });
    notify(initial ? 'Product updated' : 'Product added to the catalogue');
    onDone?.(id);
    if (!initial) {
      setP(blank());
      setSizes('');
    }
  };

  return (
    <form className="admin-grid" onSubmit={submit}>
      <div className="form-card">
        <h3>{initial ? 'Edit product' : 'Add a new product'}</h3>
        <label>
          Product name
          <input className="input" required value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Peacock Silver Jhumkas" />
        </label>
        <div className="form-row">
          <label>
            Collection
            <select className="input" value={p.line} onChange={(e) => set('line', e.target.value)}>
              {Object.values(LINES).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <input className="input" list="cats" value={p.category} onChange={(e) => set('category', e.target.value)} />
            <datalist id="cats">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
        </div>
        <div className="form-row cols3">
          <label>
            Purity
            <select className="input" value={p.purity} onChange={(e) => set('purity', +e.target.value)}>
              <option value={925}>92.5 Sterling</option>
              <option value={999}>99.9 Fine</option>
            </select>
          </label>
          <label>
            Weight (g)
            <input className="input" type="number" step="0.01" min="0.1" required value={p.weight} onChange={(e) => set('weight', e.target.value)} />
          </label>
          <label>
            Badge
            <select className="input" value={p.badge || ''} onChange={(e) => set('badge', e.target.value || null)}>
              {['', 'New', 'Bestseller', 'Signature', 'Handcrafted', 'Festive', 'Gift'].map((b) => (
                <option key={b} value={b}>
                  {b || 'None'}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Making charge type
            <select className="input" value={p.makingType} onChange={(e) => set('makingType', e.target.value)}>
              <option value="perGram">₹ per gram</option>
              <option value="percent">% of metal value</option>
            </select>
          </label>
          <label>
            Making {p.makingType === 'percent' ? '(%)' : '(₹/g)'}
            <input className="input" type="number" step="0.01" min="0" value={p.making} onChange={(e) => set('making', e.target.value)} />
          </label>
        </div>
        <div className="f-label">Stones / plating / other charges</div>
        {p.extras.map((x, i) => (
          <div className="form-row extra" key={i}>
            <input className="input" placeholder="e.g. Kundan setting" value={x.label} onChange={(e) => set('extras', p.extras.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
            <input className="input" type="number" min="0" placeholder="₹" value={x.amount} onChange={(e) => set('extras', p.extras.map((y, j) => (j === i ? { ...y, amount: e.target.value } : y)))} />
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => set('extras', p.extras.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="link" onClick={() => set('extras', [...p.extras, { label: '', amount: 0 }])}>
          + Add charge
        </button>
        <label>
          Sizes (comma separated, optional)
          <input className="input" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="2.4, 2.6, 2.8" />
        </label>
        <label>
          Description
          <textarea className="input" rows="3" value={p.description} onChange={(e) => set('description', e.target.value)} />
        </label>

        <h3 style={{ marginTop: 18 }}>Product image</h3>
        <p className="tiny muted">Pick a generated illustration (3D view is enabled automatically where available) or upload your own photo.</p>
        <div className="form-row cols3">
          <label>
            Design
            <select className="input" value={p.art.kind} onChange={(e) => setP((x) => ({ ...x, art: { ...x.art, kind: e.target.value, variant: VARIANTS[e.target.value]?.[0] || '' } }))}>
              {ART_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            Finish
            <select className="input" value={p.art.finish} onChange={(e) => setArt('finish', e.target.value)}>
              <option value="silver">Silver</option>
              <option value="oxidised">Oxidised</option>
              <option value="gold">Gold polish</option>
            </select>
          </label>
          <label>
            Stone
            <select className="input" value={p.art.gem} onChange={(e) => setArt('gem', e.target.value)}>
              {['none', 'ruby', 'emerald', 'sapphire', 'diamond', 'pearl', 'kundan'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>
        {VARIANTS[p.art.kind] && (
          <label>
            Style variant
            <select className="input" value={p.art.variant || ''} onChange={(e) => setArt('variant', e.target.value)}>
              {VARIANTS[p.art.kind].map((v) => (
                <option key={v} value={v}>
                  {v || 'standard'}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="form-row">
          <label className="file">
            Upload photo instead
            <input type="file" accept="image/*" onChange={onFile} />
          </label>
          {p.art.image && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setArt('image', null)}>
              Remove photo
            </button>
          )}
        </div>
        <button className="btn btn-gold block" style={{ marginTop: 14 }}>
          {initial ? 'Save changes' : 'Publish product'}
        </button>
      </div>
      <div className="admin-preview">
        <div className="f-label">Live preview</div>
        <div className="preview-card">
          <ProductArt art={p.art} line={p.line} title={p.name} />
          <div className="pv-body">
            <b>{p.name || 'Product name'}</b>
            <span className="muted small">
              {p.category} · {p.weight} g · {p.purity === 999 ? '99.9' : '92.5'}
            </span>
            <strong>{rupee(price.total)}</strong>
          </div>
        </div>
        <PriceBreakdown p={{ ...p, weight: +p.weight || 0 }} price={price} settings={settings} />
      </div>
    </form>
  );
}

function RateSettings() {
  const { settings, setSettings, rates, spot } = useRates();
  const num = (k) => (e) => setSettings({ [k]: +e.target.value });
  return (
    <div className="admin-grid">
      <div className="form-card">
        <h3>Rate settings</h3>
        <p className="tiny muted">Choose whether the site prices from the live international market or from your shop’s daily board rate.</p>
        <div className="calc-tabs">
          {[['live', 'Live market'], ['manual', 'Manual board rate']].map(([m, l]) => (
            <button type="button" key={m} className={settings.mode === m ? 'on' : ''} onClick={() => setSettings({ mode: m })}>
              {l}
            </button>
          ))}
        </div>
        {settings.mode === 'manual' ? (
          <div className="form-row">
            <label>
              Silver 999 (₹ / g)
              <input className="input" type="number" step="0.01" value={settings.manualSilverPerGram} onChange={num('manualSilverPerGram')} />
            </label>
            <label>
              Gold 24K (₹ / 10 g)
              <input className="input" type="number" value={settings.manualGold24Per10g} onChange={num('manualGold24Per10g')} />
            </label>
          </div>
        ) : (
          <div className="form-row">
            <label>
              Import duty %
              <input className="input" type="number" step="0.1" value={settings.importDutyPct} onChange={num('importDutyPct')} />
            </label>
            <label>
              Local premium %
              <input className="input" type="number" step="0.1" value={settings.localPremiumPct} onChange={num('localPremiumPct')} />
            </label>
          </div>
        )}
        <div className="form-row">
          <label>
            GST %
            <input className="input" type="number" step="0.1" value={settings.gstPct} onChange={num('gstPct')} />
          </label>
          <label>
            Hallmark fee (₹ / piece)
            <input className="input" type="number" value={settings.hallmarkFee} onChange={num('hallmarkFee')} />
          </label>
        </div>
        <p className="tiny muted">Settings are saved in this browser. To publish a board rate for all visitors, connect a small backend or edit src/config.js.</p>
      </div>
      <div className="admin-preview">
        <div className="f-label">Resulting rates</div>
        <div className="formula">
          <div>
            <span>Spot silver / gold</span>
            <b>
              ${spot.xagUsd.toFixed(2)} / ${spot.xauUsd.toFixed(0)}
            </b>
          </div>
          <div>
            <span>USD/INR</span>
            <b>{spot.usdInr.toFixed(3)}</b>
          </div>
          <div className="t">
            <span>Silver 999</span>
            <b>{rupee(rates.silver * 1000)}/kg</b>
          </div>
          <div className="t">
            <span>Gold 24K</span>
            <b>{rupee(rates.gold24)}/10g</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('add');
  const [editing, setEditing] = useState(null);
  const { custom, deleteProduct } = useStore();
  const { rates, settings } = useRates();
  return (
    <div className="page">
      <div className="page-head">
        <div className="container">
          <SectionTitle eyebrow="Store back-office" title="Admin" sub="Add products, manage your catalogue and set how prices are calculated." />
        </div>
      </div>
      <div className="container">
        <div className="calc-tabs center">
          {[['add', 'Add product'], ['list', `My products (${custom.length})`], ['rates', 'Rate settings']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setEditing(null); }}>
              {l}
            </button>
          ))}
        </div>
        {tab === 'add' && <ProductForm />}
        {tab === 'rates' && <RateSettings />}
        {tab === 'list' &&
          (editing ? (
            <ProductForm key={editing.id} initial={{ ...editing, extras: editing.extras?.length ? editing.extras : [{ label: '', amount: 0 }] }} onDone={() => setEditing(null)} />
          ) : custom.length ? (
            <div className="admin-list">
              {custom.map((p) => (
                <div key={p.id} className="cart-row">
                  <Link to={`/product/${p.id}`} className="cart-img">
                    <ProductArt art={p.art} line={p.line} title={p.name} />
                  </Link>
                  <div className="cart-info">
                    <b>{p.name}</b>
                    <span className="muted small">
                      {LINES[p.line]?.name} · {p.category} · {p.weight} g
                    </span>
                  </div>
                  <div className="cart-price">
                    <b>{rupee(priceProduct(p, rates, settings).total)}</b>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="link" onClick={() => setEditing(p)}>
                        Edit
                      </button>
                      <button className="link danger" onClick={() => confirm(`Delete “${p.name}”?`) && deleteProduct(p.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No custom products yet. Use “Add product” to create one — it appears in the shop immediately.</div>
          ))}
      </div>
    </div>
  );
}
