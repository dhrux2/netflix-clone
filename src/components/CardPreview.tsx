import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronDown, Play, Plus, ThumbsUp, X } from 'lucide-react';
import { PreviewVideo } from './PreviewVideo';
import { getPreviewMedia } from '../data/preview-media';
import type { Title } from '../types';
import { useStore } from '../lib/store';

/** A portal lets previews overlap shelves without changing their scroll geometry. */
export function CardPreview({
  title,
  resume,
  anchor,
  onClose,
}: {
  title: Title;
  resume: boolean;
  anchor: HTMLElement;
  onClose: () => void;
}) {
  const { library, toggle, removeProgress } = useStore();
  const location = useLocation();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (anchor.contains(document.activeElement)) {
      panel.current?.querySelector<HTMLElement>('.preview-play')?.focus({ preventScroll: true });
    }
  }, [anchor]);
  const rect = (anchor.querySelector('.card-image-wrap') || anchor).getBoundingClientRect();
  // Reserve both shelf edges for paging controls, even while a preview is open.
  const shelf = anchor.closest('.shelf')?.getBoundingClientRect();
  const minLeft = shelf ? Math.max(16, shelf.left + 24) : 16;
  const maxRight = shelf
    ? Math.min(window.innerWidth - 16, shelf.right - 24)
    : window.innerWidth - 16;
  const width = Math.min(430, Math.max(340, rect.width * 1.65), maxRight - minLeft);
  const left = Math.max(
    minLeft,
    Math.min(rect.left + rect.width / 2 - width / 2, maxRight - width),
  );
  const top = Math.max(72, Math.min(rect.top - 65, window.innerHeight - width * 0.5625 - 170));
  useLayoutEffect(() => {
    const element = panel.current;
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scale = rect.width / width;
    const hiddenHeight = Math.max(0, element.offsetHeight - rect.height / scale);
    const animation = element.animate(
      [
        {
          transform: `translate(${rect.left - left}px, ${rect.top - top}px) scale(${scale})`,
          clipPath: `inset(0 0 ${hiddenHeight}px 0 round 10px)`,
        },
        { transform: 'translate(0, 0) scale(1)', clipPath: 'inset(0 round 18px)' },
      ],
      { duration: 220, easing: 'cubic-bezier(.2,.75,.25,1)' },
    );
    return () => animation.cancel();
    // Capture the original card geometry once; scrolling dismisses this preview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor]);
  const saved = library.list.includes(title.id);
  const liked = library.likes.includes(title.id);
  const progress = library.progress[title.id];
  const percent = progress?.duration
    ? Math.min(100, (progress.seconds / progress.duration) * 100)
    : 0;
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        anchor.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
      }
    };
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', onClose, true);
    document.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('keydown', escape);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onClose, true);
      document.removeEventListener('pointerdown', outside);
    };
  }, [onClose]);
  return createPortal(
    <div
      ref={panel}
      className="floating-preview"
      style={{ width, left, top }}
      role="region"
      aria-label={`Preview of ${title.name}`}
      onMouseLeave={onClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onClose();
      }}
    >
      <div className="floating-preview-art">
        <PreviewVideo title={title} />
        <h3>{title.name}</h3>
      </div>
      <div className="floating-preview-body">
        {getPreviewMedia(title) && (
          <a
            className="stock-credit"
            href={getPreviewMedia(title)!.source}
            target="_blank"
            rel="noreferrer"
          >
            {getPreviewMedia(title)!.label} · {getPreviewMedia(title)!.credit}
          </a>
        )}
        <div className="floating-preview-actions">
          <Link
            className="preview-play"
            aria-label={`Play ${title.name}`}
            to={`/watch/${title.id}${resume && progress ? `?episode=${progress.episode}` : ''}`}
          >
            <Play size={22} fill="currentColor" />
          </Link>
          <button
            className="round-button"
            aria-label={`${saved ? 'Remove' : 'Add'} ${title.name} ${saved ? 'from' : 'to'} my list`}
            aria-pressed={saved}
            onClick={() => toggle('list', title.id)}
          >
            {saved ? <Check /> : <Plus />}
          </button>
          {resume && (
            <button
              className="round-button"
              aria-label={`Remove ${title.name} from continue watching`}
              onClick={() => {
                removeProgress(title.id);
                onClose();
              }}
            >
              <X />
            </button>
          )}
          <button
            className="round-button"
            aria-label={`Like ${title.name}`}
            aria-pressed={liked}
            onClick={() => toggle('likes', title.id)}
          >
            <ThumbsUp size={20} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <Link
            className="round-button preview-details"
            aria-label={`More about ${title.name}`}
            to={`/title/${title.id}`}
            state={{ backgroundLocation: location.state?.backgroundLocation || location }}
          >
            <ChevronDown />
          </Link>
        </div>
        {resume && progress ? (
          <>
            <p className="preview-episode">
              {title.episodes
                ? `E${progress.episode + 1}: ${title.episodes[progress.episode]?.name || title.name}`
                : 'Continue watching'}
            </p>
            <div className="preview-progress">
              <div>
                <span style={{ width: `${percent}%` }} />
              </div>
              <span>
                {Math.floor(progress.seconds / 60)} of {Math.ceil(progress.duration / 60)}m
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="preview-genres">{title.genres.join('  |  ')}</p>
            <div className="metadata">
              <span className="age-rating">{title.rating}</span>
              <span>·</span>
              <span>{title.runtime}</span>
              <span className="quality">HD</span>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
