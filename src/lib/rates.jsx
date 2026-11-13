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

const valid = (s) => s && s.xagUsd > 1 && s.xauUsd > 100 && s.usdInr > 30;

// 1) our own server endpoint (/api/rates, no CORS issues) → 2) direct public APIs
async function fetchSpot() {
  try {
    const d = await fetchJSON('/api/rates');
    const s = { xagUsd: +d.xagUsd, xauUsd: +d.xauUsd, usdInr: +d.usdInr };
    if (valid(s)) return s;
  } catch {
    /* fall through */
  }
  const s = await fetchDirect();
  if (!valid(s)) throw new Error('bad data');
  return s;
}

export function RatesProvider({ children }) {
  const cached = load('vch.spot', null);
  const [spot, setSpot] = useState(cached?.spot ?? FALLBACK_SPOT);
  const [prevSpot, setPrevSpot] = useState(null);
  const [status, setStatus] = useState(cached ? 'cached' : 'loading');
  const [updatedAt, setUpdatedAt] = useState(cached?.at ?? null);
  const [settings, setSettingsState] = useState(() => ({ ...PRICING_DEFAULTS, ...load('vch.settings', {}) }));
  const [ticks, setTicks] = useState(() => load('vch.ticks', []));
  const spotRef = useRef(spot);

  const refresh = useCallback(async () => {
    try {
      const s = await fetchSpot();
      setPrevSpot(spotRef.current);
      spotRef.current = s;
      setSpot(s);
      const at = Date.now();
      setUpdatedAt(at);
      setStatus('live');
      save('vch.spot', { spot: s, at });
      setTicks((t) => {
        const next = [...t, { at, ...s }].filter((x) => at - x.at < 1000 * 60 * 60 * 24 * 3).slice(-400);
        save('vch.ticks', next);
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
