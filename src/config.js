// Store details — replace the placeholders with VCH Jewellers' real details.
export const STORE = {
  name: 'VCH Jewellers',
  tagline: 'Royal Silver · Since Generations · Hyderabad',
  phoneDisplay: '+91 90000 00000',
  phone: '+919000000000',
  whatsapp: '919000000000', // international format, digits only
  email: 'hello@vchjewellers.in',
  address: ['VCH Jewellers', 'Near Charminar, Pathergatti Road', 'Hyderabad, Telangana 500002'],
  mapQuery: 'Pathergatti Road, Charminar, Hyderabad',
  hours: [
    ['Mon – Sat', '10:30 AM – 8:30 PM'],
    ['Sunday', '11:00 AM – 6:00 PM'],
  ],
  gstin: '36XXXXXXXXXXXZX',
};

// Market & pricing assumptions (editable from /admin → Rate settings)
export const PRICING_DEFAULTS = {
  mode: 'live', // 'live' | 'manual'
  importDutyPct: 6, // Basic customs duty + AIDC on silver/gold (Union Budget 2024)
  localPremiumPct: 1.0, // Hyderabad dealer premium over landed cost
  manualSilverPerGram: 195, // ₹ / g, fine 999 (used when mode = manual)
  manualGold24Per10g: 137350, // ₹ / 10 g, 24K 999
  gstPct: 3,
  hallmarkFee: 45, // BIS HUID fee per piece
};

// Used only if the live feeds are unreachable and nothing is cached
export const FALLBACK_SPOT = {
  xagUsd: 61.0,
  xauUsd: 4480,
  usdInr: 88.7,
  india: { silver: 195, gold24: 137350, gold22: 125900, source: 'Hyderabad rate (13 Nov 2026)' },
};
