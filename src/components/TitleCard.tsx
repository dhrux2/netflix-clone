import { Link, useLocation } from 'react-router-dom';
import { Play, Plus, Check, ArrowUpRight, X, ThumbsUp } from 'lucide-react';
import type { Title } from '../types';
import { useStore } from '../lib/store';
import { useEffect, useRef, useState } from 'react';
import { CardPreview } from './CardPreview';

export function TitleCard({
  title,
  index,
  resume = false,
  previewDisabled = false,
}: {
  title: Title;
  index?: number;
  resume?: boolean;
  previewDisabled?: boolean;
}) {
  const { library, toggle, removeProgress } = useStore();
  const location = useLocation();
  const anchor = useRef<HTMLElement>(null);
  const [preview, setPreview] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const dismissForControls = (event: PointerEvent) => {
      if ((event.target as Element).closest?.('.shelf-shift')) {
        clearTimeout(timer.current);
        setPreview(false);
      }
    };
    document.addEventListener('pointerover', dismissForControls, true);
    return () => document.removeEventListener('pointerover', dismissForControls, true);
  }, []);
  useEffect(() => {
    if (previewDisabled) {
      clearTimeout(timer.current);
      setPreview(false);
    }
  }, [previewDisabled]);
  const previewState = { backgroundLocation: location.state?.backgroundLocation || location };
  const saved = library.list.includes(title.id);
  const progress = library.progress[title.id];
  const percent = progress?.duration
    ? Math.min(100, (progress.seconds / progress.duration) * 100)
    : 0;
  return (
    <article
      ref={anchor}
      className={`title-card ${index !== undefined ? 'ranked-card' : ''} ${preview && !previewDisabled ? 'is-expanded' : ''}`}
      onMouseEnter={() => {
        if (
          !previewDisabled &&
          window.matchMedia('(hover: hover) and (min-width: 601px)').matches
        ) {
          timer.current = setTimeout(() => setPreview(true), 300);
        }
      }}
      onMouseLeave={() => clearTimeout(timer.current)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setPreview(true);
        }
      }}
    >
      {preview && !previewDisabled && anchor.current && (
        <CardPreview
          title={title}
          resume={resume}
          anchor={anchor.current}
          onClose={() => setPreview(false)}
        />
      )}
      <div className="card-image-wrap">
        <Link
          to={`/title/${title.id}`}
          state={previewState}
          className="card-art"
          aria-keyshortcuts="ArrowUp"
          aria-label={`Details for ${title.name}`}
        >
          <img
            src={title.image}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
          />
          <div className="art-shade" />
          <span className="card-wordmark">{title.name}</span>
          <span className="card-brand">
            a<span>g</span>
          </span>
          {title.year === 2026 && <span className="card-badge">NEW</span>}
        </Link>
        <div className="card-hover-actions">
          <Link
            to={`/watch/${title.id}${resume && progress ? `?episode=${progress.episode}` : ''}`}
            className="round-button light"
            aria-label={`Play ${title.name}`}
          >
            <Play size={17} fill="currentColor" />
          </Link>
          <button
            className="round-button"
            aria-label={`${saved ? 'Remove' : 'Add'} ${title.name} ${saved ? 'from' : 'to'} my list`}
            aria-pressed={saved}
            onClick={() => toggle('list', title.id)}
          >
            {saved ? <Check size={18} /> : <Plus size={18} />}
          </button>
          {resume && (
            <button
              className="round-button"
              aria-label={`Remove ${title.name} from continue watching`}
              onClick={() => removeProgress(title.id)}
            >
              <X size={17} />
            </button>
          )}
          {!resume && (
            <button
              className="round-button"
              aria-label={`Like ${title.name}`}
              aria-pressed={library.likes.includes(title.id)}
              onClick={() => toggle('likes', title.id)}
            >
              <ThumbsUp
                size={16}
                fill={library.likes.includes(title.id) ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>
        {resume && (
          <div className="progress-track">
            <span style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
      <div className="card-caption">
        {index !== undefined && <span className="rank">{index + 1}</span>}
        <div>
          <Link to={`/title/${title.id}`} state={previewState}>
            {title.name}
          </Link>
          <p>
            {resume && progress
              ? `${title.episodes ? `E${progress.episode + 1} · ` : ''}${Math.max(1, Math.ceil((progress.duration - progress.seconds) / 60))} min left`
              : `${title.genres[0]} · ${title.kind === 'series' ? 'Series' : title.runtime}`}
          </p>
        </div>
        <ArrowUpRight size={15} className="card-arrow" />
      </div>
    </article>
  );
}
