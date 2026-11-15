import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, BatteryCharging, ChevronDown, ChevronUp, CircleHelp, Droplets, HeartPulse, Hammer, HardHat, List, Package, Pause, Pickaxe, Radio, RotateCcw, Settings2, Shield, Sparkles, Users, Volume2, VolumeX, Waves, X } from 'lucide-react';
import GameScene from './GameScene';
import { missionApi } from './missionApi';
import './game.css';

const SAVE_KEY = 'outpost-zero.survival-flight.v1';
const PROFILE_KEY = 'outpost-zero.commander.v1';
const AVATARS = [
  { id: 'ember', name: 'EMBER', suit: 'amber' },
  { id: 'nova', name: 'NOVA', suit: 'teal' },
  { id: 'orbit', name: 'ORBIT', suit: 'violet' },
];
const STARTER_KITS = [
  { id: 'repair-kit', name: 'HABITAT KIT', glyph: '⌂', supply: '2 ALLOY', summary: 'Extra metal for the first structure repair or build.' },
  { id: 'field-kit', name: 'FIELD KIT', glyph: '⛏', supply: '2 REGOLITH', summary: 'Extra local material for building on the surface.' },
  { id: 'science-kit', name: 'SCIENCE KIT', glyph: '✦', supply: '2 ICE', summary: 'Extra ice sample for greenhouse construction.' },
];
const PLAY_MODES = [
  { id: 'solo', name: 'SOLO FLIGHT', detail: 'One commander makes every mission call.' },
  { id: 'crew-coop', name: 'CREW CO-OP · PASS & PLAY', detail: 'Two players share this screen and alternate decisions.' },
];
const ACADEMY = [
  ['A day on Mars', 'A Martian solar day is called a sol. It is a little longer than an Earth day. This mission uses one turn per sol.'],
  ['Power is a shared choice', 'The solar array helps refill the game power reserve. Life support, science, and buildings compete for that energy.'],
  ['Shelter and surface work', 'A storm shelter can reduce the game’s abstract exposure-risk meter. It is not a radiation dose. Surface exploration can help science but has a modeled cost.'],
  ['Food takes time', 'A greenhouse costs supplies up front. Its modeled food benefit arrives on later sols, so planning ahead matters.'],
  ['Real data, game rules', 'NASA sources offer context about Mars. Outpost Zero’s quantities, recipes, and consequences are simplified game values, not real engineering limits.'],
];
const CHAPTERS = [
  ['First Footsteps', 'Mika', 'The lander is down. We have one safe habitat and a whole lot of open ground. Salvage the crate and bring power online.'],
  ['The Dust Front', 'PIP-3', 'Wind readings are rising across the eastern ridge. Build smart, keep the crew close, and watch the sky.'],
  ['A Place to Grow', 'Mika', 'The greenhouse can turn our water into food over time. We need the right materials and a safe tile.'],
  ['Cold Shadow', 'Sol', 'The ground temperature drops sharply in the shaded crater. Stick to the marked route or prepare the shelter.'],
  ['Signal in the Soil', 'Sol', 'The rover found a pattern beneath the regolith. Help me investigate before the signal fades.'],
  ['Long Shadows', 'ORBIT', 'A dust front is crossing the outpost. Essential systems first, Commander.'],
  ['First Light', 'Mission log', 'Seven sols of work, exploration, and hard calls. Review the base your crew built together.'],
];
const RESOURCES = [
  ['power', 'POWER', BatteryCharging, '#f1c478'], ['oxygen', 'OXYGEN', Waves, '#8dcdd5'],
  ['water', 'WATER', Droplets, '#73b8d4'], ['food', 'FOOD', Sparkles, '#a6ce87'],
  ['crewWellbeing', 'CREW', HeartPulse, '#d99b74'], ['habitatIntegrity', 'HABITAT', Shield, '#93bd85'],
  ['radiationRisk', 'EXPOSURE RISK', Radio, '#e29c65'], ['scienceProgress', 'SCIENCE', Package, '#b89cda'],
];
const MATERIALS = [['alloy', 'ALLOY', '▣'], ['regolith', 'REGOLITH', '◆'], ['ice', 'ICE', '✦']];
const ROLE_COPY = {
  mika: { name: 'Mika Chen', job: 'Flight engineer', perk: 'Build actions add habitat integrity.' },
  sol: { name: 'Sol Okafor', job: 'Field scientist', perk: 'Research and rover actions add science progress.' },
  pip: { name: 'PIP-3', job: 'Rover and crew bot', perk: 'Gather twice as much from a deposit.' },
};
const ACTS = [
  ['ACT I · LANDFALL', 'Touchdown and first systems'],
  ['ACT II · MAKE A HOME', 'Grow food and protect the habitat'],
  ['ACT III · THE RED FRONTIER', 'Investigate the signal and weather'],
  ['ACT IV · FIRST LIGHT', 'Close the mission and review the choices'],
];

function ModalFrame({ title, kicker, onClose, children, className = '' }) {
  return <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`crew-room ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-heading"><button className="modal-close" onClick={onClose} aria-label="Close panel"><X size={18}/></button><span className="eyebrow">{kicker}</span><h2 id="modal-heading">{title}</h2>{children}</section></div>;
}

function CollapseButton({ open, onClick, label }) {
  return <button className="panel-collapse" type="button" onClick={onClick} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${label}`} title={`${open ? 'Collapse' : 'Expand'} ${label}`}>{open ? <ChevronDown size={18}/> : <ChevronUp size={18}/>}</button>;
}

function IntroModal({ kind, onClose, events = [], onFontSize, fontSize, reducedMotion, setReducedMotion, voiceEnabled, setVoiceEnabled }) {
  if (!kind) return null;
  if (kind === 'howto') return <ModalFrame kicker="CADET FIELD GUIDE" title="How to play" onClose={onClose} className="guide-room"><p className="modal-lead">Your job is to explore Mars, help your crew, and make the outpost ready for the next sol.</p><ol className="guide-steps"><li><b>Explore the map</b><span>Walk with WASD or the arrow keys. Click open ground to move there.</span></li><li><b>Gather materials</b><span>Walk up to a glowing deposit and press E, or click a deposit to walk over and collect it.</span></li><li><b>Build the base</b><span>Choose a crew task. Gather the shown alloy, regolith, or ice, then click an open tile to place the building.</span></li><li><b>Choose a daily plan</b><span>You get one main crew action per sol. Gathering and walking are free. Event choices happen when a story complication arrives.</span></li><li><b>Look after the team</b><span>Assign Mika, Sol, or PIP-3 to use their specialty. Unused materials stay in your pack between sols.</span></li></ol><p className="modal-note">Tip: open the mission log, objectives, crew, and ORBIT from the world HUD whenever you need a reminder.</p><button className="build-confirm" onClick={onClose}>BACK TO THE MISSION</button></ModalFrame>;
  if (kind === 'academy') return <ModalFrame kicker="SPACE ACADEMY · OPTIONAL LEARNING" title="Small lessons for big decisions" onClose={onClose} className="academy-room"><p className="modal-lead">These cards explain the ideas behind the game. The Mars numbers and recipes are fictional balancing values.</p><div className="academy-cards">{ACADEMY.map(([title, text], index) => <details className="academy-card" key={title} open={index === 0}><summary><span>LESSON {String(index + 1).padStart(2, '0')}</span><b>{title}</b></summary><p>{text}</p></details>)}</div><div className="moon-preview-card"><span>FUTURE DESTINATION</span><b>THE MOON</b><p>Lunar terrain, long light and dark periods, and shadowed regions are planned as an expansion after the Mars mission is complete.</p></div><button className="build-confirm" onClick={onClose}>BACK TO THE MISSION</button></ModalFrame>;
  if (kind === 'log') return <ModalFrame kicker="MISSION BLACK BOX · THIS FLIGHT" title="What happened out here" onClose={onClose} className="log-room"><div className="timeline-list">{[...events].reverse().map((item, index) => <article className="timeline-entry" key={`${item.id}-${index}`}><span>SOL {String(item.day || 1).padStart(2, '0')} · {(item.kind || 'MISSION').toUpperCase()}</span><p>{item.text}</p></article>)}</div></ModalFrame>;
  if (kind === 'settings') return <ModalFrame kicker="COMMANDER OPTIONS" title="Make it comfortable to play" onClose={onClose} className="settings-room"><div className="setting-row"><div><b>Text size</b><small>Make mission instructions easier to read.</small></div><div className="font-stepper"><button onClick={() => onFontSize(Math.max(16, fontSize - 1))} aria-label="Decrease text size">A−</button><strong>{fontSize}px</strong><button onClick={() => onFontSize(Math.min(22, fontSize + 1))} aria-label="Increase text size">A+</button></div></div><label className="setting-switch"><span><b>Reduced motion</b><small>Use calmer transitions and movement.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)}/></label><label className="setting-switch"><span><b>Read dialogue aloud</b><small>Uses the speech voice built into this device. Captions stay visible.</small></span><input type="checkbox" checked={voiceEnabled} onChange={(event) => setVoiceEnabled(event.target.checked)}/></label><button className="build-confirm" onClick={onClose}>SAVE AND RETURN</button></ModalFrame>;
  return <ModalFrame kicker="ORBIT · MISSION ADVISOR" title="A hint when you ask" onClose={onClose} className="orbit-room"><p className="modal-lead">I can point out a trade-off, but the decision belongs to you, Commander.</p><div className="orbit-hint-card"><span>MISSION TIP · GAME MODEL</span><p>{kind}</p></div><button className="build-confirm" onClick={onClose}>I’VE GOT THIS</button></ModalFrame>;
}

function PixelCrew({ small = false }) {
  return <div className={`pixel-crew ${small ? 'is-small' : ''}`} aria-hidden="true"><i className="crew-commander"/><i className="crew-mika"/><i className="crew-sol"/><i className="crew-pip"/></div>;
}

function Opening({ callsign, setCallsign, avatarId, setAvatarId, kitId, setKitId, playMode, setPlayMode, partnerCallsign, setPartnerCallsign, onStart, busy, error, savedSession, onContinue, onOpenHelp, onOpenAcademy }) {
  return <main className="opening-screen">
    <div className="opening-sky"/>
    <div className="opening-mars"/>
    <div className="opening-ridge ridge-back"/><div className="opening-ridge ridge-front"/>
    <div className="opening-lander"><i/><b/><span/></div>
    <div className="opening-base"><i/><i/><i/></div>
    <div className="opening-copy"><div className="pixel-brand"><span>OZ</span> OUTPOST ZERO</div>
      <div className="eyebrow">A MARS SURVIVAL STORY · 7 SOLS</div>
      <h1>THE PLANET<br/><em>IS YOURS.</em></h1>
      <p>Land with your crew. Explore the terrain. Gather what Mars leaves behind. Build a home before the next sol begins.</p>
      <div className="destination-select" aria-label="Choose mission destination"><div className="destination-card is-active"><span>DESTINATION 01 · READY</span><b>MARS</b><small>FIRST LIGHT · 7 SOLS</small></div><button type="button" className="destination-card is-locked" onClick={onOpenAcademy}><span>DESTINATION 02 · PREVIEW</span><b>MOON</b><small>SHADOWED TERRAIN · COMING NEXT</small></button></div>
      <label className="call-sign-label" htmlFor="commander-name">CHOOSE YOUR CALLSIGN</label>
      <input id="commander-name" maxLength={16} value={callsign} onChange={(event) => setCallsign(event.target.value)} placeholder="Cadet"/>
      <div className="avatar-choices" aria-label="Choose your astronaut suit">{AVATARS.map((avatar) => <button type="button" key={avatar.id} className={`avatar-choice suit-${avatar.suit} ${avatarId === avatar.id ? 'is-selected' : ''}`} onClick={() => setAvatarId(avatar.id)} aria-pressed={avatarId === avatar.id}><span className="avatar-pixel"><i/></span><b>{avatar.name}</b></button>)}</div>
      <span className="call-sign-label kit-label">CHOOSE HOW YOUR CREW PLAYS</span><div className="play-mode-choices">{PLAY_MODES.map((mode) => <button type="button" key={mode.id} className={`play-mode-choice ${playMode === mode.id ? 'is-selected' : ''}`} onClick={() => setPlayMode(mode.id)} aria-pressed={playMode === mode.id}><b>{mode.name}</b><small>{mode.detail}</small></button>)}</div>
      {playMode === 'crew-coop' && <label className="partner-call-sign">SPECIALIST CALLSIGN<input maxLength={16} value={partnerCallsign} onChange={(event) => setPartnerCallsign(event.target.value)} placeholder="Crewmate"/></label>}
      <span className="call-sign-label kit-label">SELECT A STARTER PACK · GAME SUPPLIES</span><div className="kit-choices">{STARTER_KITS.map((kit) => <button type="button" key={kit.id} className={`kit-choice ${kitId === kit.id ? 'is-selected' : ''}`} onClick={() => setKitId(kit.id)} aria-pressed={kitId === kit.id}><b>{kit.glyph} {kit.name}</b><span>{kit.supply}</span><small>{kit.summary}</small></button>)}</div>
      <div className="opening-actions">{savedSession && <button className="btn-secondary" onClick={onContinue}>CONTINUE FLIGHT <ChevronDown size={15}/></button>}<button className="btn-primary" onClick={onStart} disabled={busy}>{busy ? 'PREPARING LANDER…' : savedSession ? 'START NEW FLIGHT' : 'BEGIN LANDING'} <ArrowDownToLine size={16}/></button></div>
      <div className="opening-links"><button onClick={onOpenHelp}>HOW TO PLAY</button><button onClick={onOpenAcademy}>SPACE ACADEMY</button></div>
      {error && <p className="game-error" role="alert">{error}</p>}
      <small className="science-footnote">MARS ENVIRONMENT INSPIRED BY NASA DATA · RESOURCE AND HAZARD EFFECTS ARE SIMPLIFIED GAME MODELS</small>
    </div>
    <div className="opening-coordinate">UTOPIA PLANITIA<br/>18° 26′ N · 226° 12′ E</div>
  </main>;
}

function LandingCutscene({ callsign, starterKitName, onStepOut, zooming, onSkip }) {
  return <div className={`landing-cutscene ${zooming ? 'is-zooming' : ''}`} role="dialog" aria-modal="true" aria-labelledby="arrival-title">
    <div className="cutscene-stars"/><div className="cutscene-planet"/><div className="cutscene-horizon"/>
    <div className="pixel-lander"><i/><b/><span/></div><div className="pixel-landing-beam"/>
    <div className="landing-party"><PixelCrew/></div><div className="landing-dome"><i/><i/></div>
    <div className="arrival-copy"><span>UTOPIA PLANITIA · MARS · SOL 01</span><h2 id="arrival-title">TOUCHDOWN,<br/><em>{callsign.toUpperCase()}.</em></h2>
      <p>Engines quiet. Dust settling. Your crew is ready to build the first foothold.</p>
      <div className="radio-line"><b>MIKA · FLIGHT ENGINEER</b> “Habitat readings are stable. What should we build first?”</div>
      <div className="loadout-line"><b>PRE-FLIGHT LOADOUT · {starterKitName.toUpperCase()}</b><span>Your selected supplies are in the field pack. Recipe amounts are game units.</span></div>
      <div className="briefing-objectives"><b>MISSION BRIEF</b><span>Stabilize the outpost · Protect your crew · Complete the soil study · Return with a debrief</span></div>
      <button className="btn-primary" onClick={onStepOut}>STEP ONTO MARS <ChevronDown size={16}/></button>
    </div>
    <button className="cutscene-skip" onClick={onSkip}>SKIP INTRO</button>
    <div className="arrival-hud">CREW 04 · LANDER POWER 82%<br/>OXYGEN 96% · COMMS STABLE</div>
  </div>;
}

export default function Game() {
  const [phase, setPhase] = useState('opening');
  const [callsign, setCallsign] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}').callsign || 'Cadet'; } catch { return 'Cadet'; } });
  const [avatarId, setAvatarId] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}').avatarId || 'ember'; } catch { return 'ember'; } });
  const [kitId, setKitId] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}').starterKit || 'repair-kit'; } catch { return 'repair-kit'; } });
  const [playMode, setPlayMode] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}').playMode || 'solo'; } catch { return 'solo'; } });
  const [partnerCallsign, setPartnerCallsign] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}').partnerCallsign || 'Crewmate'; } catch { return 'Crewmate'; } });
  const [snapshot, setSnapshot] = useState(null);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SAVE_KEY) || '');
  const [selectedActionId, setSelectedActionId] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState('habitat');
  const [placementTarget, setPlacementTarget] = useState(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0.5, y: 0.7 });
  const [moveCommand, setMoveCommand] = useState(null);
  const [crewRole, setCrewRole] = useState('mika');
  const [showCrew, setShowCrew] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showScience, setShowScience] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [panelModal, setPanelModal] = useState('');
  const [collapsed, setCollapsed] = useState({ resources: false, story: false, actions: false, hotbar: false, objective: false, orbit: true });
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('outpost-zero.text-size')) || 18);
  const [reducedMotion, setReducedMotion] = useState(() => { const saved = localStorage.getItem('outpost-zero.reduce-motion'); return saved === null ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false : saved === 'true'; });
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [scienceContext, setScienceContext] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [solReport, setSolReport] = useState(null);
  const [zooming, setZooming] = useState(false);
  const pendingHazards = useRef(new Set());
  const currentSnapshot = useRef(null);
  currentSnapshot.current = snapshot;

  useEffect(() => { missionApi.science().then(setScienceContext); }, []);
  useEffect(() => {
    if (!sessionId) return;
    missionApi.read(sessionId).then((saved) => { setSnapshot(saved); setCrewRole(saved.crewAssignment || 'mika'); setPhase('world'); try { const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); setCallsign(profile.callsign || saved.profile?.callsign || 'Commander'); setAvatarId(profile.avatarId || saved.profile?.avatarId || 'ember'); setKitId(profile.starterKit || saved.profile?.starterKit || 'repair-kit'); setPlayMode(profile.playMode || saved.profile?.playMode || 'solo'); setPartnerCallsign(profile.partnerCallsign || saved.profile?.partnerCallsign || 'Crewmate'); saved.commander = { ...saved.profile, ...profile }; } catch { setCallsign(saved.profile?.callsign || 'Commander'); } }).catch(() => { localStorage.removeItem(SAVE_KEY); setSessionId(''); });
  }, []);

  const availableActions = snapshot?.availableActions || [];
  const selectedAction = useMemo(() => availableActions.find((action) => action.id === selectedActionId) || availableActions[0] || null, [availableActions, selectedActionId]);
  const actionBuilding = selectedAction?.buildingId ? snapshot?.buildings.find((building) => building.id === selectedAction.buildingId && snapshot.buildCosts?.[building.id]) : null;
  const buildingCost = actionBuilding ? snapshot.buildCosts[actionBuilding.id] : null;
  const canAffordBuild = !buildingCost || Object.entries(buildingCost).every(([item, amount]) => (snapshot.inventory?.[item] || 0) >= amount);
  const activeZone = snapshot?.hazardZones?.find((zone) => zone.sols.includes(snapshot.day) && Math.hypot(playerPosition.x - zone.x, playerPosition.y - zone.y) <= zone.radius);
  const dayIndex = Math.min(Math.max((snapshot?.day || 1) - 1, 0), 6);
  const chapter = CHAPTERS[dayIndex];
  const storySpeaker = snapshot?.activeEvent ? 'ORBIT · MISSION ADVISOR' : snapshot?.lastOutcome?.title ? chapter[1] : chapter[1];
  const storyLine = snapshot?.activeEvent?.trigger || snapshot?.lastOutcome?.text || chapter[2];
  const mainResources = showStats ? RESOURCES : RESOURCES.slice(0, 4);
  const act = snapshot?.day <= 2 ? ACTS[0] : snapshot?.day <= 4 ? ACTS[1] : snapshot?.day <= 6 ? ACTS[2] : ACTS[3];
  const profile = snapshot?.profile || {};
  const crewCoop = profile.playMode === 'crew-coop';
  const commanderName = profile.callsign || callsign;
  const specialistName = profile.partnerCallsign || partnerCallsign || 'Crewmate';
  const regularTurnOwner = snapshot?.day % 2 === 1 ? commanderName : specialistName;
  const eventTurnOwner = snapshot?.day % 2 === 1 ? specialistName : commanderName;
  const decisionOwner = snapshot?.activeEvent ? eventTurnOwner : regularTurnOwner;
  const currentHint = snapshot?.activeEvent
    ? `Two responses are available. Compare the immediate costs and the delayed effects described on each choice before you decide. ${snapshot.activeEvent.trigger}`
    : !canAffordBuild && buildingCost
      ? `You need more materials before this structure can be placed. Click a deposit to walk over and gather it. PIP-3 can collect two pieces at once.`
      : placementTarget?.x == null
        ? 'Place the ghost on an open patch of ground. The world checks that the tile is clear before the crew spends materials.'
        : selectedAction?.detail || 'Walking and gathering do not spend the crew’s main action for this sol.';
  const togglePanel = (name) => setCollapsed((previous) => ({ ...previous, [name]: !previous[name] }));
  const changeFontSize = (size) => { setFontSize(size); localStorage.setItem('outpost-zero.text-size', String(size)); };
  const changeReducedMotion = (value) => { setReducedMotion(value); localStorage.setItem('outpost-zero.reduce-motion', String(value)); };
  const readAloud = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) { setToast('Turn on Read dialogue aloud in Commander Options to hear the captions.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };
  const setVoicePreference = (enabled) => {
    setVoiceEnabled(enabled);
    if (!enabled && window.speechSynthesis) window.speechSynthesis.cancel();
  };
  const toggleVoice = () => setVoicePreference(!voiceEnabled);

  const loadFlight = async () => {
    if (!sessionId) return;
    setBusy(true); setError('');
    try {
      const saved = await missionApi.read(sessionId);
      setSnapshot(saved); setCrewRole(saved.crewAssignment || 'mika'); setPhase('world');
      setToast('Flight restored. Your inventory and world state are intact.');
    } catch (cause) { localStorage.removeItem(SAVE_KEY); setSessionId(''); setError(cause.message); }
    finally { setBusy(false); }
  };
  const startLanding = async () => {
    setBusy(true); setError('');
    try {
      const commanderProfile = { callsign: callsign.trim() || 'Cadet', avatarId, starterKit: kitId, playMode, partnerCallsign: partnerCallsign.trim() || 'Crewmate', destination: 'mars' };
      const fresh = await missionApi.start(commanderProfile);
      fresh.commander = commanderProfile;
      setSnapshot(fresh); setSessionId(fresh.sessionId); localStorage.setItem(SAVE_KEY, fresh.sessionId);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(commanderProfile));
      setSelectedActionId(fresh.availableActions?.[0]?.id || ''); setCrewRole('mika');
      setPlayerPosition({ x: 0.5, y: 0.72 }); setPhase('arrival'); setToast('');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };
  const stepOut = () => {
    setZooming(true);
    window.setTimeout(() => { setPhase('world'); setZooming(false); }, 700);
  };
  const replayIntro = () => setPhase('arrival');
  const chooseAction = (action) => {
    setSelectedActionId(action.id);
    setPlacementTarget(action.buildingId && snapshot.buildCosts?.[action.buildingId] ? { buildingId: action.buildingId, x: null, y: null } : null);
  };
  const performAction = async () => {
    if (!snapshot || !selectedAction || busy) return;
    if (buildingCost && !placementTarget?.x) { setToast('Choose an empty tile for the structure first.'); return; }
    if (!canAffordBuild) { setToast('Gather the listed materials before you build.'); return; }
    setBusy(true); setError('');
    try {
      const before = snapshot;
      const next = await missionApi.act(snapshot, selectedAction.id, buildingCost ? placementTarget : undefined, crewRole);
      setSnapshot(next); currentSnapshot.current = next; setSelectedActionId(next.availableActions?.[0]?.id || ''); setPlacementTarget(null);
      setToast(next.lastOutcome?.text || selectedAction.log || 'The crew completed its work.');
      if (next.day !== before.day || next.status !== before.status) {
        setSolReport({ sol: before.day, beforeResources: before.resources, action: selectedAction.title, outcome: next.lastOutcome, inventory: next.inventory, nextDay: next.day, nextEvent: next.activeEvent, complete: next.status !== 'active', nextAct: next.day <= 2 ? ACTS[0] : next.day <= 4 ? ACTS[1] : next.day <= 6 ? ACTS[2] : ACTS[3] });
      }
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };
  const gather = async (nodeId) => {
    const current = currentSnapshot.current;
    if (!current || busy) return;
    setBusy(true); setError('');
    try {
      const next = await missionApi.gather(current, nodeId, crewRole);
      setSnapshot(next); currentSnapshot.current = next; setToast(next.lastOutcome?.text || 'Materials collected.');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };
  const reportPlayerPosition = (position) => {
    setPlayerPosition(position);
    const current = currentSnapshot.current;
    if (!current || current.status !== 'active') return;
    const zone = (current.hazardZones || []).find((item) => item.sols.includes(current.day) && Math.hypot(position.x - item.x, position.y - item.y) <= item.radius);
    if (!zone || current.hazardsEntered?.[String(current.day)]?.includes(zone.id) || pendingHazards.current.has(zone.id)) return;
    pendingHazards.current.add(zone.id);
    missionApi.enterHazard(current, zone.id, position).then((next) => {
      currentSnapshot.current = next; setSnapshot(next); setToast(next.lastOutcome?.text || `${zone.name} crossed.`);
    }).catch((cause) => { setError(cause.message); }).finally(() => pendingHazards.current.delete(zone.id));
  };
  const selectBuilding = (id) => { setSelectedBuildingId(id); const item = snapshot?.buildings.find((building) => building.id === id); if (item) setToast(`${item.name} · ${item.status === 'online' ? 'online' : 'not built yet'}`); };
  const restartFlight = () => { localStorage.removeItem(SAVE_KEY); setSessionId(''); setSnapshot(null); setPhase('opening'); setShowCrew(false); setIsPaused(false); setPanelModal(''); setSolReport(null); setError(''); setToast(''); };

  if (phase === 'opening') return <><Opening callsign={callsign} setCallsign={setCallsign} avatarId={avatarId} setAvatarId={setAvatarId} kitId={kitId} setKitId={setKitId} playMode={playMode} setPlayMode={setPlayMode} partnerCallsign={partnerCallsign} setPartnerCallsign={setPartnerCallsign} onStart={startLanding} busy={busy} error={error} savedSession={Boolean(sessionId)} onContinue={loadFlight} onOpenHelp={() => setPanelModal('howto')} onOpenAcademy={() => setPanelModal('academy')}/><IntroModal kind={panelModal} onClose={() => setPanelModal('')}/></>;
  if (!snapshot) return <main className="boot-screen"><div className="boot-mark">OZ</div><p>WAKING MISSION CONTROL…</p></main>;
  if (phase === 'arrival') return <LandingCutscene callsign={callsign.trim() || snapshot.commander?.callsign || 'Cadet'} starterKitName={STARTER_KITS.find((kit) => kit.id === kitId)?.name || 'HABITAT KIT'} onStepOut={stepOut} onSkip={stepOut} zooming={zooming}/>;

  const complete = snapshot.status !== 'active';
  const buildingCopy = snapshot.buildings.find((building) => building.id === selectedBuildingId);
  const matCount = (key) => snapshot.inventory?.[key] || 0;

  return <main className={`survival-game ${reducedMotion ? 'reduce-motion' : ''}`} style={{ '--game-font-size': `${fontSize}px` }}>
    <GameScene snapshot={snapshot} selectedBuildingId={selectedBuildingId} placementTarget={placementTarget} playerPosition={playerPosition} moveCommand={moveCommand} avatarId={avatarId} reducedMotion={reducedMotion} paused={isPaused || Boolean(solReport)} onSelectBuilding={selectBuilding} onPlaceBuilding={setPlacementTarget} onGather={gather} onPlayerPosition={reportPlayerPosition} onMoveTo={setMoveCommand}/>
    <header className="hud-commander"><div className={`hud-logo suit-${AVATARS.find((item) => item.id === avatarId)?.suit || 'amber'}`}>OZ</div><div><b>{callsign.toUpperCase()}</b><small>{act[0]} · UTOPIA PLANITIA</small></div><div className="sol-stamp">SOL <strong>{String(snapshot.day).padStart(2, '0')}</strong><small>/ {String(snapshot.durationDays).padStart(2, '0')}</small></div></header>
    <section className={`hud-resources ${collapsed.resources ? 'is-collapsed' : ''}`} aria-label="Outpost resource meters"><div className="resource-panel-heading"><b>OUTPOST VITALS</b><CollapseButton open={!collapsed.resources} onClick={() => togglePanel('resources')} label="resource meters"/></div>{!collapsed.resources && <div className="resource-grid">{mainResources.map(([key, label, Icon, color]) => <div className="resource-meter" key={key} title={`${label}: ${snapshot.resources[key]} game units`}><Icon size={17}/><span>{label}</span><b>{snapshot.resources[key]}<small> GU</small></b><i><em style={{ width: `${snapshot.resources[key]}%`, background: color }}/></i></div>)}<button className="stats-expand" onClick={() => setShowStats(!showStats)}>{showStats ? 'CORE METERS' : 'ALL 8 METERS'}</button></div>}</section>
    <div className={`weather-tag ${activeZone ? 'is-danger' : ''}`}><i/>{activeZone ? activeZone.name.toUpperCase() : 'MARS · SETTLED DUST'} <span>·</span> {snapshot.activeEvent ? 'CREW ALERT' : 'CREW COMMS CLEAR'} <span>·</span>{snapshot.serviceMode === 'local' ? 'LOCAL SIMULATION' : 'MISSION CONTROL LINK'}</div>
    <section className={`mission-objective ${collapsed.objective ? 'is-collapsed' : ''}`}><div><span>YOUR MISSION</span><CollapseButton open={!collapsed.objective} onClick={() => togglePanel('objective')} label="mission objective"/></div>{!collapsed.objective && <ul>{[['Keep the habitat stable', snapshot.resources.habitatIntegrity >= 50], ['Protect the crew', snapshot.resources.crewWellbeing > 0 && snapshot.resources.oxygen > 0], ['Complete the soil study', snapshot.resources.scienceProgress >= 40]].map(([label, isReady]) => <li key={label} className={complete ? (isReady ? 'is-done' : 'is-missed') : ''}><span>{label}</span><small>{complete ? (isReady ? 'SECURED' : 'NEEDS WORK') : 'MISSION GOAL'}</small></li>)}<li className={complete ? 'is-done' : ''}><span>Finish the flight</span><small>{complete ? 'DEBRIEF READY' : `SOL ${snapshot.day} OF ${snapshot.durationDays}`}</small></li></ul>}</section>

    <section className={`story-box ${collapsed.story ? 'is-collapsed' : ''}`} aria-live="polite"><div className="story-box-top"><span>{act[0]} · SOL {String(snapshot.day).padStart(2, '0')}</span><b>{snapshot.activeEvent?.title || chapter[0]}</b><CollapseButton open={!collapsed.story} onClick={() => togglePanel('story')} label="story dialogue"/></div>{!collapsed.story && <><div className="story-person"><span className={`portrait portrait-${snapshot.activeEvent ? 'orbit' : chapter[1].toLowerCase()}`}>{snapshot.activeEvent ? 'O' : chapter[1].slice(0, 1)}</span><div><b>{storySpeaker}</b><p>{storyLine}</p></div></div><div className="story-footer"><span>{act[1]}{crewCoop ? ` · ${decisionOwner} DECIDES` : ''}</span><button onClick={() => readAloud(`${storySpeaker}. ${storyLine}`)}><Volume2 size={16}/> READ ALOUD</button></div>{toast && <div className="world-notice" role="status">{toast}</div>}</>}</section>

    <aside className={`command-deck ${collapsed.actions ? 'is-collapsed' : ''}`}>
      <div className="deck-top"><div><span>{snapshot.activeEvent ? 'MISSION DECISION' : complete ? 'FLIGHT DEBRIEF' : 'ONE CREW ACTION THIS SOL'}</span><h2>{complete ? snapshot.debrief?.title || 'Mission complete' : snapshot.activeEvent?.title || 'What will the crew do?'}</h2></div><div className="deck-tools"><button className="crew-open" onClick={() => setShowCrew(true)} aria-label="Manage the crew" title="Crew roster"><Users size={19}/></button><CollapseButton open={!collapsed.actions} onClick={() => togglePanel('actions')} label="crew action panel"/></div></div>
      {!collapsed.actions && (complete ? <><p className="deck-copy">{snapshot.debrief?.text}</p><ul className="debrief-list">{snapshot.debrief?.objectives?.map((goal) => <li className={goal.complete ? 'done' : ''} key={goal.id}>{goal.complete ? '✓' : '○'} {goal.title}</li>)}</ul><div className="branch-timeline"><b>YOUR STORY BRANCHES</b>{snapshot.branches?.length ? snapshot.branches.map((branch, index) => <p key={`${branch.eventId}-${index}`}>SOL {branch.day} · {branch.choice}</p>) : <p>The crew followed the primary mission plan.</p>}</div><div className="reflection-prompt"><b>MISSION REFLECTION</b><p>Which trade-off mattered most on your flight?</p><div>{['Power', 'Crew rest', 'Science', 'Building supplies'].map((item) => <button key={item} onClick={() => setToast(`Reflection saved for this flight: ${item}.`)}>{item}</button>)}</div></div><button className="build-confirm" onClick={restartFlight}><RotateCcw size={16}/> NEW FLIGHT</button></> : <>
        {crewCoop && <div className="turn-banner"><Users size={17}/><span>YOUR CALL, <b>{decisionOwner.toUpperCase()}</b></span><small>{snapshot.activeEvent ? 'EVENT RESPONSE' : `SOL ${snapshot.day} CREW PLAN`}</small></div>}
        <p className="deck-copy">{snapshot.activeEvent?.trigger || (buildingCopy ? `${buildingCopy.name} · ${buildingCopy.status === 'online' ? 'online' : 'not built yet'}. ${buildingCopy.kind === 'habitat' ? 'Home base and crew shelter.' : 'Move close or select a task to inspect.'}` : 'Explore and gather, then choose one crew plan. The sol ends when you confirm this action.')}</p>
        <div className="daily-actions" role="group" aria-label={snapshot.activeEvent ? 'Mission event choices' : 'Crew actions'}>{availableActions.map((action) => <button className={selectedAction?.id === action.id ? 'choice-card is-picked' : 'choice-card'} key={action.id} onClick={() => chooseAction(action)} aria-pressed={selectedAction?.id === action.id}><b>{action.title}</b><small>{action.detail}</small></button>)}</div>
        {selectedAction && <div className="consequence-preview"><b>IF YOU CHOOSE THIS · GAME MODEL</b><p>{selectedAction.detail}</p>{selectedAction.effects && Object.keys(selectedAction.effects).length > 0 ? <div className="effect-chips">{Object.entries(selectedAction.effects).map(([key, delta]) => <span className={delta >= 0 ? 'effect-up' : 'effect-down'} key={key}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()} {delta > 0 ? '+' : ''}{delta}{key === 'scienceProgress' ? ' progress' : ' GU'}</span>)}</div> : <small>No immediate resource change; this changes the outpost plan.</small>}{selectedAction.delayedEffects?.length > 0 && <div className="delayed-note"><b>LATER:</b> {selectedAction.delayedEffects.map((effect) => effect.text).join(' ')}</div>}</div>}
        {buildingCost && <div className="build-cost"><span><Hammer size={16}/> BUILD RECIPE · GAME UNITS</span>{Object.entries(buildingCost).map(([key, amount]) => <b className={matCount(key) >= amount ? 'has-enough' : ''} key={key}>{amount} {key.toUpperCase()} <small>({matCount(key)} IN PACK)</small></b>)}</div>}
        {placementTarget && <><div className="tile-instruction" role="status">{placementTarget.x == null ? 'CLICK AN EMPTY TILE TO PLACE THE GHOST BUILDING' : 'SITE MARKED · CONFIRM TO SPEND MATERIALS AND TODAY’S ACTION'}</div><button className="cancel-placement" onClick={() => setPlacementTarget(null)}>CANCEL PLACEMENT · RETURN TO EXPLORING</button></>}
        {selectedAction && <button className="build-confirm" disabled={busy || !canAffordBuild || Boolean(buildingCost && placementTarget?.x == null)} onClick={performAction}>{busy ? 'CREW AT WORK…' : buildingCost ? `BUILD ${actionBuilding.name.toUpperCase()}` : snapshot.activeEvent ? 'MAKE THIS CHOICE' : 'START CREW ACTION'} <ChevronDown size={17}/></button>}
        <div className="daily-carry"><span>UNUSED MATERIALS</span><b>STAY IN YOUR PACK BETWEEN SOLS</b></div>
      </>)}
    </aside>

    <section className={`survival-hotbar ${collapsed.hotbar ? 'is-collapsed' : ''}`} aria-label="Carried building materials and tools">{collapsed.hotbar ? <button onClick={() => togglePanel('hotbar')}>PACK <ChevronUp size={17}/></button> : <><div className="hotbar-title"><span>FIELD PACK</span><CollapseButton open onClick={() => togglePanel('hotbar')} label="field pack"/></div><div className="hotbar-slots"><div className="tool-slot active-tool"><Pickaxe size={20}/><small>HAND</small></div>{MATERIALS.map(([key, label, glyph]) => <div className="material-slot" key={key}><span>{glyph}</span><b>{matCount(key)}</b><small>{label}</small></div>)}<div className={`build-mode-slot ${placementTarget ? 'is-active' : ''}`}><HardHat size={20}/><small>{placementTarget ? 'PLACE' : 'BUILD'}</small></div></div></>}</section>
    <div className="control-hints"><span>MOVE <b>WASD</b> / <b>ARROWS</b></span><i/><span>GATHER <b>E</b> / CLICK A DEPOSIT</span><i/><span>BUILD <b>CHOOSE TASK → PLACE TILE</b></span></div>
    <div className="quick-actions"><button onClick={() => setIsPaused(true)} aria-label="Pause the mission"><Pause size={19}/><span>PAUSE</span></button><button onClick={() => setPanelModal('orbit')} aria-label="Ask ORBIT for a hint"><Sparkles size={19}/><span>ORBIT</span></button><button onClick={() => setPanelModal('log')} aria-label="Open mission log"><List size={19}/><span>MISSION LOG</span></button><button onClick={() => setShowCrew(true)} aria-label="Open crew roster"><Users size={19}/><span>CREW</span></button><button onClick={() => setShowScience(true)} aria-label="Open science notes"><CircleHelp size={19}/><span>SPACE FACT</span></button><button onClick={() => setPanelModal('settings')} aria-label="Open accessibility settings"><Settings2 size={19}/><span>OPTIONS</span></button><button onClick={replayIntro} aria-label="Replay landing story"><RotateCcw size={19}/><span>REPLAY INTRO</span></button><button onClick={toggleVoice} aria-label={voiceEnabled ? 'Mute spoken dialogue' : 'Enable spoken dialogue'}>{voiceEnabled ? <Volume2 size={19}/> : <VolumeX size={19}/>}<span>{voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}</span></button></div>
    {error && <div className="error-toast" role="alert"><b>MISSION CONTROL</b><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={14}/></button></div>}

    {showCrew && <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCrew(false); }}><section className="crew-room" role="dialog" aria-modal="true" aria-labelledby="crew-title"><button className="modal-close" onClick={() => setShowCrew(false)} aria-label="Close crew panel"><X size={17}/></button><span className="eyebrow">CREW ROSTER · CHOOSE TODAY’S SPECIALIST</span><h2 id="crew-title">Who goes out with you?</h2><p>Assign one crew member to your next command. Their training changes the gameplay outcome.</p>{Object.entries(ROLE_COPY).map(([role, member]) => <button className={crewRole === role ? 'crew-choice is-picked' : 'crew-choice'} key={role} onClick={() => setCrewRole(role)}><span className={`portrait portrait-${role}`}>{member.name[0]}</span><span><b>{member.name} · {member.job}</b><small>{member.perk}</small></span>{crewRole === role && <strong>ASSIGNED</strong>}</button>)}<button className="build-confirm" onClick={() => setShowCrew(false)}>RETURN TO THE WORLD <ChevronDown size={15}/></button></section></div>}
    {showScience && <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowScience(false); }}><section className="crew-room science-room" role="dialog" aria-modal="true" aria-labelledby="science-title"><button className="modal-close" onClick={() => setShowScience(false)} aria-label="Close science notes"><X size={17}/></button><span className="eyebrow">NASA CONTEXT · GAMEPLAY MODEL</span><h2 id="science-title">Real Mars, simplified systems.</h2><p>NASA observations provide location and science context. Resource counts, material recipes, hazard penalties, and crew outcomes are invented game-balancing values; they are not NASA measurements or mission forecasts.</p>{scienceContext && <div className="science-source"><b>{scienceContext.title}</b>{scienceContext.imageUrl && <img className="science-image" src={scienceContext.imageUrl} alt="NASA archive image shown as Mars context, not a live view of the game map"/>}<p>{scienceContext.summary}</p><dl><div><dt>TYPE</dt><dd>{scienceContext.kind}</dd></div><div><dt>DATE / PERIOD</dt><dd>{scienceContext.dateOrPeriod}</dd></div><div><dt>UNITS</dt><dd>{scienceContext.unit}</dd></div><div><dt>ATTRIBUTION</dt><dd>{scienceContext.attribution}</dd></div></dl><p className="science-interpretation">{scienceContext.interpretation}</p><a target="_blank" rel="noreferrer" href={scienceContext.source}>VIEW ORIGINAL NASA SOURCE ↗</a></div>}<button className="build-confirm" onClick={() => setShowScience(false)}>BACK TO THE WORLD</button></section></div>}
    {isPaused && <ModalFrame kicker={`SOL ${String(snapshot.day).padStart(2, '0')} · FLIGHT PAUSED`} title="Take a breather, Commander." onClose={() => setIsPaused(false)} className="pause-room"><p className="modal-lead">The outpost is waiting. Your resources, crew and current sol stay exactly as they are until you choose the next action.</p><button className="build-confirm" onClick={() => setIsPaused(false)}>RESUME MISSION</button><button className="pause-help" onClick={() => { setIsPaused(false); setPanelModal('howto'); }}>OPEN THE FIELD GUIDE</button><button className="pause-help" onClick={restartFlight}>END FLIGHT &amp; START FRESH</button></ModalFrame>}
    {solReport && <ModalFrame kicker={`SOL ${String(solReport.sol).padStart(2, '0')} · SHIFT COMPLETE`} title={solReport.complete ? 'The First Light mission is complete.' : 'The crew closes the airlock.'} onClose={() => setSolReport(null)} className="sol-report-room"><p className="modal-lead">{solReport.outcome?.text || solReport.action} Your remaining materials carry forward.</p><div className="report-action"><span>CREW PLAN</span><b>{solReport.action}</b><small>{solReport.complete ? 'FINAL SHIFT' : `${solReport.nextAct[0]} · SOL ${String(solReport.nextDay).padStart(2, '0')}`}</small></div><div className="report-grid"><section><h3>OUTPOST CHECK · GAME UNITS</h3>{RESOURCES.slice(0, 8).map(([key, label]) => { const delta = (snapshot.resources[key] || 0) - (solReport.beforeResources[key] || 0); return <div className="report-meter" key={key}><span>{label}</span><b>{snapshot.resources[key]} GU</b><em className={delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : ''}>{delta > 0 ? '+' : ''}{delta}</em></div>; })}</section><section><h3>PACK CARRIED FORWARD</h3>{MATERIALS.map(([key, label, glyph]) => <div className="report-meter" key={key}><span>{glyph} {label}</span><b>{solReport.inventory?.[key] || 0}</b></div>)}<p className="report-crew-note">The crew stays together. No one is left behind.</p></section></div>{solReport.nextEvent && !solReport.complete && <div className="next-beat"><span>NEXT STORY BEAT · SOL {String(solReport.nextEvent.day).padStart(2, '0')}</span><b>{solReport.nextEvent.title}</b><p>{solReport.nextEvent.trigger}</p></div>}{crewCoop && <div className="handoff-card"><Users size={18}/><span>PASS THE CONTROLS TO <b>{solReport.complete ? 'BOTH COMMANDERS' : (solReport.nextDay % 2 === 1 ? commanderName : specialistName).toUpperCase()}</b></span></div>}<button className="build-confirm" onClick={() => setSolReport(null)}>{solReport.complete ? 'OPEN FINAL DEBRIEF' : `BEGIN SOL ${String(solReport.nextDay).padStart(2, '0')}`} <ChevronDown size={17}/></button><small className="model-footnote">All quantities and effects shown here are simplified game values, not NASA measurements.</small></ModalFrame>}
    <IntroModal kind={panelModal === 'orbit' ? currentHint : panelModal} onClose={() => setPanelModal('')} events={snapshot.events || []} fontSize={fontSize} onFontSize={changeFontSize} reducedMotion={reducedMotion} setReducedMotion={changeReducedMotion} voiceEnabled={voiceEnabled} setVoiceEnabled={setVoicePreference}/>
  </main>;
}
