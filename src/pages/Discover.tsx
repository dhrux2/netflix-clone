import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Pause, Info, ArrowRight } from 'lucide-react';
import { catalog, genres, topMovies, topShows } from '../data/catalog';
import { useStore } from '../lib/store';
import { Shelf } from '../components/Shelf';
import { TitleCard } from '../components/TitleCard';
import { recommendations } from '../lib/recommendations';

const featured = [catalog[0], catalog[1], catalog[5]];
export function Discover() {
  const [slide, setSlide] = useState(0);
  const hero = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => setReducedMotion(preference.matches);
    const onVisibility = () => setVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    if (hero.current) observer.observe(hero.current);
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || !visible || !inView || reducedMotion) return;
    const timer = window.setTimeout(
      () => setSlide((current) => (current + 1) % featured.length),
      8000,
    );
    return () => window.clearTimeout(timer);
  }, [slide, paused, hovered, focused, visible, inView, reducedMotion]);
  const [genre, setGenre] = useState('For you');
  const { library, profile } = useStore();
  const location = useLocation();
  const title = featured[slide];
  const continuing = catalog
    .filter((item) => {
      const p = library.progress[item.id];
      return p && p.seconds > 0 && p.seconds < p.duration * 0.95;
    })
    .sort((a, b) => library.progress[b.id].updatedAt - library.progress[a.id].updatedAt);
  return (
    <div className="reference-home">
      <section
        ref={hero}
        className="hero"
        aria-label="Featured title"
        aria-roledescription="carousel"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false);
        }}
      >
        {featured.map((item, i) => (
          <img
            key={item.id}
            className={`hero-backdrop ${i === slide ? 'visible' : ''}`}
            src={item.image}
            alt=""
            fetchPriority={i === 0 ? 'high' : 'auto'}
          />
        ))}
        <div className="hero-shade" />
        <div className="home-section-bar">
          <h2>TV SHOWS & FILMS</h2>
          <select
            aria-label="Home genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            <option value="For you">Genres</option>
            {genres.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">
            <span className="red-line" /> THE AFTERGLOW COLLECTION{' '}
            <span className="outline-label">EXCLUSIVE</span>
          </p>
          <h1>
            {title.name === 'The Last Frontier' ? (
              <>
                THE LAST
                <br />
                <span>FRONTIER</span>
              </>
            ) : (
              title.name.toUpperCase()
            )}
          </h1>
          <p className="hero-tagline">
            <span className="top-badge">
              TOP
              <br />
              10
            </span>
            Featured in our collection
          </p>
          <div className="metadata">
            <span className="match">Editor's pick</span>
            <span>{title.year}</span>
            <span className="age-rating">{title.rating}</span>
            <span>{title.runtime}</span>
            <span className="quality">4K</span>
          </div>
          <p className="hero-description">{title.description}</p>
          <div className="button-row">
            <Link className="button primary" to={`/watch/${title.id}`}>
              <Play size={18} fill="currentColor" /> Play
            </Link>
            <Link
              className="button glass"
              to={`/title/${title.id}`}
              state={{ backgroundLocation: location }}
              aria-label={`More about ${title.name}`}
            >
              <Info size={21} /> More Info
            </Link>
          </div>
        </div>
        <div className="hero-bottom">
          <span className="hero-note">A little escape. An unforgettable story.</span>
          <div className="slide-selector">
            {!reducedMotion && (
              <button
                className="rotation-toggle"
                aria-label={paused ? 'Resume featured rotation' : 'Pause featured rotation'}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
            )}
            <span>
              0{slide + 1} <i>/ 03</i>
            </span>
            {featured.map((item, i) => (
              <button
                key={item.id}
                className={i === slide ? 'active' : ''}
                onClick={() => setSlide(i)}
                aria-label={`Feature ${item.name}`}
                aria-pressed={i === slide}
              />
            ))}
          </div>
        </div>
        <span className="hero-side-label">CURATED FOR THE CURIOUS</span>
      </section>
      <div className="browse-content">
        <div className="discovery-bar">
          <div className="genre-tabs" aria-label="Browse by genre">
            {['For you', ...genres].map((item) => (
              <button
                key={item}
                className={genre === item ? 'active' : ''}
                onClick={() => setGenre(item)}
                aria-pressed={genre === item}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="curation-note">
            <span /> A good night starts here
          </span>
        </div>
        {genre !== 'For you' ? (
          <section className="filtered-section">
            <div className="section-heading">
              <h2>{genre}, your way</h2>
              <span className="muted">
                {catalog.filter((t) => t.genres.includes(genre)).length} titles
              </span>
            </div>
            <div className="title-grid">
              {catalog
                .filter((t) => t.genres.includes(genre))
                .map((t) => (
                  <TitleCard key={t.id} title={t} />
                ))}
            </div>
          </section>
        ) : (
          <>
            {continuing.length > 0 && (
              <Shelf
                title={`Pick up where you left off${profile.name !== 'Guest' ? `, ${profile.name}` : ''}`}
                items={continuing}
                resume
              />
            )}
            <Shelf
              title="Worth staying in for"
              eyebrow="THE TALK OF THE MOMENT"
              items={[catalog[1], catalog[4], catalog[3], catalog[5], catalog[11], catalog[2]]}
              link="/new"
            />
            <Shelf
              title="A little more your kind of thing"
              eyebrow="INSPIRED BY YOUR SAVES & LIKES"
              items={recommendations(library)}
            />
            <Shelf
              title="A world beyond your everyday"
              items={[catalog[8], catalog[0], catalog[9], catalog[2], catalog[6], catalog[7]]}
              link="/movies"
            />
            <Shelf title="Top 10 Shows" items={topShows} ranked />
            <Shelf title="Top 10 Movies" items={topMovies} ranked />
            <Shelf
              title="Shows worth getting into"
              items={catalog.filter((item) => item.kind === 'series')}
              link="/series"
            />
            <section
              className="editorial-banner"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(12,21,18,.95), rgba(12,21,18,.15)), url(${catalog[3].image})`,
              }}
            >
              <div>
                <p className="eyebrow">TAKE A BREATH. LOOK A LITTLE CLOSER.</p>
                <h2>
                  The best stories
                  <br />
                  are already out there.
                </h2>
                <p>Extraordinary places. Remarkable lives. Our natural world.</p>
                <Link to="/search?genre=Nature" className="button light">
                  Explore the collection <ArrowRight size={17} />
                </Link>
              </div>
              <span className="editorial-index">THE NATURE EDIT / 01</span>
            </section>
            <Shelf
              title="One night. One great film."
              eyebrow="NO COMMITMENT REQUIRED"
              items={catalog.filter((t) => t.kind === 'movie')}
              link="/movies"
            />
            {library.list.length > 0 && (
              <Shelf
                title="Saved for a good night"
                items={catalog.filter((t) => library.list.includes(t.id))}
                link="/my-list"
              />
            )}
            <Shelf
              title="Gems for you"
              items={[catalog[7], catalog[10], catalog[3], catalog[9], catalog[6], catalog[8]]}
            />
          </>
        )}
      </div>
    </div>
  );
}
