import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mountain,
  Zap,
  Heart,
  Laugh,
  Orbit,
  Trees,
  Film,
  Fingerprint,
  Drama,
  ScanEye,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { catalog, genres } from '../data/catalog';

const icons = {
  Adventure: Mountain,
  Action: Zap,
  Romance: Heart,
  Comedy: Laugh,
  'Sci-Fi': Orbit,
  Nature: Trees,
  Documentary: Film,
  Crime: Fingerprint,
  Drama,
  Thriller: ScanEye,
};
function CategoryIcon({ genre }: { genre: string }) {
  const Icon = icons[genre as keyof typeof icons] || Film;
  return <Icon size={28} strokeWidth={1.5} />;
}

export function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return (
    <div
      className="category-dropdown"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="category-trigger"
        aria-expanded={open}
        aria-controls="category-options"
        onClick={() => setOpen(!open)}
      >
        Categories <ChevronDown size={13} />
      </button>
      {open && (
        <div className="category-options" id="category-options">
          {genres.map((genre) => (
            <Link key={genre} to={`/search?genre=${encodeURIComponent(genre)}`}>
              <CategoryIcon genre={genre} />
              {genre}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryCollection() {
  return (
    <section className="category-collection" aria-labelledby="category-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FIND YOUR KIND OF STORY</p>
          <h2 id="category-heading">Browse by category</h2>
        </div>
      </div>
      <div className="category-grid">
        {genres.map((genre) => {
          const titles = catalog.filter((title) => title.genres.includes(genre));
          return (
            <Link
              className="category-card"
              key={genre}
              to={`/search?genre=${encodeURIComponent(genre)}`}
              style={{ '--category-color': titles[0].color } as React.CSSProperties}
            >
              <span className="category-card-icon">
                <CategoryIcon genre={genre} />
              </span>
              <ArrowUpRight className="category-arrow" size={17} />
              <div>
                <h3>{genre}</h3>
                <p>{titles.length} stories to explore</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
