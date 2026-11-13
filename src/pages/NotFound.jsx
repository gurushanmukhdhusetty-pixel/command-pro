import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="page">
      <div className="container empty big" style={{ paddingTop: 80 }}>
        <h1 className="silver-text">404</h1>
        <p>This piece seems to have left the vault.</p>
        <Link to="/" className="btn btn-gold">
          Back to home
        </Link>
      </div>
    </div>
  );
}
