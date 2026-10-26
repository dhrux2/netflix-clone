import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { api, readLocal } from './api';
import { guestShowcase } from './config';
import type { Library, Profile, Progress, User } from '../types';

const blank = (): Library => ({ list: [], likes: [], progress: {} });
const guest: Profile = { id: 'guest', name: 'Guest', color: '#b56647' };
type Store = {
  user: User | null;
  profile: Profile;
  profiles: Profile[];
  library: Library;
  ready: boolean;
  message: string;
  notify: (message: string) => void;
  authenticate: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  selectProfile: (profile: Profile) => Promise<void>;
  addProfile: (name: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  toggle: (key: 'list' | 'likes', id: string) => void;
  saveProgress: (id: string, value: Progress) => void;
  removeProgress: (id: string) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([guest]);
  const [profile, setProfile] = useState(guest);
  const [library, setLibrary] = useState<Library>(() => readLocal('afterglow:guest', blank()));
  const [ready, setReady] = useState(false);
  const [message, notify] = useState('');
  const current = useRef(library);
  const queue = useRef(Promise.resolve());
  const apply = (value: Library) => {
    current.current = value;
    setLibrary(value);
  };
  async function loadAccount(account: User) {
    const all = await api<Profile[]>('/profiles');
    const selected = all.find((p) => p.id === readLocal<string>('afterglow:profile', '')) || all[0];
    const data = await api<Library>(`/profiles/${selected.id}/library`);
    setUser(account);
    setProfiles(all);
    setProfile(selected);
    apply(data);
  }
  useEffect(() => {
    if (guestShowcase) {
      setReady(true);
      return;
    }
    api<{ user: User | null }>('/session')
      .then(async (data) => {
        if (data.user) await loadAccount(data.user);
      })
      .catch(() => notify('The server is unavailable. You can still explore as a guest.'))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => notify(''), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  function persist(value: Library) {
    apply(value);
    if (!user) {
      try {
        localStorage.setItem('afterglow:guest', JSON.stringify(value));
      } catch {
        notify('Browser storage is full. Your changes could not be saved.');
      }
      return;
    }
    // Serialize snapshots so a slower response cannot overwrite a newer change.
    const path = `/profiles/${profile.id}/library`;
    queue.current = queue.current
      .then(() => api(path, { method: 'PUT', body: JSON.stringify(value) }))
      .then(() => {})
      .catch(() => notify('Could not save your latest change. Please try it again.'));
  }
  async function selectProfile(next: Profile) {
    await queue.current;
    const data = await api<Library>(`/profiles/${next.id}/library`);
    setProfile(next);
    apply(data);
    localStorage.setItem('afterglow:profile', JSON.stringify(next.id));
  }
  const store: Store = {
    user,
    profiles,
    profile,
    library,
    ready,
    message,
    notify,
    authenticate: loadAccount,
    logout: async () => {
      await queue.current;
      await api('/logout', { method: 'POST' });
      setUser(null);
      setProfiles([guest]);
      setProfile(guest);
      apply(readLocal('afterglow:guest', blank()));
    },
    selectProfile,
    addProfile: async (name) => {
      const created = await api<Profile>('/profiles', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setProfiles((previous) => [...previous, created]);
    },
    deleteProfile: async (id) => {
      await api(`/profiles/${id}`, { method: 'DELETE' });
      const remaining = profiles.filter((p) => p.id !== id);
      setProfiles(remaining);
      if (profile.id === id) await selectProfile(remaining[0]);
    },
    toggle: (key, id) => {
      const old = current.current;
      const exists = old[key].includes(id);
      persist({
        ...old,
        [key]: exists ? old[key].filter((item) => item !== id) : [...old[key], id],
      });
      if (key === 'list') notify(exists ? 'Removed from your list' : 'Added to your list');
    },
    saveProgress: (id, value) =>
      persist({ ...current.current, progress: { ...current.current.progress, [id]: value } }),
    removeProgress: (id) => {
      const progress = { ...current.current.progress };
      delete progress[id];
      persist({ ...current.current, progress });
      notify('Removed from Continue watching');
    },
  };
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error('StoreProvider is missing');
  return store;
}
