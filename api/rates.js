// Vercel serverless function: live spot silver/gold (USD/oz) + USD→INR, with fallbacks.
// Server-side so browsers never hit CORS issues; cached at the edge for 30 s.
const TIMEOUT = 6000;

async function getJSON(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'vch-rates/1.0', Accept: 'application/json' } });
    if (!r.ok) throw new Error(`${url} ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const SPOT_SOURCES = [
  async () => {
    const [ag, au] = await Promise.all([getJSON('https://api.gold-api.com/price/XAG'), getJSON('https://api.gold-api.com/price/XAU')]);
    return { xagUsd: +ag.price, xauUsd: +au.price, source: 'gold-api.com' };
  },
  async () => {
    const d = await getJSON('https://api.metals.live/v1/spot');
    const pick = (k) => +(d.find((x) => x[k] != null) || {})[k];
    return { xagUsd: pick('silver'), xauUsd: pick('gold'), source: 'metals.live' };
  },
];

const FX_SOURCES = [
  async () => +(await getJSON('https://open.er-api.com/v6/latest/USD')).rates.INR,
  async () => +(await getJSON('https://api.frankfurter.app/latest?from=USD&to=INR')).rates.INR,
  async () => +(await getJSON('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')).usd.inr,
];

async function first(sources, ok) {
  const errors = [];
  for (const s of sources) {
    try {
      const v = await s();
      if (ok(v)) return v;
      errors.push('invalid data');
    } catch (e) {
      errors.push(String(e.message || e));
    }
  }
  throw new Error(errors.join(' | '));
}

export default async function handler(req, res) {
  try {
    const [spot, usdInr] = await Promise.all([
      first(SPOT_SOURCES, (v) => v.xagUsd > 1 && v.xauUsd > 100),
      first(FX_SOURCES, (v) => v > 30 && v < 300),
    ]);
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    res.status(200).json({ ...spot, usdInr, at: Date.now() });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'rates unavailable', detail: String(e.message || e) });
  }
}
