// Procedural product illustrations — every product image on the site is generated here as SVG.
import { memo, useId } from 'react';

const METALS = {
  silver: ['#ffffff', '#dde1e7', '#9aa1ab', '#f5f7f9', '#737a84', '#cdd2d9'],
  oxidised: ['#d8d8d4', '#8e908c', '#3c3e3d', '#b4b5b1', '#252625', '#7e7f7b'],
  gold: ['#fff6d6', '#f2d27e', '#b98a33', '#fde9a9', '#7f5717', '#dcb057'],
  gold24: ['#fff3c4', '#ffd768', '#c8921e', '#ffe9a0', '#86580b', '#e9b443'],
};
const GEMS = {
  ruby: ['#ff9aa8', '#d4163a', '#4d0010'],
  emerald: ['#9dffd0', '#11a265', '#023822'],
  sapphire: ['#a9c6ff', '#2456db', '#08164f'],
  diamond: ['#ffffff', '#e6eeff', '#9fb0d0'],
  pearl: ['#ffffff', '#f3ede2', '#b8ab97'],
  kundan: ['#fffdf0', '#f3e6b8', '#b99b4f'],
  none: ['#ffffff', '#e6eeff', '#9fb0d0'],
};
export const BACKDROPS = {
  bridal: ['#7a1a2e', '#2f0710', '#120306'],
  home: ['#17594d', '#072620', '#020d0b'],
  casual: ['#2b3a7a', '#0e1533', '#05070f'],
  bullion: ['#4a4238', '#1a1613', '#080706'],
};

const rad = (d) => (d * Math.PI) / 180;
const arc = (cx, cy, rx, ry, a0, a1, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = n === 1 ? (a0 + a1) / 2 : a0 + ((a1 - a0) * i) / (n - 1);
    return { x: cx + rx * Math.cos(rad(a)), y: cy + ry * Math.sin(rad(a)), a };
  });
const poly = (pts) => 'M' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
const fmt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
function smooth(pts) {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`;
  }
  return d;
}
const lathe = (profile, cx = 200) => {
  const r = profile.map(([w, y]) => [cx + w, y]);
  const l = [...profile].reverse().map(([w, y]) => [cx - w, y]);
  return `M${fmt(r[0])}${smooth(r)} L${fmt(l[0])}${smooth(l)} Z`;
};
const qb = (p0, p1, p2, t) => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];

function makeKit(id, finish, gemName) {
  const m = METALS[finish] || METALS.silver;
  const k = {
    M: `url(#${id}m)`,
    MC: `url(#${id}mc)`,
    MR: `url(#${id}mr)`,
    MS: `url(#${id}ms)`,
    G: `url(#${id}g)`,
    P: `url(#${id}p)`,
    ml: m[0],
    mm: m[2],
    md: m[4],
    gemName,
    id,
  };
  k.bead = (x, y, r, key) => (
    <g key={key}>
      <circle cx={x} cy={y} r={r} fill={k.MR} />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.28} fill="#fff" opacity=".85" />
    </g>
  );
  k.pearl = (x, y, r, key) => (
    <g key={key}>
      <circle cx={x} cy={y} r={r} fill={k.P} />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#fff" opacity=".9" />
    </g>
  );
  k.gem = (x, y, r, key, fill = k.G) => (
    <g key={key}>
      <circle cx={x} cy={y} r={r + Math.max(1.5, r * 0.22)} fill={k.M} stroke={k.md} strokeWidth=".8" />
      <circle cx={x} cy={y} r={r} fill={fill} />
      <path d={`M${x - r * 0.55} ${y - r * 0.1} L${x - r * 0.1} ${y - r * 0.6} L${x + r * 0.2} ${y - r * 0.3} Z`} fill="#fff" opacity=".7" />
      <circle cx={x + r * 0.35} cy={y + r * 0.35} r={r * 0.14} fill="#fff" opacity=".5" />
    </g>
  );
  k.spark = (x, y, s, key) => (
    <path key={key} d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`} fill="#fff" opacity=".9" />
  );
  return k;
}

// ─────────────────────────── drawings ───────────────────────────
const D = {
  choker(k) {
    const pts = arc(200, 92, 132, 150, 16, 164, 11);
    const cord = arc(200, 92, 132, 150, -12, 192, 60);
    const inner = arc(200, 92, 112, 128, 22, 158, 22);
    return (
      <g>
        <path d={poly(cord)} fill="none" stroke="#6d0f22" strokeWidth="4" />
        <path d={poly(cord)} fill="none" stroke={k.MS} strokeWidth="2" strokeDasharray="2 3" />
        {inner.map((p, i) => k.bead(p.x, p.y, 4, 'i' + i))}
        {pts.map((p, i) => {
          const c = i === 5;
          const r = c ? 24 : 15 - Math.abs(i - 5) * 0.45;
          const ox = Math.cos(rad(p.a)), oy = Math.sin(rad(p.a));
          const dl = c ? 36 : 18;
          return (
            <g key={i}>
              <line x1={p.x + ox * r} y1={p.y + oy * r} x2={p.x + ox * (r + dl)} y2={p.y + oy * (r + dl)} stroke={k.mm} strokeWidth="1.4" />
              {c ? (
                <path
                  d={`M${p.x + ox * (r + dl)} ${p.y + oy * (r + dl) - 2} c-12 10 -12 24 0 30 c12 -6 12 -20 0 -30z`}
                  fill={k.G}
                  stroke={k.M}
                  strokeWidth="2.5"
                />
              ) : (
                k.pearl(p.x + ox * (r + dl), p.y + oy * (r + dl), 5.5, 'pd')
              )}
              <circle cx={p.x} cy={p.y} r={r} fill={k.M} stroke={k.md} strokeWidth="1" />
              {Array.from({ length: 10 }, (_, j) => {
                const a = (j / 10) * Math.PI * 2;
                return <circle key={j} cx={p.x + Math.cos(a) * r * 0.78} cy={p.y + Math.sin(a) * r * 0.78} r={r * 0.11} fill="#fffaf0" opacity=".9" />;
              })}
              {k.gem(p.x, p.y, r * 0.48, 'g')}
            </g>
          );
        })}
        {k.spark(300, 250, 10, 's1')}
        {k.spark(92, 150, 7, 's2')}
      </g>
    );
  },
  temple(k) {
    const chain = arc(200, 24, 120, 236, -6, 186, 70);
    const coins = arc(200, 24, 120, 236, 12, 168, 23);
    return (
      <g>
        <path d={poly(chain)} fill="none" stroke={k.MS} strokeWidth="3" />
        {coins.map((p, i) => (
          <g key={i} transform={`rotate(${p.a - 90} ${p.x} ${p.y})`}>
            <circle cx={p.x} cy={p.y + 6} r="12.5" fill={k.M} stroke={k.md} strokeWidth="1" />
            <circle cx={p.x} cy={p.y + 6} r="8.5" fill="none" stroke={k.md} strokeWidth=".8" opacity=".7" />
            <ellipse cx={p.x} cy={p.y + 6} rx="3" ry="5" fill={k.md} opacity=".45" />
          </g>
        ))}
        <g transform="translate(200 300)">
          {[-60, -30, 0, 30, 60].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0 0 C-16 -14 -14 -44 0 -56 C14 -44 16 -14 0 0Z" fill={k.M} stroke={k.md} strokeWidth="1.2" />
          ))}
          <path d="M-46 4 Q0 26 46 4 Q0 46 -46 4Z" fill={k.M} stroke={k.md} strokeWidth="1.2" />
          {k.gem(0, -16, 13, 'c')}
          {[-30, 0, 30].map((x, i) => (
            <g key={x}>
              <line x1={x} y1={20} x2={x} y2={i === 1 ? 46 : 36} stroke={k.mm} strokeWidth="1.3" />
              <ellipse cx={x} cy={i === 1 ? 54 : 44} rx="6" ry="9" fill={`url(#${k.gemName === 'ruby' ? k.id + 'ge' : k.id + 'gr'})`} />
            </g>
          ))}
          {arc(0, 10, 44, 18, 10, 170, 9).map((p, i) => k.pearl(p.x, p.y + 10, 4, i))}
        </g>
        {k.spark(118, 250, 9, 's1')}
        {k.spark(292, 120, 6, 's2')}
      </g>
    );
  },
  vaddanam(k) {
    const T = [[20, 150], [200, 205], [380, 150]];
    const B = [[20, 232], [200, 287], [380, 232]];
    const tb = Array.from({ length: 34 }, (_, i) => qb(...T, 0.03 + (i / 33) * 0.94));
    const bb = Array.from({ length: 34 }, (_, i) => qb(...B, 0.03 + (i / 33) * 0.94));
    const motifs = Array.from({ length: 12 }, (_, i) => 0.06 + (i / 11) * 0.88).filter((t) => Math.abs(t - 0.5) > 0.12);
    return (
      <g>
        <path d="M20 150 Q200 260 380 150 L380 232 Q200 342 20 232Z" fill={k.M} stroke={k.md} strokeWidth="1.5" />
        <path d="M20 160 Q200 270 380 160 M20 222 Q200 332 20 222" fill="none" />
        {motifs.map((t, i) => {
          const a = qb(...T, t), b = qb(...B, t);
          const x = (a[0] + b[0]) / 2, y = (a[1] + b[1]) / 2;
          return (
            <g key={i}>
              <path d={`M${x} ${y - 24} L${x + 14} ${y} L${x} ${y + 24} L${x - 14} ${y}Z`} fill="none" stroke={k.md} strokeWidth="1.2" opacity=".75" />
              {[0, 90, 180, 270].map((r) => (
                <ellipse key={r} cx={x} cy={y - 8} rx="3.5" ry="7" transform={`rotate(${r} ${x} ${y})`} fill={k.md} opacity=".35" />
              ))}
              {k.gem(x, y, 3.6, 'g', i % 2 ? `url(#${k.id}ge)` : `url(#${k.id}gr)`)}
            </g>
          );
        })}
        {tb.map((p, i) => k.bead(p[0], p[1], 4.2, 't' + i))}
        {bb.map((p, i) => k.bead(p[0], p[1], 4.2, 'b' + i))}
        <g transform="translate(200 245)">
          <ellipse rx="58" ry="66" fill={k.M} stroke={k.md} strokeWidth="2" />
          <ellipse rx="46" ry="54" fill="none" stroke={k.md} strokeWidth="1.2" />
          {arc(0, 0, 46, 54, 0, 345, 24).map((p, i) => k.bead(p.x, p.y, 3, i))}
          <path d="M0 -40 C10 -30 22 -24 18 -6 C14 6 6 4 0 12 C-6 4 -14 6 -18 -6 C-22 -24 -10 -30 0 -40Z" fill={k.md} opacity=".35" />
          {k.gem(0, 0, 15, 'c')}
          {k.gem(0, -32, 6, 't', `url(#${k.id}gr)`)}
          {arc(0, 0, 58, 66, 50, 130, 7).map((p, i) => (
            <g key={'d' + i}>
              <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 16} stroke={k.mm} strokeWidth="1.2" />
              {k.pearl(p.x, p.y + 21, 5, 'p')}
            </g>
          ))}
        </g>
        <path d="M20 160 c-14 4 -14 26 0 30 M380 160 c14 4 14 26 0 30" fill="none" stroke={k.MS} strokeWidth="4" />
        {k.spark(320, 140, 9, 's')}
      </g>
    );
  },
  jhumka(k, v) {
    const s = v === 'mini' ? 0.78 : 1;
    const one = (x, y) => (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx="0" cy="-15" rx="8" ry="13" transform={`rotate(${i * 45})`} fill={k.M} stroke={k.md} strokeWidth=".8" />
        ))}
        {k.gemName === 'none' ? k.bead(0, 0, 9, 'c') : k.gem(0, 0, 9, 'c')}
        {k.bead(0, 34, 6, 'b1')}
        {k.bead(0, 48, 5, 'b2')}
        <path d="M-56 175 C-56 110 -30 66 0 62 C30 66 56 110 56 175Z" fill={k.M} stroke={k.md} strokeWidth="1.5" />
        {[-34, -17, 0, 17, 34].map((x) => (
          <path key={x} d={`M${x - 7} 160 L${x - 7} 140 Q${x} 124 ${x + 7} 140 L${x + 7} 160`} fill="none" stroke={k.md} strokeWidth="1.3" opacity=".7" />
        ))}
        <path d="M-40 118 Q0 102 40 118" fill="none" stroke={k.md} strokeWidth="1.2" opacity=".6" />
        {arc(0, 92, 30, 14, 200, 340, 8).map((p, i) => k.bead(p.x, p.y + 6, 2.6, 'h' + i))}
        <ellipse cx="0" cy="175" rx="58" ry="11" fill={k.M} stroke={k.md} strokeWidth="1.2" />
        {arc(0, 175, 56, 11, 5, 175, 11).map((p, i) => (
          <g key={'p' + i}>
            <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + (i % 2 ? 12 : 20)} stroke={k.mm} strokeWidth="1.1" />
            {k.gemName === 'ruby' && i % 2 === 0
              ? k.gem(p.x, p.y + 26, 4.6, 'g')
              : k.pearl(p.x, p.y + (i % 2 ? 17 : 26), 5, 'q')}
          </g>
        ))}
        <path d="M-30 80 Q-44 120 -46 165" fill="none" stroke="#fff" strokeWidth="5" opacity=".28" strokeLinecap="round" />
      </g>
    );
    return (
      <g>
        {one(122, v === 'mini' ? 88 : 62)}
        {one(278, v === 'mini' ? 70 : 44)}
        {k.spark(205, 300, 10, 's')}
      </g>
    );
  },
  studs(k) {
    const one = (x, y, s) => (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r="62" fill={k.M} stroke={k.md} strokeWidth="1.5" />
        {Array.from({ length: 6 }, (_, i) => {
          const a = rad(i * 60 - 90);
          return k.gem(Math.cos(a) * 38, Math.sin(a) * 38, 17, i);
        })}
        {k.gem(0, 0, 19, 'c')}
        <circle r="62" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2" strokeDasharray="40 300" />
      </g>
    );
    return (
      <g>
        {one(128, 215, 0.95)}
        {one(275, 185, 1)}
        {k.spark(200, 110, 12, 'a')}
        {k.spark(330, 290, 8, 'b')}
      </g>
    );
  },
  tikka(k) {
    return (
      <g>
        <path d="M200 18 c-14 0 -18 -18 -4 -20" fill="none" stroke={k.MS} strokeWidth="3" />
        <line x1="200" y1="20" x2="200" y2="140" stroke={k.mm} strokeWidth="2.5" strokeDasharray="5 3" />
        {[40, 70, 100, 128].map((y) => k.bead(200, y, 4, y))}
        <g transform="translate(200 158)">
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cy="-9" rx="5" ry="9" transform={`rotate(${i * 60})`} fill={k.M} stroke={k.md} strokeWidth=".6" />
          ))}
          {k.bead(0, 0, 6, 'c')}
        </g>
        <path d="M118 210 A82 82 0 0 0 282 210 A70 58 0 0 1 118 210Z" fill={k.M} stroke={k.md} strokeWidth="1.5" />
        {arc(200, 210, 76, 68, 18, 162, 15).map((p, i) => k.bead(p.x, p.y, 3.2, 'cr' + i))}
        <circle cx="200" cy="205" r="30" fill={k.M} stroke={k.md} strokeWidth="1.2" />
        {arc(200, 205, 24, 24, 0, 345, 16).map((p, i) => k.bead(p.x, p.y, 2.2, 'r' + i))}
        {k.gem(200, 205, 17, 'g')}
        {arc(200, 210, 82, 82, 12, 168, 11).map((p, i) => (
          <g key={'d' + i}>
            <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 16 + (i % 2) * 8} stroke={k.mm} strokeWidth="1.1" />
            {k.pearl(p.x, p.y + 21 + (i % 2) * 8, 5.5, 'p')}
          </g>
        ))}
        {k.spark(286, 150, 10, 's')}
      </g>
    );
  },
  kada(k, v, opts = {}) {
    const w = opts.w ?? 30;
    const one = (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx="120" ry="52" fill="none" stroke={k.MS} strokeWidth={w} />
        <ellipse cx={cx} cy={cy} rx={120 + w / 2} ry={52 + w / 2} fill="none" stroke={k.md} strokeWidth="1.2" opacity=".7" />
        <ellipse cx={cx} cy={cy} rx={120 - w / 2} ry={52 - w / 2} fill="none" stroke={k.md} strokeWidth="1.2" opacity=".7" />
        {opts.gems
          ? arc(cx, cy, 120, 52, 0, 345, 24).map((p, i) => k.gem(p.x, p.y, 4.5, i))
          : arc(cx, cy, 120, 52, 0, 352, 48).map((p, i) => {
              const nx = Math.cos(rad(p.a)), ny = Math.sin(rad(p.a));
              return (
                <path
                  key={i}
                  d={`M${p.x - nx * 9} ${p.y - ny * 4} Q${p.x + ny * 6} ${p.y} ${p.x + nx * 9} ${p.y + ny * 4}`}
                  fill="none"
                  stroke={k.md}
                  strokeWidth="1.3"
                  opacity=".6"
                />
              );
            })}
        {!opts.gems && arc(cx, cy, 120 + w / 2, 52 + w / 2, 0, 350, 44).map((p, i) => k.bead(p.x, p.y, 3.2, 'b' + i))}
        <path d={poly(arc(cx, cy, 120, 52 + w * 0.15, 30, 150, 30))} fill="none" stroke="#fff" strokeWidth={w * 0.22} opacity=".35" strokeLinecap="round" />
      </g>
    );
    return (
      <g>
        {one(218, 170, 'a')}
        {one(184, 238, 'b')}
        {k.spark(330, 280, 10, 's')}
      </g>
    );
  },
  bangle(k) {
    return D.kada(k, null, { w: 14, gems: true });
  },
  anklet(k, v) {
    const heavy = v === 'heavy';
    const one = (cx, cy, key) => {
      const links = arc(cx, cy, 142, 62, 0, 355, 64);
      const bells = arc(cx, cy, 142, 62, 12, 168, heavy ? 15 : 9);
      return (
        <g key={key}>
          {links.map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx="7.5" ry="3.8" transform={`rotate(${p.a + 90} ${p.x} ${p.y})`} fill="none" stroke={k.MS} strokeWidth="2.6" />
          ))}
          {heavy && arc(cx, cy + 9, 142, 62, 10, 170, 40).map((p, i) => k.bead(p.x, p.y, 2.6, 'r' + i))}
          {bells.map((p, i) => {
            const r = heavy ? 8 : 5.5;
            const l = heavy ? (i % 2 ? 14 : 24) : 10;
            return (
              <g key={'b' + i}>
                <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + l} stroke={k.mm} strokeWidth="1.2" />
                <circle cx={p.x} cy={p.y + l + r} r={r} fill={k.MR} />
                <path d={`M${p.x} ${p.y + l + r} l0 ${r * 0.9}`} stroke={k.md} strokeWidth="1.5" />
                <circle cx={p.x - r * 0.35} cy={p.y + l + r * 0.65} r={r * 0.25} fill="#fff" opacity=".8" />
              </g>
            );
          })}
        </g>
      );
    };
    return (
      <g>
        {one(212, 140, 'a')}
        {one(188, 205, 'b')}
        {k.spark(70, 120, 9, 's')}
      </g>
    );
  },
  ring(k) {
    return (
      <g>
        <ellipse cx="200" cy="262" rx="80" ry="32" fill="none" stroke={k.MS} strokeWidth="13" />
        <ellipse cx="200" cy="262" rx="73" ry="26" fill="none" stroke={k.md} strokeWidth="1" opacity=".5" />
        <path d="M168 236 L182 210 L218 210 L232 236 Q200 246 168 236Z" fill={k.M} stroke={k.md} strokeWidth="1" />
        <path d="M160 186 L176 166 L224 166 L240 186 L200 226Z" fill={k.G} stroke={k.mm} strokeWidth="1" />
        <path d="M160 186 L240 186 M176 166 L190 186 L200 166 L210 186 L224 166 M190 186 L200 226 L210 186" fill="none" stroke="#fff" strokeWidth=".9" opacity=".75" />
        <path d="M176 166 L190 186 L160 186Z" fill="#fff" opacity=".55" />
        {[[164, 180, 176, 214], [236, 180, 224, 214], [186, 166, 190, 212], [214, 166, 210, 212]].map(([a, b, c, d], i) => (
          <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={k.MS} strokeWidth="4" strokeLinecap="round" />
        ))}
        <path d={poly(arc(200, 262, 80, 34, 25, 155, 30))} fill="none" stroke="#fff" strokeWidth="3" opacity=".45" strokeLinecap="round" />
        {k.spark(258, 150, 16, 'a')}
        {k.spark(150, 140, 8, 'b')}
      </g>
    );
  },
  toering(k) {
    const one = (cx, cy, key) => (
      <g key={key}>
        {[0, 9, 18].map((dy) => (
          <ellipse key={dy} cx={cx} cy={cy + dy} rx="50" ry="20" fill="none" stroke={k.MS} strokeWidth="5" />
        ))}
        <g transform={`translate(${cx} ${cy - 18})`}>
          {Array.from({ length: 6 }, (_, i) => k.bead(Math.cos(rad(i * 60)) * 9, Math.sin(rad(i * 60)) * 6, 5, i))}
          {k.bead(0, 0, 5.5, 'c')}
        </g>
      </g>
    );
    return (
      <g>
        {one(140, 232, 'a')}
        {one(268, 200, 'b')}
        {k.spark(205, 300, 9, 's')}
      </g>
    );
  },
  pendant(k, v) {
    const chain = arc(200, 22, 112, 182, -4, 184, 90);
    return (
      <g>
        <path d={poly(chain)} fill="none" stroke={k.MS} strokeWidth="2.4" strokeDasharray="4 2" />
        {v === 'blackbeads' && (
          <>
            <path d={poly(arc(200, 22, 100, 165, -4, 184, 90))} fill="none" stroke={k.MS} strokeWidth="2" strokeDasharray="4 2" />
            {[...arc(200, 22, 112, 182, 22, 158, 26), ...arc(200, 22, 100, 165, 24, 156, 24)].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4.4" fill="#0b0b0d" />
                <circle cx={p.x - 1.3} cy={p.y - 1.4} r="1.2" fill="#fff" opacity=".7" />
              </g>
            ))}
          </>
        )}
        <ellipse cx="200" cy="208" rx="5" ry="9" fill="none" stroke={k.MS} strokeWidth="3" />
        {v === 'lotus' && (
          <g transform="translate(200 262)">
            {[-64, -32, 0, 32, 64].map((a) => (
              <path key={a} transform={`rotate(${a})`} d="M0 6 C-14 -10 -12 -34 0 -46 C12 -34 14 -10 0 6Z" fill={k.M} stroke={k.md} strokeWidth="1" />
            ))}
            <path d="M0 18 C-10 10 -14 2 -8 -4 C-4 -8 0 -6 0 -2 C0 -6 4 -8 8 -4 C14 2 10 10 0 18Z" fill={k.G} stroke={k.ml} strokeWidth="1.5" />
          </g>
        )}
        {v === 'heart' && (
          <g>
            <path d="M200 268 C150 236 160 196 200 216 C240 196 250 236 200 268Z" fill="none" stroke={k.MS} strokeWidth="8" strokeLinejoin="round" />
            {k.gem(200, 218, 6, 'g')}
          </g>
        )}
        {v === 'blackbeads' && (
          <g>
            <circle cx="200" cy="240" r="26" fill={k.M} stroke={k.md} strokeWidth="1.2" />
            <circle cx="200" cy="240" r="18" fill="none" stroke={k.md} strokeWidth="1" opacity=".7" />
            {arc(200, 240, 22, 22, 0, 340, 18).map((p, i) => k.bead(p.x, p.y, 1.8, i))}
          </g>
        )}
        {k.spark(248, 300, 11, 'a')}
        {k.spark(110, 120, 7, 'b')}
      </g>
    );
  },
  bracelet(k) {
    const links = arc(200, 200, 138, 58, 0, 356, 70);
    return (
      <g>
        {links.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx="6.5" ry="3.4" transform={`rotate(${p.a + 90} ${p.x} ${p.y})`} fill="none" stroke={k.MS} strokeWidth="2.4" />
        ))}
        {arc(200, 200, 138, 58, 55, 125, 3).map((p, i) => (
          <g key={'c' + i}>
            <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 16} stroke={k.mm} strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y + 34} r="18" fill={k.M} />
            <circle cx={p.x} cy={p.y + 34} r="15" fill="#1d47c9" />
            <circle cx={p.x} cy={p.y + 34} r="10.5" fill="#fff" />
            <circle cx={p.x} cy={p.y + 34} r="7.5" fill="#55a8ff" />
            <circle cx={p.x} cy={p.y + 34} r="3.6" fill="#08080a" />
            <circle cx={p.x - 5} cy={p.y + 28} r="2.6" fill="#fff" opacity=".85" />
          </g>
        ))}
        <rect x="58" y="192" width="16" height="10" rx="4" fill={k.M} stroke={k.md} />
        {k.spark(310, 120, 10, 's')}
      </g>
    );
  },
  diya(k) {
    const one = (x, y, s, key) => (
      <g key={key} transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx="0" cy="52" rx="34" ry="9" fill={k.M} stroke={k.md} />
        <path d="M-16 26 L16 26 L28 50 L-28 50Z" fill={k.MC} />
        <path d="M-72 0 C-68 34 52 40 72 4 L104 -14 L64 -6 Z" fill={k.MC} stroke={k.md} strokeWidth="1" />
        <ellipse cx="-2" cy="-2" rx="70" ry="15" fill={k.M} stroke={k.md} />
        <ellipse cx="-2" cy="-1" rx="60" ry="10" fill="#4a3410" />
        <ellipse cx="-14" cy="-3" rx="26" ry="3" fill="#a07a2a" opacity=".6" />
        {arc(0, 14, 66, 14, 20, 160, 9).map((p, i) => (
          <path key={i} d={`M${p.x} ${p.y - 4} q-4 8 0 12 q4 -4 0 -12`} fill={k.md} opacity=".35" />
        ))}
        <g filter={`url(#${k.id}glow)`}>
          <circle cx="104" cy="-34" r="26" fill="#ffb347" opacity=".45" />
        </g>
        <path d="M104 -14 C92 -26 98 -44 106 -62 C110 -44 118 -28 104 -14Z" fill={`url(#${k.id}fl)`} />
      </g>
    );
    return (
      <g>
        {one(118, 236, 0.82, 'a')}
        {one(250, 262, 1, 'b')}
      </g>
    );
  },
  kalash(k) {
    const body = lathe([[56, 136], [42, 148], [46, 166], [88, 206], [98, 250], [80, 296], [58, 320], [62, 336], [56, 344]]);
    return (
      <g>
        {[-62, -32, 0, 32, 62].map((a) => (
          <path key={a} transform={`rotate(${a} 200 136)`} d="M200 136 C186 110 188 72 200 50 C212 72 214 110 200 136Z" fill={k.M} stroke={k.md} strokeWidth="1" />
        ))}
        {[-62, -32, 0, 32, 62].map((a) => (
          <line key={'v' + a} transform={`rotate(${a} 200 136)`} x1="200" y1="132" x2="200" y2="58" stroke={k.md} strokeWidth=".8" opacity=".6" />
        ))}
        <ellipse cx="200" cy="96" rx="34" ry="40" fill={k.MC} stroke={k.md} />
        {[-18, -6, 6, 18].map((x) => (
          <path key={x} d={`M${200 + x} 60 Q${200 + x * 1.5} 96 ${200 + x} 132`} fill="none" stroke={k.md} strokeWidth=".9" opacity=".5" />
        ))}
        <path d={body} fill={k.MC} stroke={k.md} strokeWidth="1.2" />
        <ellipse cx="200" cy="138" rx="56" ry="9" fill={k.M} stroke={k.md} />
        {[214, 286].map((y) => (
          <ellipse key={y} cx="200" cy={y} rx={y === 214 ? 92 : 84} ry="12" fill="none" stroke={k.md} strokeWidth="1.5" opacity=".7" />
        ))}
        {[-68, -40, -13, 13, 40, 68].map((x) => (
          <g key={x} transform={`translate(${200 + x} 250)`}>
            <path d="M-9 18 L-9 -4 Q0 -20 9 -4 L9 18" fill="none" stroke={k.md} strokeWidth="1.3" opacity=".7" />
            <circle cy="4" r="3.4" fill={k.md} opacity=".45" />
          </g>
        ))}
        <path d="M150 190 Q132 250 156 304" fill="none" stroke="#fff" strokeWidth="8" opacity=".3" strokeLinecap="round" />
        {k.spark(300, 110, 10, 's')}
      </g>
    );
  },
  lamp(k) {
    const body = lathe([[92, 150], [86, 160], [56, 170], [14, 180], [9, 196], [10, 214], [22, 226], [10, 238], [10, 256], [28, 270], [12, 284], [18, 300], [48, 318], [74, 332], [80, 344]]);
    const wicks = [180, 145, 90, 35, 0].map((a) => ({ x: 200 + 90 * Math.cos(rad(a)), y: 151 + 16 * Math.sin(rad(a)) }));
    const fid = k.id;
    return (
      <g>
        <line x1="200" y1="150" x2="200" y2="102" stroke={k.MS} strokeWidth="6" />
        <path transform="translate(200 92) scale(1.3)" d="M-22 10 C-22 -2 4 -4 12 4 C14 -8 6 -18 12 -26 C16 -32 24 -30 22 -24 L28 -22 L21 -20 C16 -14 22 -4 20 6 C18 16 -14 18 -22 10Z" fill={k.M} stroke={k.md} strokeWidth="1" />
        <path d={body} fill={k.MC} stroke={k.md} strokeWidth="1.2" />
        <ellipse cx="200" cy="151" rx="91" ry="16" fill={k.M} stroke={k.md} />
        <ellipse cx="200" cy="152" rx="78" ry="11" fill="#4a3410" />
        {arc(200, 160, 88, 16, 15, 165, 13).map((p, i) => k.bead(p.x, p.y + 4, 3, 'b' + i))}
        {wicks.map((w, i) => (
          <g key={i}>
            <circle cx={w.x} cy={w.y - 18} r="18" fill="#ffb347" opacity=".35" filter={`url(#${fid}glow)`} />
            <path d={`M${w.x} ${w.y} C${w.x - 9} ${w.y - 10} ${w.x - 4} ${w.y - 24} ${w.x + 1} ${w.y - 36} C${w.x + 4} ${w.y - 22} ${w.x + 10} ${w.y - 10} ${w.x} ${w.y}Z`} fill={`url(#${fid}fl)`} />
          </g>
        ))}
        {k.spark(310, 250, 9, 's')}
      </g>
    );
  },
  kumkum(k) {
    const box = lathe([[0, 128], [10, 140], [12, 152], [28, 168], [56, 186], [76, 212], [82, 222], [74, 230], [72, 296], [78, 306]]);
    return (
      <g>
        <path d={box} fill={k.MC} stroke={k.md} strokeWidth="1.2" />
        <ellipse cx="200" cy="224" rx="82" ry="15" fill="none" stroke={k.md} strokeWidth="1.5" />
        {arc(200, 224, 82, 15, 5, 175, 15).map((p, i) => k.bead(p.x, p.y, 3, i))}
        {[-52, -26, 0, 26, 52].map((x, i) => (
          <g key={x} transform={`translate(${200 + x} 266)`}>
            <path d="M0 -24 C14 -12 12 12 0 22 C-12 12 -14 -12 0 -24Z" fill="none" stroke={k.md} strokeWidth="1.2" opacity=".75" />
            <ellipse cy="-2" rx="5" ry="7" fill={i % 2 ? '#1a6b5a' : '#1b3d9c'} opacity=".75" />
            <circle cy="-2" r="2.5" fill={k.md} />
          </g>
        ))}
        {[-34, 0, 34].map((x) => (
          <path key={x} d={`M${200 + x} 196 q-8 -10 0 -22 q8 12 0 22`} fill={k.md} opacity=".35" />
        ))}
        <path d="M144 236 Q138 270 148 296" fill="none" stroke="#fff" strokeWidth="7" opacity=".3" strokeLinecap="round" />
        {k.spark(290, 150, 10, 's')}
      </g>
    );
  },
  glass(k) {
    const one = (x, y, s, key) => (
      <g key={key} transform={`translate(${x - 200 * s} ${y - 200 * s}) scale(${s})`}>
        <path d={lathe([[70, 120], [68, 160], [64, 220], [60, 280], [56, 300]])} fill={k.MC} stroke={k.md} strokeWidth="1.2" />
        <ellipse cx="200" cy="120" rx="70" ry="13" fill={k.M} stroke={k.md} />
        <ellipse cx="200" cy="121" rx="63" ry="9.5" fill={`url(#${k.id}in)`} />
        {[190, 240].map((yy) => (
          <ellipse key={yy} cx="200" cy={yy} rx={66 - (yy - 120) * 0.05} ry="11" fill="none" stroke={k.md} strokeWidth="1.3" opacity=".7" />
        ))}
        {[-44, -22, 0, 22, 44].map((xx) => (
          <path key={xx} d={`M${200 + xx - 8} 238 L${200 + xx - 8} 212 Q${200 + xx} 196 ${200 + xx + 8} 212 L${200 + xx + 8} 238`} fill="none" stroke={k.md} strokeWidth="1.2" opacity=".7" />
        ))}
        <path d="M150 140 L156 286" stroke="#fff" strokeWidth="9" opacity=".3" strokeLinecap="round" />
      </g>
    );
    return (
      <g>
        {one(145, 190, 0.78, 'a')}
        {one(245, 205, 0.95, 'b')}
      </g>
    );
  },
  bowl(k, v) {
    if (v === 'panchapatra') {
      return (
        <g>
          <path d={lathe([[64, 160], [56, 210], [44, 262], [32, 282], [44, 296], [52, 306]])} fill={k.MC} stroke={k.md} strokeWidth="1.2" />
          <ellipse cx="200" cy="160" rx="64" ry="13" fill={k.M} stroke={k.md} />
          <ellipse cx="200" cy="161" rx="57" ry="9" fill={`url(#${k.id}in)`} />
          <ellipse cx="200" cy="230" rx="50" ry="9" fill="none" stroke={k.md} strokeWidth="1.2" opacity=".7" />
          <path d="M226 150 L300 40" stroke={k.MS} strokeWidth="7" strokeLinecap="round" />
          <circle cx="303" cy="34" r="9" fill={k.MR} />
          <path d="M162 178 L176 268" stroke="#fff" strokeWidth="7" opacity=".3" strokeLinecap="round" />
          {k.spark(110, 120, 10, 's')}
        </g>
      );
    }
    return (
      <g>
        <path d={lathe([[100, 196], [94, 236], [74, 272], [44, 290], [46, 304], [52, 310]])} fill={k.MC} stroke={k.md} strokeWidth="1.2" />
        <ellipse cx="200" cy="196" rx="100" ry="24" fill={k.M} stroke={k.md} />
        <ellipse cx="200" cy="198" rx="90" ry="18" fill={`url(#${k.id}in)`} />
        <ellipse cx="200" cy="240" rx="90" ry="20" fill="none" stroke={k.md} strokeWidth="1.2" opacity=".7" />
        {arc(200, 240, 90, 20, 15, 165, 12).map((p, i) => (
          <path key={i} d={`M${p.x} ${p.y + 4} q-6 -8 0 -16 q6 8 0 16`} fill={k.md} opacity=".35" />
        ))}
        <path d="M250 196 L338 94" stroke={k.MS} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="238" cy="206" rx="22" ry="12" transform="rotate(-48 238 206)" fill={k.M} stroke={k.md} />
        <circle cx="340" cy="90" r="8" fill={k.MR} />
        {k.spark(110, 130, 10, 's')}
      </g>
    );
  },
  thali(k) {
    const fid = k.id;
    return (
      <g>
        <ellipse cx="200" cy="262" rx="172" ry="74" fill={k.MC} stroke={k.md} strokeWidth="1.2" />
        <ellipse cx="200" cy="258" rx="146" ry="58" fill={k.M} stroke={k.md} />
        <ellipse cx="200" cy="258" rx="128" ry="49" fill="none" stroke={k.md} strokeWidth="1" opacity=".5" />
        {arc(200, 262, 166, 70, 0, 352, 52).map((p, i) => k.bead(p.x, p.y, 3.4, i))}
        {/* diya */}
        <g transform="translate(122 236) scale(.45)">
          <path d="M-72 0 C-68 34 52 40 72 4 L104 -14 L64 -6 Z" fill={k.MC} stroke={k.md} />
          <ellipse cx="-2" cy="-2" rx="70" ry="15" fill="#4a3410" stroke={k.mm} />
          <circle cx="104" cy="-34" r="26" fill="#ffb347" opacity=".45" filter={`url(#${fid}glow)`} />
          <path d="M104 -14 C92 -26 98 -44 106 -62 C110 -44 118 -28 104 -14Z" fill={`url(#${fid}fl)`} />
        </g>
        {/* kumkum & haldi bowls */}
        {[
          [212, 222, '#b3122c'],
          [268, 238, '#e6a312'],
        ].map(([x, y, c]) => (
          <g key={x}>
            <path d={`M${x - 22} ${y} Q${x - 20} ${y + 22} ${x} ${y + 22} Q${x + 20} ${y + 22} ${x + 22} ${y}Z`} fill={k.MC} stroke={k.md} />
            <ellipse cx={x} cy={y} rx="22" ry="7" fill={k.M} stroke={k.md} />
            <ellipse cx={x} cy={y} rx="17" ry="4.6" fill={c} />
          </g>
        ))}
        {/* bell */}
        <g transform="translate(176 268)">
          <path d="M-18 22 C-18 0 -10 -10 0 -10 C10 -10 18 0 18 22Z" fill={k.MC} stroke={k.md} />
          <ellipse cy="22" rx="19" ry="5" fill={k.M} stroke={k.md} />
          <line x1="0" y1="-10" x2="0" y2="-46" stroke={k.MS} strokeWidth="4" />
          <path d="M0 -50 l-8 -10 h16z" fill={k.M} stroke={k.md} />
        </g>
        {/* agarbatti stand */}
        <g transform="translate(262 282)">
          <ellipse rx="14" ry="5" fill={k.M} stroke={k.md} />
          <line x1="0" y1="0" x2="10" y2="-62" stroke="#5a3a1a" strokeWidth="2" />
          <path d="M10 -62 q-8 -14 2 -26 q10 -12 0 -26" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".35" />
        </g>
        {/* spoon */}
        <path d="M120 286 L176 306" stroke={k.MS} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="114" cy="284" rx="10" ry="6" fill={k.M} stroke={k.md} />
        {k.spark(70, 160, 10, 's')}
      </g>
    );
  },
  coin(k, v, label, finish) {
    const pid = k.id + 'tp';
    const gold = finish === 'gold24';
    return (
      <g>
        <circle cx="208" cy="214" r="132" fill={k.md} />
        <circle cx="200" cy="204" r="132" fill={k.M} stroke={k.md} strokeWidth="1.5" />
        <circle cx="200" cy="204" r="122" fill="none" stroke={k.md} strokeWidth="1.5" opacity=".8" />
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          return <circle key={i} cx={200 + Math.cos(a) * 114} cy={204 + Math.sin(a) * 114} r="2.2" fill={k.md} opacity=".55" />;
        })}
        <circle cx="200" cy="204" r="78" fill="none" stroke={k.md} strokeWidth="1" opacity=".6" />
        <path id={pid} d="M200 204 m-98 0 a98 98 0 1 1 196 0" fill="none" />
        <text fontFamily="Cinzel, serif" fontSize="12.5" fontWeight="600" fill={k.md} letterSpacing="2" opacity=".85">
          <textPath href={`#${pid}`} startOffset="50%" textAnchor="middle">
            VCH JEWELLERS · HYDERABAD
          </textPath>
        </text>
        <g transform="translate(200 176)" opacity=".75">
          {[-60, -30, 0, 30, 60].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0 8 C-9 -2 -8 -18 0 -26 C8 -18 9 -2 0 8Z" fill="none" stroke={k.md} strokeWidth="1.4" />
          ))}
        </g>
        <text x="200" y="230" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="34" fontWeight="700" fill={k.md} opacity=".85">
          {gold ? '999.9' : '999'}
        </text>
        <text x="200" y="254" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="13" letterSpacing="3" fill={k.md} opacity=".8">
          {gold ? 'FINE GOLD 24K' : 'FINE SILVER'}
        </text>
        <text x="200" y="290" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="20" fontWeight="600" fill={k.md} opacity=".85">
          {label}
        </text>
        <path d="M110 140 A110 110 0 0 1 200 94" fill="none" stroke="#fff" strokeWidth="6" opacity=".5" strokeLinecap="round" />
        {k.spark(330, 92, 12, 's')}
      </g>
    );
  },
  bar(k, v, label, finish) {
    const gold = finish === 'gold24';
    const metalTxt = gold ? 'FINE GOLD' : 'FINE SILVER';
    const assay = gold ? '999.9' : '999.0';
    if (v === 'minted') {
      return (
        <g>
          <rect x="128" y="62" width="152" height="266" rx="12" fill={k.md} />
          <rect x="120" y="54" width="152" height="266" rx="12" fill={k.M} stroke={k.md} strokeWidth="1.5" />
          <rect x="132" y="66" width="128" height="242" rx="8" fill="none" stroke={k.md} strokeWidth="1" opacity=".6" />
          <path d="M196 92 L214 112 L196 132 L178 112Z" fill="none" stroke={k.md} strokeWidth="1.6" opacity=".8" />
          <text x="196" y="117" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="11" fontWeight="700" fill={k.md}>VCH</text>
          {[['VCH JEWELLERS', 152, 11], [metalTxt, 194, 13], [label, 236, 30], [assay, 270, 20], ['No. VC 041287', 296, 9]].map(([t, y, s]) => (
            <text key={t} x="196" y={y} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={s} fontWeight="600" letterSpacing="1.5" fill={k.md} opacity=".85">
              {t}
            </text>
          ))}
          <path d="M136 80 L140 300" stroke="#fff" strokeWidth="8" opacity=".35" strokeLinecap="round" />
          {k.spark(300, 90, 12, 's')}
        </g>
      );
    }
    return (
      <g>
        <path d="M58 226 L342 226 L322 288 L78 288Z" fill={k.md} />
        <path d="M58 226 L342 226 L322 288 L78 288Z" fill={k.MC} opacity=".55" />
        <path d="M96 140 L304 140 L342 226 L58 226Z" fill={k.M} stroke={k.md} strokeWidth="1.2" />
        <path d="M112 152 L288 152 L318 216 L82 216Z" fill="none" stroke={k.md} strokeWidth="1" opacity=".55" />
        {[['VCH JEWELLERS', 170, 11], [`${metalTxt}  ${assay}`, 190, 14], [label, 210, 15]].map(([t, y, s]) => (
          <text key={t} x="200" y={y} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={s} fontWeight="700" letterSpacing="2" fill={k.md} opacity=".85">
            {t}
          </text>
        ))}
        <text x="200" y="262" textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="10" letterSpacing="3" fill={k.ml} opacity=".6">
          No. VC 2026 004127
        </text>
        <path d="M110 146 L300 146" stroke="#fff" strokeWidth="3" opacity=".5" />
        {k.spark(318, 120, 14, 's')}
      </g>
    );
  },
  nazariya(k) {
    const one = (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx="74" ry="30" fill="none" stroke={k.MS} strokeWidth="9" />
        {arc(cx, cy, 74, 30, 20, 160, 7).map((p, i) =>
          i % 3 === 1 ? (
            <g key={i}>
              <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 10} stroke={k.mm} />
              <circle cx={p.x} cy={p.y + 16} r="6" fill={k.MR} />
              <path d={`M${p.x} ${p.y + 16} v6`} stroke={k.md} strokeWidth="1.4" />
            </g>
          ) : (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="6.5" fill="#0b0b0d" />
              <circle cx={p.x - 2} cy={p.y - 2} r="1.8" fill="#fff" opacity=".75" />
            </g>
          ),
        )}
        {arc(cx, cy, 74, 30, 200, 340, 6).map((p, i) => k.bead(p.x, p.y, 3.4, 'b' + i))}
      </g>
    );
    return (
      <g>
        {one(150, 230, 'a')}
        {one(262, 200, 'b')}
        {k.spark(310, 300, 10, 's')}
        {k.spark(84, 130, 7, 't')}
      </g>
    );
  },
};

export const ART_KINDS = Object.keys(D);

function ProductArtImpl({ art = {}, line = 'casual', className, title }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = 'a' + raw;
  const finish = art.finish || 'silver';
  const gemName = art.gem || 'none';
  const m = METALS[finish] || METALS.silver;
  const g = GEMS[gemName] || GEMS.none;
  const bg = BACKDROPS[line] || BACKDROPS.casual;
  const k = makeKit(id, finish, gemName);
  const draw = D[art.kind] || D.ring;
  if (art.image) {
    return <img className={className} src={art.image} alt={title || ''} loading="lazy" />;
  }
  return (
    <svg className={className} viewBox="0 0 400 400" role="img" aria-label={title} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`${id}bg`} cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset=".55" stopColor={bg[1]} />
          <stop offset="1" stopColor={bg[2]} />
        </radialGradient>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m[0]} />
          <stop offset=".22" stopColor={m[1]} />
          <stop offset=".45" stopColor={m[2]} />
          <stop offset=".62" stopColor={m[3]} />
          <stop offset=".82" stopColor={m[4]} />
          <stop offset="1" stopColor={m[5]} />
        </linearGradient>
        <linearGradient id={`${id}mc`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={m[4]} />
          <stop offset=".18" stopColor={m[1]} />
          <stop offset=".3" stopColor={m[0]} />
          <stop offset=".5" stopColor={m[2]} />
          <stop offset=".72" stopColor={m[3]} />
          <stop offset="1" stopColor={m[4]} />
        </linearGradient>
        <linearGradient id={`${id}ms`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="90" y2="60" spreadMethod="reflect">
          <stop offset="0" stopColor={m[0]} />
          <stop offset=".35" stopColor={m[1]} />
          <stop offset=".6" stopColor={m[2]} />
          <stop offset=".85" stopColor={m[3]} />
          <stop offset="1" stopColor={m[4]} />
        </linearGradient>
        <radialGradient id={`${id}mr`} cx="35%" cy="32%" r="70%">
          <stop offset="0" stopColor={m[0]} />
          <stop offset=".45" stopColor={m[1]} />
          <stop offset="1" stopColor={m[4]} />
        </radialGradient>
        <radialGradient id={`${id}g`} cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor={g[0]} />
          <stop offset=".5" stopColor={g[1]} />
          <stop offset="1" stopColor={g[2]} />
        </radialGradient>
        <radialGradient id={`${id}gr`} cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor={GEMS.ruby[0]} />
          <stop offset=".5" stopColor={GEMS.ruby[1]} />
          <stop offset="1" stopColor={GEMS.ruby[2]} />
        </radialGradient>
        <radialGradient id={`${id}ge`} cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor={GEMS.emerald[0]} />
          <stop offset=".5" stopColor={GEMS.emerald[1]} />
          <stop offset="1" stopColor={GEMS.emerald[2]} />
        </radialGradient>
        <radialGradient id={`${id}p`} cx="35%" cy="32%" r="70%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".5" stopColor="#f1e9db" />
          <stop offset="1" stopColor="#a99b86" />
        </radialGradient>
        <linearGradient id={`${id}in`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m[4]} />
          <stop offset="1" stopColor={m[1]} />
        </linearGradient>
        <radialGradient id={`${id}fl`} cx="50%" cy="75%" r="70%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset=".35" stopColor="#ffd34d" />
          <stop offset=".75" stopColor="#ff8a1f" />
          <stop offset="1" stopColor="#d9480f" />
        </radialGradient>
        <filter id={`${id}glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={`${id}sh`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000" floodOpacity=".55" />
        </filter>
        <filter id={`${id}blur`}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}bg)`} />
      <g opacity=".07" fill="none" stroke="#fff" strokeWidth="1.2">
        <path d="M60 400 L60 150 Q60 70 200 22 Q340 70 340 150 L340 400" />
        <path d="M84 400 L84 160 Q84 92 200 50 Q316 92 316 160 L316 400" />
      </g>
      <ellipse cx="200" cy="352" rx="150" ry="18" fill="#000" opacity=".45" filter={`url(#${id}blur)`} />
      <g filter={`url(#${id}sh)`}>{draw(k, art.variant, art.label, finish)}</g>
    </svg>
  );
}

const ProductArt = memo(ProductArtImpl);
export default ProductArt;
