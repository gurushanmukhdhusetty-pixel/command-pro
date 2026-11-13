import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Collection from './pages/Collection';
import Product from './pages/Product';
import Bullion from './pages/Bullion';
import Rates from './pages/Rates';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import { STORE } from './config';

const TITLES = {
  '/': 'Royal Silver Jewellery, Hyderabad',
  '/shop': 'Shop All Silver',
  '/bullion': 'Gold & Silver Bullion',
  '/rates': 'Live Silver & Gold Rates Hyderabad',
  '/cart': 'Your Bag',
  '/wishlist': 'Wishlist',
  '/about': 'Our Heritage',
  '/contact': 'Visit & Contact',
  '/faq': 'FAQ & Policies',
  '/admin': 'Store Admin',
};

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (TITLES[pathname]) document.title = `${TITLES[pathname]} · ${STORE.name}`;
  }, [pathname]);
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections/:line" element={<Collection />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/bullion" element={<Bullion />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
      <BottomNav />
    </>
  );
}
