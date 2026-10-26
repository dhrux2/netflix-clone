import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronDown, Users, Settings } from 'lucide-react';
import { useStore } from '../lib/store';
import { guestShowcase } from '../lib/config';

export function ProfileMenu() {
  const { profiles, profile, user, selectProfile, notify } = useStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div
      className="profile-menu"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link to="/profiles" className="profile-link" aria-label={`Profiles: ${profile.name}`}>
        <span className="avatar small" style={{ background: profile.color }}>
          {profile.name[0].toUpperCase()}
        </span>
      </Link>
      <button
        ref={trigger}
        className="icon-button profile-menu-trigger"
        aria-label="Quick profile switch"
        aria-expanded={open}
        aria-controls="profile-popover"
        title="Switch profile"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() =>
              container.current
                ?.querySelector<HTMLElement>(
                  '.profile-popover button:not(:disabled), .profile-popover a',
                )
                ?.focus(),
            );
          }
        }}
        onClick={() => setOpen(!open)}
      >
        <ChevronDown size={15} />
      </button>
      {open && (
        <div
          id="profile-popover"
          className="profile-popover"
          aria-label="Profile options"
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
            const options = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a'),
            );
            const current = options.indexOf(document.activeElement as HTMLElement);
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? options.length - 1
                  : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) %
                    options.length;
            event.preventDefault();
            options[next]?.focus();
          }}
        >
          <p>Who's watching?</p>
          {profiles.map((item) => (
            <button
              key={item.id}
              className={`profile-option ${item.id === profile.id ? 'current' : ''}`}
              aria-current={item.id === profile.id ? 'true' : undefined}
              disabled={busy || !user || item.id === profile.id}
              onClick={async () => {
                setBusy(true);
                try {
                  await selectProfile(item);
                  setOpen(false);
                  notify(`Switched to ${item.name}`);
                  trigger.current?.focus();
                } catch (error) {
                  notify((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <span className="avatar small" style={{ background: item.color }}>
                {item.name[0].toUpperCase()}
              </span>
              <span>{item.name}</span>
              {item.id === profile.id && <Check size={15} />}
            </button>
          ))}
          <div className="profile-menu-links">
            <Link to="/profiles">
              <Users size={16} />
              {guestShowcase ? 'Your profile' : 'Manage profiles'}
            </Link>
            <Link to="/account">
              <Settings size={16} />
              {guestShowcase
                ? 'Guest settings'
                : user
                  ? 'Account settings'
                  : 'Sign in or create account'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
