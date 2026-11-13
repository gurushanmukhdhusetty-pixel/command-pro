// Stylised Charminar silhouette used as a decorative backdrop.
export default function Charminar({ className = '' }) {
  const minaret = (x) => (
    <g key={x}>
      <rect x={x - 9} y="70" width="18" height="250" />
      {[110, 150, 190].map((y) => (
        <rect key={y} x={x - 14} y={y} width="28" height="6" rx="2" />
      ))}
      <path d={`M${x - 11} 70 Q${x - 11} 46 ${x} 30 Q${x + 11} 46 ${x + 11} 70Z`} />
      <rect x={x - 1.2} y="14" width="2.4" height="18" />
      <circle cx={x} cy="28" r="3.5" />
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 400 330" aria-hidden="true">
      <g fill="currentColor">
        {[48, 352].map(minaret)}
        <path d="M60 330 V200 H340 V330 H262 V262 Q262 206 200 182 Q138 206 138 262 V330Z" />
        <rect x="60" y="192" width="280" height="10" />
        {[86, 116, 146, 176, 206, 236, 266, 296].map((x) => (
          <path key={x} d={`M${x} 190 V170 Q${x + 9} 158 ${x + 18} 170 V190Z`} />
        ))}
        <rect x="60" y="150" width="280" height="8" />
        <path d="M150 150 Q150 110 200 98 Q250 110 250 150Z" opacity=".9" />
        <rect x="198" y="80" width="4" height="22" />
      </g>
    </svg>
  );
}
