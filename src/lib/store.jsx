import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PRODUCTS } from '../data/products';
import { load, save } from './storage';

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load('vch.cart', []));
  const [wish, setWish] = useState(() => load('vch.wish', []));
  const [custom, setCustom] = useState(() => load('vch.products', []));
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg) => {
    setToast({ msg, id: Date.now() });
    setTimeout(() => setToast((t) => (t && Date.now() - t.id >= 2400 ? null : t)), 2600);
  }, []);

  const persist = (setter, key) => (fn) =>
    setter((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      save(key, next);
      return next;
    });
  const updCart = useMemo(() => persist(setCart, 'vch.cart'), []);
  const updWish = useMemo(() => persist(setWish, 'vch.wish'), []);
  const updCustom = useMemo(() => persist(setCustom, 'vch.products'), []);

  const products = useMemo(() => [...custom, ...PRODUCTS], [custom]);

  const value = useMemo(
    () => ({
      products,
      custom,
      cart,
      wish,
      toast,
      notify,
      addToCart: (id, opts = {}) => {
        const key = `${id}|${opts.size || ''}|${opts.kind || 'product'}`;
        updCart((c) => {
          const found = c.find((x) => x.key === key);
          if (found) return c.map((x) => (x.key === key ? { ...x, qty: x.qty + (opts.qty || 1) } : x));
          return [...c, { key, id, size: opts.size || '', kind: opts.kind || 'product', qty: opts.qty || 1 }];
        });
        notify('Added to your bag');
      },
      setQty: (key, qty) => updCart((c) => (qty <= 0 ? c.filter((x) => x.key !== key) : c.map((x) => (x.key === key ? { ...x, qty } : x)))),
      clearCart: () => updCart([]),
      toggleWish: (id) =>
        updWish((w) => {
          const has = w.includes(id);
          notify(has ? 'Removed from wishlist' : 'Saved to wishlist');
          return has ? w.filter((x) => x !== id) : [...w, id];
        }),
      saveProduct: (p) => updCustom((list) => [p, ...list.filter((x) => x.id !== p.id)]),
      deleteProduct: (id) => updCustom((list) => list.filter((x) => x.id !== id)),
    }),
    [products, custom, cart, wish, toast, notify, updCart, updWish, updCustom],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
