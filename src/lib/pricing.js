// Pricing engine — mirrors how Indian silver jewellers bill:
// metal value (weight × rate × purity) + making + stones/plating + hallmark, then GST.
export const OZ = 31.1034768;

export function deriveRates(spot, settings) {
  if (settings.mode === 'manual') {
    const silver = +settings.manualSilverPerGram;
    const gold24 = +settings.manualGold24Per10g;
    return { silver, gold24, gold22: gold24 * 0.916, source: 'VCH store board rate' };
  }
  // Indian market rate (Hyderabad city rate / IBJA) — what Google and other jewellers show
  const ind = spot.india;
  if (ind && ind.silver > 0 && ind.gold24 > 0) {
    return { silver: ind.silver, gold24: ind.gold24, gold22: ind.gold22 || ind.gold24 * 0.916, source: ind.source };
  }
  const landed = (1 + settings.importDutyPct / 100) * (1 + settings.localPremiumPct / 100);
  const silver = ((spot.xagUsd * spot.usdInr) / OZ) * landed; // ₹ per gram, 999
  const gold24 = ((spot.xauUsd * spot.usdInr) / OZ) * 10 * landed; // ₹ per 10 g, 999
  return { silver, gold24, gold22: gold24 * 0.916, source: 'International spot parity' };
}

export const PURITY = {
  925: { label: '92.5 Sterling', factor: 0.925 },
  999: { label: '99.9 Fine Silver', factor: 1 },
};

export function priceProduct(p, rates, settings) {
  const rate = rates.silver;
  const factor = PURITY[p.purity]?.factor ?? 0.925;
  const metal = p.weight * rate * factor;
  const making = p.makingType === 'percent' ? (metal * p.making) / 100 : p.weight * p.making;
  const extras = (p.extras || []).filter((e) => +e.amount > 0).map((e) => ({ label: e.label, amount: +e.amount }));
  const extrasTotal = extras.reduce((s, e) => s + e.amount, 0);
  const hallmark = settings.hallmarkFee;
  const taxable = metal + making + extrasTotal + hallmark;
  const gst = (taxable * settings.gstPct) / 100;
  const total = Math.round(taxable + gst);
  return {
    rate,
    factor,
    metal,
    making,
    makingLabel: p.makingType === 'percent' ? `${p.making}% of metal` : `₹${p.making}/g × ${p.weight} g`,
    extras,
    hallmark,
    taxable,
    gst,
    total,
    exchangeValue: metal * 0.95, // indicative old-silver exchange value (5% melting loss)
  };
}

export function priceBullion(b, rates, settings) {
  const base = b.metal === 'gold' ? (rates.gold24 / 10) * b.weight * (b.purity / 999) : rates.silver * b.weight * (b.purity / 999);
  const premium = b.premium;
  const gst = ((base + premium) * settings.gstPct) / 100;
  const total = Math.round(base + premium + gst);
  const spread = b.metal === 'gold' ? 0.01 : 0.025;
  const buyback = Math.round(base * (1 - spread));
  return { base, premium, gst, total, buyback, spread };
}
