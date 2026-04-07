import { useState, useEffect, useRef } from "react";

const SPORTS = {
  swimming: {
    label: "Swimming", icon: "🏊",
    events: ["50 Free", "100 Free", "200 Free", "100 Fly", "200 Fly", "100 Back", "200 Back", "100 Breast", "200 Breast", "200 IM", "400 IM"],
    focusAreas: ["Start & Dive", "Underwaters", "Stroke Technique", "Turns", "Finish", "Race Strategy", "Breathing Pattern", "Pacing"],
    sensoryPrompts: ["the smell of chlorine", "the cool water hitting your skin", "the echo of the natatorium", "your goggles sealing tight", "the block beneath your feet"],
  },
  track: {
    label: "Track & Field", icon: "🏃",
    events: ["100m", "200m", "400m", "800m", "1500m", "Mile", "5K", "10K", "110m Hurdles", "400m Hurdles"],
    focusAreas: ["Start", "Drive Phase", "Top Speed", "Endurance", "Kick", "Hurdle Clearance", "Mental Toughness", "Finish Line"],
    sensoryPrompts: ["the rubber track under your spikes", "the crowd noise", "your lungs burning", "the wind against your face", "the starting gun"],
  },
  football: {
    label: "Football", icon: "🏈",
    events: ["Pre-Game", "Key Play", "Red Zone", "4th Quarter", "Championship"],
    focusAreas: ["Reading the Defense", "Route Running", "Blocking", "Throwing Motion", "Tackling", "Mental Composure", "Team Chemistry"],
    sensoryPrompts: ["the smell of the turf", "the weight of your pads", "the roar of the crowd", "the snap count", "the impact of contact"],
  },
  basketball: {
    label: "Basketball", icon: "🏀",
    events: ["Pre-Game", "Clutch Moment", "Free Throws", "Championship Game", "Comeback"],
    focusAreas: ["Shooting Form", "Defense", "Ball Handling", "Reading the Court", "Clutch Performance", "Team Communication"],
    sensoryPrompts: ["the squeak of sneakers", "the weight of the ball", "the net swishing", "the hardwood under your feet", "the crowd going quiet"],
  },
};

const TONES = [
  { id: "calm", label: "Calm & Focused", desc: "Steady, in control", color: "#3b82f6", bg: "#060e1f" },
  { id: "fired", label: "Fired Up", desc: "Intense, dominant", color: "#f87171", bg: "#1a0808" },
  { id: "confident", label: "Quiet Confidence", desc: "Assured, unshakeable", color: "#a78bfa", bg: "#0d0818" },
  { id: "flow", label: "Flow State", desc: "Effortless, present", color: "#34d399", bg: "#041a12" },
];

const MUSIC_MOODS = [
  { id: "none", label: "No Music", icon: "🔇", url: null },
  { id: "ambient", label: "Ambient", icon: "🌊", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "nature", label: "Nature", icon: "🌿", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "focus", label: "Deep Focus", icon: "🎯", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

const VOICE_STYLES = [
  { id: "coach", label: "Coach", desc: "Direct & motivating" },
  { id: "guide", label: "Guide", desc: "Soft & grounding" },
  { id: "athlete", label: "Athlete POV", desc: "First-person" },
];

const NAV_ITEMS = [
  { id: "generate", icon: "✦", label: "New Session" },
  { id: "sessions", icon: "▶", label: "My Sessions" },
  { id: "playlists", icon: "≡", label: "Playlists" },
  { id: "teams", icon: "◈", label: "My Teams" },
  { id: "explore", icon: "◎", label: "Explore" },
];

const SPORTS_NAV = Object.entries(SPORTS).map(([key, s]) => ({ id: key, label: s.label, icon: s.icon }));

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
1. Arrival — 2-3 sentences grounding the athlete
2. The Performance — vivid, sensory-rich visualization of executing perfectly
3. The Feeling — the emotional payoff and result

Do NOT use headers or labels. Just flowing prose meant to be read aloud.`;
}

// ── NOW PLAYING BAR ──
function NowPlayingBar({ session, onClose }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const voiceRef = useRef(null);
  const musicRef = useRef(null);
  const toneData = TONES.find(t => t.id === session.tone) || TONES[0];
  const musicData = MUSIC_MOODS.find(m => m.id === session.music);

  const startMusic = () => {
    if (!musicData?.url) return;
    const audio = new Audio(musicData.url);
    audio.loop = true; audio.volume = musicVolume;
    audio.play().catch(() => {});
    musicRef.current = audio;
  };
  const stopMusic = () => { if (musicRef.current) { musicRef.current.pause(); musicRef.current = null; } };

  useEffect(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(session.script);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
    if (voice) utterance.voice = voice;
    const toneSettings = { calm: { rate: 0.82, pitch: 0.95 }, fired: { rate: 1.05, pitch: 1.1 }, confident: { rate: 0.88, pitch: 1.0 }, flow: { rate: 0.78, pitch: 0.9 } };
    const s = toneSettings[session.tone] || { rate: 0.85, pitch: 1.0 };
    utterance.rate = s.rate; utterance.pitch = s.pitch; utterance.volume = 0.9;
    let wc = 0; const total = session.script.split(" ").length;
    utterance.onboundary = (e) => { if (e.name === "word") { wc++; setProgress((wc / total) * 100); } };
    utterance.onend = () => { setProgress(100); stopMusic(); };
    voiceRef.current = utterance;
    startMusic();
    window.speechSynthesis.speak(utterance);
    return () => { window.speechSynthesis.cancel(); stopMusic(); };
  }, [session]);

  useEffect(() => { if (musicRef.current) musicRef.current.volume = musicVolume; }, [musicVolume]);

  const togglePause = () => {
    if (isPaused) { window.speechSynthesis.resume(); if (musicRef.current) musicRef.current.play(); }
    else { window.speechSynthesis.pause(); if (musicRef.current) musicRef.current.pause(); }
    setIsPaused(!isPaused);
  };

  const handleClose = () => { window.speechSynthesis.cancel(); stopMusic(); onClose(); };

  return (
    <div className="now-playing-bar" style={{ "--tone-color": toneData.color }}>
      <div className="np-progress"><div className="np-progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="np-content">
        <div className="np-left">
          <div className="np-icon">{SPORTS[session.sport]?.icon || "◎"}</div>
          <div className="np-info">
            <div className="np-title">{session.sport ? SPORTS[session.sport].label : "Visualization"} — {session.event}</div>
            <div className="np-sub" style={{ color: toneData.color }}>{TONES.find(t => t.id === session.tone)?.label}</div>
          </div>
        </div>
        <div className="np-controls">
          <button className="np-btn" onClick={togglePause}>{isPaused ? "▶" : "⏸"}</button>
          <button className="np-btn np-stop" onClick={handleClose}>■</button>
        </div>
        <div className="np-right">
          <span className="np-vol-label">🎵</span>
          <input type="range" min="0" max="1" step="0.05" value={musicVolume}
            onChange={e => setMusicVolume(parseFloat(e.target.value))} className="np-vol-slider" />
        </div>
      </div>
    </div>
  );
}

// ── GENERATE VIEW ──
function GenerateView({ onSessionStart }) {
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState("");
  const [event, setEvent] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [tone, setTone] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [music, setMusic] = useState("");
  const [athleteName, setAthleteName] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sportData = sport ? SPORTS[sport] : null;
  const STEPS = ["Sport", "Event", "Focus", "Vibe", "Generate"];

  const toggleFocus = (fa) => {
    if (focusAreas.includes(fa)) setFocusAreas(f => f.filter(x => x !== fa));
    else if (focusAreas.length < 3) setFocusAreas(f => [...f, fa]);
  };

  const canNext = () => {
    if (step === 0) return !!sport;
    if (step === 1) return !!event;
    if (step === 2) return focusAreas.length > 0;
    if (step === 3) return !!tone && !!voiceStyle && !!music;
    return true;
  };

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const prompt = buildPrompt({ sport, event, focusAreas, tone, voiceStyle, athleteName, personalNotes, sportData });
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("Empty");
      onSessionStart({ sport, event, tone, voiceStyle, music, script: text });
    } catch (e) { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const stepTitles = ["CHOOSE YOUR SPORT", "SELECT YOUR EVENT", "WHAT'S YOUR FOCUS?", "SET THE VIBE", "ALMOST THERE"];
  const stepSubs = [
    "What are you training or competing in?",
    "Pick the specific event or scenario you want to visualize.",
    "Pick up to 3 areas to lock in on.",
    "How do you want to feel during this session?",
    "Add your name and any personal notes.",
  ];

  return (
    <div className="generate-view" key={step}>
      <div className="gen-step-header">
        <div className="gen-eyebrow">Step {step + 1} of {STEPS.length}</div>
        <h2 className="gen-title">{stepTitles[step]}</h2>
        <p className="gen-sub">{stepSubs[step]}</p>
        <div className="gen-track">
          {STEPS.map((_, i) => <div key={i} className={`gen-node ${i < step ? "done" : i === step ? "active" : ""}`} />)}
        </div>
      </div>

      <div className="gen-body">
        {step === 0 && (
          <div className="sport-grid">
            {Object.entries(SPORTS).map(([key, s]) => (
              <div key={key} className={`sport-card ${sport === key ? "active" : ""}`} onClick={() => setSport(key)}>
                <div className="sport-emoji-wrap">{s.icon}</div>
                <div className="sport-name">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && sportData && (
          <div className="pill-wrap">
            {sportData.events.map(ev => (
              <div key={ev} className={`pill ${event === ev ? "active" : ""}`} onClick={() => setEvent(ev)}>{ev}</div>
            ))}
          </div>
        )}

        {step === 2 && sportData && (
          <div className="pill-wrap">
            {sportData.focusAreas.map(fa => (
              <div key={fa} className={`pill ${focusAreas.includes(fa) ? "active" : ""}`} onClick={() => toggleFocus(fa)}>{fa}</div>
            ))}
          </div>
        )}

        {step === 3 && (
          <>
            <div className="tone-grid">
              {TONES.map(t => (
                <div key={t.id} className={`tone-card ${tone === t.id ? "active" : ""}`}
                  style={{ "--tone-color": t.color }} onClick={() => setTone(t.id)}>
                  <div className="tone-name">{t.label}</div>
                  <div className="tone-desc">{t.desc}</div>
                </div>
              ))}
            </div>
            <div className="vibe-sub-label">VOICE STYLE</div>
            <div className="voice-row">
              {VOICE_STYLES.map(v => (
                <div key={v.id} className={`voice-card ${voiceStyle === v.id ? "active" : ""}`} onClick={() => setVoiceStyle(v.id)}>
                  <div className="voice-name">{v.label}</div>
                  <div className="voice-desc">{v.desc}</div>
                </div>
              ))}
            </div>
            <div className="vibe-sub-label">BACKGROUND MUSIC</div>
            <div className="music-row">
              {MUSIC_MOODS.map(m => (
                <div key={m.id} className={`music-chip ${music === m.id ? "active" : ""}`} onClick={() => setMusic(m.id)}>
                  {m.icon} {m.label}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <input className="text-input" placeholder="Your name (optional) — e.g. Malcolm"
              value={athleteName} onChange={e => setAthleteName(e.target.value)} />
            <textarea className="text-input textarea-input"
              placeholder="Anything specific you want to focus on? (optional)"
              value={personalNotes} onChange={e => setPersonalNotes(e.target.value)} />
            {error && <div className="error-msg">{error}</div>}
          </>
        )}
      </div>

      <div className="gen-nav">
        <button className="back-btn" onClick={() => setStep(s => s - 1)} style={{ visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
        {step < 4
          ? <button className="next-btn" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="next-btn gen-go" disabled={loading} onClick={generate}>
              {loading ? "⟳ Generating..." : "✦ Generate & Play"}
            </button>
        }
      </div>
    </div>
  );
}

// ── PLACEHOLDER VIEWS ──
function PlaceholderView({ title, desc, icon }) {
  return (
    <div className="placeholder-view">
      <div className="ph-icon">{icon}</div>
      <h2 className="ph-title">{title}</h2>
      <p className="ph-desc">{desc}</p>
      <div className="ph-badge">Coming Soon</div>
    </div>
  );
}

// ── WELCOME SCREEN ──
function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-wrap">
      <div className="welcome-bg" />
      <div className="welcome-content">
        <div className="welcome-eyebrow">Mental Performance Platform</div>
        <h1 className="welcome-headline">
          THE FUTURE OF<br/>
          <span className="welcome-highlight">ATHLETIC</span><br/>
          PERFORMANCE.
        </h1>
        <p className="welcome-sub">
          AI-powered visualization sessions personalized to your sport,
          your event, and your mindset. Train your mind like you train your body.
        </p>
        <div className="welcome-stats">
          <div className="welcome-stat"><div className="stat-num">4+</div><div className="stat-label">Sports</div></div>
          <div className="stat-divider" />
          <div className="welcome-stat"><div className="stat-num">AI</div><div className="stat-label">Personalized</div></div>
          <div className="stat-divider" />
          <div className="welcome-stat"><div className="stat-num">∞</div><div className="stat-label">Sessions</div></div>
        </div>
        <button className="welcome-cta" onClick={onStart}>GET STARTED →</button>
        <p className="welcome-fine">No account needed. Free to use.</p>
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [activeNav, setActiveNav] = useState("generate");
  const [nowPlaying, setNowPlaying] = useState(null);

  const handleSessionStart = (session) => {
    setNowPlaying(session);
  };

  const renderMain = () => {
    if (activeNav === "generate") return <GenerateView onSessionStart={handleSessionStart} />;
    if (activeNav === "sessions") return <PlaceholderView icon="▶" title="My Sessions" desc="Your saved visualization sessions will appear here. Sign in to save and replay your sessions anytime." />;
    if (activeNav === "playlists") return <PlaceholderView icon="≡" title="Playlists" desc="Group your favorite sessions into playlists. Pre-meet, championship week, daily practice — organize however works for you." />;
    if (activeNav === "teams") return <PlaceholderView icon="◈" title="My Teams" desc="Coaches can create a team and push visualization sessions directly to athletes. Athletes can join their team's group." />;
    if (activeNav === "explore") return <PlaceholderView icon="◎" title="Explore" desc="Discover visualization sessions shared by athletes and coaches across all sports. Find what works for the best." />;
    return null;
  };

  if (screen === "welcome") return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050608; color: #fff; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .welcome-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .welcome-bg { position: absolute; inset: 0; background: #050608; }
        .welcome-bg::before { content: ''; position: absolute; top: -30%; left: -20%; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%); }
        .welcome-bg::after { content: ''; position: absolute; bottom: -20%; right: -10%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%); }
        .welcome-content { position: relative; z-index: 1; max-width: 640px; padding: 3rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .welcome-eyebrow { font-family: 'Oswald', sans-serif; font-size: 0.62rem; letter-spacing: 0.25em; color: #3b82f6; font-weight: 400; text-transform: uppercase; }
        .welcome-headline { font-family: 'Oswald', sans-serif; font-size: 5rem; font-weight: 700; line-height: 0.95; letter-spacing: 0.02em; text-transform: uppercase; }
        .welcome-highlight { color: #3b82f6; }
        .welcome-sub { font-size: 0.92rem; color: rgba(255,255,255,0.4); line-height: 1.75; font-weight: 300; max-width: 460px; }
        .welcome-stats { display: flex; align-items: center; gap: 2rem; margin: 0.5rem 0; }
        .welcome-stat { text-align: center; }
        .stat-num { font-family: 'Oswald', sans-serif; font-size: 1.8rem; font-weight: 700; color: #fff; letter-spacing: 0.04em; }
        .stat-label { font-family: 'Oswald', sans-serif; font-size: 0.58rem; letter-spacing: 0.15em; color: rgba(255,255,255,0.35); text-transform: uppercase; font-weight: 400; margin-top: 2px; }
        .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.1); }
        .welcome-cta { background: #3b82f6; border: none; border-radius: 12px; padding: 1.1rem 3rem; color: #fff; font-family: 'Oswald', sans-serif; font-size: 1.05rem; letter-spacing: 0.18em; font-weight: 600; text-transform: uppercase; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; }
        .welcome-cta:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(59,130,246,0.3); }
        .welcome-fine { font-size: 0.72rem; color: rgba(255,255,255,0.2); font-weight: 300; }
        @media (max-width: 500px) { .welcome-headline { font-size: 3rem; } }
      `}</style>
      <WelcomeScreen onStart={() => setScreen("app")} />
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #050608; --sidebar-bg: #0a0b0f; --surface: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.07); --text: #fff; --muted: rgba(255,255,255,0.35); --accent: #3b82f6; }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        /* APP SHELL */
        .app-shell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .app-top { display: flex; flex: 1; overflow: hidden; }

        /* HEADER */
        .header { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.5rem; border-bottom: 1px solid var(--border); background: rgba(5,6,8,0.95); backdrop-filter: blur(20px); z-index: 20; flex-shrink: 0; }
        .logo { font-family: 'Oswald', sans-serif; font-size: 1.3rem; font-weight: 700; letter-spacing: 0.15em; }
        .logo-dot { color: var(--accent); }
        .header-right { display: flex; align-items: center; gap: 1rem; }
        .account-btn { display: flex; align-items: center; gap: 0.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.4rem 0.9rem; cursor: pointer; transition: all 0.2s; }
        .account-btn:hover { border-color: rgba(255,255,255,0.2); }
        .account-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: 'Oswald', sans-serif; font-size: 0.6rem; font-weight: 600; }
        .account-label { font-family: 'Oswald', sans-serif; font-size: 0.65rem; letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase; }

        /* SIDEBAR */
        .sidebar { width: 220px; flex-shrink: 0; background: var(--sidebar-bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto; }
        .sidebar-section { padding: 1.25rem 1rem 0.5rem; }
        .sidebar-label { font-family: 'Oswald', sans-serif; font-size: 0.55rem; letter-spacing: 0.2em; color: rgba(255,255,255,0.2); text-transform: uppercase; font-weight: 400; padding: 0 0.5rem; margin-bottom: 0.4rem; }
        .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 8px; cursor: pointer; transition: all 0.18s; margin-bottom: 2px; }
        .nav-item:hover { background: rgba(255,255,255,0.04); }
        .nav-item.active { background: rgba(59,130,246,0.1); }
        .nav-icon { font-size: 0.75rem; color: rgba(255,255,255,0.3); width: 16px; text-align: center; flex-shrink: 0; }
        .nav-item.active .nav-icon { color: var(--accent); }
        .nav-label { font-family: 'Oswald', sans-serif; font-size: 0.72rem; letter-spacing: 0.06em; color: rgba(255,255,255,0.45); text-transform: uppercase; font-weight: 500; }
        .nav-item.active .nav-label { color: #fff; }
        .sidebar-divider { height: 1px; background: var(--border); margin: 0.75rem 1rem; }
        .sport-nav-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 0.75rem; border-radius: 6px; cursor: pointer; transition: all 0.18s; margin-bottom: 1px; }
        .sport-nav-item:hover { background: rgba(255,255,255,0.03); }
        .sport-nav-icon { font-size: 0.85rem; }
        .sport-nav-label { font-family: 'Oswald', sans-serif; font-size: 0.65rem; letter-spacing: 0.04em; color: rgba(255,255,255,0.3); text-transform: uppercase; font-weight: 400; }
        .sidebar-bottom { margin-top: auto; padding: 1rem; border-top: 1px solid var(--border); }
        .upgrade-card { background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05)); border: 1px solid rgba(59,130,246,0.2); border-radius: 10px; padding: 0.9rem; }
        .upgrade-title { font-family: 'Oswald', sans-serif; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; color: #fff; margin-bottom: 0.3rem; }
        .upgrade-desc { font-size: 0.68rem; color: rgba(255,255,255,0.3); line-height: 1.5; margin-bottom: 0.75rem; }
        .upgrade-btn { width: 100%; padding: 0.5rem; background: var(--accent); border: none; border-radius: 6px; color: #fff; font-family: 'Oswald', sans-serif; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .upgrade-btn:hover { background: #2563eb; }

        /* MAIN CONTENT */
        .main-content { flex: 1; overflow-y: auto; padding: 2rem 2.5rem; }

        /* GENERATE VIEW */
        .generate-view { max-width: 580px; margin: 0 auto; animation: fadeUp 0.3s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .gen-step-header { margin-bottom: 2rem; }
        .gen-eyebrow { font-family: 'Oswald', sans-serif; font-size: 0.58rem; letter-spacing: 0.22em; color: var(--accent); font-weight: 400; text-transform: uppercase; margin-bottom: 0.4rem; }
        .gen-title { font-family: 'Oswald', sans-serif; font-size: 2rem; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 0.4rem; }
        .gen-sub { font-size: 0.82rem; color: var(--muted); font-weight: 300; margin-bottom: 1.25rem; }
        .gen-track { display: flex; gap: 5px; align-items: center; }
        .gen-node { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.3s; }
        .gen-node.done { background: rgba(59,130,246,0.5); }
        .gen-node.active { background: #fff; width: 18px; border-radius: 3px; }
        .gen-body { margin-bottom: 2rem; }
        .gen-nav { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid var(--border); }

        /* SPORT CARDS */
        .sport-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .sport-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.9rem; }
        .sport-card:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); }
        .sport-card.active { border-color: var(--accent); background: rgba(59,130,246,0.08); }
        .sport-emoji-wrap { width: 46px; height: 46px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: all 0.2s; flex-shrink: 0; }
        .sport-card.active .sport-emoji-wrap { background: rgba(59,130,246,0.15); }
        .sport-name { font-family: 'Oswald', sans-serif; font-size: 0.82rem; letter-spacing: 0.06em; color: rgba(255,255,255,0.55); font-weight: 600; text-transform: uppercase; }
        .sport-card.active .sport-name { color: #fff; }

        /* PILLS */
        .pill-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .pill { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.4rem 0.9rem; font-family: 'Oswald', sans-serif; font-size: 0.65rem; letter-spacing: 0.06em; color: var(--muted); cursor: pointer; transition: all 0.18s; text-transform: uppercase; font-weight: 400; white-space: nowrap; }
        .pill:hover { border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.7); }
        .pill.active { background: rgba(59,130,246,0.1); border-color: var(--accent); color: #93c5fd; }

        /* TONE */
        .tone-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 1.5rem; }
        .tone-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; cursor: pointer; transition: all 0.2s; }
        .tone-card:hover { border-color: rgba(255,255,255,0.14); }
        .tone-card.active { border-color: var(--tone-color); background: rgba(0,0,0,0.3); }
        .tone-name { font-family: 'Oswald', sans-serif; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; color: rgba(255,255,255,0.45); margin-bottom: 2px; }
        .tone-card.active .tone-name { color: var(--tone-color); }
        .tone-desc { font-size: 0.65rem; color: rgba(255,255,255,0.2); font-weight: 300; }
        .vibe-sub-label { font-family: 'Oswald', sans-serif; font-size: 0.56rem; letter-spacing: 0.2em; color: var(--muted); text-transform: uppercase; margin-bottom: 0.6rem; font-weight: 400; }
        .voice-row { display: flex; gap: 7px; margin-bottom: 1.25rem; }
        .voice-card { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.7rem 0.5rem; cursor: pointer; transition: all 0.2s; text-align: center; }
        .voice-card:hover { border-color: rgba(255,255,255,0.14); }
        .voice-card.active { border-color: var(--accent); background: rgba(59,130,246,0.08); }
        .voice-name { font-family: 'Oswald', sans-serif; font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; color: rgba(255,255,255,0.4); }
        .voice-card.active .voice-name { color: #fff; }
        .voice-desc { font-size: 0.6rem; color: rgba(255,255,255,0.2); margin-top: 2px; }
        .music-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .music-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.35rem 0.8rem; font-family: 'Oswald', sans-serif; font-size: 0.62rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); cursor: pointer; transition: all 0.18s; }
        .music-chip:hover { border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.7); }
        .music-chip.active { border-color: var(--accent); color: #93c5fd; background: rgba(59,130,246,0.08); }

        /* INPUTS */
        .text-input { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.7rem 0.9rem; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; outline: none; width: 100%; transition: border-color 0.2s; margin-bottom: 0.75rem; }
        .text-input:focus { border-color: rgba(59,130,246,0.4); }
        .text-input::placeholder { color: rgba(255,255,255,0.18); }
        .textarea-input { min-height: 80px; resize: vertical; }
        .error-msg { color: #f87171; font-size: 0.78rem; padding: 0.6rem 0.9rem; background: rgba(248,113,113,0.08); border-radius: 8px; border: 1px solid rgba(248,113,113,0.2); margin-top: 0.75rem; }

        /* NAV BUTTONS */
        .back-btn { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 1.1rem; color: var(--muted); font-family: 'Oswald', sans-serif; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .back-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .next-btn { background: var(--accent); border: none; border-radius: 8px; padding: 0.6rem 1.6rem; color: #fff; font-family: 'Oswald', sans-serif; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .next-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
        .next-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .gen-go { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }

        /* PLACEHOLDER */
        .placeholder-view { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; gap: 1rem; }
        .ph-icon { font-size: 2.5rem; color: rgba(255,255,255,0.1); }
        .ph-title { font-family: 'Oswald', sans-serif; font-size: 1.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .ph-desc { font-size: 0.85rem; color: var(--muted); max-width: 360px; line-height: 1.7; font-weight: 300; }
        .ph-badge { font-family: 'Oswald', sans-serif; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 100px; padding: 0.35rem 0.9rem; }

        /* NOW PLAYING BAR */
        .now-playing-bar { flex-shrink: 0; background: rgba(10,11,15,0.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border); position: relative; }
        .np-progress { height: 2px; background: rgba(255,255,255,0.06); }
        .np-progress-fill { height: 100%; background: var(--tone-color, var(--accent)); transition: width 0.5s linear; }
        .np-content { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem; gap: 1rem; }
        .np-left { display: flex; align-items: center; gap: 0.9rem; flex: 1; min-width: 0; }
        .np-icon { font-size: 1.5rem; flex-shrink: 0; }
        .np-info { min-width: 0; }
        .np-title { font-family: 'Oswald', sans-serif; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .np-sub { font-size: 0.62rem; color: var(--tone-color, var(--accent)); margin-top: 1px; font-family: 'Oswald', sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
        .np-controls { display: flex; gap: 0.5rem; align-items: center; }
        .np-btn { background: rgba(255,255,255,0.08); border: none; border-radius: 6px; padding: 0.4rem 0.75rem; color: #fff; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
        .np-btn:hover { background: rgba(255,255,255,0.15); }
        .np-stop { color: var(--muted); }
        .np-right { display: flex; align-items: center; gap: 0.5rem; flex: 1; justify-content: flex-end; }
        .np-vol-label { font-size: 0.75rem; }
        .np-vol-slider { width: 80px; accent-color: var(--tone-color, var(--accent)); cursor: pointer; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { padding: 1.5rem; }
        }
      `}</style>

      <div className="app-shell">
        {/* HEADER */}
        <header className="header">
          <div className="logo">MIND<span className="logo-dot">SET</span></div>
          <div className="header-right">
            <div className="account-btn">
              <div className="account-avatar">M</div>
              <span className="account-label">Account</span>
            </div>
          </div>
        </header>

        <div className="app-top">
          {/* SIDEBAR */}
          <nav className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">Menu</div>
              {NAV_ITEMS.map(item => (
                <div key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                  onClick={() => setActiveNav(item.id)}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-section">
              <div className="sidebar-label">Sports</div>
              {SPORTS_NAV.map(s => (
                <div key={s.id} className="sport-nav-item" onClick={() => setActiveNav("generate")}>
                  <span className="sport-nav-icon">{s.icon}</span>
                  <span className="sport-nav-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-bottom">
              <div className="upgrade-card">
                <div className="upgrade-title">Go Pro</div>
                <div className="upgrade-desc">Unlock unlimited sessions, AI voice, teams & more.</div>
                <button className="upgrade-btn">Upgrade →</button>
              </div>
            </div>
          </nav>

          {/* MAIN */}
          <main className="main-content">
            {renderMain()}
          </main>
        </div>

        {/* NOW PLAYING BAR */}
        {nowPlaying && (
          <NowPlayingBar session={nowPlaying} onClose={() => setNowPlaying(null)} />
        )}
      </div>
    </>
  );
}
