// Vercel serverless function: live Indian silver & gold rates for Hyderabad.
// Priority (same as other Indian jewellery/rate sites):
//   1. Goodreturns Hyderabad city rate (what Google shows)
//   2. IBJA benchmark (India Bullion & Jewellers Association)
//   3. International spot × USD/INR (computed client-side as last resort)
// Rates are per gram / per 10 g, excluding GST. Cached at the edge for 5 minutes.
const TIMEOUT = 8000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

async function get(url, json = false) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: json ? 'application/json' : 'text/html' } });
    if (!r.ok) throw new Error(`${url} ${r.status}`);
    return json ? r.json() : r.text();
  } finally {
    clearTimeout(t);
  }
}

const num = (s) => +String(s).replace(/,/g, '');
const text = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x20b9;|&#8377;|&nbsp;/gi, (m) => (m.toLowerCase() === '&nbsp;' ? ' ' : '₹'))
    .replace(/\s+/g, ' ');

export async function goodreturns(city = 'hyderabad') {
  const [sh, gh] = await Promise.all([get(`https://www.goodreturns.in/silver-rates/${city}.html`), get(`https://www.goodreturns.in/gold-rates/${city}.html`)]);
  const st = text(sh), gt = text(gh);
  const sm = st.match(/Last 10 Days Date 10 gram 100 gram 1 Kg ([A-Z][a-z]{2} \d{1,2}, \d{4}) ₹([\d,]+) ₹([\d,]+) ₹([\d,]+)/);
  const g24 = gt.match(/24K Gold \/g ₹([\d,]+)/);
  const g22 = gt.match(/22K Gold \/g ₹([\d,]+)/);
  if (!sm || !g24) throw new Error('goodreturns: pattern not found');
  return {
    silver: num(sm[4]) / 1000,
    gold24: num(g24[1]) * 10,
    gold22: g22 ? num(g22[1]) * 10 : null,
    asOf: sm[1],
    source: 'Goodreturns · Hyderabad',
  };
}

export async function ibja() {
  const h = await get('https://ibjarates.com/');
  const f = (id) => {
    const m = h.match(new RegExp(`id="${id}"[^>]*>\\s*([\\d,.]+)\\s*<`));
    return m ? num(m[1]) : NaN;
  };
  const silverKg = f('lblSilver999_PM') || f('lblSilver999_AM');
  const g999 = f('lblGold999_PM') || f('lblGold999_AM');
  const g916 = f('lblGold916_PM') || f('lblGold916_AM');
  if (!(silverKg > 0 && g999 > 0)) throw new Error('ibja: fields not found');
  return { silver: silverKg / 1000, gold24: g999, gold22: g916 || null, source: 'IBJA benchmark' };
}

async function spot() {
  const [ag, au, fx] = await Promise.all([
    get('https://api.gold-api.com/price/XAG', true),
    get('https://api.gold-api.com/price/XAU', true),
    get('https://open.er-api.com/v6/latest/USD', true).then((d) => d.rates.INR).catch(async () => (await get('https://api.frankfurter.app/latest?from=USD&to=INR', true)).rates.INR),
  ]);
  return { xagUsd: +ag.price, xauUsd: +au.price, usdInr: +fx };
}

const sane = (r) => r && r.silver > 50 && r.silver < 1000 && r.gold24 > 30000 && r.gold24 < 500000;

export default async function handler(req, res) {
  const [gr, ib, sp] = await Promise.allSettled([goodreturns(), ibja(), spot()]);
  const india = [gr, ib].map((x) => (x.status === 'fulfilled' ? x.value : null)).find(sane) || null;
  const body = {
    india,
    ibja: ib.status === 'fulfilled' ? ib.value : null,
    ...(sp.status === 'fulfilled' ? sp.value : {}),
    at: Date.now(),
    errors: [gr, ib, sp].filter((x) => x.status === 'rejected').map((x) => String(x.reason?.message || x.reason)),
  };
  if (!india && sp.status !== 'fulfilled') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json(body);
  }
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  res.status(200).json(body);
}
