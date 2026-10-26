import { Link, useParams, useLocation } from 'react-router-dom';
import { Play, Plus, Check, ThumbsUp, ArrowLeft } from 'lucide-react';
import { catalog, getTitle } from '../data/catalog';
import { useStore } from '../lib/store';

import { PreviewVideo } from '../components/PreviewVideo';
import { getPreviewMedia } from '../data/preview-media';
import { NotFound } from './NotFound';

export function Details() {
  const { id = '' } = useParams();
  const title = getTitle(id);
  const location = useLocation();
  const { library, toggle } = useStore();
  if (!title) return <NotFound />;
  const saved = library.list.includes(id);
  const liked = library.likes.includes(id);
  const progress = library.progress[id];
  return (
    <div className="details-page">
      <section
        className="detail-hero"
        style={{
          backgroundImage: `linear-gradient(0deg, #101011 2%, transparent 90%), linear-gradient(90deg, rgba(16,16,17,.85), transparent), url(${title.image})`,
        }}
      >
        <Link className="back-link" to="/">
          <ArrowLeft size={17} /> Back to discover
        </Link>
        <div className="detail-heading">
          <p className="eyebrow red-text">AFTERGLOW COLLECTION / {title.kind.toUpperCase()}</p>
          <h1>{title.name}</h1>
          <p>{title.tagline}</p>
          <div className="metadata">
            <span>{title.year}</span>
            <span className="age-rating">{title.rating}</span>
            <span>{title.runtime}</span>
            <span className="quality">HD</span>
          </div>
          <div className="button-row">
            <Link to={`/watch/${id}?episode=${progress?.episode || 0}`} className="button primary">
              <Play size={18} fill="currentColor" />
              {progress?.seconds ? 'Continue watching' : 'Start watching'}
            </Link>
            <button className="button glass" onClick={() => toggle('list', id)}>
              {saved ? <Check size={18} /> : <Plus size={18} />}
              {saved ? 'On my list' : 'My list'}
            </button>
            <button
              className={`round-button ${liked ? 'liked' : ''}`}
              aria-label={liked ? 'Unlike title' : 'Like title'}
              aria-pressed={liked}
              onClick={() => toggle('likes', id)}
            >
              <ThumbsUp size={19} />
            </button>
          </div>
        </div>
      </section>
      <div className="detail-body">
        <div className="synopsis">
          <div>
            <h2>About the story</h2>
            <p>{title.description}</p>
            <p className="demo-note">
              Fictional catalog title. Playback features the open film <em>Big Buck Bunny</em> as a
              working demonstration.
            </p>
          </div>
          <dl>
            <dt>Starring</dt>
            <dd>{title.cast.join(', ')}</dd>
            <dt>Genres</dt>
            <dd>
              {title.genres.map((g) => (
                <Link key={g} to={`/search?genre=${g}`}>
                  {g}{' '}
                </Link>
              ))}
            </dd>
            <dt>Available audio</dt>
            <dd>Original demo audio</dd>
          </dl>
        </div>
        {title.episodes && (
          <section className="episodes">
            <div className="section-heading">
              <h2>Episodes</h2>
              <span className="outline-label">Season 1 · {title.episodes.length} episodes</span>
            </div>
            {title.episodes.map((episode, i) => (
              <Link className="episode" key={episode.name} to={`/watch/${id}?episode=${i}`}>
                <span className="episode-number">{String(i + 1).padStart(2, '0')}</span>
                <div className="episode-image">
                  <img src={title.image} alt="" loading="lazy" />
                  <Play size={25} fill="currentColor" />
                </div>
                <div>
                  <h3>{episode.name}</h3>
                  <p>{episode.description}</p>
                  <span>Demo episode · 10 min</span>
                </div>
                <Play className="episode-play" size={21} />
              </Link>
            ))}
          </section>
        )}
        <section className="more-like-this">
          <h2>More Like This</h2>
          <div className="related-grid">
            {catalog
              .filter((item) => item.id !== id)
              .sort(
                (a, b) =>
                  Number(b.genres.some((g) => title.genres.includes(g))) -
                  Number(a.genres.some((g) => title.genres.includes(g))),
              )
              .slice(0, 9)
              .map((item) => (
                <article className="related-card" key={item.id}>
                  <Link
                    to={`/title/${item.id}`}
                    state={location.state}
                    replace={Boolean(location.state?.backgroundLocation)}
                  >
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <span className="related-runtime">{item.runtime}</span>
                    <h3>{item.name}</h3>
                  </Link>
                  <div className="related-body">
                    <div className="metadata">
                      <span className="age-rating">{item.rating}</span>
                      <span>{item.year}</span>
                      <button
                        className="round-button"
                        aria-label={`Save ${item.name}`}
                        aria-pressed={library.list.includes(item.id)}
                        onClick={() => toggle('list', item.id)}
                      >
                        {library.list.includes(item.id) ? <Check size={18} /> : <Plus size={18} />}
                      </button>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
          </div>
        </section>
        <section className="detail-extras">
          <h2>Trailers & More</h2>
          {getPreviewMedia(title) && (
            <div className="stock-trailer">
              <PreviewVideo key={title.id} title={title} controls />
              <a href={getPreviewMedia(title)!.source} target="_blank" rel="noreferrer">
                {getPreviewMedia(title)!.label} · {getPreviewMedia(title)!.credit}
              </a>
              <p>Illustrative stock footage, not a trailer for this fictional title.</p>
            </div>
          )}
          <Link className="trailer-card" to={`/watch/${id}`}>
            <img src={title.image} alt="" loading="lazy" />
            <Play size={25} />
            <span>Play demo trailer</span>
          </Link>
          <p className="demo-note">Playback uses the openly licensed Big Buck Bunny trailer.</p>
          <h2>About {title.name}</h2>
          <p>
            <span>Cast:</span> {title.cast.join(', ')}
          </p>
          <p>
            <span>Genres:</span> {title.genres.join(', ')}
          </p>
          <p>
            <span>Maturity rating:</span> {title.rating}
          </p>
        </section>{' '}
      </div>
    </div>
  );
}
