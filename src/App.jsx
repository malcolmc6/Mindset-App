import { useState, useEffect, useRef } from "react";

const SPORTS = {
  swimming: {
    label: "Swimming",
    icon: "🏊",
    events: ["50 Free", "100 Free", "200 Free", "100 Fly", "200 Fly", "100 Back", "200 Back", "100 Breast", "200 Breast", "200 IM", "400 IM"],
    focusAreas: ["Start & Dive", "Underwaters", "Stroke Technique", "Turns", "Finish", "Race Strategy", "Breathing Pattern", "Pacing"],
    sensoryPrompts: ["the smell of chlorine", "the cool water hitting your skin", "the echo of the natatorium", "your goggles sealing tight", "the block beneath your feet"],
  },
  track: {
    label: "Track & Field",
    icon: "🏃",
    events: ["100m", "200m", "400m", "800m", "1500m", "Mile", "5K", "10K", "110m Hurdles", "400m Hurdles"],
    focusAreas: ["Start", "Drive Phase", "Top Speed", "Endurance", "Kick", "Hurdle Clearance", "Mental Toughness", "Finish Line"],
    sensoryPrompts: ["the rubber track under your spikes", "the crowd noise", "your lungs burning", "the wind against your face", "the starting gun"],
  },
  football: {
    label: "Football",
    icon: "🏈",
    events: ["Pre-Game", "Key Play", "Red Zone", "4th Quarter", "Championship"],
    focusAreas: ["Reading the Defense", "Route Running", "Blocking", "Throwing Motion", "Tackling", "Mental Composure", "Team Chemistry"],
    sensoryPrompts: ["the smell of the turf", "the weight of your pads", "the roar of the crowd", "the snap count", "the impact of contact"],
  },
  basketball: {
    label: "Basketball",
    icon: "🏀",
    events: ["Pre-Game", "Clutch Moment", "Free Throws", "Championship Game", "Comeback"],
    focusAreas: ["Shooting Form", "Defense", "Ball Handling", "Reading the Court", "Clutch Performance", "Team Communication"],
    sensoryPrompts: ["the squeak of sneakers", "the weight of the ball", "the net swishing", "the hardwood under your feet", "the crowd going quiet"],
  },
};

const TONES = [
  { id: "calm", label: "Calm & Focused", desc: "Peaceful, steady, in control", color: "#4a9eff", bg: "#0a1628" },
  { id: "fired", label: "Fired Up", desc: "Intense, powerful, dominant", color: "#ff4a4a", bg: "#1a0808" },
  { id: "confident", label: "Quiet Confidence", desc: "Assured, ready, unshakeable", color: "#a78bfa", bg: "#0d0818" },
  { id: "flow", label: "Flow State", desc: "Effortless, automatic, present", color: "#34d399", bg: "#041a12" },
];

const MUSIC_MOODS = [
  { id: "none", label: "No Music", icon: "🔇" },
  { id: "ambient", label: "Ambient", icon: "🌊" },
  { id: "orchestral", label: "Orchestral", icon: "🎼" },
  { id: "lofi", label: "Lo-Fi Beats", icon: "🎧" },
  { id: "nature", label: "Nature Sounds", icon: "🌿" },
];

const VOICE_STYLES = [
  { id: "coach", label: "Coach", desc: "Direct & motivating" },
  { id: "guide", label: "Mindfulness Guide", desc: "Soft & grounding" },
  { id: "athlete", label: "Athlete POV", desc: "First-person immersive" },
];

function buildPrompt({ sport, event, focusAreas, tone, voiceStyle, athleteName, personalNotes, sportData }) {
  const toneMap = {
    calm: "calm, grounded, and focused — like a still lake before dawn",
    fired: "intensely powerful and fired up — like a force of nature unleashed",
    confident: "quietly confident and unshakeable — like someone who has already won",
    flow: "effortless and flowing — like everything is automatic and perfect",
  };
  const voiceMap = {
    coach: "You are an elite performance coach delivering a powerful, direct visualization session.",
    guide: "You are a mindfulness guide leading a gentle, immersive visualization with soft, grounding language.",
    athlete: "Speak in first-person as the athlete — 'I feel', 'I see', 'I am' — creating deep immersive POV.",
  };
  const sensory = sportData.sensoryPrompts.slice(0, 3).join(", ");

  return `${voiceMap[voiceStyle]}

Create a personalized athletic visualization script for ${athleteName || "this athlete"} with the following profile:
- Sport: ${sportData.label} ${sport === "swimming" ? `| Event: ${event}` : `| Scenario: ${event}`}
- Focus Areas: ${focusAreas.join(", ")}
- Emotional Tone: ${toneMap[tone]}
- Sensory anchors to weave in: ${sensory}
${personalNotes ? `- Personal notes from athlete: "${personalNotes}"` : ""}

Write a 300-400 word guided visualization script. Structure it in 3 phases:
1. **Arrival** (grounding & arriving at the moment) — 2-3 sentences
2. **The Performance** (vivid, sensory-rich visualization of executing perfectly) — main body
3. **The Feeling** (the emotional payoff, the result, how it feels) — closing 2-3 sentences

Use rich sensory language. Make it feel personal, not generic. Do NOT use headers or labels in the output — just flowing prose. Write it as something to be read aloud.`;
}

// ───── STEP COMPONENTS ─────

function StepSport({ value, onChange }) {
  return (
    <div className="step-content">
      <h2 className="step-title">What sport are you visualizing for?</h2>
      <div className="sport-grid">
        {Object.entries(SPORTS).map(([key, s]) => (
          <button
            key={key}
            className={`sport-card ${value === key ? "selected" : ""}`}
            onClick={() => onChange(key)}
          >
            <span className="sport-icon">{s.icon}</span>
            <span className="sport-label">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepProfile({ sport, values, onChange }) {
  const sportData = SPORTS[sport];
  return (
    <div className="step-content">
      <h2 className="step-title">Tell us about you</h2>
      <div className="field-group">
        <label className="field-label">Your name (optional)</label>
        <input
          className="field-input"
          placeholder="e.g. Alex"
          value={values.athleteName}
          onChange={e => onChange({ ...values, athleteName: e.target.value })}
        />
      </div>
      <div className="field-group">
        <label className="field-label">Event / Scenario</label>
        <div className="pill-grid">
          {sportData.events.map(ev => (
            <button
              key={ev}
              className={`pill ${values.event === ev ? "selected" : ""}`}
              onClick={() => onChange({ ...values, event: ev })}
            >
              {ev}
            </button>
          ))}
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">Focus areas <span className="hint">(pick up to 3)</span></label>
        <div className="pill-grid">
          {sportData.focusAreas.map(fa => {
            const sel = values.focusAreas.includes(fa);
            return (
              <button
                key={fa}
                className={`pill ${sel ? "selected" : ""}`}
                onClick={() => {
                  if (sel) onChange({ ...values, focusAreas: values.focusAreas.filter(x => x !== fa) });
                  else if (values.focusAreas.length < 3) onChange({ ...values, focusAreas: [...values.focusAreas, fa] });
                }}
              >
                {fa}
              </button>
            );
          })}
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">Anything specific you want to visualize? <span className="hint">(optional)</span></label>
        <textarea
          className="field-input field-textarea"
          placeholder={sport === "swimming" ? "e.g. I want to nail my underwater off the walls and stay relaxed in the back half..." : "e.g. I want to feel completely locked in from the first whistle..."}
          value={values.personalNotes}
          onChange={e => onChange({ ...values, personalNotes: e.target.value })}
        />
      </div>
    </div>
  );
}

function StepTone({ values, onChange }) {
  return (
    <div className="step-content">
      <h2 className="step-title">Set your emotional tone</h2>
      <p className="step-sub">How do you want to feel during this visualization?</p>
      <div className="tone-grid">
        {TONES.map(t => (
          <button
            key={t.id}
            className={`tone-card ${values.tone === t.id ? "selected" : ""}`}
            style={{ "--tone-color": t.color, "--tone-bg": t.bg }}
            onClick={() => onChange({ ...values, tone: t.id })}
          >
            <span className="tone-label">{t.label}</span>
            <span className="tone-desc">{t.desc}</span>
          </button>
        ))}
      </div>
      <div className="field-group" style={{ marginTop: "2rem" }}>
        <label className="field-label">Voice style</label>
        <div className="voice-grid">
          {VOICE_STYLES.map(v => (
            <button
              key={v.id}
              className={`voice-card ${values.voiceStyle === v.id ? "selected" : ""}`}
              onClick={() => onChange({ ...values, voiceStyle: v.id })}
            >
              <span className="voice-label">{v.label}</span>
              <span className="voice-desc">{v.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="field-group" style={{ marginTop: "1.5rem" }}>
        <label className="field-label">Background music</label>
        <div className="music-grid">
          {MUSIC_MOODS.map(m => (
            <button
              key={m.id}
              className={`music-pill ${values.music === m.id ? "selected" : ""}`}
              onClick={() => onChange({ ...values, music: m.id })}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualizationPlayer({ script, tone, athleteName, onRestart }) {
  const [phase, setPhase] = useState("ready"); // ready | playing | done
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const words = useRef([]);
  const intervalRef = useRef(null);
  const toneData = TONES.find(t => t.id === tone);

  useEffect(() => {
    words.current = script.split(" ");
  }, [script]);

  useEffect(() => {
    if (phase === "playing") {
      intervalRef.current = setInterval(() => {
        setWordIndex(i => {
          const next = i + 1;
          if (next >= words.current.length) {
            clearInterval(intervalRef.current);
            setPhase("done");
            return i;
          }
          setDisplayedText(words.current.slice(0, next + 1).join(" "));
          return next;
        });
      }, 280);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const progress = words.current.length ? (wordIndex / words.current.length) * 100 : 0;

  return (
    <div className="player-wrap" style={{ "--tone-color": toneData.color, "--tone-bg": toneData.bg }}>
      <div className="player-bg" />
      {phase === "ready" && (
        <div className="player-ready">
          <div className="ready-icon">🎯</div>
          <h2 className="ready-title">Your visualization is ready{athleteName ? `, ${athleteName}` : ""}</h2>
          <p className="ready-sub">Find a quiet space. Close your eyes after you press play. Let the words guide you.</p>
          <button className="play-btn" onClick={() => { setPhase("playing"); setDisplayedText(words.current[0] || ""); setWordIndex(0); }}>
            ▶ Begin Visualization
          </button>
        </div>
      )}
      {phase === "playing" && (
        <div className="player-active">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="script-display">
            <p className="script-text">{displayedText}<span className="cursor-blink">|</span></p>
          </div>
          <button className="stop-btn" onClick={() => { clearInterval(intervalRef.current); setPhase("done"); }}>
            ■ End Session
          </button>
        </div>
      )}
      {phase === "done" && (
        <div className="player-done">
          <div className="done-icon">✨</div>
          <h2 className="done-title">Session Complete</h2>
          <p className="done-sub">Take a breath. Carry that feeling into your performance.</p>
          <div className="done-script">
            <p>{script}</p>
          </div>
          <div className="done-actions">
            <button className="play-btn" onClick={() => { setPhase("ready"); setDisplayedText(""); setWordIndex(0); }}>
              ↺ Replay
            </button>
            <button className="secondary-btn" onClick={onRestart}>
              ✦ New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ───── MAIN APP ─────

const STEPS = ["Sport", "Profile", "Tone", "Visualize"];

export default function App() {
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState("swimming");
  const [profile, setProfile] = useState({ athleteName: "", event: "", focusAreas: [], personalNotes: "" });
  const [vibe, setVibe] = useState({ tone: "calm", voiceStyle: "coach", music: "ambient" });
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canNext = () => {
    if (step === 0) return !!sport;
    if (step === 1) return !!profile.event && profile.focusAreas.length > 0;
    if (step === 2) return !!vibe.tone;
    return true;
  };

  const generateScript = async () => {
    setLoading(true);
    setError("");
    try {
      const prompt = buildPrompt({
        sport,
        event: profile.event,
        focusAreas: profile.focusAreas,
        tone: vibe.tone,
        voiceStyle: vibe.voiceStyle,
        athleteName: profile.athleteName,
        personalNotes: profile.personalNotes,
        sportData: SPORTS[sport],
      });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("No script returned");
      setScript(text.trim());
      setStep(3);
    } catch (e) {
      setError("Something went wrong generating your script. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(0);
    setSport("swimming");
    setProfile({ athleteName: "", event: "", focusAreas: [], personalNotes: "" });
    setVibe({ tone: "calm", voiceStyle: "coach", music: "ambient" });
    setScript("");
  };

  const toneData = TONES.find(t => t.id === vibe.tone) || TONES[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #08090d;
          --surface: #11131a;
          --border: rgba(255,255,255,0.08);
          --text: #e8eaf0;
          --muted: #6b7280;
          --accent: #4a9eff;
          --radius: 14px;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* HEADER */
        .header {
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: rgba(8,9,13,0.85);
          backdrop-filter: blur(12px);
          z-index: 10;
        }

        .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.06em;
          color: var(--text);
        }

        .logo span {
          color: var(--accent);
        }

        .step-indicators {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border);
          transition: all 0.3s;
        }

        .step-dot.active {
          background: var(--accent);
          width: 24px;
          border-radius: 4px;
        }

        .step-dot.done {
          background: rgba(74,158,255,0.4);
        }

        /* MAIN */
        .main {
          flex: 1;
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
          padding: 2.5rem 1.5rem 4rem;
        }

        /* STEP CONTENT */
        .step-content {
          animation: fadeUp 0.4s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .step-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.04em;
          margin-bottom: 0.4rem;
          line-height: 1.1;
        }

        .step-sub {
          color: var(--muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        /* SPORT GRID */
        .sport-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .sport-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem 1rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.2s;
          color: var(--text);
        }

        .sport-card:hover {
          border-color: rgba(74,158,255,0.3);
          background: rgba(74,158,255,0.05);
        }

        .sport-card.selected {
          border-color: var(--accent);
          background: rgba(74,158,255,0.1);
          box-shadow: 0 0 0 1px rgba(74,158,255,0.3);
        }

        .sport-icon { font-size: 2rem; }
        .sport-label { font-size: 0.9rem; font-weight: 500; }

        /* FIELDS */
        .field-group { margin-top: 1.8rem; }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.75rem;
        }

        .hint {
          text-transform: none;
          letter-spacing: 0;
          font-weight: 300;
          font-size: 0.75rem;
          color: rgba(107,114,128,0.7);
        }

        .field-input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .field-input:focus {
          border-color: rgba(74,158,255,0.4);
        }

        .field-textarea {
          min-height: 80px;
          resize: vertical;
        }

        /* PILLS */
        .pill-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .pill {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 0.4rem 0.9rem;
          font-size: 0.82rem;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }

        .pill:hover {
          border-color: rgba(74,158,255,0.3);
          color: var(--text);
        }

        .pill.selected {
          background: rgba(74,158,255,0.12);
          border-color: var(--accent);
          color: var(--accent);
        }

        /* TONE CARDS */
        .tone-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.9rem;
          margin-top: 1rem;
        }

        .tone-card {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.2rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          background: var(--surface);
          transition: all 0.2s;
          text-align: left;
        }

        .tone-card:hover {
          border-color: var(--tone-color);
          background: var(--tone-bg);
        }

        .tone-card.selected {
          border-color: var(--tone-color);
          background: var(--tone-bg);
          box-shadow: 0 0 0 1px var(--tone-color), inset 0 0 30px rgba(0,0,0,0.3);
        }

        .tone-label {
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text);
        }

        .tone-card.selected .tone-label { color: var(--tone-color); }

        .tone-desc {
          font-size: 0.78rem;
          color: var(--muted);
          font-style: italic;
        }

        /* VOICE */
        .voice-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .voice-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.9rem 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .voice-card:hover, .voice-card.selected {
          border-color: var(--accent);
          background: rgba(74,158,255,0.07);
        }

        .voice-label {
          font-size: 0.85rem;
          font-weight: 500;
          display: block;
          color: var(--text);
        }

        .voice-desc {
          font-size: 0.72rem;
          color: var(--muted);
          display: block;
        }

        /* MUSIC */
        .music-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .music-pill {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 0.45rem 1rem;
          font-size: 0.82rem;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s;
        }

        .music-pill.selected {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(74,158,255,0.08);
        }

        /* NAV */
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .nav-back {
          background: none;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.7rem 1.3rem;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-back:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }

        .nav-next {
          background: var(--accent);
          border: none;
          border-radius: 10px;
          padding: 0.7rem 1.8rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-next:hover:not(:disabled) { background: #3a8ef0; transform: translateY(-1px); }
        .nav-next:disabled { opacity: 0.4; cursor: not-allowed; }

        .nav-next.generating {
          background: rgba(74,158,255,0.3);
          cursor: wait;
        }

        .spin {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .error-msg {
          color: #ff6b6b;
          font-size: 0.82rem;
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(255,75,75,0.08);
          border-radius: 8px;
          border: 1px solid rgba(255,75,75,0.2);
        }

        /* PLAYER */
        .player-wrap {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          margin-top: 1rem;
        }

        .player-bg {
          position: absolute;
          inset: 0;
          background: var(--tone-bg, #0a1628);
          z-index: 0;
        }

        .player-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--tone-color) 12%, transparent), transparent 70%);
        }

        .player-ready, .player-active, .player-done {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 3rem 2rem;
          max-width: 560px;
        }

        .ready-icon, .done-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .ready-title, .done-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.04em;
          margin-bottom: 0.75rem;
          color: var(--tone-color, var(--text));
        }

        .ready-sub, .done-sub {
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-style: italic;
        }

        .play-btn {
          background: var(--tone-color, var(--accent));
          border: none;
          border-radius: 12px;
          padding: 0.9rem 2.2rem;
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.15rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .play-btn:hover { transform: scale(1.03); }

        .player-active {
          width: 100%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          text-align: left;
        }

        .progress-bar {
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }

        .progress-fill {
          height: 100%;
          background: var(--tone-color, var(--accent));
          border-radius: 2px;
          transition: width 0.3s linear;
        }

        .script-display {
          min-height: 200px;
          display: flex;
          align-items: center;
        }

        .script-text {
          font-size: 1.25rem;
          line-height: 1.75;
          color: var(--text);
          font-weight: 300;
          font-style: italic;
        }

        .cursor-blink {
          animation: blink 1s step-end infinite;
          color: var(--tone-color, var(--accent));
        }

        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        .stop-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.5rem 1.2rem;
          color: var(--muted);
          font-size: 0.8rem;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .done-script {
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          text-align: left;
          max-height: 200px;
          overflow-y: auto;
          font-style: italic;
          font-size: 0.88rem;
          line-height: 1.7;
          color: var(--muted);
        }

        .done-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .secondary-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 0.9rem 2rem;
          color: var(--text);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.15rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-btn:hover { background: rgba(255,255,255,0.1); }

        @media (max-width: 500px) {
          .sport-grid { grid-template-columns: repeat(2, 1fr); }
          .tone-grid { grid-template-columns: 1fr 1fr; }
          .voice-grid { grid-template-columns: 1fr; }
          .step-title { font-size: 1.7rem; }
        }
      `}</style>

      <div className="app">
        <header className="header">
          <div className="logo">MIND<span>SET</span></div>
          {step < 3 && (
            <div className="step-indicators">
              {STEPS.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`}
                />
              ))}
            </div>
          )}
        </header>

        <main className="main">
          {step === 0 && <StepSport value={sport} onChange={setSport} />}
          {step === 1 && <StepProfile sport={sport} values={profile} onChange={setProfile} />}
          {step === 2 && <StepTone values={vibe} onChange={setVibe} />}
          {step === 3 && script && (
            <VisualizationPlayer
              script={script}
              tone={vibe.tone}
              athleteName={profile.athleteName}
              onRestart={restart}
            />
          )}

          {step < 3 && (
            <>
              {error && <div className="error-msg">{error}</div>}
              <div className="nav-bar">
                <button
                  className="nav-back"
                  onClick={() => setStep(s => s - 1)}
                  style={{ visibility: step === 0 ? "hidden" : "visible" }}
                >
                  ← Back
                </button>
                {step < 2 ? (
                  <button className="nav-next" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
                    Continue →
                  </button>
                ) : (
                  <button
                    className={`nav-next ${loading ? "generating" : ""}`}
                    disabled={loading || !canNext()}
                    onClick={generateScript}
                  >
                    {loading ? <><span className="spin">⟳</span> Generating…</> : "✦ Generate My Visualization"}
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
