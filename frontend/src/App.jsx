import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import AuthPanel from "./components/AuthPanel";
import Icon from "./components/Icon";
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const TrackerPage = lazy(() => import("./pages/TrackerPage"));
const VitalsPage = lazy(() => import("./pages/VitalsPage"));

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [authMode, setAuthMode] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (authMode) {
      dialog.current.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [authMode]);
  const start = () => (token ? navigate("/dashboard") : setAuthMode("signup"));
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <Link to="/" className="brand" aria-label="Health Companion home">
            <span className="brand-mark">
              <Icon name="leaf" size={24} />
            </span>
            <span>
              health<span className="brand-light">companion</span>
              <span className="brand-dot">.</span>
            </span>
          </Link>
          <button
            className="mobile-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <nav
            id="main-navigation"
            className={menuOpen ? "main-nav is-open" : "main-nav"}
            aria-label="Main navigation"
          >
            {token ? (
              <>
                <NavLink to="/dashboard">Overview</NavLink>
                <NavLink to="/tracker">Daily tracker</NavLink>
                <NavLink to="/vitals">Vitals</NavLink>
                <NavLink to="/chat">Assistant</NavLink>
              </>
            ) : (
              <>
                <a href="/#features" onClick={() => setMenuOpen(false)}>
                  The little things
                </a>
                <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>
                  How it works
                </a>
                <a href="/#our-approach" onClick={() => setMenuOpen(false)}>
                  Our approach
                </a>
              </>
            )}
            <div className="nav-actions">
              {token ? (
                <button
                  className="text-btn"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setToken(null);
                    navigate("/");
                  }}
                >
                  Log out
                </button>
              ) : (
                <>
                  <button
                    className="text-btn"
                    onClick={() => {
                      setMenuOpen(false);
                      setAuthMode("login");
                    }}
                  >
                    Log in
                  </button>
                  <button className="primary-btn nav-cta" onClick={start}>
                    Get started <Icon size={16} />
                  </button>
                </>
              )}
            </div>
          </nav>
        </header>
        <main id="main-content">
          <Suspense
            fallback={
              <div className="route-loading" role="status">
                Getting things ready…
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<LandingPage onStart={start} />} />
              {[
                ["dashboard", DashboardPage],
                ["tracker", TrackerPage],
                ["vitals", VitalsPage],
                ["chat", ChatPage],
              ].map(([path, Page]) => (
                <Route
                  key={path}
                  path={`/${path}`}
                  element={
                    token ? (
                      <div className="workspace-content">
                        <Link to="/" className="back-link">
                          ← Back to home
                        </Link>
                        <Page token={token} />
                      </div>
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="site-footer">
          <Link to="/" className="brand">
            <Icon name="leaf" />
            <span>healthcompanion.</span>
          </Link>
          <p>A little better, every day.</p>
          <span>© {new Date().getFullYear()} Health Companion</span>
        </footer>
        <dialog
          ref={dialog}
          className="auth-dialog"
          aria-labelledby="auth-title"
          onCancel={() => setAuthMode(null)}
          onClick={(e) => {
            if (e.target === dialog.current) setAuthMode(null);
          }}
        >
          <button
            className="dialog-close"
            aria-label="Close sign in"
            onClick={() => setAuthMode(null)}
          >
            <Icon name="close" />
          </button>
          {authMode && (
            <AuthPanel
              key={authMode}
              initialMode={authMode}
              onAuthenticated={(value) => {
                localStorage.setItem("token", value);
                setToken(value);
                setAuthMode(null);
                navigate("/dashboard");
              }}
            />
          )}
        </dialog>
      </div>
    </MotionConfig>
  );
}
