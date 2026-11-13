export function Divider({ className = '' }) {
  return (
    <svg className={`divider ${className}`} viewBox="0 0 240 24" aria-hidden="true">
      <path d="M0 12 H92" stroke="currentColor" strokeWidth="1" />
      <path d="M148 12 H240" stroke="currentColor" strokeWidth="1" />
      <path d="M120 2 L130 12 L120 22 L110 12 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="120" cy="12" r="3" fill="currentColor" />
      <circle cx="100" cy="12" r="2" fill="currentColor" />
      <circle cx="140" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function SectionTitle({ eyebrow, title, sub, align = 'center' }) {
  return (
    <div className={`section-title ${align}`}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
      <Divider />
      {sub && <p className="muted">{sub}</p>}
    </div>
  );
}

export function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lg-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#9aa1ab" />
          <stop offset=".7" stopColor="#f2f4f7" />
          <stop offset="1" stopColor="#7d838c" />
        </linearGradient>
      </defs>
      <path d="M32 3 L58 32 L32 61 L6 32 Z" fill="none" stroke="url(#lg-logo)" strokeWidth="2.2" />
      <path d="M32 10 L51 32 L32 54 L13 32 Z" fill="none" stroke="#d4b06a" strokeWidth="1" opacity=".8" />
      <text x="32" y="37.5" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="700" fontSize="14" fill="url(#lg-logo)">
        VCH
      </text>
    </svg>
  );
}
