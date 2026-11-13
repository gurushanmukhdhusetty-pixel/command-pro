import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SectionTitle } from '../components/Ornament';
import { useStore } from '../lib/store';

export default function Wishlist() {
  const { wish, products } = useStore();
  const list = products.filter((p) => wish.includes(p.id));
  return (
    <div className="page">
      <div className="page-head">
        <div className="container">
          <SectionTitle eyebrow="Saved for later" title="Your Wishlist" />
        </div>
      </div>
      <div className="container">
        {list.length ? (
          <div className="grid-products">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="empty big">
            <p>No saved pieces yet — tap the ♥ on anything you love.</p>
            <Link to="/shop" className="btn btn-gold">
              Browse silver
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
