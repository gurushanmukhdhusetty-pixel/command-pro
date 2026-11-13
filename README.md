# VCH Jewellers — Royal Silver, Hyderabad

A multi-page React website for VCH Jewellers with prices that update live from the silver and gold market, product images the site generates itself, and interactive 3D (three.js).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Deploys as a static site (Vercel `vercel.json` included for SPA routing).

## Pages

| Route | What it is |
|---|---|
| `/` | 3D hero (floating kada, coin, bar, jhumka), live rate card, 3 collections, 3D carousel of signature pieces, bestsellers, bullion, heritage, reviews |
| `/collections/bridal` · `/home` · `/casual` | The three product lines (Nizam Royal Bridal, Devalayam Home & Pooja, Lite Everyday) |
| `/shop` | All products: search, filters (line, category, purity, price, 3D-only), sorting |
| `/product/:id` | Rotatable 3D model, image views, sizes, live price breakdown, WhatsApp order |
| `/bullion` | 3D bullion stack, gold & silver coins/bars with buy and buyback prices, calculator, KYC rules |
| `/rates` | Live board, step-by-step rate formula, reference tables, chart |
| `/cart`, `/wishlist` | Saved in the browser; checkout goes to WhatsApp |
| `/about`, `/contact`, `/faq` | Heritage and how pieces are made, appointment booking, policies |
| `/admin` | Add / edit / delete products (live preview + price), rate settings (live vs manual board rate) |

## Live pricing

`src/lib/rates.jsx` polls every 60 s:

- Spot silver/gold: `api.gold-api.com/price/XAG|XAU` (USD / troy oz)
- USD→INR: `open.er-api.com` (fallback `api.frankfurter.app`)

```
silver ₹/g = XAG × USDINR ÷ 31.1035 × (1 + import duty 6%) × (1 + local premium 1%)
item price = weight × rate × purity + making + stones/plating + ₹45 HUID hallmark, then + 3% GST
bullion    = weight × rate + minting premium, then + 3% GST · buyback = metal value − 1% (gold) / 2.5% (silver)
```

If the feeds can't be reached, the site uses the last cached rate (or a default) and labels it **Indicative**. The store can switch to a **manual board rate** in `/admin → Rate settings`.

## Editing

- Store details (address, phone, WhatsApp, GSTIN): `src/config.js` — currently placeholders.
- Catalogue: `src/data/products.js`, `src/data/bullion.js`.
- Product photos: `public/products/<product-id>-1.webp` (+ `-1-sm.webp`), listed in `src/data/photos.js`. Only products with a photo appear in the shop. Add a new photo by saving it there and adding the id to `photos.js`.
- Studio renders: `render.html` + `scripts/render-products.cjs` render photoreal images from the 3D models in `src/three/` (run `npx vite --port 5199`, then the script; convert with `scripts/convert-renders.py`).
- Palette: Emerald & Ivory (tokens at the top of `src/styles.css`).
- Products added in the admin page are stored in that browser (localStorage). To share them with all visitors, connect a backend.
