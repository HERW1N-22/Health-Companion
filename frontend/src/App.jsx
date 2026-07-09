import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useMemo, useState } from 'react';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import TrackerPage from './pages/TrackerPage';
import VitalsPage from './pages/VitalsPage';

function PulseModel() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} />
      <Float speed={2.5} rotationIntensity={0.7} floatIntensity={0.8}>
        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial color="#7c3aed" attach="material" roughness={0.3} metalness={0.4} distort={0.25} speed={2} />
        </Sphere>
      </Float>
      {prefersReducedMotion ? null : (
        <mesh rotation={[0, 0, 0]}>
          <torusKnotGeometry args={[1.15, 0.16, 200, 16]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0f172a" />
        </mesh>
      )}
    </Canvas>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const prefersReducedMotion = useReducedMotion();

  const isAuthenticated = Boolean(token);

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  const heroMotion = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0.1 : 0.5 }
  }), [prefersReducedMotion]);

  return (
    <div className="app-shell">
      <header className="topbar glass-card">
        <div className="brand">AI Health Companion</div>
        <nav>
          <NavLink className={navLinkClass} to="/">Home</NavLink>
          {isAuthenticated && <NavLink className={navLinkClass} to="/dashboard">Dashboard</NavLink>}
          {isAuthenticated && <NavLink className={navLinkClass} to="/chat">Assistant</NavLink>}
          {isAuthenticated && <NavLink className={navLinkClass} to="/tracker">Tracker</NavLink>}
          {isAuthenticated && <NavLink className={navLinkClass} to="/vitals">Vitals</NavLink>}
          {!isAuthenticated ? <button className="ghost-btn" onClick={() => setToken('demo-token')}>Demo Login</button> : <button className="ghost-btn" onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button>}
        </nav>
      </header>

      <motion.main className="content" {...heroMotion}>
        <Routes>
          <Route path="/" element={<LandingPage pulseModel={<PulseModel />} onAuthenticated={(value) => { localStorage.setItem('token', value); setToken(value); }} />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage token={token} /> : <Navigate to="/" replace />} />
          <Route path="/chat" element={isAuthenticated ? <ChatPage token={token} /> : <Navigate to="/" replace />} />
          <Route path="/tracker" element={isAuthenticated ? <TrackerPage token={token} /> : <Navigate to="/" replace />} />
          <Route path="/vitals" element={isAuthenticated ? <VitalsPage token={token} /> : <Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </div>
  );
}

export default App;
