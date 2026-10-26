import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SkipForward, RotateCcw, AlertCircle, ExternalLink } from 'lucide-react';
import { demoFilm, getTitle } from '../data/catalog';
import { useStore } from '../lib/store';
import { NotFound } from './NotFound';
import { PlayerTools } from '../components/PlayerTools';

export function Watch() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const title = getTitle(id);
  const { library, saveProgress, ready } = useStore();
  const rawEpisode = Number(params.get('episode') || 0);
  const episode =
    title?.episodes && Number.isInteger(rawEpisode)
      ? Math.max(0, Math.min(rawEpisode, title.episodes.length - 1))
      : 0;
  const video = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(0);
  const save = useRef(saveProgress);
  save.current = saveProgress;
  const [error, setError] = useState(false);
  const [ended, setEnded] = useState(false);
  const key = `${id}:${episode}`;
  const checkpoint = useRef(library.progress[id]);
  useEffect(() => {
    checkpoint.current = library.progress[id];
  }, [id, episode, ready]);
  const persist = (element: HTMLVideoElement | null) => {
    if (!element || !Number.isFinite(element.duration) || element.duration <= 0) return;
    save.current(id, {
      seconds: Math.min(element.currentTime, element.duration),
      duration: element.duration,
      episode,
      updatedAt: Date.now(),
    });
  };
  useEffect(() => {
    const element = video.current;
    lastSaved.current = 0;
    setEnded(false);
    setError(false);
    const visibility = () => {
      if (document.visibilityState === 'hidden') persist(element);
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      persist(element);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [key, ready]);
  if (!title) return <NotFound />;
  const nextEpisode = title.episodes && episode < title.episodes.length - 1;
  return (
    <div className="watch-page">
      <div className="watch-top">
        <Link to={`/title/${id}`} className="back-link">
          <ArrowLeft size={20} />
          <span>Back to {title.name}</span>
        </Link>
        <span className="eyebrow">NOW PLAYING</span>
        <span className="watch-brand">afterglow</span>
      </div>
      <div className="video-container">
        {ready && (
          <video
            key={key}
            ref={video}
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={title.image}
            aria-label={`Demo playback for ${title.name}`}
            onError={() => setError(true)}
            onLoadedMetadata={() => {
              const p = checkpoint.current;
              if (video.current && p?.episode === episode && p.seconds < p.duration * 0.95)
                video.current.currentTime = p.seconds;
            }}
            onTimeUpdate={() => {
              if (Date.now() - lastSaved.current > 5000) {
                persist(video.current);
                lastSaved.current = Date.now();
              }
            }}
            onPause={() => persist(video.current)}
            onEnded={() => {
              persist(video.current);
              setEnded(true);
            }}
          >
            <source src={demoFilm.url} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        )}
        {error && (
          <div className="player-message" role="alert">
            <AlertCircle size={34} />
            <h2>The film couldn't load.</h2>
            <p>Check your connection and try again. The demo video is hosted externally.</p>
            <button
              className="button light"
              onClick={() => {
                setError(false);
                video.current?.load();
              }}
            >
              Try again
            </button>
          </div>
        )}
        {ended && (
          <div className="player-message">
            <h2>{nextEpisode ? 'One more episode?' : 'That’s a wrap.'}</h2>
            <div className="button-row">
              <button
                className="button glass"
                onClick={() => {
                  if (video.current) {
                    video.current.currentTime = 0;
                    void video.current.play();
                  }
                  setEnded(false);
                }}
              >
                <RotateCcw size={17} /> Watch again
              </button>
              {nextEpisode && (
                <Link className="button primary" to={`/watch/${id}?episode=${episode + 1}`}>
                  <SkipForward size={17} /> Next episode
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <PlayerTools video={video} title={title} episode={episode} />
      <div className="watch-info">
        <div>
          <p className="eyebrow red-text">
            {title.kind === 'series' ? `SEASON 1 / EPISODE ${episode + 1}` : 'FEATURE FILM'}
          </p>
          <h1>{title.episodes?.[episode]?.name || title.name}</h1>
          <p>{title.episodes?.[episode]?.description || title.tagline}</p>
        </div>
        {nextEpisode && (
          <Link className="button glass" to={`/watch/${id}?episode=${episode + 1}`}>
            Next episode <SkipForward size={17} />
          </Link>
        )}
      </div>
      <div className="playback-credit">
        <p>
          <strong>Demo screening</strong> · You’re watching {demoFilm.name}, an open film used to
          demonstrate playback and resume.
        </p>
        <a href={demoFilm.source} target="_blank" rel="noreferrer">
          {demoFilm.attribution} <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
