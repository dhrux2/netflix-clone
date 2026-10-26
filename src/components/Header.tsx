import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Bell } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Afterglow home">
      afterglow<span>®</span>
    </Link>
  );
}
export function Header() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(window.scrollY > 35);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 35);
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, [navigate]);
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <Brand />
      <button
        className="icon-button mobile-toggle"
        aria-label="Toggle navigation"
        aria-expanded={menu}
        aria-controls="main-navigation"
        onClick={() => setMenu(!menu)}
      >
        {menu ? <X /> : <Menu />}
      </button>
      <nav
        id="main-navigation"
        className={menu ? 'navigation open' : 'navigation'}
        aria-label="Main navigation"
      >
        {[
          ['/', 'Home'],
          ['/series', 'Shows'],
          ['/movies', 'Movies'],
          ['/games', 'Games'],
          ['/new', 'New & Popular'],
          ['/my-list', 'My Netflix'],
          ['/languages', 'Browse by Languages'],
        ].map(([to, label]) => (
          <NavLink end to={to} key={to} onClick={() => setMenu(false)}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="header-actions">
        <button
          aria-label="Search titles"
          title="Search titles (Ctrl/⌘ K)"
          className={`icon-button ${location.pathname === '/search' ? 'selected' : ''}`}
          onClick={() => navigate('/search')}
        >
          <Search size={20} />
        </button>
        <Link to="/new" className="icon-button" aria-label="New arrivals" title="New arrivals">
          <Bell size={20} />
        </Link>
        <ProfileMenu />
      </div>
    </header>
  );
}
