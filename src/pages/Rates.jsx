import { useMemo, useState } from 'react';
import { SectionTitle } from '../components/Ornament';
import Reveal from '../components/Reveal';
import { useRates } from '../lib/rates';
import { OZ } from '../lib/pricing';
import { rupee, rupee2, timeAgo } from '../lib/format';

function mulberry(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Chart({ points, color = '#dfe3e8', label }) {
  const W = 760, H = 260, P = 34;
  const min = Math.min(...points), max = Math.max(...points);
  const pad = (max - min) * 0.15 || 1;
  const y = (v) => H - P - ((v - (min - pad)) / (max - min + 2 * pad)) * (H - 2 * P);
  const x = (i) => P + (i / (points.length - 1)) * (W - 2 * P);
  const d = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const [hover, setHover] = useState(null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const i = Math.round((((e.clientX - r.left) / r.width) * W - P) / ((W - 2 * P) / (points.length - 1)));
        setHover(Math.max(0, Math.min(points.length - 1, i)));
      }}>
      <defs>
        <linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((k) => {
        const v = min - pad + k * (max - min + 2 * pad);
        return (
          <g key={k}>
            <line x1={P} x2={W - P} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".08" />
            <text x={W - P + 4} y={y(v) + 4} fontSize="10" fill="currentColor" opacity=".5">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      <path d={`${d} L${x(points.length - 1)},${H - P} L${x(0)},${H - P}Z`} fill="url(#chartfill)" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" />
      <circle cx={x(points.length - 1)} cy={y(points.at(-1))} r="5" fill={color} className="pulse-dot" />
      {hover != null && (
        <g>
          <line x1={x(hover)} x2={x(hover)} y1={P} y2={H - P} stroke="currentColor" opacity=".3" />
          <circle cx={x(hover)} cy={y(points[hover])} r="4" fill={color} />
          <text x={Math.min(x(hover) + 8, W - 150)} y={P + 8} fontSize="12" fill="currentColor">
            {label(hover)} · ₹{points[hover].toFixed(2)}
          </text>
        </g>
      )}
    </svg>
  );
}

export default function Rates() {
  const { rates, spot, status, updatedAt, settings, refresh, ticks } = useRates();
  const [busy, setBusy] = useState(false);
  const landed = (1 + settings.importDutyPct / 100) * (1 + settings.localPremiumPct / 100);
  const intl = (spot.xagUsd * spot.usdInr) / OZ;

  // 30-day illustrative trend anchored on today's live rate (no free historical feed available client-side).
  const trend = useMemo(() => {
    const rnd = mulberry(Math.floor(Date.now() / 86400000));
    const pts = [rates.silver];
    for (let i = 1; i < 30; i++) pts.unshift(pts[0] * (1 + (rnd() - 0.52) * 0.018));
    return pts;
  }, [rates.silver]);
  const session = ticks.map((t) => t.silver || ((t.xagUsd * t.usdInr) / OZ) * landed);

  const silverRows = [1, 10, 100, 500, 1000];
  const goldRows = [1, 8, 10, 100];

  return (
    <div className="page rates-page">
      <div className="page-head">
        <div className="container">
          <SectionTitle eyebrow="Hyderabad · updated every minute" title="Today’s Silver & Gold Rates" sub="Transparent, formula-based rates — the same numbers that price every piece on this site." />
        </div>
      </div>
      <div className="container">
        <div className="board">
          <Reveal className="board-main">
            <div className="bm-top">
              <span className={`live-chip ${status}`}>
                <i /> {status === 'live' ? 'LIVE MARKET' : status === 'manual' ? 'STORE BOARD RATE' : 'INDICATIVE (feed offline)'}
              </span>
              <button
                className="btn btn-sm btn-ghost"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await refresh();
                  setBusy(false);
                }}>
                {busy ? 'Refreshing…' : '↻ Refresh'}
              </button>
            </div>
            <small>Silver 999 fine · per kg</small>
            <div className="bm-big silver-text flash" key={Math.round(rates.silver * 1000)}>{rupee(rates.silver * 1000)}</div>
            <div className="bm-sub">
              {rupee2(rates.silver)} / g · 92.5 sterling {rupee2(rates.silver * 0.925)} / g · updated {timeAgo(updatedAt)}
            </div>
          </Reveal>
          <Reveal delay={100} className="board-side">
            <small>Gold 24K (999) · per 10 g</small>
            <div className="bs-big gold-text">{rupee(rates.gold24)}</div>
            <small>Gold 22K (916) · per 10 g</small>
            <div className="bs-mid">{rupee(rates.gold22)}</div>
          </Reveal>
        </div>

        <section className="section">
          <div className="split top">
            <Reveal>
              <h3 className="h3">Where today’s rate comes from</h3>
              <div className="formula">
                <div>
                  <span>Hyderabad city rate (Goodreturns · as shown on Google)</span>
                  <b>{spot.india?.source?.startsWith('Goodreturns') ? `${rupee2(spot.india.silver)} / g` : '—'}</b>
                </div>
                <div>
                  <span>IBJA national benchmark</span>
                  <b>{spot.ibja ? `${rupee2(spot.ibja.silver)} / g` : '—'}</b>
                </div>
                <div>
                  <span>International parity (${spot.xagUsd.toFixed(2)}/oz × ₹{spot.usdInr.toFixed(2)} + {settings.importDutyPct}% duty)</span>
                  <b>{rupee2(intl * (1 + settings.importDutyPct / 100))} / g</b>
                </div>
                <div className="t">
                  <span>Silver 999 rate used · {rates.source}</span>
                  <b>{rupee2(rates.silver)} / g</b>
                </div>
              </div>
              <p className="tiny muted">
                Like other Indian jewellers, we price on the local Hyderabad market rate (excl. GST), refreshed every few minutes. If it is unavailable we
                fall back to the IBJA benchmark, then to international spot parity, and label the price “indicative”.
                {settings.mode === 'manual' && ' The store has currently set a manual board rate.'}
                {spot.india?.asOf && ` Market date: ${spot.india.asOf}.`}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h3 className="h3">Quick reference</h3>
              <table className="rtable">
                <thead>
                  <tr>
                    <th>Silver</th>
                    <th>99.9</th>
                    <th>92.5</th>
                  </tr>
                </thead>
                <tbody>
                  {silverRows.map((g) => (
                    <tr key={g}>
                      <td>{g >= 1000 ? '1 kg' : `${g} g`}</td>
                      <td>{rupee(rates.silver * g)}</td>
                      <td>{rupee(rates.silver * g * 0.925)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="rtable">
                <thead>
                  <tr>
                    <th>Gold</th>
                    <th>24K</th>
                    <th>22K</th>
                  </tr>
                </thead>
                <tbody>
                  {goldRows.map((g) => (
                    <tr key={g}>
                      <td>{g === 8 ? '8 g (1 sovereign)' : `${g} g`}</td>
                      <td>{rupee((rates.gold24 / 10) * g)}</td>
                      <td>{rupee((rates.gold22 / 10) * g)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <Reveal className="chart-card">
            <div className="chart-head">
              <div>
                <h3 className="h3">Silver 999 · ₹ per gram</h3>
                <span className="tiny muted">
                  {session.length >= 5
                    ? `Live readings captured by your browser (${session.length} points, last 3 days)`
                    : 'Illustrative 30-day trend ending at today’s live rate. Live readings will appear here as they are captured.'}
                </span>
              </div>
            </div>
            <Chart
              points={session.length >= 5 ? session : trend}
              label={(i) =>
                session.length >= 5
                  ? new Date(ticks[i].at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  : new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              }
            />
          </Reveal>
        </section>
      </div>
    </div>
  );
}
