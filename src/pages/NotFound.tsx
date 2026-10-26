import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export function NotFound() {
  return (
    <div className="page empty-state">
      <p className="eyebrow red-text">404 / END OF THE REEL</p>
      <h1>This story isn't here.</h1>
      <p>The link may have changed. There are plenty more stories waiting.</p>
      <Link to="/" className="button light">
        <ArrowLeft size={18} /> Back to discover
      </Link>
    </div>
  );
}
