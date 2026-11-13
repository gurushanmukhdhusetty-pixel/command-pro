import { createRoot } from 'react-dom/client';
import { StudioShot } from '../three/Studio';
import { PRODUCTS } from '../data/products';
import { BULLION } from '../data/bullion';

const q = new URLSearchParams(location.search);
const id = q.get('id');
const view = +(q.get('view') || 0);
const size = +(q.get('size') || 1400);
let subject, line;
const p = PRODUCTS.find((x) => x.id === id);
const b = BULLION.find((x) => x.id === id);
if (p) {
  subject = { kind: p.model || p.art.kind, finish: p.art.finish, gem: p.art.gem, variant: p.art.variant, label: p.art.label };
  line = p.line;
} else if (b) {
  subject = { kind: b.form, finish: b.metal === 'gold' ? 'gold24' : 'silver', label: b.weight >= 1000 ? `${b.weight / 1000} kg` : `${b.weight} g`, variant: b.form === 'bar' && b.weight < 500 ? 'minted' : 'cast' };
  line = 'bullion';
} else {
  subject = JSON.parse(q.get('subject') || '{"kind":"kada","finish":"silver"}');
  line = q.get('line') || 'bridal';
}
document.getElementById('root').style.cssText = `width:${size}px;height:${size}px`;
document.fonts.ready.then(() => createRoot(document.getElementById('root')).render(<StudioShot subject={subject} view={view} line={line} />));
