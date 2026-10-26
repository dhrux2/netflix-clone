import type { Title } from '../types';
import { expandedCatalog } from './expanded-catalog';

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

// Fictional titles let the interface stand on its own without redistributing film artwork.
export const catalog: Title[] = [
  { id: 'the-last-frontier', name: 'The Last Frontier', tagline: 'Some journeys change everything.', description: 'At the edge of the known world, a solitary cartographer follows a signal into the wilderness. What she finds will redraw more than the map.', year: 2026, kind: 'series', genres: ['Adventure', 'Drama'], rating: '16+', runtime: 'Limited series', image: photo('photo-1464822759023-fed622ff2c3b'), color: '#73918f', cast: ['Maya Bennett', 'Elias Cole', 'Ruth Sinclair'], episodes: [{ name: 'Beyond the map', description: 'A forgotten transmission sends Nora north, far beyond the last settlement.' }, { name: 'The crossing', description: 'The weather turns. An unexpected companion offers a way through.' }, { name: 'White silence', description: 'A discovery beneath the ice challenges everything the expedition believes.' }, { name: 'A place to begin', description: 'Nora must choose what to bring home, and what to leave behind.' }] },
  { id: 'midnight-city', name: 'Midnight City', tagline: 'Every light hides a secret.', description: 'One missing passenger. Six strangers. A night-shift driver follows a trail through a city that never tells the whole truth.', year: 2026, kind: 'series', genres: ['Thriller', 'Crime'], rating: '18+', runtime: '1 season', image: photo('photo-1519608487953-e999c86e7455'), color: '#bf4967', cast: ['Theo Park', 'Ada Reyes'], episodes: [{ name: 'Last fare', description: 'A passenger leaves something behind on the final ride of the night.' }, { name: 'Dead end', description: 'An old friend recognizes the address, but refuses to explain why.' }, { name: 'Daybreak', description: 'The city wakes up to a different version of the truth.' }] },
  { id: 'blue-hours', name: 'Blue Hours', tagline: 'Find a little room to breathe.', description: 'An oceanographer returns to the small coastal town she once left behind, and discovers that the tides are not the only things that have changed.', year: 2025, kind: 'movie', genres: ['Drama', 'Romance'], rating: '13+', runtime: '1h 48m', image: photo('photo-1518837695005-2083093ee35b'), color: '#70b0c4', cast: ['Isla Moore', 'James Vale'] },
  { id: 'wild-earth', name: 'Wild Earth', tagline: 'A world worth getting lost in.', description: 'From mist-covered forests to the last wild coastlines, follow the quiet, extraordinary lives that keep our planet moving.', year: 2026, kind: 'series', genres: ['Nature', 'Documentary'], rating: 'All', runtime: '1 season', image: photo('photo-1448375240586-882707db888b'), color: '#8ca279', cast: ['Narrated by Rowan Ellis'], episodes: [{ name: 'Under the canopy', description: 'A whole world unfolds beneath the oldest trees on Earth.' }, { name: 'Waterlines', description: 'Life follows the water through an ever-changing landscape.' }, { name: 'The open sky', description: 'The great migrations connect worlds thousands of miles apart.' }] },
  { id: 'red-dust', name: 'Red Dust', tagline: 'There is no road back.', description: 'Two estranged brothers take one last job across the desert. As the miles disappear, an old debt catches up with them.', year: 2025, kind: 'movie', genres: ['Action', 'Thriller'], rating: '16+', runtime: '2h 06m', image: photo('photo-1509316785289-025f5b846b35'), color: '#c78d57', cast: ['Leo West', 'Daniel Mercer'] },
  { id: 'orbit', name: 'Orbit', tagline: 'Home is a long way down.', description: 'When an orbital research station loses contact with Earth, its smallest crew must make an impossible journey together.', year: 2026, kind: 'movie', genres: ['Sci-Fi', 'Adventure'], rating: '13+', runtime: '1h 56m', image: photo('photo-1446776811953-b23d57bd21aa'), color: '#6383ac', cast: ['Aria Quinn', 'Miles Foster'] },
  { id: 'somewhere-sunday', name: 'Somewhere, Sunday', tagline: 'No plans. Good company.', description: 'Four friends reunite for a weekend in the countryside. Between missed trains and terrible cooking, they find a reason to stay a little longer.', year: 2025, kind: 'movie', genres: ['Comedy', 'Drama'], rating: '13+', runtime: '1h 34m', image: photo('photo-1470770841072-f978cf4d019e'), color: '#b5a27b', cast: ['Freya Bell', 'Oliver Nash', 'June Hart'] },
  { id: 'after-the-rain', name: 'After the Rain', tagline: 'Something good is growing.', description: 'A burnt-out chef inherits a failing garden center and an entirely new set of problems in this warm, quietly funny series.', year: 2026, kind: 'series', genres: ['Comedy', 'Drama'], rating: '13+', runtime: '1 season', image: photo('photo-1441974231531-c6227db76b6e'), color: '#81a589', cast: ['Harper Lane', 'Finn Avery'], episodes: [{ name: 'New roots', description: 'An unexpected inheritance brings Alex to a town without a decent espresso.' }, { name: 'Growing pains', description: 'The first open day does not quite go according to plan.' }, { name: 'A good season', description: 'With the garden on the line, the town shows up.' }] },
  { id: 'northbound', name: 'Northbound', tagline: 'Take the long way home.', description: 'A photographer and her father cross the northern wilderness in a battered camper van, hoping to see the lights one last time.', year: 2024, kind: 'movie', genres: ['Adventure', 'Drama'], rating: '13+', runtime: '1h 42m', image: photo('photo-1469474968028-56623f02e42e'), color: '#a4af86', cast: ['Nora Blake', 'Arthur Reed'] },
  { id: 'the-deep', name: 'The Deep', tagline: 'We have only seen the surface.', description: 'An intimate look at the divers, scientists, and extraordinary creatures at the frontier of ocean exploration.', year: 2025, kind: 'movie', genres: ['Documentary', 'Nature'], rating: 'All', runtime: '1h 28m', image: photo('photo-1451187580459-43490279c0fa'), color: '#638bb8', cast: ['Narrated by Sienna Brooks'] },
  { id: 'golden-state', name: 'Golden State', tagline: 'Everybody wants a second act.', description: 'A washed-up musician takes an unlikely student on the road in search of one final show worth remembering.', year: 2025, kind: 'movie', genres: ['Drama', 'Comedy'], rating: '16+', runtime: '1h 51m', image: photo('photo-1500534623283-312aade485b7'), color: '#c8a261', cast: ['Samuel Cruz', 'Willow Hayes'] },
  { id: 'stillwater', name: 'Stillwater', tagline: 'The quietest places keep the loudest secrets.', description: 'A detective returns to her lakeside hometown when a long-closed case surfaces with the spring thaw.', year: 2026, kind: 'series', genres: ['Crime', 'Thriller'], rating: '16+', runtime: 'Limited series', image: photo('photo-1472396961693-142e6e269027'), color: '#7c9692', cast: ['Clara Wells', 'Jonah Price'], episodes: [{ name: 'The thaw', description: 'A discovery at the lake brings detective Eve Ward home.' }, { name: 'Old names', description: 'The case leads to a familiar doorstep.' }, { name: 'Below the surface', description: 'Everything the town buried comes to light.' }] },
  ...expandedCatalog,
];

export const topMovies = catalog.filter(title => title.kind === 'movie').slice(0, 10);
export const topShows = catalog.filter(title => title.kind === 'series').slice(0, 10);

export const genres = [...new Set(catalog.flatMap(title => title.genres))].sort();
export const getTitle = (id: string) => catalog.find(title => title.id === id);
export function searchTitles(query: string, genre = 'All genres', kind = 'all') {
  const terms = query.toLowerCase().trim().split(/\s+/);
  return catalog.filter(title => (kind === 'all' || title.kind === kind)
    && (genre === 'All genres' || title.genres.includes(genre))
    && terms.every(term => [title.name, ...title.genres, ...title.cast].join(' ').toLowerCase().includes(term)));
}

// One openly licensed short is used for every fictional catalog entry.
export const demoFilm = {
  name: 'Big Buck Bunny (trailer)',
  url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
  attribution: 'Big Buck Bunny © 2008 Blender Foundation · CC BY 3.0',
  source: 'https://peach.blender.org/about/',
};


