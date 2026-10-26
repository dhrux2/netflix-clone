import { useEffect, useRef, useState } from 'react';
import type { Title } from '../types';
import { getPreviewMedia } from '../data/preview-media';

/** Stock footage is separate from episode playback and never changes watch progress. */
export function PreviewVideo({ title, controls = false }: { title: Title; controls?: boolean }) {
  const media = getPreviewMedia(title);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    const visibility = () => {
      if (document.hidden) video.current?.pause();
      else if (!controls && !preference.matches) void video.current?.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [controls]);
  useEffect(() => {
    const element = video.current;
    if (!element || controls || reducedMotion || document.hidden) return;
    element.muted = true;
    void element.play().catch(() => {});
    return () => element.pause();
  }, [controls, reducedMotion, media.url]);
  if (!media || failed || (reducedMotion && !controls)) return <img src={title.image} alt="" />;
  return (
    <video
      ref={video}
      src={media.url}
      poster={title.image}
      muted={!controls}
      autoPlay={!controls}
      loop={!controls}
      playsInline
      controls={controls}
      preload={controls ? 'none' : 'auto'}
      onCanPlay={(event) => {
        if (!controls && !reducedMotion && !document.hidden)
          void event.currentTarget.play().catch(() => {});
      }}
      aria-label={media.label}
      onError={() => setFailed(true)}
    />
  );
}
