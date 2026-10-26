import { useEffect, useState } from 'react';
import { catalog } from '../data/catalog';

function newDeck() {
  return catalog
    .slice(0, 6)
    .flatMap((title) => [title, title])
    .map((title) => ({ title, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map((item) => item.title);
}

export function Games() {
  const [deck, setDeck] = useState(newDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  useEffect(() => {
    if (flipped.length !== 2) return;
    const timer = setTimeout(() => {
      if (deck[flipped[0]].id === deck[flipped[1]].id)
        setMatched((current) => [...current, deck[flipped[0]].id]);
      setFlipped([]);
    }, 800);
    return () => clearTimeout(timer);
  }, [flipped, deck]);
  return (
    <div className="page games-page">
      <h1>Games</h1>
      <p className="page-description">Take a break with a quick game of Movie Match.</p>
      <div className="section-heading">
        <h2>Movie Match</h2>
        <button
          className="button glass"
          onClick={() => {
            setDeck(newDeck());
            setFlipped([]);
            setMatched([]);
            setMoves(0);
          }}
        >
          New game
        </button>
      </div>
      <p role="status">
        {matched.length === 6
          ? `All pairs found in ${moves} moves!`
          : `${moves} moves · ${matched.length} of 6 pairs found`}
      </p>
      <div className="memory-grid">
        {deck.map((title, index) => {
          const shown = flipped.includes(index) || matched.includes(title.id);
          return (
            <button
              key={index}
              className={shown ? 'memory-card revealed' : 'memory-card'}
              disabled={shown || flipped.length === 2}
              aria-label={shown ? title.name : `Reveal card ${index + 1}`}
              onClick={() => {
                setFlipped((current) => [...current, index]);
                if (flipped.length === 1) setMoves((current) => current + 1);
              }}
            >
              {shown ? (
                <>
                  <img src={title.image} alt="" />
                  <span>{title.name}</span>
                </>
              ) : (
                <span>Afterglow</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
