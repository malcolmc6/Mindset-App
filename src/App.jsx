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

const VOICE_OPTIONS = {
  coach: { id: "pNInz6obpgDQGcFmaJgB" },
  guide: { id: "21m00Tcm4TlvDq8ikWAM" },
  athlete: { id: "ErXwobaYiN019PkySvjV" },
};

const VOICE_STYLES = [
  { id: "coach", label: "Coach", desc: "Direct & motivating" },
  { id: "guide", label: "Guide", desc: "Soft & grounding" },
  { id: "athlete", label: "Athlete POV", desc: "First-person" },
];

const STEPS = ["Sport", "Event", "Focus", "Vibe", "Generate"];

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
    audio.loop = true; audio.volume = musicVolume;
    audio.play().catch(() => {});
    musicAudioRef.current = audio;
  };
  const stopMusic = () => { if (musicAudioRef.current) { musicAudioRef.current.pause(); musicAudioRef.current = null; } };
  useEffect(() => { if (musicAudioRef.current) musicAudioRef.current.volume = musicVolume; }, [musicVolume]);
  useEffect(() => { if (voiceAudioRef.current) voiceAudioRef.current.volume = voiceVolume; }, [voiceVolume]);

  const startSession = async () => {
    setAudioError(""); setPhase("loading");
    try {
      const voiceId = VOICE_OPTIONS[voiceStyle]?.id || VOICE_OPTIONS.coach.id;
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tts", text: script, voiceId }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = voiceVolume;
      voiceAudioRef.current = audio;
      audio.addEventListener("timeupdate", () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); });
      audio.addEventListener("ended", () => { setPhase("done"); setProgress(100); stopMusic(); });
      setPhase("playing"); startMusic(); audio.play();
    } catch (e) { setAudioError("Couldn't load voiceover. Please try again."); setPhase("ready"); }
  };

  const togglePause = () => {
    if (!voiceAudioRef.current) return;
    if (isPaused) { voiceAudioRef.current.play(); if (musicAudioRef.current) musicAudioRef.current.play(); }
    else { voiceAudioRef.current.pause(); if (musicAudioRef.current) musicAudioRef.current.pause(); }
    setIsPaused(!isPaused);
  };

  const endSession = () => { if (voiceAudioRef.current) { voiceAudioRef.current.pause(); voiceAudioRef.current = null; } stopMusic(); setPhase("done"); setProgress(100); };
  const replay = () => { setPhase("ready"); setProgress(0); setIsPaused(false); voiceAudioRef.current = null; };
  useEffect(() => () => { if (voiceAudioRef.current) voiceAudioRef.current.pause(); stopMusic(); }, []);

  return (
    <div className="player-wrap" style={{ "--tone-color": toneData.color, "--tone-bg": toneData.bg }}>
      <div className="player-bg" />
      {phase === "ready" && (
        <div className="player-center">
          <div className="player-glyph">◎</div>
          <h2 className="player-title">READY{athleteName ? `, ${athleteName.toUpperCase()}` : ""}?</h2>
          <p className="player-sub">Find a quiet space. Press play, close your eyes, and let the voice guide you.</p>
          {audioError && <p className="audio-error">{audioError}</p>}
          <div className="vol-controls">
            <div className="vol-row">
              <span className="vol-label">VOICE</span>
              <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="vol-slider" />
              <span className="vol-pct">{Math.round(voiceVolume * 100)}%</span>
            </div>
            {music !== "none" && (
              <div className="vol-row">
                <span className="vol-label">MUSIC</span>
                <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))} className="vol-slider" />
                <span className="vol-pct">{Math.round(musicVolume * 100)}%</span>
              </div>
            )}
          </div>
          <button className="begin-btn" onClick={startSession}>▶ BEGIN SESSION</button>
        </div>
      )}
      {phase === "loading" && (
        <div className="player-center">
          <div className="loader" />
          <p className="player-sub" style={{ marginTop: "1.5rem" }}>Preparing your voiceover...</p>
        </div>
      )}
      {phase === "playing" && (
        <div className="player-center">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="wave-wrap">
            {[...Array(7)].map((_, i) => <div key={i} className={`wave-bar ${isPaused ? "paused" : ""}`} style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
          <p className="playing-status">{isPaused ? "PAUSED" : "PLAYING"}</p>
          <div className="script-box"><p>{script.slice(0, 200)}...</p></div>
          <div className="vol-controls" style={{ width: "100%", maxWidth: 380 }}>
            <div className="vol-row">
              <span className="vol-label">VOICE</span>
              <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="vol-slider" />
            </div>
            {music !== "none" && (
              <div className="vol-row">
                <span className="vol-label">MUSIC</span>
                <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))} className="vol-slider" />
              </div>
            )}
          </div>
          <div className="playback-btns">
            <button className="pause-btn" onClick={togglePause}>{isPaused ? "▶ RESUME" : "⏸ PAUSE"}</button>
            <button className="end-btn" onClick={endSession}>■ END</button>
          </div>
        </div>
      )}
      {phase === "done" && (
        <div className="player-center">
          <div className="player-glyph" style={{ color: toneData.color }}>✦</div>
          <h2 className="player-title">SESSION COMPLETE</h2>
          <p className="player-sub">Take a breath. Carry that feeling into your performance.</p>
          <div className="script-box done-script"><p>{script}</p></div>
          <div className="done-btns">
            <button className="begin-btn" onClick={replay}>↺ REPLAY</button>
            <button className="outline-btn" onClick={onRestart}>NEW SESSION</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState("");
  const [event, setEvent] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [tone, setTone] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [music, setMusic] = useState("");
  const [athleteName, setAthleteName] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState("setup");

  const sportData = sport ? SPORTS[sport] : null;

  const toggleFocus = (fa) => {
    if (focusAreas.includes(fa)) setFocusAreas(f => f.filter(x => x !== fa));
    else if (focusAreas.length < 3) setFocusAreas(f => [...f, fa]);
  };

  const generateScript = async () => {
    setLoading(true); setError("");
    try {
      const prompt = buildPrompt({ sport, event, focusAreas, tone, voiceStyle, athleteName, personalNotes, sportData });
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("No script returned");
      setScript(text.trim()); setScreen("player");
    } catch (e) { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const restart = () => {
    setScreen("setup"); setStep(0); setSport(""); setEvent(""); setFocusAreas([]);
    setTone(""); setVoiceStyle(""); setMusic(""); setAthleteName(""); setPersonalNotes(""); setScript("");
  };

  const canNext = () => {
    if (step === 0) return !!sport;
    if (step === 1) return !!event;
    if (step === 2) return focusAreas.length > 0;
    if (step === 3) return !!tone && !!voiceStyle && !!music;
    return true;
  };

  const stepTitles = ["CHOOSE YOUR SPORT", "SELECT YOUR EVENT", "WHAT'S YOUR FOCUS?", "SET THE VIBE", "READY TO GO"];
  const stepSubs = [
    "What are you training or competing in?",
    "Pick the specific event or scenario you want to visualize.",
    "Pick up to 3 areas to lock in on.",
    "How do you want to feel during this session?",
    "Add your name and any personal notes, then generate.",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #050608; --surface: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.07); --text: #fff; --muted: rgba(255,255,255,0.35); --accent: #3b82f6; }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .app { display: flex; flex-direction: column; min-height: 100vh; }

        /* HEADER */
        .header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 2rem; border-bottom: 1px solid var(--border); background: rgba(5,6,8,0.95); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 10; }
        .logo { font-family: 'Oswald', sans-serif; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.15em; }
        .logo-dot { color: var(--accent); }

        /* STEP TRACK */
        .step-track { display: flex; align-items: center; gap: 6px; }
        .step-node { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.3s; }
        .step-node.done { background: rgba(59,130,246,0.5); }
        .step-node.active { background: #fff; width: 22px; border-radius: 3px; }

        /* MAIN */
        .main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; min-height: calc(100vh - 56px); }

        /* STEP CONTAINER */
        .step-wrap { width: 100%; max-width: 600px; animation: fadeUp 0.35s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        .step-eyebrow { font-family: 'Oswald', sans-serif; font-size: 0.58rem; letter-spacing: 0.22em; color: var(--accent); font-weight: 400; text-transform: uppercase; margin-bottom: 0.5rem; }
        .step-title { font-family: 'Oswald', sans-serif; font-size: 2.2rem; font-weight: 700; letter-spacing: 0.04em; line-height: 1.05; margin-bottom: 0.5rem; }
        .step-sub { font-size: 0.83rem; color: var(--muted); font-weight: 300; margin-bottom: 2rem; }

        /* SPORT GRID */
        .sport-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .sport-btn {
          background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
          padding: 1.25rem 1rem; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 1rem;
        }
        .sport-btn:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); }
        .sport-btn.active { border-color: var(--accent); background: rgba(59,130,246,0.08); }
        .sport-emoji-wrap { width: 50px; height: 50px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; transition: all 0.2s; flex-shrink: 0; }
        .sport-btn:hover .sport-emoji-wrap { background: rgba(255,255,255,0.08); }
        .sport-btn.active .sport-emoji-wrap { background: rgba(59,130,246,0.15); }
        .sport-info { display: flex; flex-direction: column; gap: 2px; }
        .sport-name { font-family: 'Oswald', sans-serif; font-size: 0.9rem; letter-spacing: 0.06em; color: rgba(255,255,255,0.6); font-weight: 600; text-transform: uppercase; }
        .sport-btn.active .sport-name { color: #fff; }

        /* PILLS */
        .pill-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .pill { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.45rem 1rem; font-family: 'Oswald', sans-serif; font-size: 0.68rem; letter-spacing: 0.07em; color: var(--muted); cursor: pointer; transition: all 0.18s; text-transform: uppercase; font-weight: 400; white-space: nowrap; }
        .pill:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
        .pill.active { background: rgba(59,130,246,0.1); border-color: var(--accent); color: #93c5fd; }

        /* TONE GRID */
        .tone-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 1.5rem; }
        .tone-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.1rem; cursor: pointer; transition: all 0.2s; }
        .tone-btn:hover { border-color: rgba(255,255,255,0.15); }
        .tone-btn.active { border-color: var(--tone-color); background: rgba(0,0,0,0.3); box-shadow: inset 0 0 30px rgba(0,0,0,0.4); }
        .tone-name { font-family: 'Oswald', sans-serif; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; color: rgba(255,255,255,0.45); margin-bottom: 3px; }
        .tone-btn.active .tone-name { color: var(--tone-color); }
        .tone-desc { font-size: 0.68rem; color: rgba(255,255,255,0.2); font-weight: 300; }

        /* VOICE ROW */
        .voice-label { font-family: 'Oswald', sans-serif; font-size: 0.58rem; letter-spacing: 0.2em; color: var(--muted); text-transform: uppercase; margin-bottom: 0.6rem; font-weight: 400; }
        .voice-row { display: flex; gap: 8px; margin-bottom: 1.5rem; }
        .voice-btn { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 0.75rem 0.5rem; cursor: pointer; transition: all 0.2s; text-align: center; }
        .voice-btn:hover { border-color: rgba(255,255,255,0.15); }
        .voice-btn.active { border-color: var(--accent); background: rgba(59,130,246,0.08); }
        .voice-name { font-family: 'Oswald', sans-serif; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; color: rgba(255,255,255,0.4); }
        .voice-btn.active .voice-name { color: #fff; }
        .voice-desc { font-size: 0.62rem; color: rgba(255,255,255,0.2); margin-top: 2px; }

        /* MUSIC ROW */
        .music-row { display: flex; flex-wrap: wrap; gap: 7px; }
        .music-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.4rem 0.9rem; font-family: 'Oswald', sans-serif; font-size: 0.65rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); cursor: pointer; transition: all 0.18s; }
        .music-chip:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
        .music-chip.active { border-color: var(--accent); color: #93c5fd; background: rgba(59,130,246,0.08); }

        /* TEXT INPUT */
        .text-input { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; outline: none; width: 100%; transition: border-color 0.2s; margin-bottom: 1rem; }
        .text-input:focus { border-color: rgba(59,130,246,0.4); }
        .text-input::placeholder { color: rgba(255,255,255,0.18); }
        .textarea-input { min-height: 80px; resize: vertical; margin-bottom: 0; }

        /* NAV */
        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .back-btn { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 0.65rem 1.2rem; color: var(--muted); font-family: 'Oswald', sans-serif; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .back-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .next-btn { background: var(--accent); border: none; border-radius: 8px; padding: 0.65rem 1.8rem; color: #fff; font-family: 'Oswald', sans-serif; font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .next-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
        .next-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .gen-btn { background: var(--accent); border: none; border-radius: 8px; padding: 0.65rem 1.8rem; color: #fff; font-family: 'Oswald', sans-serif; font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .gen-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
        .gen-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .spin { display: inline-block; animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .error-msg { color: #f87171; font-size: 0.78rem; padding: 0.65rem 0.9rem; background: rgba(248,113,113,0.08); border-radius: 8px; border: 1px solid rgba(248,113,113,0.2); margin-top: 1rem; }

        /* PLAYER */
        .player-wrap { flex: 1; min-height: calc(100vh - 56px); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .player-bg { position: absolute; inset: 0; background: var(--tone-bg, #050608); z-index: 0; }
        .player-bg::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, color-mix(in srgb, var(--tone-color) 10%, transparent), transparent 65%); }
        .player-center { position: relative; z-index: 1; text-align: center; padding: 3rem 2rem; max-width: 560px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
        .player-glyph { font-size: 2.5rem; color: var(--accent); }
        .player-title { font-family: 'Oswald', sans-serif; font-size: 2.5rem; font-weight: 700; letter-spacing: 0.08em; color: var(--tone-color, #fff); }
        .player-sub { font-size: 0.85rem; color: var(--muted); line-height: 1.7; font-weight: 300; font-style: italic; max-width: 380px; }
        .audio-error { color: #f87171; font-size: 0.8rem; }
        .vol-controls { width: 100%; display: flex; flex-direction: column; gap: 0.75rem; }
        .vol-row { display: flex; align-items: center; gap: 0.75rem; }
        .vol-label { font-family: 'Oswald', sans-serif; font-size: 0.58rem; letter-spacing: 0.15em; color: var(--muted); min-width: 50px; text-align: left; font-weight: 400; text-transform: uppercase; }
        .vol-slider { flex: 1; accent-color: var(--tone-color, var(--accent)); cursor: pointer; }
        .vol-pct { font-size: 0.68rem; color: var(--muted); min-width: 32px; font-family: 'Oswald', sans-serif; }
        .begin-btn { background: var(--tone-color, var(--accent)); border: none; border-radius: 10px; padding: 0.9rem 2.5rem; color: #fff; font-family: 'Oswald', sans-serif; font-size: 1rem; letter-spacing: 0.15em; font-weight: 600; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
        .begin-btn:hover { opacity: 0.88; transform: scale(1.02); }
        .loader { width: 44px; height: 44px; border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--tone-color, var(--accent)); border-radius: 50%; animation: spin 0.8s linear infinite; }
        .progress-bar { width: 100%; height: 2px; background: rgba(255,255,255,0.08); border-radius: 2px; }
        .progress-fill { height: 100%; background: var(--tone-color, var(--accent)); border-radius: 2px; transition: width 0.5s linear; }
        .wave-wrap { display: flex; align-items: center; gap: 5px; height: 36px; }
        .wave-bar { width: 3px; background: var(--tone-color, var(--accent)); border-radius: 2px; animation: wave 0.9s ease-in-out infinite alternate; opacity: 0.85; }
        .wave-bar.paused { animation-play-state: paused; }
        @keyframes wave { 0% { height: 4px; } 100% { height: 32px; } }
        .playing-status { font-family: 'Oswald', sans-serif; font-size: 0.62rem; letter-spacing: 0.25em; color: var(--muted); font-weight: 400; text-transform: uppercase; }
        .script-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.25rem; font-style: italic; font-size: 0.83rem; line-height: 1.75; color: rgba(255,255,255,0.4); text-align: left; width: 100%; font-weight: 300; }
        .done-script { max-height: 180px; overflow-y: auto; }
        .playback-btns { display: flex; gap: 0.75rem; }
        .pause-btn { background: var(--tone-color, var(--accent)); border: none; border-radius: 8px; padding: 0.7rem 1.5rem; color: #fff; font-family: 'Oswald', sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .end-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem 1.2rem; color: var(--muted); font-family: 'Oswald', sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
        .done-btns { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
        .outline-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 0.9rem 2rem; color: rgba(255,255,255,0.6); font-family: 'Oswald', sans-serif; font-size: 1rem; letter-spacing: 0.15em; font-weight: 600; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
        .outline-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

        @media (max-width: 500px) {
          .sport-grid { grid-template-columns: 1fr 1fr; }
          .step-title { font-size: 1.7rem; }
          .tone-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="app">
        <header className="header">
          <div className="logo">MIND<span className="logo-dot">SET</span></div>
          {screen === "setup" && (
            <div className="step-track">
              {STEPS.map((_, i) => (
                <div key={i} className={`step-node ${i < step ? "done" : i === step ? "active" : ""}`} />
              ))}
            </div>
          )}
        </header>

        {screen === "player" ? (
          <VisualizationPlayer script={script} tone={tone} voiceStyle={voiceStyle} music={music} athleteName={athleteName} onRestart={restart} />
        ) : (
          <div className="main">
            <div className="step-wrap" key={step}>
              <div className="step-eyebrow">Step {step + 1} of {STEPS.length}</div>
              <h2 className="step-title">{stepTitles[step]}</h2>
              <p className="step-sub">{stepSubs[step]}</p>

              {/* STEP 0 — SPORT */}
              {step === 0 && (
                <div className="sport-grid">
                  {Object.entries(SPORTS).map(([key, s]) => (
                    <div key={key} className={`sport-btn ${sport === key ? "active" : ""}`} onClick={() => setSport(key)}>
                      <div className="sport-emoji-wrap">{s.icon}</div>
                      <div className="sport-info">
                        <div className="sport-name">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 1 — EVENT */}
              {step === 1 && sportData && (
                <div className="pill-wrap">
                  {sportData.events.map(ev => (
                    <div key={ev} className={`pill ${event === ev ? "active" : ""}`} onClick={() => setEvent(ev)}>{ev}</div>
                  ))}
                </div>
              )}

              {/* STEP 2 — FOCUS AREAS */}
              {step === 2 && sportData && (
                <div className="pill-wrap">
                  {sportData.focusAreas.map(fa => (
                    <div key={fa} className={`pill ${focusAreas.includes(fa) ? "active" : ""}`} onClick={() => toggleFocus(fa)}>{fa}</div>
                  ))}
                </div>
              )}

              {/* STEP 3 — VIBE */}
              {step === 3 && (
                <>
                  <div className="tone-grid">
                    {TONES.map(t => (
                      <div key={t.id} className={`tone-btn ${tone === t.id ? "active" : ""}`}
                        style={{ "--tone-color": t.color }} onClick={() => setTone(t.id)}>
                        <div className="tone-name">{t.label}</div>
                        <div className="tone-desc">{t.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="voice-label">Voice Style</div>
                  <div className="voice-row">
                    {VOICE_STYLES.map(v => (
                      <div key={v.id} className={`voice-btn ${voiceStyle === v.id ? "active" : ""}`} onClick={() => setVoiceStyle(v.id)}>
                        <div className="voice-name">{v.label}</div>
                        <div className="voice-desc">{v.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="voice-label">Background Music</div>
                  <div className="music-row">
                    {MUSIC_MOODS.map(m => (
                      <div key={m.id} className={`music-chip ${music === m.id ? "active" : ""}`} onClick={() => setMusic(m.id)}>
                        {m.icon} {m.label}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 4 — GENERATE */}
              {step === 4 && (
                <>
                  <input className="text-input" placeholder="Your name (optional) — e.g. Malcolm" value={athleteName} onChange={e => setAthleteName(e.target.value)} />
                  <textarea className="text-input textarea-input"
                    placeholder={sport === "swimming" ? "Anything specific? e.g. I want to nail my underwaters and stay relaxed in the back half..." : "Anything specific you want to focus on?"}
                    value={personalNotes} onChange={e => setPersonalNotes(e.target.value)} />
                  {error && <div className="error-msg">{error}</div>}
                </>
              )}

              <div className="nav-bar">
                <button className="back-btn" onClick={() => setStep(s => s - 1)} style={{ visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
                {step < 4 ? (
                  <button className="next-btn" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Continue →</button>
                ) : (
                  <button className="gen-btn" disabled={loading} onClick={generateScript}>
                    {loading ? <><span className="spin">⟳</span> Generating...</> : "✦ Generate"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
