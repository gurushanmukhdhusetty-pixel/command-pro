import { rupee, rupee2 } from '../lib/format';
import { PURITY } from '../lib/pricing';

export default function PriceBreakdown({ p, price, settings, qty = 1 }) {
  return (
    <div className="breakdown">
      <div className="bd-head">
        <span>Price breakdown</span>
        <span className="tiny muted">computed live</span>
      </div>
      <div className="bd-row">
        <span>
          Silver value
          <small>
            {p.weight} g × {rupee2(price.rate)}/g × {PURITY[p.purity]?.factor ?? 0.925} ({PURITY[p.purity]?.label})
          </small>
        </span>
        <b>{rupee(price.metal)}</b>
      </div>
      <div className="bd-row">
        <span>
          Making charges
          <small>{price.makingLabel}</small>
        </span>
        <b>{rupee(price.making)}</b>
      </div>
      {price.extras.map((e) => (
        <div className="bd-row" key={e.label}>
          <span>{e.label}</span>
          <b>{rupee(e.amount)}</b>
        </div>
      ))}
      <div className="bd-row">
        <span>
          BIS hallmarking (HUID)
          <small>per piece</small>
        </span>
        <b>{rupee(price.hallmark)}</b>
      </div>
      <div className="bd-row sub">
        <span>Taxable value</span>
        <b>{rupee(price.taxable)}</b>
      </div>
      <div className="bd-row">
        <span>
          GST {settings.gstPct}%
          <small>CGST 1.5% + SGST 1.5% (Telangana)</small>
        </span>
        <b>{rupee(price.gst)}</b>
      </div>
      <div className="bd-row total">
        <span>Total{qty > 1 ? ` × ${qty}` : ''}</span>
        <b>{rupee(price.total * qty)}</b>
      </div>
      <p className="tiny muted" style={{ marginTop: 10 }}>
        Weight shown is the design weight; your invoice uses the actual weighed piece (±3%). Old-silver exchange value of this piece today: ~{rupee(price.exchangeValue)}.
      </p>
    </div>
  );
}
