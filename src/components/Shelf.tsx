import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Title } from '../types';
import { TitleCard } from './TitleCard';

export function Shelf({
  title,
  eyebrow,
  items,
  ranked,
  resume,
  link,
}: {
  title: string;
  eyebrow?: string;
  items: Title[];
  ranked?: boolean;
  resume?: boolean;
  link?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [usingControls, setUsingControls] = useState(false);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft < 2,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, [items.length]);
  if (!items.length) return null;
  const scroll = (direction: number) => {
    const element = track.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    const step =
      first.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap);
    const page = Math.max(1, Math.floor((element.clientWidth + 1) / step));
    const current = Math.round(element.scrollLeft / step);
    element.scrollTo({
      left: Math.max(0, current + direction * page) * step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  return (
    <section className={`shelf ${ranked ? 'ranked-shelf' : ''} ${resume ? 'resume-shelf' : ''}`}>
      <div className="section-heading">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        <div className="shelf-controls">
          {link && (
            <Link to={link} className="text-link">
              View all <ArrowRight size={14} />
            </Link>
          )}
          <button
            aria-label={`Scroll ${title} left`}
            disabled={edges.start}
            className="shelf-shift shelf-shift-left"
            onPointerEnter={() => setUsingControls(true)}
            onPointerLeave={() => setUsingControls(false)}
            onFocus={() => setUsingControls(true)}
            onBlur={() => setUsingControls(false)}
            onClick={() => scroll(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label={`Scroll ${title} right`}
            disabled={edges.end}
            className="shelf-shift shelf-shift-right"
            onPointerEnter={() => setUsingControls(true)}
            onPointerLeave={() => setUsingControls(false)}
            onFocus={() => setUsingControls(true)}
            onBlur={() => setUsingControls(false)}
            onClick={() => scroll(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="shelf-track" ref={track}>
        {items.map((item, index) => (
          <TitleCard
            key={item.id}
            title={item}
            index={ranked ? index : undefined}
            resume={resume}
            previewDisabled={usingControls}
          />
        ))}
      </div>
    </section>
  );
}
