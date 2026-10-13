import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Icon from "../components/Icon";
const WellnessScene = lazy(() => import("../components/WellnessScene"));
const focuses = [
  {
    label: "Find your calm",
    icon: "leaf",
    color: "#527e60",
    title: "A moment, just for you.",
    detail: "Let your shoulders soften. There’s no rush.",
  },
  {
    label: "Move a little",
    icon: "activity",
    color: "#bc8656",
    title: "Small steps. Fresh energy.",
    detail: "A gentle stretch is a lovely place to start.",
  },
  {
    label: "Rest a little",
    icon: "moon",
    color: "#8581a6",
    title: "Give yourself a softer landing.",
    detail: "Pause the noise. Make a little room to unwind.",
  },
];
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="sculpture-fallback">
        <span />
        <span />
      </div>
    ) : (
      this.props.children
    );
  }
}
function Scene({ active, color }) {
  const holder = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "60px" },
    );
    observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={holder}
      className="sculpture"
      role="img"
      aria-label="A softly lit, interactive sculpture of interlocking green rings. Move your pointer to rotate it."
    >
      {visible && (
        <SceneBoundary>
          <Suspense
            fallback={
              <div className="sculpture-fallback">
                <span />
                <span />
              </div>
            }
          >
            <WellnessScene active={active} color={color} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
export default function LandingPage({ onStart }) {
  const reduced = useReducedMotion();
  const [focus, setFocus] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const selected = focuses[focus];
  useEffect(() => {
    if (!breathing) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [breathing]);
  const reveal = {
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };
  const faqs = [
    [
      "What can Health Companion help me with?",
      "Keep daily habits, health readings, and wellness conversations in one place. It’s a simple way to make time for your wellbeing and see the small steps you take.",
    ],
    [
      "Do I need a wearable to get started?",
      "No wearable needed. You can log your habits and readings yourself, at your own pace.",
    ],
    [
      "Is this a replacement for medical advice?",
      "Health Companion supports everyday wellness; it does not diagnose conditions or replace a healthcare professional. Speak with your doctor about medical concerns.",
    ],
  ];
  return (
    <>
      <section className="hero-section page-width">
        <motion.div className="hero-copy" {...reveal}>
          <div className="hero-eyebrow">
            <span className="status-dot" /> WELLNESS, WITH YOU IN MIND
          </div>
          <h1>
            A little care.
            <br />A <span>healthier</span> you
            <span className="heading-dot">.</span>
          </h1>
          <p className="hero-description">
            Your health isn’t just a number.
            <br className="desktop-break" /> It’s how you feel, move, rest, and
            live. Bring it all
            <br className="desktop-break" /> together with a companion that
            cares.
          </p>
          <div className="hero-actions">
            <button className="primary-btn hero-cta" onClick={onStart}>
              Find your everyday balance <Icon size={20} />
            </button>
            <a href="#how-it-works" className="how-link">
              <span className="play-icon">
                <Icon name="play" size={14} />
              </span>
              See how it works
            </a>
          </div>
          <div className="hero-note">
            <Icon name="check" size={15} />
            <span>Small steps. Your pace. A little better every day.</span>
          </div>
          <div className="hero-bottom-note">
            <span className="mini-flower">
              <Icon name="flower" size={38} />
            </span>
            <p>
              Built around <strong>you.</strong>
              <br />
              <span>Not the other way around.</span>
            </p>
            <div className="handwritten">
              here for the whole you <span>↗</span>
            </div>
          </div>
        </motion.div>
        <motion.div
          className={`hero-art focus-${focus}`}
          {...reveal}
          transition={{ duration: 0.8, delay: reduced ? 0 : 0.12 }}
        >
          <div className="art-topline">
            <span>
              <span className="status-dot" /> YOUR DAILY DOSE OF GOOD
            </span>
            <Icon name="spark" size={23} />
          </div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <Scene active={breathing} color={selected.color} />
          <div className="floating-label label-balance">
            <span className="floating-icon">
              <Icon name="leaf" size={16} />
            </span>{" "}
            A little more balance
          </div>
          <div className="floating-label label-you">
            <span className="mini-dot" /> A little more you
          </div>
          <div className="art-caption">
            <span className="eyebrow">
              {breathing ? "YOUR MINDFUL MOMENT" : "BREATHE IN. SETTLE IN."}
            </span>
            <h2>
              {breathing
                ? seconds % 8 < 4
                  ? "Breathe in…"
                  : "Breathe out…"
                : selected.title}
            </h2>
            <p>
              {breathing
                ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} of time for yourself`
                : selected.detail}
            </p>
          </div>
          <button
            className={`breathe-button ${breathing ? "is-breathing" : ""}`}
            onClick={() => {
              setBreathing(!breathing);
              setSeconds(0);
            }}
            aria-pressed={breathing}
          >
            <Icon name={breathing ? "close" : "plus"} size={17} />
            {breathing ? "End mindful moment" : "Take a mindful moment"}
          </button>
          <span className="art-footnote">
            {reduced
              ? "A little space to slow down"
              : "Move your cursor. Find your flow."}
          </span>
        </motion.div>
      </section>
      <div className="values-strip page-width">
        <span>GOOD HEALTH IS A COLLECTION OF LITTLE THINGS.</span>
        <div>
          <Icon name="heart" size={18} /> Made for real life
        </div>
        <div>
          <Icon name="lock" size={18} /> Your space, your data
        </div>
        <div>
          <Icon name="spark" size={18} /> A little intelligence. A lot of care.
        </div>
      </div>
      <section id="features" className="features-section page-width">
        <motion.div className="section-heading" {...reveal}>
          <div>
            <p className="eyebrow">LESS OVERWHELM. MORE WELLBEING.</p>
            <h2>
              Everything you need.
              <br />
              <span>Room for what matters.</span>
            </h2>
          </div>
          <p>
            Less connecting the dots. More seeing the whole picture.
            <br />
            Your everyday wellbeing, in one thoughtful space.
          </p>
        </motion.div>
        <div className="feature-grid">
          <motion.article className="feature-card habits-card" {...reveal}>
            <div className="card-top">
              <span className="icon-tile">
                <Icon name="sun" />
              </span>
              <span className="feature-number">01 / YOUR EVERYDAY</span>
            </div>
            <h3>
              Little habits.
              <br />
              Lasting differences.
            </h3>
            <p>
              A glass of water. A good night’s sleep.
              <br />
              Make the small things count.
            </p>
            <div className="habit-preview" aria-label="Example daily habits">
              <div className="preview-heading">
                A little progress <span>EXAMPLE DAY</span>
              </div>
              <div className="habit-row">
                <span className="habit-symbol">
                  <Icon name="moon" size={16} />
                </span>
                <span>
                  Rest well<small>Sleep</small>
                </span>
                <strong>
                  7.5 <small>hrs</small>
                </strong>
                <span className="habit-check">
                  <Icon name="check" size={13} />
                </span>
              </div>
              <div className="habit-row">
                <span className="habit-symbol water">◒</span>
                <span>
                  Stay hydrated<small>Water</small>
                </span>
                <strong>
                  1.8 <small>L</small>
                </strong>
                <div className="tiny-progress" />
              </div>
            </div>
            <button className="card-link" onClick={onStart}>
              Meet your daily tracker <Icon size={17} />
            </button>
          </motion.article>
          <motion.article className="feature-card insight-card" {...reveal}>
            <div className="card-top">
              <span className="icon-tile">
                <Icon name="activity" />
              </span>
              <span className="feature-number">02 / THE BIGGER PICTURE</span>
            </div>
            <h3>
              Know yourself.
              <br />A little better.
            </h3>
            <p>
              Keep your readings together.
              <br />
              Get a clearer view over time.
            </p>
            <div className="chart-preview">
              <div className="preview-heading">
                Your rhythm <span>ILLUSTRATION</span>
              </div>
              <div className="chart-value">
                72 <span>bpm</span>
                <span className="chart-tag">Resting heart rate</span>
              </div>
              <svg
                viewBox="0 0 300 74"
                role="img"
                aria-label="Illustrative heart rate trend"
              >
                <defs>
                  <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#b3c7ab" stopOpacity=".5" />
                    <stop offset="1" stopColor="#b3c7ab" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 50C16 50 17 20 35 30S62 65 80 45S100 15 120 28S145 57 164 37S182 16 200 24S228 48 247 30S277 34 300 16V74H0Z"
                  fill="url(#chart-fill)"
                />
                <path
                  d="M0 50C16 50 17 20 35 30S62 65 80 45S100 15 120 28S145 57 164 37S182 16 200 24S228 48 247 30S277 34 300 16"
                  fill="none"
                  stroke="#658267"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="chart-days">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
            </div>
            <button className="card-link" onClick={onStart}>
              See the bigger picture <Icon size={17} />
            </button>
          </motion.article>
          <motion.article className="feature-card companion-card" {...reveal}>
            <div className="card-top">
              <span className="icon-tile">
                <Icon name="spark" />
              </span>
              <span className="feature-number">03 / A LITTLE SUPPORT</span>
            </div>
            <h3>
              A listening ear.
              <br />
              Whenever you need.
            </h3>
            <p>
              A thoughtful space for your questions,
              <br />
              check-ins, and everyday wins.
            </p>
            <div className="chat-preview">
              <span className="preview-heading">
                A CONVERSATION COULD START WITH…
              </span>
              <div className="sample-message">
                How can I make more time for myself?
              </div>
              <div className="sample-answer">
                <span className="chat-avatar">
                  <Icon name="spark" size={16} />
                </span>
                <p>
                  Start small. What’s one thing that helps you feel a little
                  more like you?
                </p>
              </div>
            </div>
            <button className="card-link" onClick={onStart}>
              Meet your companion <Icon size={17} />
            </button>
          </motion.article>
        </div>
      </section>
      <section id="how-it-works" className="balance-section page-width">
        <motion.div className="balance-copy" {...reveal}>
          <p className="eyebrow">NO PERFECT ROUTINE REQUIRED</p>
          <h2>
            Start where you are.
            <br />
            <span>We’ll meet you there.</span>
          </h2>
          <p>
            You don’t have to change everything to feel a little better. Choose
            what you need today. Let the rest follow.
          </p>
          <div
            className="focus-options"
            role="group"
            aria-label="Choose your wellness focus"
          >
            {focuses.map((item, i) => (
              <button
                key={item.label}
                aria-pressed={focus === i}
                className={focus === i ? "selected" : ""}
                onClick={() => {
                  setFocus(i);
                  setBreathing(false);
                }}
              >
                <Icon name={item.icon} />
                {item.label}
                <Icon size={17} />
              </button>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="focus-detail"
          key={focus}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="focus-illustration">
            <span className={`focus-ring focus-ring-${focus}`} />
            <span className="focus-center">
              <Icon name={selected.icon} size={42} />
            </span>
            <span className="small-spark">✧</span>
          </div>
          <p className="eyebrow">TODAY, MAKE A LITTLE SPACE TO</p>
          <h3>
            {focus === 0
              ? "Just be."
              : focus === 1
                ? "Find your energy."
                : "Slow things down."}
          </h3>
          <p>
            {focus === 0
              ? "Take a slow breath. Notice how you feel. A moment of calm is a moment well spent."
              : focus === 1
                ? "Step outside, stretch gently, or take a short walk. Movement doesn’t need to be a milestone."
                : "Give your day a gentle ending. Put your phone down, soften the lights, and settle into rest."}
          </p>
          <a
            href="#main-content"
            className="card-link"
            onClick={() => {
              if (focus === 0) {
                setBreathing(true);
                setSeconds(0);
              }
            }}
          >
            {focus === 0
              ? "Try a mindful moment"
              : "Find your daily inspiration"}
            <Icon size={17} />
          </a>
        </motion.div>
      </section>
      <section id="our-approach" className="approach-section page-width">
        <motion.div {...reveal}>
          <span className="approach-icon">
            <Icon name="leaf" size={30} />
          </span>
          <p className="eyebrow">A COMPANION, NOT A SCORECARD</p>
          <h2>
            You’re a person.
            <br />
            <span>Not a project to perfect.</span>
          </h2>
          <p>
            Some days you’ll take a big step. Other days, showing up is enough.
            <br />
            We’re here for all of it — with a little perspective and a lot of
            care.
          </p>
          <button className="primary-btn" onClick={onStart}>
            Let’s take the first step <Icon size={18} />
          </button>
        </motion.div>
        <span className="approach-decoration" aria-hidden="true">
          <Icon name="flower" size={480} />
        </span>
      </section>
      <section className="faq-section page-width">
        <div>
          <p className="eyebrow">A LITTLE CLARITY</p>
          <h2>
            Good questions.
            <br />
            <span>Thoughtful answers.</span>
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], i) => (
            <div key={question} className="faq-item">
              <h3>
                <button
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {question}
                  <Icon name={openFaq === i ? "close" : "plus"} size={18} />
                </button>
              </h3>
              <div id={`faq-${i}`} hidden={openFaq !== i}>
                <p>{answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
