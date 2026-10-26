import { useEffect, Component, type ReactNode, type ErrorInfo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import { Header } from './components/Header';
import { Discover } from './pages/Discover';
import { Games } from './pages/Games';
import { Browse } from './pages/Browse';
import { Details } from './pages/Details';
import { Watch } from './pages/Watch';
import { Account } from './pages/Account';
import { Profiles } from './pages/Profiles';
import { NotFound } from './pages/NotFound';
import { TitlePreview } from './components/TitlePreview';
import { Footer } from './components/Footer';

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }
  render() {
    return this.state.failed ? (
      <div className="page empty-state">
        <h1>Something interrupted the story.</h1>
        <p>Reload the page to try again.</p>
        <button className="button primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Shell() {
  const location = useLocation();
  const background = location.state?.backgroundLocation;
  const { message } = useStore();
  const watching = location.pathname.startsWith('/watch/');
  useEffect(() => {
    if (!background) window.scrollTo(0, 0);
  }, [background ? background.pathname : location.pathname]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!watching && <Header />}
      <main id="main">
        <Routes location={background || location}>
          <Route path="/" element={<Discover />} />
          <Route path="/movies" element={<Browse key="movies" mode="movies" />} />
          <Route path="/series" element={<Browse key="series" mode="series" />} />
          <Route path="/new" element={<Browse key="new" mode="new" />} />
          <Route path="/games" element={<Games />} />
          <Route path="/languages" element={<Browse key="languages" mode="languages" />} />
          <Route path="/search" element={<Browse key="search" mode="search" />} />
          <Route path="/my-list" element={<Browse key="list" mode="list" />} />
          <Route path="/title/:id" element={<Details />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {background && (
        <Routes>
          <Route path="/title/:id" element={<TitlePreview />} />
        </Routes>
      )}
      {!watching && <Footer />}
      <div className={`toast ${message ? 'visible' : ''}`} role="status" aria-live="polite">
        {message && (
          <>
            <Check size={17} />
            {message}
          </>
        )}
      </div>
    </>
  );
}
export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </ErrorBoundary>
  );
}
