import { useEffect, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Maximize, RotateCcw, RotateCw, Keyboard, X, Play } from 'lucide-react';
import type { Title } from '../types';

export function PlayerTools({
  video,
  title,
  episode,
}: {
  video: RefObject<HTMLVideoElement | null>;
  title: Title;
  episode: number;
}) {
  const [episodesOpen, setEpisodesOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [speed, setSpeed] = useState('1');
  const seek = (offset: number) => {
    const v = video.current;
    if (v && Number.isFinite(v.duration))
      v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + offset));
  };
  const fullscreen = () => {
    const v = video.current;
    if (!v) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void v.requestFullscreen().catch(() => {});
  };
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A', 'VIDEO'].includes(target.tagName)) return;
      const v = video.current;
      if (!v) return;
      if ([' ', 'k', 'ArrowLeft', 'ArrowRight', 'm', 'f'].includes(event.key))
        event.preventDefault();
      if (event.key === ' ' || event.key === 'k') {
        if (v.paused) void v.play().catch(() => {});
        else v.pause();
      }
      if (event.key === 'ArrowLeft') seek(-10);
      if (event.key === 'ArrowRight') seek(10);
      if (event.key === 'm') v.muted = !v.muted;
      if (event.key === 'f') fullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [video]);
  useEffect(() => {
    if (video.current) video.current.playbackRate = Number(speed);
  }, [speed, episode, video]);
  return (
    <>
      <div className="player-tools">
        <div className="player-tools-group">
          <button className="player-tool" aria-label="Rewind 10 seconds" onClick={() => seek(-10)}>
            <RotateCcw size={17} />
            <span>10s</span>
          </button>
          <button className="player-tool" aria-label="Forward 10 seconds" onClick={() => seek(10)}>
            <RotateCw size={17} />
            <span>10s</span>
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            aria-label="Playback speed"
          >
            {['0.5', '0.75', '1', '1.25', '1.5', '2'].map((rate) => (
              <option key={rate} value={rate}>
                {rate}× speed
              </option>
            ))}
          </select>
        </div>
        <div className="player-tools-group">
          {title.episodes && (
            <button
              className={`player-tool ${episodesOpen ? 'active' : ''}`}
              aria-expanded={episodesOpen}
              onClick={() => setEpisodesOpen(!episodesOpen)}
            >
              <ListVideo size={18} />
              <span>Episodes</span>
            </button>
          )}
          <button
            className="player-tool shortcuts-toggle"
            aria-label="Keyboard shortcuts"
            aria-expanded={shortcutsOpen}
            onClick={() => setShortcutsOpen(!shortcutsOpen)}
          >
            <Keyboard size={19} />
          </button>
          <button className="player-tool" aria-label="Fullscreen" onClick={fullscreen}>
            <Maximize size={18} />
          </button>
        </div>
      </div>
      {shortcutsOpen && (
        <div className="shortcut-panel">
          <span>
            <kbd>Space</kbd> Play / pause
          </span>
          <span>
            <kbd>←</kbd>
            <kbd>→</kbd> Seek 10s
          </span>
          <span>
            <kbd>M</kbd> Mute
          </span>
          <span>
            <kbd>F</kbd> Fullscreen
          </span>
          <button
            className="icon-button"
            aria-label="Close keyboard shortcuts"
            onClick={() => setShortcutsOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {episodesOpen && (
        <section className="player-episodes">
          <div className="section-heading">
            <h2>Season 1</h2>
            <button
              className="icon-button"
              aria-label="Close episodes"
              onClick={() => setEpisodesOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          {title.episodes?.map((item, i) => (
            <Link
              className={i === episode ? 'active' : ''}
              key={item.name}
              to={`/watch/${title.id}?episode=${i}`}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              {i === episode ? (
                <span className="now-playing">NOW PLAYING</span>
              ) : (
                <Play size={16} />
              )}
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
