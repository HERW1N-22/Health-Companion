import { motion } from 'framer-motion';
import AuthPanel from '../components/AuthPanel';

export default function LandingPage({ pulseModel, onAuthenticated }) {
  return (
    <section className="hero">
      <motion.div className="hero-card glass-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p style={{ letterSpacing: '0.3em', textTransform: 'uppercase', color: '#67e8f9' }}>AI-powered wellness guidance</p>
        <h1>Stay ahead of your health with a calm, intelligent companion.</h1>
        <p>Track vitals, log habits, chat with an AI coach, and receive supportive insight with privacy-first design.</p>
        <div className="hero-actions">
          <button className="primary-btn">Start free</button>
          <button className="secondary-btn">Explore features</button>
        </div>
        <div className="grid">
          <div className="metric-card">
            <strong>Daily check-ins</strong>
            <p>Keep habits visible and actionable.</p>
          </div>
          <div className="metric-card">
            <strong>Privacy by design</strong>
            <p>Encrypted storage and secure auth.</p>
          </div>
        </div>
      </motion.div>
      <motion.div className="panel glass-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <div className="canvas-wrap">{pulseModel}</div>
        <AuthPanel onAuthenticated={onAuthenticated} />
      </motion.div>
    </section>
  );
}
