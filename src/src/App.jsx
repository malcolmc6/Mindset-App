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
  { id: "none", label: "No Music", icon: "🔇", url: null },
  { id: "ambient", label: "Ambient", icon: "🌊", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d041.mp3" },
  { id: "nature", label: "Nature Sounds", icon: "🌿", url: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_e521341fce.mp3" },
  { id: "focus", label: "Deep Focus", icon: "🎯", url: "https://cdn.pixabay.com/download/audio/2023/03/09/audio_2e5a3c4b71.mp3" },
];

const VOICE_OPTIONS = {
  coach: { id: "pNInz6obpgDQGcFmaJgB", name: "Adam" },
  guide: { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
  athlete: { id: "ErXwobaYiN019PkySvjV", name: "Antoni" },
};

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
1. Arrival (grounding & arriving at the moment) — 2-3 sentences
2. The Performance (vivid, sensory-rich visualization of executing perfectly) — main body
3. The Feeling (the emotional payoff, the result, how it feels) — closing 2-3 sentences

Use rich sensory language. Make it feel personal, not generic. Do NOT use headers or labels in the output — just flowing prose. Write it as something to be read aloud.`;
}

function StepSport({ value, onChange }) {
  return (
    <div className="step-content">
      <h2 className="step-title">What sport are you visualizing for?</h2>
      <div className="sport-grid">
        {Object.entries(SPORTS).map(([key, s]) => (
          <button key={key} className={`sport-card ${value === key ? "selected" : ""}`} onClick={() => onChange(key)}>
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
        <input className="field-input" placeholder="e.g. Alex" value={values.athleteName} onChange={e => onChange({ ...values, athleteName: e.target.value })} />
      </div>
      <div className="field-group">
        <label className="field-label">Event / Scenario</label>
        <div className="pill-grid">
          {sportData.events.map(ev => (
            <button key={ev} className={`pill ${values.event === ev ? "selected" : ""}`} onClick={() => onChange({ ...values, event: ev })}>{ev}</button>
          ))}
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">Focus areas <span className="hint">(pick up to 3)</span></label>
        <div className="pill-grid">
          {sportData.focusAreas.map(fa => {
            const sel = values.focusAreas.includes(fa);
            return (
              <button key={fa} className={`pill ${sel ? "selected" : ""}`} onClick={() => {
                if (sel) onChange({ ...values, focusAreas: values.focusAreas.filter(x => x !== fa) });
                else if (values.focusAreas.length < 3) onChange({ ...values, focusAreas: [...values.focusAreas, fa] });
              }}>{fa}</button>
            );
          })}
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">Anything specific you want to visualize? <span className="hint">(optional)</span></label>
        <textarea className="field-input field-textarea"
          placeholder={sport === "swimming" ? "e.g. I want to nail my underwater off the walls..." : "e.g. I want to feel locked in from the first whistle..."}
          value={values.personalNotes} onChange={e => onChange({ ...values, personalNotes: e.target.value })} />
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
          <button key={t.id} className={`tone-card ${values.tone === t.id ? "selected" : ""}`}
            style={{ "--tone-color": t.color, "--tone-bg": t.bg }} onClick={() => onChange({ ...values, tone: t.id })}>
            <span className="tone-label">{t.label}</span>
            <span className="tone-desc">{t.desc}</span>
          </button>
        ))}
      </div>
      <div className="field-group" style={{ marginTop: "2rem" }}>
        <label className="field-label">Voice style</label>
        <div className="voice-grid">
          {VOICE_STYLES.map(v => (
            <button key={v.id} className={`voice-card ${values.voiceStyle === v.id ? "selected" : ""}`} onClick={() => onChange({ ...values, voiceStyle: v.id })}>
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
            <button key={m.id} className={`music-pill ${values.music === m.id ? "selected" : ""}`} onClick={() => onChange({ ...values, music: m.id })}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualizationPlayer({ script, tone, voiceStyle, music, athleteName, onRestart }) {
  const [phase, setPhase] = useState("ready");
  const [audioError, setAudioError] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.9);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [progress, setProgress] = useState(0);
  const voiceAudioRef = useRef(null);
  const musicAudioRef = useRef(null);
  const toneData = TONES.find(t => t.id === tone);
  const musicData = MUSIC_MOODS.find(m => m.id === music);

  const startMusic = () => {
    if (!musicData?.url) return;
    const audio = new Audio(musicData.url);
    audio.loop = true;
    audio.volume = musicVolume;
    audio.play().catch(() => {});
    musicAudioRef.current = audio;
  };

  const stopMusic = () => {
    if (musicAudioRef.current) { musicAudioRef.current.pause(); musicAudioRef.current = null; }
  };

  useEffect(() => { if (musicAudioRef.current) musicAudioRef.current.volume = musicVolume; }, [musicVolume]);
  useEffect(() => { if (voiceAudioRef.current) voiceAudioRef.current.volume = voiceVolume; }, [voiceVolume]);

  const startSession = async () => {
    setAudioError("");
    setPhase("loading");
    try {
      const voiceId = VOICE_OPTIONS[voiceStyle]?.id || VOICE_OPTIONS.coach.id;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tts", text: script, voiceId }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = voiceVolume;
      voiceAudioRef.current = audio;
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
      });
      audio.addEventListener("ended", () => { setPhase("done"); setProgress(100); stopMusic(); });
      setPhase("playing");
      startMusic();
      audio.play();
    } catch (e) {
      setAudioError("Couldn't load voiceover. Please try again.");
      setPhase("ready");
    }
  };

  const togglePause = () => {
    if (!voiceAudioRef.current) return;
    if (isPaused) {
      voiceAudioRef.current.play();
      if (musicAudioRef.current) musicAudioRef.current.play();
    } else {
      voiceAudioRef.current.pause();
      if (musicAudioRef.current) musicAudioRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  const endSession = () => {
    if (voiceAudioRef.current) { voiceAudioRef.current.pause(); voiceAudioRef.current = null; }
    stopMusic();
    setPhase("done");
    setProgress(100);
  };

  const replay = () => { setPhase("ready"); setProgress(0); setIsPaused(false); voiceAudioRef.current = null; };

  useEffect(() => () => { if (voiceAudioRef.current) voiceAudioRef.current.pause(); stopMusic(); }, []);

  return (
    <div className="player-wrap" style={{ "--tone-color": toneData.color, "--tone-bg": toneData.bg }}>
      <div className="player-bg" />
      {phase === "ready" && (
        <div className="player-ready">
          <div className="ready-icon">🎯</div>
          <h2 className="ready-title">Ready{athleteName ? `, ${athleteName}` : ""}?</h2>
          <p className="ready-sub">Find a quiet space. Press play, close your eyes, and let the voice guide you.</p>
          {audioError && <p className="audio-error">{audioError}</p>}
          <div className="volume-controls">
            <div className="vol-row">
              <span className="vol-label">🎙️ Voice</span>
              <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="vol-slider" />
              <span className="vol-pct">{Math.round(voiceVolume * 100)}%</span>
            </div>
            {music !== "none" && (
              <div className="vol-row">
                <span className="vol-label">🎵 Music</span>
                <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))} className="vol-slider" />
                <span className="vol-pct">{Math.round(musicVolume * 100)}%</span>
              </div>
            )}
          </div>
          <button className="play-btn" onClick={startSession}>▶ Begin Visualization</button>
        </div>
      )}
      {phase === "loading" && (
        <div className="player-ready">
          <div className="loading-spinner" />
          <p className="ready-sub" style={{ marginTop: "1.5rem" }}>Preparing your voiceover...</p>
        </div>
      )}
      {phase === "playing" && (
        <div className="player-active">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="now-playing">
            <div className="sound-wave">
              {[...Array(5)].map((_, i) => <div key={i} className={`bar ${isPaused ? "paused" : ""}`} style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
            <p className="playing-label">{isPaused ? "Paused" : "Playing your visualization..."}</p>
          </div>
          <div className="script-preview"><p>{script.slice(0, 180)}...</p></div>
          <div className="volume-controls">
            <div className="vol-row">
              <span className="vol-label">🎙️</span>
              <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="vol-slider" />
            </div>
            {music !== "none" && (
              <div className="vol-row">
                <span className="vol-label">🎵</span>
                <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))} className="vol-slider" />
              </div>
            )}
          </div>
          <div className="playback-controls">
            <button className="ctrl-btn" onClick={togglePause}>{isPaused ? "▶ Resume" : "⏸ Pause"}</button>
            <button className="stop-btn" onClick={endSession}>■ End</button>
          </div>
        </div>
      )}
      {phase === "done" && (
        <div className="player-done">
          <div className="done-icon">✨</div>
          <h2 className="done-title">Session Complete</h2>
          <p className="done-sub">Take a breath. Carry that feeling into your performance.</p>
          <div className="done-script"><p>{script}</p></div>
          <div className="done-actions">
            <button className="play-btn" onClick={replay}>↺ Replay</button>
            <button className="secondary-btn" onClick={onRestart}>✦ New Session</button>
          </div>
        </div>
      )}
    </div>
  );
}

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
      const prompt = buildPrompt({ sport, event: profile.event, focusAreas: profile.focusAreas, tone: vibe.tone, voiceStyle: vibe.voiceStyle, athleteName: profile.athleteName, personalNotes: profile.personalNotes, sportData: SPORTS[sport] });
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
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

  const restart = () => { setStep(0); setSport("swimming"); setProfile({ athleteName: "", event: "", focusAreas: [], personalNotes: "" }); setVibe({ tone: "calm", voiceStyle: "coach", music: "ambient" }); setScript(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #08090d; --surface: #11131a; --border: rgba(255,255,255,0.08); --text: #e8eaf0; --muted: #6b7280; --accent: #4a9eff; --radius: 14px; }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .app { min-height: 100vh; display: flex; flex-direction: column; }
        .header { padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(8,9,13,0.85); backdrop-filter: blur(12px); z-index: 10; }
        .logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.06em; }
        .logo span { color: var(--accent); }
        .step-indicators { display: flex; gap: 0.5rem; align-items: center; }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all 0.3s; }
        .step-dot.active { background: var(--accent); width: 24px; border-radius: 4px; }
        .step-dot.done { background: rgba(74,158,255,0.4); }
        .main { flex: 1; max-width: 680px; margin: 0 auto; width: 100%; padding: 2.5rem 1.5rem 4rem; }
        .step-content { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .step-title { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.04em; margin-bottom: 0.4rem; }
        .step-sub { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
        .sport-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem; }
        .sport-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem 1rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; transition: all 0.2s; color: var(--text); }
        .sport-card:hover { border-color: rgba(74,158,255,0.3); background: rgba(74,158,255,0.05); }
        .sport-card.selected { border-color: var(--accent); background: rgba(74,158,255,0.1); box-shadow: 0 0 0 1px rgba(74,158,255,0.3); }
        .sport-icon { font-size: 2rem; } .sport-label { font-size: 0.9rem; font-weight: 500; }
        .field-group { margin-top: 1.8rem; }
        .field-label { display: block; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.75rem; }
        .hint { text-transform: none; letter-spacing: 0; font-weight: 300; font-size: 0.75rem; color: rgba(107,114,128,0.7); }
        .field-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 0.75rem 1rem; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
        .field-input:focus { border-color: rgba(74,158,255,0.4); }
        .field-textarea { min-height: 80px; resize: vertical; }
        .pill-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .pill { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.4rem 0.9rem; font-size: 0.82rem; color: var(--muted); cursor: pointer; transition: all 0.18s; white-space: nowrap; }
        .pill:hover { border-color: rgba(74,158,255,0.3); color: var(--text); }
        .pill.selected { background: rgba(74,158,255,0.12); border-color: var(--accent); color: var(--accent); }
        .tone-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; margin-top: 1rem; }
        .tone-card { border: 1px solid var(--border); border-radius: var(--radius); padding: 1.2rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.3rem; background: var(--surface); transition: all 0.2s; text-align: left; }
        .tone-card:hover, .tone-card.selected { border-color: var(--tone-color); background: var(--tone-bg); }
        .tone-card.selected { box-shadow: 0 0 0 1px var(--tone-color); }
        .tone-label { font-weight: 500; font-size: 0.9rem; color: var(--text); }
        .tone-card.selected .tone-label { color: var(--tone-color); }
        .tone-desc { font-size: 0.78rem; color: var(--muted); font-style: italic; }
        .voice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .voice-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 0.9rem 0.75rem; cursor: pointer; transition: all 0.2s; text-align: center; display: flex; flex-direction: column; gap: 0.25rem; }
        .voice-card:hover, .voice-card.selected { border-color: var(--accent); background: rgba(74,158,255,0.07); }
        .voice-label { font-size: 0.85rem; font-weight: 500; display: block; color: var(--text); }
        .voice-desc { font-size: 0.72rem; color: var(--muted); display: block; }
        .music-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .music-pill { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.45rem 1rem; font-size: 0.82rem; color: var(--muted); cursor: pointer; transition: all 0.18s; }
        .music-pill.selected { border-color: var(--accent); color: var(--accent); background: rgba(74,158,255,0.08); }
        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .nav-back { background: none; border: 1px solid var(--border); border-radius: 10px; padding: 0.7rem 1.3rem; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; }
        .nav-back:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
        .nav-next { background: var(--accent); border: none; border-radius: 10px; padding: 0.7rem 1.8rem; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .nav-next:hover:not(:disabled) { background: #3a8ef0; transform: translateY(-1px); }
        .nav-next:disabled { opacity: 0.4; cursor: not-allowed; }
        .spin { display: inline-block; animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .error-msg { color: #ff6b6b; font-size: 0.82rem; margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(255,75,75,0.08); border-radius: 8px; border: 1px solid rgba(255,75,75,0.2); }
        .audio-error { color: #ff6b6b; font-size: 0.82rem; margin-bottom: 1rem; }
        .player-wrap { min-height: 70vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); margin-top: 1rem; }
        .player-bg { position: absolute; inset: 0; background: var(--tone-bg, #0a1628); z-index: 0; }
        .player-bg::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--tone-color) 12%, transparent), transparent 70%); }
        .player-ready, .player-active, .player-done { position: relative; z-index: 1; text-align: center; padding: 3rem 2rem; max-width: 560px; width: 100%; }
        .ready-icon, .done-icon { font-size: 3rem; margin-bottom: 1rem; }
        .ready-title, .done-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; letter-spacing: 0.04em; margin-bottom: 0.75rem; color: var(--tone-color, var(--text)); }
        .ready-sub, .done-sub { color: var(--muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; font-style: italic; }
        .volume-controls { width: 100%; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .vol-row { display: flex; align-items: center; gap: 0.75rem; }
        .vol-label { font-size: 0.85rem; color: var(--muted); min-width: 70px; text-align: left; }
        .vol-slider { flex: 1; accent-color: var(--tone-color, var(--accent)); cursor: pointer; }
        .vol-pct { font-size: 0.75rem; color: var(--muted); min-width: 35px; }
        .play-btn { background: var(--tone-color, var(--accent)); border: none; border-radius: 12px; padding: 0.9rem 2.2rem; color: #fff; font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; }
        .play-btn:hover { transform: scale(1.03); }
        .loading-spinner { width: 48px; height: 48px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--tone-color, var(--accent)); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
        .player-active { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 2.5rem 2rem; }
        .progress-bar { width: 100%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; }
        .progress-fill { height: 100%; background: var(--tone-color, var(--accent)); border-radius: 2px; transition: width 0.5s linear; }
        .now-playing { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .playing-label { color: var(--muted); font-size: 0.85rem; font-style: italic; }
        .sound-wave { display: flex; align-items: center; gap: 4px; height: 32px; }
        .bar { width: 4px; background: var(--tone-color, var(--accent)); border-radius: 2px; animation: wave 1s ease-in-out infinite alternate; }
        .bar.paused { animation-play-state: paused; }
        @keyframes wave { 0% { height: 4px; opacity: 0.4; } 100% { height: 28px; opacity: 1; } }
        .script-preview { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.2rem; font-style: italic; font-size: 0.85rem; line-height: 1.7; color: var(--muted); text-align: left; width: 100%; }
        .playback-controls { display: flex; gap: 1rem; align-items: center; }
        .ctrl-btn { background: var(--tone-color, var(--accent)); border: none; border-radius: 10px; padding: 0.7rem 1.5rem; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .ctrl-btn:hover { transform: scale(1.03); }
        .stop-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.7rem 1.2rem; color: var(--muted); font-size: 0.85rem; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .done-script { margin: 1.5rem 0; padding: 1.5rem; background: rgba(255,255,255,0.04); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); text-align: left; max-height: 200px; overflow-y: auto; font-style: italic; font-size: 0.88rem; line-height: 1.7; color: var(--muted); }
        .done-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .secondary-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.9rem 2rem; color: var(--text); font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; }
        .secondary-btn:hover { background: rgba(255,255,255,0.1); }
        @media (max-width: 500px) { .sport-grid { grid-template-columns: repeat(2, 1fr); } .tone-grid { grid-template-columns: 1fr 1fr; } .voice-grid { grid-template-columns: 1fr; } .step-title { font-size: 1.7rem; } }
      `}</style>
      <div className="app">
        <header className="header">
          <div className="logo">MIND<span>SET</span></div>
          {step < 3 && (
            <div className="step-indicators">
              {STEPS.slice(0, 3).map((_, i) => <div key={i} className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`} />)}
            </div>
          )}
        </header>
        <main className="main">
          {step === 0 && <StepSport value={sport} onChange={setSport} />}
          {step === 1 && <StepProfile sport={sport} values={profile} onChange={setProfile} />}
          {step === 2 && <StepTone values={vibe} onChange={setVibe} />}
          {step === 3 && script && <VisualizationPlayer script={script} tone={vibe.tone} voiceStyle={vibe.voiceStyle} music={vibe.music} athleteName={profile.athleteName} onRestart={restart} />}
          {step < 3 && (
            <>
              {error && <div className="error-msg">{error}</div>}
              <div className="nav-bar">
                <button className="nav-back" onClick={() => setStep(s => s - 1)} style={{ visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
                {step < 2 ? (
                  <button className="nav-next" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Continue →</button>
                ) : (
                  <button className="nav-next" disabled={loading || !canNext()} onClick={generateScript}>
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
// v2
