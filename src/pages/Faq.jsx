import { useState } from 'react';
import { SectionTitle } from '../components/Ornament';

const QA = [
  ['How is the price of a piece calculated?', 'Silver value (weight × today’s rate × purity) + making charges + any stones or gold polish + ₹45 BIS hallmarking, then 3% GST on the total. Every product page shows this breakdown live.'],
  ['Where does the live silver rate come from?', 'We take the international spot price (USD per troy ounce), convert to rupees at the live exchange rate, add 6% import duty and a 1% local dealer premium. When the store sets a board rate manually, the site shows “Store rate”.'],
  ['What is the difference between 92.5 and 99.9 silver?', '99.9 (fine) silver is almost pure and is used for pooja articles, coins and bars. 92.5 (sterling) is alloyed with 7.5% copper for strength — ideal for jewellery that must hold stones and shape.'],
  ['Is every piece hallmarked?', 'Yes. Every piece is BIS hallmarked with a 6-digit HUID that you can verify on the BIS CARE app.'],
  ['Will the final price differ from the website?', 'Silver moves through the day, so prices are indicative until billed. Handmade pieces can also vary ±3% in weight; your invoice uses the actual weight.'],
  ['Exchange & buyback policy', 'Exchange any VCH piece anytime at the day’s silver value of its metal content, less 5% melting loss (making and GST are not refunded). Sealed VCH bullion is bought back at live rate minus 1% (gold) or 2.5% (silver).'],
  ['Returns', 'Unworn, non-customised pieces can be returned within 7 days for a full refund of the invoice value. Engraved and made-to-order pieces are exchange-only.'],
  ['Do you ship outside Hyderabad?', 'Yes — fully insured delivery across India. Free over ₹5,000; bullion above ₹50,000 ships through secure logistics.'],
  ['What documents do I need for bullion?', 'PAN for purchases of ₹2 lakh or more. Payments of ₹2 lakh and above cannot be made in cash.'],
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="page">
      <div className="page-head">
        <div className="container">
          <SectionTitle eyebrow="Good to know" title="FAQ & Policies" />
        </div>
      </div>
      <div className="container narrow">
        {QA.map(([q, a], i) => (
          <div key={q} className={`faq ${open === i ? 'open' : ''}`}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{q}</span>
              <i>+</i>
            </button>
            <div className="faq-a">
              <p>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
