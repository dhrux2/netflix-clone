import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Check, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { guestShowcase } from '../lib/config';

export function Profiles() {
  const { user, profiles, profile, selectProfile, addProfile, deleteProfile, ready } = useStore();
  const [manage, setManage] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get('name'));
    void run(async () => {
      await addProfile(name);
      setAdding(false);
    });
  };
  if (!ready)
    return (
      <div className="page empty-state" aria-busy="true">
        <h1>Getting your profiles…</h1>
      </div>
    );
  return (
    <div className="profiles-page">
      <p className="eyebrow red-text">MAKE YOURSELF AT HOME</p>
      <h1>Who's settling in?</h1>
      <p className="muted">
        {guestShowcase
          ? 'Your favorites and progress stay in this browser.'
          : 'Different tastes. A world for each of you.'}
      </p>
      <div className="profiles-list">
        {profiles.map((item) => (
          <div key={item.id} className="profile-choice">
            <button
              disabled={busy}
              onClick={() => {
                if (!user) navigate('/');
                else
                  void run(async () => {
                    await selectProfile(item);
                    navigate('/');
                  });
              }}
            >
              <span
                className={`avatar large ${item.id === profile.id ? 'current' : ''}`}
                style={{ background: item.color }}
              >
                <span>{item.name[0].toUpperCase()}</span>
                <i className="avatar-smile" />
              </span>
              <span>{item.name}</span>
              {item.id === profile.id && <small>Current profile</small>}
            </button>
            {manage && profiles.length > 1 && (
              <button
                className="delete-profile"
                disabled={busy}
                onClick={() => setDeleting(item.id)}
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {user && profiles.length < 5 && (
          <button className="add-profile" disabled={busy} onClick={() => setAdding(true)}>
            <span>
              <Plus size={35} strokeWidth={1} />
            </span>
            Add profile
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {adding && (
        <form className="profile-form" onSubmit={submit}>
          <label htmlFor="profile-name">New profile name</label>
          <div>
            <input
              id="profile-name"
              name="name"
              autoFocus
              required
              maxLength={24}
              placeholder="Enter a name"
            />
            <button className="button primary" disabled={busy}>
              Add
            </button>
            <button type="button" className="button glass" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {deleting && (
        <div className="delete-confirm" role="alert">
          <p>Delete this profile and all its watch history? This cannot be undone.</p>
          <div className="button-row">
            <button
              className="button primary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await deleteProfile(deleting);
                  setDeleting(null);
                })
              }
            >
              Delete profile
            </button>
            <button className="button glass" onClick={() => setDeleting(null)}>
              Keep profile
            </button>
          </div>
        </div>
      )}
      {user ? (
        <>
          <button
            className="button glass manage-profiles"
            onClick={() => {
              setManage(!manage);
              setDeleting(null);
            }}
          >
            {manage ? <Check size={17} /> : <Pencil size={16} />}
            {manage ? 'Done' : 'Manage profiles'}
          </button>
          <Link className="guest-link" to="/account">
            Account settings <ArrowRight size={14} />
          </Link>
        </>
      ) : (
        <Link className="button glass" to="/account">
          {guestShowcase ? 'About your guest profile' : 'Create an account for more profiles'}{' '}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
