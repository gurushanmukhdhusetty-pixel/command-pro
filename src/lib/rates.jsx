import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_SPOT, PRICING_DEFAULTS } from '../config';
import { deriveRates } from './pricing';
import { load, save } from './storage';

const RatesCtx = createContext(null);
const POLL_MS = 60_000;
const RETRY_MS = 15_000;

async function fetchJSON(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

async function fetchDirect() {
  const [xag, xau] = await Promise.all([fetchJSON('https://api.gold-api.com/price/XAG'), fetchJSON('https://api.gold-api.com/price/XAU')]);
  let usdInr;
  try {
    usdInr = (await fetchJSON('https://open.er-api.com/v6/latest/USD')).rates.INR;
  } catch {
    usdInr = (await fetchJSON('https://api.frankfurter.app/latest?from=USD&to=INR')).rates.INR;
  }
  return { xagUsd: +xag.price, xauUsd: +xau.price, usdInr: +usdInr };
}

const sane = (i) => i && i.silver > 50 && i.silver < 1000 && i.gold24 > 30000 && i.gold24 < 500000;
const spotOk = (s) => s && s.xagUsd > 1 && s.xauUsd > 100 && s.usdInr > 30;

// 1) our server endpoint (/api/rates → Hyderabad city rate, IBJA, spot) → 2) direct spot APIs
async function fetchSpot(prev) {
  try {
    const d = await fetchJSON('/api/rates');
    const out = {
      xagUsd: +d.xagUsd || prev.xagUsd,
      xauUsd: +d.xauUsd || prev.xauUsd,
      usdInr: +d.usdInr || prev.usdInr,
      india: sane(d.india) ? d.india : null,
      ibja: sane(d.ibja) ? d.ibja : null,
    };
    if (out.india || spotOk(d)) return out;
  } catch {
    /* fall through */
  }
  const s = await fetchDirect();
  if (!spotOk(s)) throw new Error('bad data');
  return { ...s, india: null, ibja: null };
}

export function RatesProvider({ children }) {
  const cached = load('vch.spot2', null);
  const [spot, setSpot] = useState(cached?.spot ?? FALLBACK_SPOT);
  const [prevSpot, setPrevSpot] = useState(null);
  const [status, setStatus] = useState(cached ? 'cached' : 'loading');
  const [updatedAt, setUpdatedAt] = useState(cached?.at ?? null);
  const [settings, setSettingsState] = useState(() => ({ ...PRICING_DEFAULTS, ...load('vch.settings', {}) }));
  const [ticks, setTicks] = useState(() => load('vch.ticks2', []));
  const spotRef = useRef(spot);

  const refresh = useCallback(async () => {
    try {
      const s = await fetchSpot(spotRef.current);
      setPrevSpot(spotRef.current);
      spotRef.current = s;
      setSpot(s);
      const at = Date.now();
      setUpdatedAt(at);
      setStatus('live');
      save('vch.spot2', { spot: s, at });
      setTicks((t) => {
        const next = [...t, { at, xagUsd: s.xagUsd, xauUsd: s.xauUsd, usdInr: s.usdInr, silver: s.india?.silver }].filter((x) => at - x.at < 1000 * 60 * 60 * 24 * 3).slice(-400);
        save('vch.ticks2', next);
        return next;
      });
      return true;
    } catch {
      setStatus((st) => (st === 'live' ? 'live' : cached ? 'cached' : 'fallback'));
      return false;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let timer;
    let alive = true;
    const loop = async () => {
      const ok = await refresh();
      if (alive) timer = setTimeout(loop, ok ? POLL_MS : RETRY_MS);
    };
    loop();
    const onVis = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refresh]);

  const setSettings = useCallback((patch) => {
    setSettingsState((s) => {
      const next = { ...s, ...patch };
      save('vch.settings', next);
      return next;
    });
  }, []);

  const value = useMemo(() => {
    const rates = deriveRates(spot, settings);
    const prev = prevSpot ? deriveRates(prevSpot, settings) : null;
    return {
      spot,
      rates,
      prev,
      status: settings.mode === 'manual' ? 'manual' : status,
      updatedAt,
      settings,
      setSettings,
      refresh,
      ticks,
    };
  }, [spot, prevSpot, settings, status, updatedAt, setSettings, refresh, ticks]);

  return <RatesCtx.Provider value={value}>{children}</RatesCtx.Provider>;
}

export const useRates = () => useContext(RatesCtx);
