import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Bookmark, ArrowRight, X } from 'lucide-react';
import { catalog, genres, searchTitles, topMovies, topShows } from '../data/catalog';
import { Shelf } from '../components/Shelf';
import { TitleCard } from '../components/TitleCard';
import { useStore } from '../lib/store';

export function Browse({
  mode,
}: {
  mode: 'search' | 'movies' | 'series' | 'new' | 'list' | 'languages';
}) {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('curated');
  const { library } = useStore();
  const query = params.get('q') || '';
  const genre = params.get('genre') || 'All genres';
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  let results = searchTitles(
    query,
    genre,
    mode === 'movies' ? 'movie' : mode === 'series' ? 'series' : 'all',
  );
  if (mode === 'list') results = results.filter((t) => library.list.includes(t.id));
  if (mode === 'new') results = results.filter((t) => t.year === 2026);
  if (sort === 'az') results.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'newest') results.sort((a, b) => b.year - a.year);
  const titles = {
    search: 'Find your next obsession.',
    movies: 'Make a night of it.',
    series: 'Just one more episode.',
    new: 'Your next great discovery.',
    list: 'My Netflix',
    languages: 'Browse by Languages',
  };
  const labels = {
    search: 'EXPLORE AFTERGLOW',
    movies: 'THE FILM COLLECTION',
    series: 'SERIES TO GET LOST IN',
    new: 'NEW & NOTEWORTHY',
    list: 'YOUR PERSONAL COLLECTION',
    languages: 'AUDIO & SUBTITLES',
  };
  return (
    <div className="page browse-page" key={mode}>
      <p className="eyebrow red-text">{labels[mode]}</p>
      <h1>{titles[mode]}</h1>
      <p className="page-description">
        {mode === 'list'
          ? 'All the things you meant to watch. All in one place.'
          : 'For every mood, a different world awaits.'}
      </p>
      {mode === 'languages' && (
        <div className="language-filter">
          <label>
            Original language{' '}
            <select aria-label="Original language">
              <option>English</option>
            </select>
          </label>
          <p>
            The demo catalog is in English. Additional audio and subtitle languages are not
            available yet.
          </p>
        </div>
      )}
      {(mode === 'movies' || mode === 'series') && !query && genre === 'All genres' && (
        <div className="reference-home browse-rankings">
          <Shelf
            title={mode === 'movies' ? 'Top 10 Movies' : 'Top 10 Shows'}
            items={mode === 'movies' ? topMovies : topShows}
            ranked
          />
        </div>
      )}
      <div className="browse-toolbar">
        <label className="search-field">
          <Search size={20} />
          <input
            autoFocus={mode === 'search'}
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Titles, genres, people…"
            aria-label="Search titles, genres, or cast"
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && query) {
                event.preventDefault();
                setParam('q', '');
              }
            }}
          />
          {query && (
            <button
              className="icon-button"
              onClick={() => setParam('q', '')}
              aria-label="Clear search"
              title="Clear search (Esc)"
              onMouseDown={(event) => event.preventDefault()}
            >
              <X size={17} />
            </button>
          )}
        </label>
        <label className="select-wrap">
          <SlidersHorizontal size={16} />
          <select
            aria-label="Genre"
            value={genre}
            onChange={(e) => setParam('genre', e.target.value)}
          >
            {['All genres', ...genres].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <select aria-label="Sort titles" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="curated">Curated order</option>
          <option value="az">Title: A–Z</option>
          <option value="newest">Newest first</option>
        </select>
        {(query || genre !== 'All genres' || sort !== 'curated') && (
          <button
            className="reset-filters"
            onClick={() => {
              setParams({});
              setSort('curated');
            }}
          >
            Reset filters
          </button>
        )}
      </div>
      <div className="results-label" role="status" aria-live="polite" aria-atomic="true">
        <span>
          {results.length} {results.length === 1 ? 'story' : 'stories'}
          {query ? ` matching “${query}”` : ' to discover'}
        </span>
        <span>
          {mode === 'list'
            ? 'Made for your kind of night'
            : `${catalog.length} titles. Endless possibilities.`}
        </span>
      </div>
      {results.length ? (
        <div className="title-grid">
          {results.map((title) => (
            <TitleCard key={title.id} title={title} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {mode === 'list' ? <Bookmark size={38} /> : <Search size={38} />}
          <h2>
            {mode === 'list' && !query
              ? 'Your next favorite belongs here.'
              : 'No stories found. Yet.'}
          </h2>
          <p>
            {mode === 'list' && !query
              ? 'Tap the plus on any title to save it for later.'
              : 'Try another title, a different genre, or clear your filters.'}
          </p>
          <Link className="button light" to="/">
            Explore the collection <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
