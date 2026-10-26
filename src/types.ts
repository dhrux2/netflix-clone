export type Title = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  year: number;
  kind: 'movie' | 'series';
  genres: string[];
  rating: string;
  runtime: string;
  image: string;
  color: string;
  cast: string[];
  episodes?: { name: string; description: string }[];
};
export type Profile = { id: string; name: string; color: string };
export type Progress = { seconds: number; duration: number; episode: number; updatedAt: number };
export type Library = { list: string[]; likes: string[]; progress: Record<string, Progress> };
export type User = { id: string; email: string };
