import { Suspense, useEffect, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, BookOpen, Check, Compass, Radio, Rocket, Save, Users } from 'lucide-react';
import MarsPanorama from './MarsPanorama';
import { SCIENCE_SOURCES } from '../shared/scienceSources';

const panels = [
  { id: 'world', label: 'MARS SURFACE', icon: Compass },
  { id: 'crew', label: 'CREW CHANNEL', icon: Users },
  { id: 'science', label: 'FIELD NOTES', icon: BookOpen },
  { id: 'log', label: 'FLIGHT LOG', icon: Activity },
];

const learningCards = [
  {
    id: 'utopia-planitia',
    title: 'A landing place with a history',
    body: 'Utopia Planitia is a broad plain in Mars’s northern hemisphere. NASA’s Viking 2 lander touched down there in 1976.',
    source: SCIENCE_SOURCES.viking2,
  },
  {
    id: 'space-weather',
    title: 'The Sun can change the mission',
    body: 'Solar flares and other space-weather events can affect spacecraft and communications. DONKI tracks events; it is research context, not a personal crew dose forecast.',
    source: SCIENCE_SOURCES.donki,
  },
  {
    id: 'space-farming',
    title: 'A greenhouse is a tiny ecosystem',
    body: 'Growing food far from Earth connects plant needs, nutrition, and careful use of limited resources. Explore CSA activities about food production in space.',
    source: SCIENCE_SOURCES.csaFood,
  },
  {
    id: 'radlab-measurements',
    title: 'Measurements need context',
    body: 'RadLab shares spaceflight dosimetry measurements. ISS readings help explain units and variation, but they are not Mars-surface measurements.',
    source: SCIENCE_SOURCES.radlab,
  },
];

function formatStamp(value) {
  if (!value) return 'JUST NOW';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MarsArrival({ profile, onLanded }) {
  const [phase, setPhase] = useState('ready');
  useEffect(() => {
    if (phase !== 'descent') return undefined;
    const timer = window.setTimeout(() => setPhase('touchdown'), 7200);
    return () => window.clearTimeout(timer);
  }, [phase]);
  const landed = phase === 'touchdown';
  return <section className={`arrival-scene arrival-${phase}`} aria-label="Mars arrival sequence">
    <div className="arrival-stars" aria-hidden="true" />
    <div className="arrival-sky"><span className="arrival-moon" /><span className="arrival-horizon-glow" /></div>
    <div className="arrival-ridge arrival-ridge-far" /><div className="arrival-ridge arrival-ridge-near" />
    <div className="arrival-dust arrival-dust-one" /><div className="arrival-dust arrival-dust-two" />
    <div className="arrival-lander"><div className="lander-cabin"><i /><b /></div><div className="lander-leg leg-left"/><div className="lander-leg leg-right"/><span className="lander-flame"/></div>
    <div className="arrival-hud"><span><i/> FIRST LIGHT · DESCENT CAMERA</span><b>{phase === 'ready' ? 'MARS ORBIT · APPROACH VECTOR' : landed ? 'TOUCHDOWN · UTOPIA PLANITIA' : 'ENTRY → POWERED DESCENT'}</b><small>FICTIONAL HUMAN-MISSION TRAINING SCENARIO</small></div>
    <div className="arrival-copy"><span className="arrival-kicker">{landed ? 'THE DUST SETTLES' : phase === 'ready' ? 'A NEW WORLD BELOW' : 'HOLD STEADY, COMMANDER'}</span><h2>{landed ? 'MARS IS<br/><em>UNDERFOOT.</em>' : phase === 'ready' ? 'TIME TO<br/><em>COME HOME.</em>' : 'THROUGH THE<br/><em>RED SKY.</em>'}</h2><p>{landed ? `Touchdown confirmed. ${profile.callsign}, your crew is ready to cycle the airlock together.` : phase === 'ready' ? 'Your fictional crew lander is lined up over Utopia Planitia. Start the descent and watch the surface rise to meet you.' : 'The heat shield glows. Guidance checks the landing area; the descent engines slow the lander for touchdown.'}</p>
      {phase === 'ready' && <button className="primary-btn" onClick={() => setPhase('descent')}><Rocket size={17}/> BEGIN DESCENT <ArrowRight size={16}/></button>}
      {phase === 'descent' && <button className="arrival-skip" onClick={() => setPhase('touchdown')}>SKIP TO TOUCHDOWN <ArrowRight size={14}/></button>}
      {landed && <button className="primary-btn" onClick={onLanded}><ArrowRight size={16}/> CYCLE THE AIRLOCK <ArrowRight size={16}/></button>}
    </div>
    <div className="arrival-sequence"><span className={phase !== 'ready' ? 'done' : 'current'}>01 ENTRY</span><i/><span className={landed ? 'done' : phase === 'descent' ? 'current' : ''}>02 DESCENT</span><i/><span className={landed ? 'current' : ''}>03 TOUCHDOWN</span><i/><span>04 AIRLOCK</span></div>
  </section>;
}

function FirstSurfaceWalk({ profile, mission, run, onUpdateRun }) {
  const [sealPulse, setSealPulse] = useState(false);
  const decide = (choice) => {
    if (run.firstSurfaceDecision) return;
    const now = new Date().toISOString();
    const narrative = choice === 'survey' ? 'Mika sends the rover camera ahead. The crew studies a route map before stepping outside.' : 'The crew follows the marked training route slowly, keeping the habitat and each other in sight.';
    const entry = { id: `surface-choice-${Date.now()}`, type: 'surface-decision', sol: run.currentSol, createdAt: now, text: `First surface-walk plan: ${narrative}` };
    onUpdateRun({ ...run, firstSurfaceDecision: choice, logEntries: [entry, ...(run.logEntries || [])], updatedAt: now });
  };
  const checkSeal = () => {
    if (run.habitatSealChecked) return;
    setSealPulse(true);
    const now = new Date().toISOString();
    const entry = { id: `seal-check-${Date.now()}`, type: 'habitat-check', sol: run.currentSol, createdAt: now, text: 'Airlock seal check complete. Crew confirmed the hatch is ready for a supervised first walk.' };
    onUpdateRun({ ...run, habitatSealChecked: true, logEntries: [entry, ...(run.logEntries || [])], updatedAt: now });
  };
  const decision = run.firstSurfaceDecision;
  return <section className="surface-mission">
    <div className="surface-mission-art"><MarsPanorama variant="crew" className="surface-backdrop"/><div className="surface-art-vignette"/><div className="surface-art-top"><span><i/> SURFACE WALK · SOL {run.currentSol}</span><span>TRAINING SCENARIO</span></div><div className="surface-landmarks"><span className="surface-habitat"><i/><b>HABITAT</b></span><span className="surface-rover"><i>✦</i><b>ROVER</b></span><span className={`surface-route ${decision ? 'route-lit' : ''}`} /><span className="surface-cadet">{profile.avatarId === 'orbit' || profile.avatarId === 'aster' ? '👩🏻‍🚀' : '🧑🏽‍🚀'}</span></div><div className="surface-art-caption"><b>UTOPIA PLANITIA</b><span>A broad plain in Mars’s northern hemisphere</span></div></div>
    <div className="surface-mission-body"><div className="surface-step-rail"><span>FIRST WALK</span><strong>{run.habitatSealChecked ? '02' : decision ? '02' : '01'} <small>/ 02</small></strong><div><i style={{width: run.habitatSealChecked ? '100%' : decision ? '50%' : '0%'}}/></div><span>{run.habitatSealChecked ? 'READY' : decision ? 'AIRLOCK CHECK' : 'ROUTE PLAN'}</span></div>
      <div className="surface-task-copy"><span className="eyebrow"><span className="eyebrow-line"/> YOUR FIRST SURFACE WALK</span><h2>{run.habitatSealChecked ? <>YOU’RE READY<br/><em>TO EXPLORE.</em></> : decision ? <>CHECK THE<br/><em>HABITAT SEAL.</em></> : <>HOW WILL YOU<br/><em>SCOUT THE ROUTE?</em></>}</h2>
        {!decision ? <><p>Your crew is inside the lander. Before the first walk, choose how to check the ground between the airlock and the habitat marker.</p><div className="surface-choice-grid"><button className="surface-choice" onClick={() => decide('survey')}><span className="choice-icon">⌖</span><b>MAP IT WITH THE ROVER</b><span>Ask Mika to photograph the route first. You’ll see the ground before the crew steps out.</span><small>CAREFUL RECON · TAKES A MOMENT</small></button><button className="surface-choice" onClick={() => decide('walk')}><span className="choice-icon">➜</span><b>FOLLOW THE MARKERS</b><span>Stay together and walk slowly along the clearly marked training route.</span><small>CREW CHECK-IN · STAY IN SIGHT</small></button></div></> : run.habitatSealChecked ? <><p>{decision === 'survey' ? 'Mika’s route images are in the flight log. The crew checked the hatch together; your first walk is ready.' : 'Your crew’s marked-route plan is in the flight log. The hatch check is complete and everyone is ready.'}</p><div className="surface-complete"><Check size={18}/><span><b>FIRST WALK PREP COMPLETE</b><small>Route plan and habitat check saved on this device.</small></span></div><p className="surface-next-hint">Your first outpost shift is ready. Step inside and help the crew bring the habitat online.</p><button className="primary-btn" onClick={() => onUpdateRun({ ...run, worldUnlocked: true, updatedAt: new Date().toISOString() })}><ArrowRight size={16}/> ENTER THE OUTPOST</button></> : <><div className="surface-feedback"><span className="feedback-avatar">{decision === 'survey' ? '🤖' : '👩🏻‍🚀'}</span><div><b>{decision === 'survey' ? 'ROVER CAMERA · ROUTE MAP RECEIVED' : 'CREW CHANNEL · ROUTE PLAN CONFIRMED'}</b><p>{decision === 'survey' ? 'NASA’s Perseverance rover used Terrain Relative Navigation during landing: it compared images with a stored map to help avoid hazards. Your crew’s route survey here is a fictional training activity inspired by careful mapping.' : 'Your crew will stay together and use the visible markers as a simple route guide. For real Mars exploration, teams plan routes from maps and spacecraft data; this walk is a fictional training scenario.'}</p></div></div><p className="surface-instruction">Now tap the hatch indicator in the scene to run the habitat seal check.</p><button className={`seal-hotspot ${sealPulse ? 'pulse' : ''}`} onClick={checkSeal} aria-label="Check the habitat airlock seal"><span>◉</span> RUN AIRLOCK SEAL CHECK <ArrowRight size={15}/></button></>}
      </div>
    </div>
    <div className="surface-science-strip"><span>✳ SCIENCE, IN THE STORY</span><p>A habitat needs to keep its inside environment protected. This seal check is a simplified game interaction, not a real spacecraft procedure.</p><small>NASA RESEARCH CONTEXT · TERRAIN RELATIVE NAVIGATION</small></div>
  </section>;
}

// Person 2 replaces this isolated slot with the Phaser world component.
// Expected bridge: <MarsWorld mission={mission} run={run} onSnapshot={onSnapshot} onComplete={onComplete} />
function WorldModuleSlot({ mission, run }) {
  const readings = run.latestSnapshot?.resources || [];
  const telemetryReady = readings.length > 0;
  return <section className="world-module" aria-label="Mars mission world module">
    <div className="world-viewport" id="mars-world-root" data-world-module="pending">
      <MarsPanorama variant="crew" className="world-panorama" />
      <div className="world-shade" />
      <div className="world-scanline" aria-hidden="true" />
      <div className="world-topline"><span><i /> SURFACE UPLINK</span><span>MISSION {mission.id.toUpperCase()}</span></div>
      {run.preparation && <div className="mission-plan-chip"><small>COMMANDER’S FLIGHT PLAN</small><b>{run.preparation.focusLabel}</b><span>{(run.preparation.payloadLabels || []).join(' · ')}</span></div>}
      <div className="world-center-status">
        <div className="world-signal-icon"><Radio size={23} /></div>
        <span className="world-overline">WORLD MODULE LINK</span>
        <h2>{telemetryReady ? 'TELEMETRY RECEIVED' : 'STANDING BY, COMMANDER'}</h2>
        <p>{telemetryReady ? 'The surface module has sent its latest readings.' : 'Your crew is ready. The surface world will appear here when its module connects.'}</p>
        <span className={`world-connection ${telemetryReady ? 'connected' : ''}`}><i />{telemetryReady ? `LAST CONTACT · ${formatStamp(run.latestSnapshot.capturedAt)}` : 'WAITING FOR WORLD MODULE'}</span>
      </div>
      <div className="world-bottomline"><span>UTOPIA PLANITIA · MARS</span><span>FEED {telemetryReady ? 'LIVE' : 'PENDING'}</span></div>
    </div>
    <div className="telemetry-rail">
      <div className="telemetry-heading"><div><small>FLIGHT TELEMETRY</small><strong>{telemetryReady ? 'LATEST READINGS' : 'NO READINGS YET'}</strong></div><span className={telemetryReady ? 'telemetry-live' : ''}><i /> {telemetryReady ? 'WORLD LINK' : 'STANDBY'}</span></div>
      {telemetryReady ? <div className="telemetry-readings">{readings.map(reading => <div className="telemetry-reading" key={reading.id}><span>{reading.label}</span><strong>{reading.value} <small>{reading.unit}</small></strong><em>{reading.sourceKind === 'measured' ? 'MEASURED' : reading.sourceKind === 'derived' ? 'DERIVED' : 'SCENARIO'}</em></div>)}</div> : <p className="telemetry-empty">Resource readings will appear after the world module reports them. OUTPOST ZERO keeps measured, calculated, and story-scenario values clearly labeled.</p>}
      <div className="telemetry-footer"><span>MISSION SOL</span><strong>{run.currentSol} <small>/ {mission.durationDays}</small></strong></div>
    </div>
  </section>;
}

function CrewPanel({ mission, run, onUpdateRun }) {
  const [selected, setSelected] = useState(mission.crew[0]?.id);
  const selectedCrew = mission.crew.find(member => member.id === selected) || mission.crew[0];
  const checkedIn = run.crewCheckIns || [];
  const checkIn = () => {
    if (!selectedCrew || checkedIn.includes(selectedCrew.id)) return;
    const entry = { id: `crew-${selectedCrew.id}-${Date.now()}`, type: 'crew-check-in', sol: run.currentSol, createdAt: new Date().toISOString(), text: `Checked in with ${selectedCrew.name}.` };
    onUpdateRun({ ...run, crewCheckIns: [...checkedIn, selectedCrew.id], logEntries: [entry, ...(run.logEntries || [])], updatedAt: entry.createdAt });
  };
  if (!selectedCrew) return <p className="module-empty">Crew signal unavailable.</p>;
  return <div className="crew-panel">
    <div className="crew-list" role="tablist" aria-label="Crew members">{mission.crew.map(member => <button key={member.id} role="tab" aria-selected={selected === member.id} className={selected === member.id ? 'active' : ''} onClick={() => setSelected(member.id)}><span>{member.avatar}</span><span><b>{member.name}</b><small>{member.role}</small></span><i className={checkedIn.includes(member.id) ? 'checked-in' : ''}>{checkedIn.includes(member.id) ? <Check size={12} /> : null}</i></button>)}</div>
    <article className="crew-conversation"><div className="conversation-signal"><i /> PRIVATE CREW CHANNEL · SOL {run.currentSol}</div><div className="conversation-avatar">{selectedCrew.avatar}</div><span className="crew-role">{selectedCrew.role.toUpperCase()}</span><h2>{selectedCrew.name}</h2><p>“{selectedCrew.line}”</p><div className="conversation-bottom"><span>{checkedIn.includes(selectedCrew.id) ? 'CHECK-IN ADDED TO FLIGHT LOG' : 'YOUR CREW IS WAITING TO HEAR FROM YOU'}</span><button className="primary-btn" disabled={checkedIn.includes(selectedCrew.id)} onClick={checkIn}>{checkedIn.includes(selectedCrew.id) ? 'CHECKED IN' : 'SEND A CHECK-IN'} <ArrowRight size={15} /></button></div></article>
  </div>;
}

function SciencePanel({ run, onUpdateRun }) {
  const learned = run.learnedScienceIds || [];
  const markLearned = (card) => {
    if (learned.includes(card.id)) return;
    const now = new Date().toISOString();
    const entry = { id: `science-${card.id}-${Date.now()}`, type: 'science-note', sol: run.currentSol, createdAt: now, text: `Added field note: ${card.title}.` };
    onUpdateRun({ ...run, learnedScienceIds: [...learned, card.id], logEntries: [entry, ...(run.logEntries || [])], updatedAt: now });
  };
  return <div className="science-panel"><div className="panel-intro"><span className="eyebrow"><span className="eyebrow-line" /> SCIENCE DECK · SOL {run.currentSol}</span><h2>Notes from the <em>field.</em></h2><p>Learn the science that helps a crew understand a new world. These are mission briefings, not live surface data.</p></div><div className="science-card-grid">{learningCards.map(card => <article key={card.id} className={`field-card ${learned.includes(card.id) ? 'learned' : ''}`}><span className="field-card-kicker">FIELD NOTE · {learned.includes(card.id) ? 'COLLECTED' : 'NEW'}</span><h3>{card.title}</h3><p>{card.body}</p><span className="field-source">RESEARCH CONTEXT · {card.source.organization}</span><button className="field-collect" disabled={learned.includes(card.id)} onClick={() => markLearned(card)}>{learned.includes(card.id) ? <><Check size={14}/> SAVED TO JOURNAL</> : <>ADD TO FIELD JOURNAL <ArrowRight size={14}/></>}</button></article>)}</div></div>;
}

function FlightLog({ mission, run }) {
  const entries = run.logEntries || [];
  return <div className="flight-log"><div className="panel-intro"><span className="eyebrow"><span className="eyebrow-line" /> FLIGHT RECORDER</span><h2>Your mission, <em>so far.</em></h2><p>Every check-in and field note is saved on this device.</p></div>{entries.length === 0 ? <div className="log-empty"><Activity size={22}/><b>THE RECORDER IS QUIET</b><span>Talk with your crew or collect a field note to add the first entry.</span></div> : <ol>{entries.map((entry, index) => <li key={entry.id}><span className="log-node">{index === 0 ? <i /> : null}</span><div><small>SOL {entry.sol} · {formatStamp(entry.createdAt)}</small><p>{entry.text}</p></div></li>)}</ol>}<div className="log-footer"><span>MISSION</span><strong>{mission.id.toUpperCase()}</strong><span>LAST SAVE</span><strong>{formatStamp(run.updatedAt)}</strong></div></div>;
}

export default function MissionExperience({ profile, mission, run, onUpdateRun, onSnapshot, onComplete, onExit, WorldModule }) {
  const [panel, setPanel] = useState('world');
  const markLanded = () => {
    if (run.arrivalComplete) return;
    const now = new Date().toISOString();
    const entry = { id: `touchdown-${Date.now()}`, type: 'touchdown', sol: run.currentSol, createdAt: now, text: 'First Light touched down at Utopia Planitia. Crew began the supervised airlock sequence.' };
    onUpdateRun({ ...run, arrivalComplete: true, logEntries: [entry, ...(run.logEntries || [])], updatedAt: now });
  };
  return <div className="mission-experience">
    <div className="mission-experience-heading"><div><span className="eyebrow"><span className="eyebrow-line"/> FLIGHT DECK · FIRST LIGHT</span><h1>COMMANDER <em>{profile.callsign}.</em></h1></div><div className="sol-counter"><span>MISSION SOL</span><strong>{String(run.currentSol).padStart(2, '0')}<small> / {String(mission.durationDays).padStart(2, '0')}</small></strong><i className="sol-progress"><b style={{ width: `${Math.min(100, (run.currentSol / mission.durationDays) * 100)}%` }} /></i></div></div>
    <nav className="mission-nav" aria-label="Mission stations">{panels.map(({ id, label, icon: Icon }) => <button key={id} className={panel === id ? 'active' : ''} aria-current={panel === id ? 'page' : undefined} onClick={() => setPanel(id)}><Icon size={16}/><span>{label}</span>{id === 'log' && run.logEntries?.length > 0 && <i>{run.logEntries.length}</i>}</button>)}<span className="autosave-indicator"><Save size={13}/> AUTOSAVED</span></nav>
    <section className="mission-station" aria-live="polite">
      {panel === 'world' && (run.worldUnlocked && WorldModule
        ? <Suspense fallback={<div className="loading-mark"><span>CONNECTING TO THE OUTPOST…</span></div>}><WorldModule profile={profile} onBackToLaunch={() => onUpdateRun({ ...run, worldUnlocked: false, updatedAt: new Date().toISOString() })} /></Suspense>
        : run.arrivalComplete
          ? <FirstSurfaceWalk profile={profile} mission={mission} run={run} onUpdateRun={onUpdateRun} />
          : <MarsArrival profile={profile} onLanded={markLanded} />)}
      {panel === 'crew' && <CrewPanel mission={mission} run={run} onUpdateRun={onUpdateRun} />}
      {panel === 'science' && <SciencePanel run={run} onUpdateRun={onUpdateRun} />}
      {panel === 'log' && <FlightLog mission={mission} run={run} />}
    </section>
    <div className="mission-experience-footer"><button className="back-link" onClick={onExit}><ArrowLeft size={15}/> RETURN TO FLIGHT RECORD</button><span>WORLD SIMULATION VALUES ARRIVE FROM THE SURFACE MODULE</span></div>
  </div>;
}
