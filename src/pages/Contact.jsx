import { useState } from 'react';
import { SectionTitle } from '../components/Ornament';
import Reveal from '../components/Reveal';
import { STORE } from '../config';

export default function Contact() {
  const [f, setF] = useState({ name: '', phone: '', date: '', time: '11:00', purpose: 'Bridal jewellery', notes: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const msg = `Namaste VCH Jewellers! I'd like to book a store visit.\nName: ${f.name}\nPhone: ${f.phone}\nDate: ${f.date} at ${f.time}\nFor: ${f.purpose}\n${f.notes ? `Notes: ${f.notes}` : ''}`;
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };
  return (
    <div className="page">
      <div className="page-head">
        <div className="container">
          <SectionTitle eyebrow="Old City, Hyderabad" title="Visit VCH Jewellers" sub="Walk in, or book a private appointment for bridal and bullion purchases." />
        </div>
      </div>
      <div className="container contact-grid">
        <Reveal className="contact-card">
          <h3>Showroom</h3>
          {STORE.address.map((l) => (
            <div key={l}>{l}</div>
          ))}
          <h3>Call / WhatsApp</h3>
          <a href={`tel:${STORE.phone}`}>{STORE.phoneDisplay}</a>
          <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
          <h3>Hours</h3>
          {STORE.hours.map(([d, h]) => (
            <div key={d}>
              <span className="muted">{d}</span> · {h}
            </div>
          ))}
          <div className="map">
            <iframe title="Map" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(STORE.mapQuery)}&output=embed`} />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <form className="form-card" onSubmit={submit}>
            <h3>Book an appointment</h3>
            <div className="form-row">
              <label>
                Name
                <input className="input" required value={f.name} onChange={set('name')} />
              </label>
              <label>
                Phone
                <input className="input" required type="tel" pattern="[0-9+ ]{10,15}" value={f.phone} onChange={set('phone')} />
              </label>
            </div>
            <div className="form-row">
              <label>
                Date
                <input className="input" required type="date" value={f.date} onChange={set('date')} min={new Date().toISOString().slice(0, 10)} />
              </label>
              <label>
                Time
                <select className="input" value={f.time} onChange={set('time')}>
                  {['11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '19:30'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Purpose
              <select className="input" value={f.purpose} onChange={set('purpose')}>
                {['Bridal jewellery', 'Pooja & home silver', 'Everyday jewellery', 'Gold / silver bullion', 'Sell / exchange old silver', 'Custom order'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Notes
              <textarea className="input" rows="3" value={f.notes} onChange={set('notes')} placeholder="Wedding date, budget, pieces you liked…" />
            </label>
            <button className="btn btn-gold block">Send request via WhatsApp</button>
            <p className="tiny muted">We confirm every appointment by phone within working hours.</p>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
