import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_SPOT, PRICING_DEFAULTS } from '../config';
import { deriveRates } from './pricing';
import { load, save } from './storage';

const RatesCtx = createContext(null);
const POLL_MS = 60_000;

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

async function fetchSpot() {
  const [xag, xau] = await Promise.all([
    fetchJSON('https://api.gold-api.com/price/XAG'),
    fetchJSON('https://api.gold-api.com/price/XAU'),
  ]);
  let usdInr;
  try {
    usdInr = (await fetchJSON('https://open.er-api.com/v6/latest/USD')).rates.INR;
  } catch {
    usdInr = (await fetchJSON('https://api.frankfurter.app/latest?from=USD&to=INR')).rates.INR;
  }
  if (!(xag?.price > 0 && xau?.price > 0 && usdInr > 0)) throw new Error('bad data');
  return { xagUsd: xag.price, xauUsd: xau.price, usdInr };
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
    } catch {
      setStatus((st) => (st === 'live' ? 'live' : cached ? 'cached' : 'fallback'));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
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
