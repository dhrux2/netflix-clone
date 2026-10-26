import type { Title } from '../types';
import { demoFilm } from './catalog';

export const previewMedia = {
  ocean: {
    url: 'https://videos.pexels.com/video-files/6981292/6981292-hd_1920_1080_25fps.mp4',
    source: 'https://www.pexels.com/video/a-drone-footage-of-ocean-waves-6981292/',
    credit: 'Mikhail Nilov on Pexels',
    label: 'Ocean waves · stock preview',
  },
  city: {
    url: 'https://videos.pexels.com/video-files/6345160/6345160-hd_1920_1080_30fps.mp4',
    source: 'https://www.pexels.com/video/a-city-at-night-6345160/',
    credit: 'TripAway 2Day on Pexels',
    label: 'City at night · stock preview',
  },
};

const oceanTitles = new Set(['blue-hours', 'the-deep', 'tidal', 'under-current', 'low-tide', 'blue-planet-nights', 'almost-home']);
const cityTitles = new Set(['midnight-city', 'glass-harbor', 'night-dispatch', 'city-of-strangers', 'electric-mile', 'signal-lost']);

export function getPreviewMedia(title: Title) {
  return oceanTitles.has(title.id) ? previewMedia.ocean : cityTitles.has(title.id) ? previewMedia.city : {
    url: demoFilm.url,
    source: demoFilm.source,
    credit: demoFilm.attribution,
    label: 'Big Buck Bunny · demo preview',
  };
}
