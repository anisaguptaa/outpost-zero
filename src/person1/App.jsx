import { lazy, useEffect, useLayoutEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, AudioLines, Check, ChevronDown, Rocket, ShieldCheck, Sparkles, Sun, Volume2, X } from 'lucide-react';
import { playerApi } from './api';
import { GAME_CONTRACT_VERSION } from '../shared/contracts';
import MarsPanorama from './MarsPanorama';
import MissionPrep from './MissionPrep';
import MissionExperience from './MissionExperience';
import MissionDebrief from './MissionDebrief';

const MissionWorld = lazy(() => import('../person2/MissionWorld'));

const avatars = [
  { id: 'nova', emoji: '🧑🏽‍🚀', name: 'Nova' }, { id: 'orbit', emoji: '👩🏻‍🚀', name: 'Orbit' },
  { id: 'comet', emoji: '👨🏿‍🚀', name: 'Comet' }, { id: 'aster', emoji: '👩🏽‍🚀', name: 'Aster' },
];
const steps = ['YOUR IDENTITY', 'THE BRIEFING', 'MISSION PREP', 'LIFTOFF'];
const createId = () => globalThis.crypto?.randomUUID?.() ?? `cadet-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
function trackPointer(event) { if (event.pointerType === 'touch') return; const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - .5; const y = (event.clientY - rect.top) / rect.height - .5; event.currentTarget.style.setProperty('--pointer-x', `${(-x * 15).toFixed(1)}px`); event.currentTarget.style.setProperty('--pointer-y', `${(-y * 9).toFixed(1)}px`); }
function resetPointer(event) { event.currentTarget.style.setProperty('--pointer-x', '0px'); event.currentTarget.style.setProperty('--pointer-y', '0px'); }

function Stars() { return <div className="stars" aria-hidden="true">{Array.from({ length: 52 }, (_, i) => <i key={i} style={{ '--x': `${(i * 37 + 3) % 100}%`, '--y': `${(i * 61 + 7) % 100}%`, '--delay': `${(i % 9) * -.7}s`, '--size': `${i % 7 === 0 ? 3 : 1.5}px` }} />)}</div>; }
function Logo({ small = false }) { return <div className={`brand ${small ? 'brand-small' : ''}`}><span className="brand-mark"><span /></span><span>OUTPOST<span className="brand-zero"> ZERO</span></span></div>; }
function TopBar({ page, setPage, onSound, sound }) { return <header className="topbar"><button className="brand-button" onClick={() => setPage(0)} aria-label="Go to beginning"><Logo /></button><div className="top-right"><span className="transmission"><i /> LIVE TRANSMISSION</span><button className="sound-btn" onClick={onSound} aria-label={sound ? 'Mute sound' : 'Enable sound'}>{sound ? <Volume2 size={17}/> : <AudioLines size={17}/>}<span>SOUND {sound ? 'ON' : 'OFF'}</span></button></div></header>; }
function Progress({ page }) { return <div className="progress-row"><span>FLIGHT PLAN</span><div className="progress-track">{steps.map((s, i) => <div key={s} className={`progress-step ${i <= page ? 'active' : ''}`}><i>{i < page ? <Check size={10}/> : `0${i + 1}`}</i><span>{s}</span></div>)}</div><span className="progress-page">0{page + 1}<b> / 04</b></span></div>; }

function Landing({ onStart, onResume }) {
  const [scanned, setScanned] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  return <section className="hero-screen" onPointerMove={trackPointer} onPointerLeave={resetPointer}>
    <MarsPanorama variant="arrival" className="hero-panorama" />
    <div className="hero-vignette" aria-hidden="true" />
    <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> THE FUTURE ISN’T BUILT YET</div><h1>YOUR PLANET.<br/><em>YOUR CREW.</em><br/>YOUR CALL.</h1><p className="hero-intro">A new world is waiting. Your crew is counting on you.<br/>Ready to make history, Cadet?</p><div className="hero-actions"><button className="primary-btn" onClick={onStart}><Rocket size={18}/> BEGIN YOUR MISSION <ArrowRight size={17}/></button>{onResume && <button className="resume-btn" onClick={onResume}>CONTINUE MISSION <ArrowRight size={15}/></button>}</div><div className="hero-meta"><span><ShieldCheck size={15}/> COMMANDER TRAINING</span><i/><span><Sun size={15}/> MARS · 30 SOLS</span></div></div>
    <div className="scene-readout"><span className="scene-signal"><i/> SIGNAL FOUND</span><button className={`location-tip-trigger ${locationOpen ? 'is-open' : ''}`} aria-describedby="utopia-planitia-tip" aria-expanded={locationOpen} onClick={() => setLocationOpen(open => !open)}><strong>UTOPIA PLANITIA</strong><span className="location-tooltip" id="utopia-planitia-tip" role="tooltip">“Plain of Utopia”: a broad plain in Mars’s northern hemisphere. NASA’s Viking 2 lander touched down here in 1976.</span></button><small>47° 38′ N &nbsp; 134° 17′ E · VIKING 2</small><span className="location-source">HISTORICAL LANDING SITE · 1976</span><button className={`scan-button ${scanned ? 'scanned' : ''}`} onClick={() => setScanned(!scanned)}>{scanned ? '✦ MARS SCANNED' : '⌖ SCAN THE HORIZON'}</button>{scanned && <span className="scan-result">One Mars day is called a <b>sol</b>—it lasts 24 hours and 39 minutes.</span>}</div>
    <div className="hero-bottom"><span>EST. 2049</span><div/><span>EARTH ORBITAL COMMAND</span><span className="scroll-cue">EXPLORE THE RED PLANET <ChevronDown size={14}/></span></div>
  </section>;
}

function Setup({ profile, setProfile, onNext, onBack }) {
  const [name, setName] = useState(profile?.callsign || ''); const [avatar, setAvatar] = useState(profile?.avatarId || avatars[0].id);
  const ready = name.trim().length >= 2;
  return <div className="setup-grid"><div className="setup-copy"><div className="eyebrow"><span className="eyebrow-line"/> CADET REGISTRATION · 01</div><h2>What should<br/>we call you<span className="orange">?</span></h2><p className="muted">Every great mission starts with a name on the flight log.</p><label className="field-label" htmlFor="callsign">YOUR CALLSIGN</label><div className="name-field"><span className="hash">#</span><input id="callsign" maxLength="16" placeholder="e.g. Starfox" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && ready && onNext({ callsign: name.trim(), avatarId: avatar })}/><span className="field-count">{name.length}/16</span></div><label className="field-label avatar-label">CHOOSE YOUR FLIGHT SUIT</label><div className="avatar-list">{avatars.map(a => <button key={a.id} className={`avatar-card ${avatar === a.id ? 'selected' : ''}`} onClick={() => setAvatar(a.id)} aria-label={`Choose ${a.name} avatar`}><span className="avatar-emoji">{a.emoji}</span><span>{a.name.toUpperCase()}</span>{avatar === a.id && <i><Check size={11}/></i>}</button>)}</div><div className="form-actions"><button className="back-link" onClick={onBack}><ArrowLeft size={15}/> BACK</button><button className="primary-btn" disabled={!ready} onClick={() => onNext({ callsign: name.trim(), avatarId: avatar })}>CONTINUE TO BRIEFING <ArrowRight size={16}/></button></div></div><div className="identity-preview"><div className="preview-top"><span>FLIGHT RECORD</span><span className="record-dot">● ACTIVE</span></div><div className="preview-window"><MarsPanorama variant="crew" className="preview-panorama"/><span className="preview-avatar">{avatars.find(a => a.id === avatar)?.emoji}</span><span className="preview-star">✦</span></div><div className="record-info"><small>CADET DESIGNATION</small><strong>{name.trim() || 'UNASSIGNED CADET'}</strong><div><span>STATUS</span><b>READY FOR DUTY</b></div><div><span>FLIGHT SUIT</span><b>{avatars.find(a => a.id === avatar)?.name.toUpperCase()} CLASS</b></div></div><div className="preview-stamp"><Sparkles size={13}/> YOUR STORY STARTS HERE</div></div></div>;
}

function Briefing({ profile, mission, onLaunch, onBack }) {
  const [line, setLine] = useState(0); const [launching, setLaunching] = useState(false);
  const dialogue = [{ name: 'COMMANDER VEGA', role: 'MISSION CONTROL', avatar: '🧑🏻‍✈️', text: `Cadet ${profile.callsign}, welcome to the crew. Mars is a world of red dust, thin air, and surprises. We need a commander who can think ahead.` }, ...mission.crew.map(c => ({ name: c.name.toUpperCase(), role: c.role.toUpperCase(), avatar: c.avatar, text: c.line }))];
  const next = () => { if (line < dialogue.length - 1) setLine(line + 1); else { setLaunching(true); onLaunch(); } };
  const d = dialogue[line];
  return <div className="briefing-layout"><div className="briefing-main"><div className="eyebrow"><span className="eyebrow-line"/> INCOMING TRANSMISSION · MARS ORBIT</div><div className="briefing-heading"><div><h2>FIRST<br/><em>LIGHT.</em></h2><p>Humanity’s first steps on Mars start with you.</p></div><div className="mission-seal"><span>MISSION</span><strong>01</strong><i>● CLASSIFIED</i></div></div><div className="transmission-card"><div className="trans-head"><span><AudioLines size={15}/> CREW CHANNEL · SECURE</span><span>00:0{line + 1} <i className="equalizer"><b/><b/><b/><b/></i></span></div><div className="speaker-row"><div className="speaker-avatar">{d.avatar}</div><div><strong>{d.name}</strong><small>{d.role}</small></div><div className="signal-bars"><i/><i/><i/><i/><i/></div></div><p className="dialogue">“{d.text}”</p><div className="trans-bottom"><span><i/> TRANSMISSION STABLE</span><button onClick={next}>{line < dialogue.length - 1 ? 'NEXT TRANSMISSION' : launching ? 'OPENING FLIGHT PREP…' : 'PLAN MY FLIGHT'} <ArrowRight size={14}/></button></div></div><div className="science-note"><span className="science-icon">✳</span><p><b>QUICK SCIENCE</b><br/>A sol is one day on Mars — about 40 minutes longer than an Earth day. Your crew’s 30-sol mission is a little over 30 Earth days.</p></div><button className="back-link briefing-back" onClick={onBack}><ArrowLeft size={15}/> BACK TO YOUR FLIGHT RECORD</button></div>
    <aside className="mission-card"><div className="mission-art"><MarsPanorama variant="orbit" className="mission-panorama"/><span className="art-coord">47° 38′ N<br/>134° 17′ E</span><span className="art-tag">MARS · UTOPIA PLANITIA</span></div><div className="mission-info"><div className="mission-title"><div><small>DESTINATION</small><h3>MARS</h3></div><span className="difficulty"><i/> CADET LEVEL</span></div><p className="mission-description">A distant, rust-red frontier. Your crew’s new home is waiting.</p><div className="mission-facts"><div><span>MISSION LENGTH</span><strong>30 <small>SOLS</small></strong></div><div><span>CREW</span><strong>03 <small>EXPLORERS</small></strong></div></div><div className="objective-title">YOUR FIRST OBJECTIVES <span>01—03</span></div><ul className="objectives">{mission.objectives.map((o, i) => <li key={o}><span>0{i + 1}</span>{o}</li>)}</ul><div className="crew-strip"><span>YOUR CREW</span><div>{mission.crew.map(c => <i key={c.id} title={c.name}>{c.avatar}</i>)}<small>+ YOU</small></div></div></div></aside>
  </div>;
}

function Launch({ profile, onContinue, onRestart }) { return <div className="launch-screen"><MarsPanorama variant="liftoff" className="launch-panorama"/><div className="launch-orbit"><div className="launch-planet"/><div className="launch-ship"><Rocket size={42}/></div><div className="launch-ring"/></div><div className="eyebrow"><span className="eyebrow-line"/> MISSION CONTROL · HANDOFF READY</div><h2>YOU’RE CLEARED<br/>FOR <em>MARS.</em></h2><p>Commander {profile.callsign}, your crew is buckled in.<br/>First Light is yours to lead.</p><div className="launch-status"><span><i/> CREW MANIFEST LOCKED</span><span><i/> MISSION SAVE CREATED</span></div><div className="handoff-card"><div className="handoff-icon"><Rocket size={19}/></div><div><b>OUTPOST ZERO · FIRST LIGHT</b><small>MISSION READY · SOL 01 · CONTRACT {GAME_CONTRACT_VERSION}</small></div><span className="handoff-state">MISSION CONTROL<br/><b>FLIGHT DECK READY</b></span></div><div className="launch-actions"><button className="primary-btn" onClick={onContinue}><Rocket size={17}/> ENTER MISSION CONTROL <ArrowRight size={16}/></button><button className="back-link" onClick={onRestart}>REPLAY OPENING</button><span>YOUR FLIGHT RECORD IS SAVED ON THIS DEVICE</span></div></div>; }

export default function App() {
  const [page, setPage] = useState(0); const [profile, setProfile] = useState(null); const [mission, setMission] = useState(null); const [save, setSave] = useState(null); const [busy, setBusy] = useState(false); const [sound, setSound] = useState(false);
  useEffect(() => { playerApi.getProfile().then(p => p && setProfile(p)); playerApi.getMissionBrief().then(setMission); playerApi.getSave().then(setSave); }, []);
  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [page]);
  const begin = () => setPage(1);
  const saveProfile = async (data) => { const next = { id: createId(), ...data, createdAt: new Date().toISOString() }; await playerApi.saveProfile(next); setProfile(next); setPage(2); };
  const launch = async (preparation) => { if (busy) return; setBusy(true); try { const next = await playerApi.startMission(profile, mission.id, preparation); setSave(next); setPage(4); } finally { setBusy(false); } };
  const resume = () => { if (!save || !profile) { begin(); return; } setPage(save.status === 'complete' ? 6 : save.status === 'active' ? 5 : 0); };
  const continueToPrep = () => setPage(3);
  const saveRun = async (next) => { setSave(next); await playerApi.saveMissionRun(next); };
  const finishRun = async (report) => {
    const base = save || await playerApi.getSave();
    if (!base) return;
    const finalSnapshot = report.finalSnapshot || (report.resources || report.objectiveStates ? report : base.latestSnapshot);
    const completedRun = {
      ...base,
      ...(finalSnapshot ? {
        latestSnapshot: finalSnapshot,
        currentSol: Number.isFinite(finalSnapshot.sol) ? finalSnapshot.sol : base.currentSol,
      } : {}),
    };
    setSave(await playerApi.completeMissionRun(completedRun, { ...report, ...(finalSnapshot ? { finalSnapshot } : {}) }));
    setPage(5);
  };
  const saveSnapshot = async (snapshot) => {
    const now = new Date().toISOString();
    const next = { ...save, currentSol: Number.isFinite(snapshot.sol) ? snapshot.sol : save.currentSol, latestSnapshot: snapshot, status: snapshot.status === 'complete' ? 'complete' : 'active', updatedAt: now };
    if (snapshot.status === 'complete') { await finishRun({ ...snapshot, finalSnapshot: snapshot }); return; }
    await saveRun(next);
  };
  if (!mission) return <main className="app-shell"><Stars/><div className="loading-mark"><Logo/><span>ESTABLISHING UPLINK…</span></div></main>;
  return <main className={`app-shell page-${page}`}><Stars/><TopBar page={page} setPage={setPage} sound={sound} onSound={() => setSound(!sound)}/><div className="app-content">{page === 0 && <Landing onStart={begin} onResume={save ? resume : null}/ >}{page > 0 && page < 5 && <Progress page={page - 1}/ >}{page === 1 && <Setup profile={profile} setProfile={setProfile} onNext={saveProfile} onBack={() => setPage(0)}/ >}{page === 2 && <Briefing profile={profile || { callsign: 'CADET' }} mission={mission} onLaunch={continueToPrep} onBack={() => setPage(1)}/ >}{page === 3 && <MissionPrep profile={profile || { callsign: 'CADET' }} mission={mission} busy={busy} onLaunch={launch} onBack={() => setPage(2)}/ >}{page === 4 && <Launch profile={profile || { callsign: 'CADET' }} onContinue={() => setPage(5)} onRestart={() => setPage(0)}/ >}{page === 5 && save && <MissionExperience profile={profile || { callsign: 'CADET' }} mission={mission} run={save} onUpdateRun={saveRun} onSnapshot={saveSnapshot} onComplete={finishRun} onExit={() => setPage(4)} WorldModule={MissionWorld}/ >}{page === 6 && save && <MissionDebrief profile={profile || { callsign: 'CADET' }} mission={mission} run={save} onReturn={() => setPage(4)}/ >}</div><footer className="site-footer"><Logo small/><span>AN OUTPOST ZERO MISSION · BUILD 0.3</span><span>FOR THE CURIOUS, THE BRAVE & THE FUTURE</span></footer></main>;
}
