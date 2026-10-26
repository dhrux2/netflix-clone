import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LogOut, Users } from 'lucide-react';
import { api } from '../lib/api';
import { guestShowcase } from '../lib/config';
import { useStore } from '../lib/store';
import { catalog } from '../data/catalog';
import type { User } from '../types';

export function Account() {
  const { user, authenticate, logout, notify } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api<{ user: User }>(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await authenticate(result.user);
      navigate('/profiles');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (guestShowcase)
    return (
      <div className="page account-settings">
        <p className="eyebrow red-text">YOUR AFTERGLOW</p>
        <h1>Make yourself at home.</h1>
        <div className="settings-card">
          <h2>Your guest profile</h2>
          <p>Explore the collection, save your favorites, and pick up where you left off.</p>
          <p className="muted">
            Your list, likes, and watch progress stay in this browser. No account is needed.
            Clearing browser data removes these saves; they do not sync across devices.
          </p>
          <Link to="/my-list" className="button primary">
            Open My Netflix <ArrowRight size={17} />
          </Link>
          <Link to="/" className="button glass">
            Keep browsing
          </Link>
        </div>
      </div>
    );
  if (user)
    return (
      <div className="page account-settings">
        <p className="eyebrow red-text">YOUR AFTERGLOW</p>
        <h1>A space for your stories.</h1>
        <div className="settings-card">
          <h2>Your account</h2>
          <p>{user.email}</p>
          <p className="muted">Your watchlist and playback progress are saved to this account.</p>
          <Link to="/profiles" className="button glass">
            <Users size={17} /> Manage profiles
          </Link>
          <button
            className="button subtle"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await logout();
                navigate('/');
                notify('You have signed out.');
              } catch (e) {
                notify((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </div>
    );
  return (
    <div className="auth-page">
      <div
        className="auth-image"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(16,16,17,.95), rgba(16,16,17,.15)), url(${catalog[8].image})`,
        }}
      >
        <span className="eyebrow">STAY FOR THE STORY</span>
        <div>
          <h1>
            A whole world.
            <br />
            Your kind of escape.
          </h1>
          <p>Save the stories that find you. Pick up wherever you left off.</p>
        </div>
      </div>
      <div className="auth-panel">
        <p className="eyebrow red-text">WELCOME TO AFTERGLOW</p>
        <h2>{mode === 'signup' ? 'Your next chapter starts here.' : 'Good to have you back.'}</h2>
        <p className="muted">
          {mode === 'signup'
            ? 'Create a free account to make it your own.'
            : 'Sign in and settle into something good.'}
        </p>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              Profile name
              <input
                name="name"
                required
                maxLength={24}
                autoComplete="nickname"
                placeholder="What should we call you?"
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={visible ? 'text' : 'password'}
                required
                minLength={10}
                maxLength={128}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="At least 10 characters"
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button disabled={busy} className="button primary full-width">
            {busy ? 'One moment…' : mode === 'signup' ? 'Create your account' : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'signup' ? 'Already part of the story?' : 'New around here?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError('');
            }}
          >
            {mode === 'signup' ? 'Sign in' : 'Create an account'}
          </button>
        </p>
        <Link to="/" className="guest-link">
          Just looking? Explore as a guest <ArrowRight size={14} />
        </Link>
        <p className="auth-footnote">Portfolio demo. No subscription or payment required.</p>
      </div>
    </div>
  );
}
