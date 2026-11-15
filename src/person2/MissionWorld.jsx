import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, BatteryCharging, Check, CircleHelp, FlaskConical, House, RotateCcw, Shield, ShieldAlert, Sparkles, Waves } from 'lucide-react';
import { MARS_MISSION } from '../shared/contracts';
import { worldApi } from './worldApi';
import OutpostScene from './OutpostScene';
import './world.css';

const resourceMeta = [
  ['power', 'POWER', BatteryCharging], ['oxygen', 'OXYGEN', Activity],
  ['water', 'WATER', Waves], ['food', 'FOOD', Sparkles], ['crewWellbeing', 'CREW', Shield],
  ['habitatIntegrity', 'HABITAT', House], ['radiationRisk', 'EXPOSURE RISK', ShieldAlert], ['scienceProgress', 'SCIENCE', FlaskConical],
];

export default function MissionWorld({ profile, onBackToLaunch, onSnapshot, onComplete }) {
  const [snapshot, setSnapshot] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState('solar-array');
  const [selectedActionId, setSelectedActionId] = useState('activate-solar-array');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('Connecting to the outpost…');
  const [error, setError] = useState('');
  const [showScience, setShowScience] = useState(false);
  const [view, setView] = useState('third');
  const [choicePage, setChoicePage] = useState(0);

  useEffect(() => {
    let active = true;
    worldApi.getSnapshot().then(async (saved) => {
      const initial = saved || await worldApi.startMission(MARS_MISSION.id, profile);
      if (active) {
        setSnapshot(initial);
        if (initial.status === 'active') onSnapshot?.(initial);
        else onComplete?.(initial);
        setBusy(false);
        setMessage('Touchdown confirmed. The crew is at the outpost.');
      }
    }).catch((cause) => { if (active) { setError(cause.message); setBusy(false); } });
    return () => { active = false; };
  }, []);

  const selectedBuilding = snapshot?.buildings.find((building) => building.id === selectedBuildingId);
  const availableActions = snapshot?.availableActions || [];
  const selectedAction = useMemo(() => availableActions.find((item) => item.id === selectedActionId) || availableActions[0] || null, [availableActions, selectedActionId]);
  const effectSummary = (action) => Object.entries(action?.effects || {}).map(([key, amount]) => ({ key, amount })).filter((item) => item.amount !== 0);
  const resourceName = (key) => ({ power: 'POWER', water: 'WATER', food: 'FOOD', oxygen: 'OXYGEN', crewWellbeing: 'CREW', habitatIntegrity: 'HABITAT', radiationRisk: 'EXPOSURE RISK', scienceProgress: 'SCIENCE' }[key] || key.toUpperCase());
  const pageCount = Math.max(1, Math.ceil(availableActions.length / 4));
  const visibleActions = availableActions.slice(choicePage * 4, choicePage * 4 + 4);

  const chooseBuilding = (buildingId) => {
    setSelectedBuildingId(buildingId);
    if (snapshot?.day === 1) {
      const action = availableActions.find((item) => item.buildingId === buildingId);
      if (action) setSelectedActionId(action.id);
    }
  };
  const takeAction = async () => {
    if (!selectedAction || busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const next = await worldApi.performAction(selectedAction.id, snapshot.day);
      setSnapshot(next);
      if (next.status === 'active') onSnapshot?.(next);
      else onComplete?.(next);
      setMessage(next.lastOutcome.text);
      setSelectedActionId(next.availableActions?.[0]?.id || '');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };
  const restart = async () => {
    setBusy(true); setError('');
    try {
      const next = await worldApi.startMission(MARS_MISSION.id, profile);
      setSnapshot(next); onSnapshot?.(next); setSelectedBuildingId('solar-array'); setSelectedActionId(next.availableActions?.[0]?.id || '');
      setMessage('A fresh mission is ready. Choose the first system to bring online.');
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  if (!snapshot) return <main className="mission-world"><div className="world-loading"><span className="world-orbit-mark">✦</span><p>{error || message}</p><button className="world-secondary" onClick={onBackToLaunch}>BACK TO MISSION CONTROL</button></div></main>;
  const completed = snapshot.status !== 'active';
  const buildingCopy = selectedBuilding?.kind === 'solar'
    ? 'The array helps supply power to habitat systems. Bring it online to grow the outpost’s modeled power buffer.'
    : selectedBuilding?.kind === 'habitat'
      ? 'The habitat protects the crew and houses core systems. Diagnostics use power now to improve its modeled condition.'
      : selectedBuilding?.kind === 'greenhouse'
        ? 'A greenhouse takes power and water to build, then grows food on later sols while drawing power.'
        : selectedBuilding?.kind === 'lifeSupport'
          ? 'The life-support module uses power to improve the model’s oxygen and water recovery on later sols.'
          : selectedBuilding?.kind === 'shelter'
            ? 'The storm shelter draws power but lowers the game’s abstract exposure-risk meter, especially after rover work.'
            : 'The rover can investigate a nearby soil site when the outpost has enough power.';

  return <main className="mission-world">
    <header className="world-header">
      <div><span className="world-eyebrow"><i/> MARS OUTPOST · FIRST LIGHT</span><h1>Good to have you here, Commander {profile?.callsign || 'Cadet'}.</h1></div>
      <div className="world-header-actions"><span className="world-save"><i/> {snapshot.adapter === 'api' ? 'MISSION SERVICE CONNECTED' : 'LOCAL MISSION SAVE'}</span><button className="world-icon-button" onClick={() => setShowScience(!showScience)} aria-expanded={showScience} aria-label="Game model explanation"><CircleHelp size={17}/></button></div>
    </header>
    <div className="world-objective-row"><div className="objective-marker"><Sparkles size={15}/></div><div><span>{completed ? 'MISSION COMPLETE' : snapshot.day === 1 ? 'YOUR FIRST JOB' : 'MISSION OBJECTIVE'}</span><strong>{completed ? 'Mission Control is ready to review the flight.' : snapshot.day === 1 ? 'Get the outpost ready for its first full sol.' : 'Protect the crew, keep systems running, and complete the soil study.'}</strong></div><div className="sol-counter"><small>MISSION DAY</small><b>{String(snapshot.day).padStart(2, '0')} <i>/ {String(snapshot.durationDays).padStart(2, '0')} SOLS</i></b></div></div>

    <section className="world-layout" aria-label="Mars mission">
      <div className="world-main-column">
        <div className="world-scene-frame"><div className="scene-label"><span>UTOPIA PLANITIA · SURFACE WALK</span><span>SOL {String(snapshot.day).padStart(2, '0')} · {snapshot.day === 1 ? 'TOUCHDOWN' : completed ? 'FLIGHT COMPLETE' : 'OUTPOST ONLINE'}</span></div><OutpostScene snapshot={snapshot} selectedBuildingId={selectedBuildingId} onSelectBuilding={chooseBuilding} view={view}/><div className="scene-caption"><span>TAP / CLICK THE GROUND TO WALK · WASD / ARROWS TO MOVE · SPACE TO HOP <small>Mars gravity is about 0.38 of Earth’s · NASA · rover panorama is a different Mars site</small></span><div className="view-controls" aria-label="Camera view"><b>CAMERA</b>{[['first','1 · VISOR'],['second','2 · CREW CAM'],['third','3 · FOLLOW']].map(([id,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)} aria-pressed={view===id}>{label}</button>)}</div></div></div>
        <div className="resource-strip" aria-label="Outpost systems, illustrative game values">{resourceMeta.map(([key, label, Icon]) => <div className="resource-chip" key={key}><Icon size={15}/><span>{label}</span><b>{snapshot.resources[key]}<small> GU</small></b><i className={`resource-meter ${key === 'radiationRisk' ? 'is-risk' : ''}`}><i style={{ width: `${snapshot.resources[key]}%`, backgroundColor: key === 'radiationRisk' ? (snapshot.resources[key] >= 40 ? '#d49b4b' : '#82b08a') : undefined }}/></i></div>)}</div>
        <p className="game-value-note">GU = game units. Exposure risk is an abstract training meter, not a radiation dose. All values are simplified for play and are not NASA measurements.</p>
        {!completed && <section className="command-deck" aria-label="Mission command choices"><div className="command-heading"><span className="command-pulse"/><div><small>INCOMING CREW TRANSMISSION · SOL {String(snapshot.day).padStart(2,'0')}</small><h2>{snapshot.day===1?'“We’re home, Commander. What do we secure first?”':'“Commander, choose what our crew tackles this sol.”'}</h2><p>{snapshot.day===1?'Mika is waiting at the habitat hatch. Compare the likely gains and trade-offs before you give the go-ahead.':'Every sol is a choice about time, supplies, crew health and discovery. Choose the work that matters most today.'}</p></div></div>
          <div className="story-choice-grid">{visibleActions.map((option,index)=>{const deltas=effectSummary(option);const gains=deltas.filter(item=>item.amount>0);const costs=deltas.filter(item=>item.amount<0);const benefit=gains.length?gains.map(item=>`${resourceName(item.key)} +${item.amount}`).join(' · '):option.setPowerMode==='life-support'?'OXYGEN reserve held steady':option.setPowerMode==='research'?'SCIENCE +4 each sol':'Crew wellbeing holds through daily upkeep';const tradeoff=costs.length?costs.map(item=>`${resourceName(item.key)} ${item.amount}`).join(' · '):option.setPowerMode==='life-support'?'POWER -3 beyond normal daily use':option.setPowerMode==='research'?'POWER -5 beyond normal daily use':option.id==='conserve-and-observe'?'No outpost system comes online this sol':option.buildingId==='solar-array'?'Uses the crew’s first work window':'Uses this sol’s work window';return <button key={option.id} className={`story-choice ${selectedAction?.id===option.id?'selected':''}`} onClick={()=>setSelectedActionId(option.id)} aria-pressed={selectedAction?.id===option.id}><span className="story-choice-index">0{choicePage*4+index+1}</span><b>{option.title}</b><p>{option.detail}</p><span className="choice-outcomes"><small><i>▲</i> ADVANTAGE <strong>{benefit}</strong></small><small><i>◆</i> TRADE-OFF <strong>{tradeoff}</strong></small></span></button>;})}</div>
          {pageCount>1&&<div className="choice-pager"><span>ORDERS {choicePage*4+1}–{Math.min(choicePage*4+4,availableActions.length)} OF {availableActions.length}</span><button disabled={choicePage===0} onClick={()=>{const next=choicePage-1;setChoicePage(next);setSelectedActionId(availableActions[next*4]?.id||'');}}>PREVIOUS</button><button disabled={choicePage===pageCount-1} onClick={()=>{const next=choicePage+1;setChoicePage(next);setSelectedActionId(availableActions[next*4]?.id||'');}}>MORE ORDERS</button></div>}
          {selectedAction&&<div className="command-commit"><span><b>COMMANDER’S ORDER</b><small>{selectedAction.title} · the crew will report the result in the flight log.</small></span><button className="world-primary" disabled={busy} onClick={takeAction}>{busy?'CREW IN ACTION…':'GIVE THE ORDER'} <ArrowRight size={16}/></button></div>}
        </section>}
        {message && !busy && <p className="world-feedback world-story-feedback" role="status">{message}</p>}{error && <p className="world-error" role="alert">{error}</p>}
        {snapshot.events?.length > 1 && <details className="mission-log"><summary>MISSION LOG · {snapshot.events.length} UPDATES</summary><ol>{snapshot.events.slice().reverse().map((event, index) => <li key={`${event.id}-${index}`}><b>SOL {String(event.day).padStart(2, '0')}</b>{event.text}</li>)}</ol></details>}
      </div>

      <aside className="world-side-panel world-side-panel-compact">
        <div className="orbit-card"><div className="orbit-avatar">✦</div><div className="orbit-heading"><span>ORBIT · MISSION ADVISOR</span><small>READY TO HELP</small></div><p>{completed ? 'Your seven-sol training flight is complete. Mission Control can review the choices and systems log.' : snapshot.lastOutcome ? 'Order logged. The resource meters show how the outpost responded; pick a new order in the crew transmission below.' : 'Walk around and inspect the outpost. Then compare the crew’s four orders in the transmission below before you choose.'}</p><button onClick={() => setShowScience(!showScience)}><CircleHelp size={13}/> HOW THE GAME MODEL WORKS</button></div>

        <div className="system-inspector"><div className="panel-kicker">{snapshot.day === 1 ? 'OUTPOST SYSTEM' : 'MISSION DECISION'}</div><h2>{snapshot.day === 1 ? selectedBuilding?.name || 'Select a structure' : completed ? 'Flight summary' : 'What should the crew do?'}</h2>
          {snapshot.day === 1 && <><div className={`system-status ${selectedBuilding?.status === 'online' ? 'is-online' : ''}`}><i/>{selectedBuilding?.status === 'online' ? 'ONLINE' : 'STANDBY'}</div><p>{buildingCopy}</p></>}
          {completed && <div className="mission-complete"><Check size={18}/><span>CREW SAFE · TRAINING FLIGHT FINISHED</span></div>}
          {error && <p className="world-error" role="alert">{error}</p>}
        </div>
        <div className="crew-card"><div className="panel-kicker">CREW CHANNEL</div><div className="crew-line"><span>👩🏾‍🚀</span><p><b>Sol · Field scientist</b><br/>{snapshot.day === 1 ? 'I’m ready to study the soil once we have the outpost set up.' : completed ? 'Thanks for keeping the crew and our work in mind, Commander.' : 'The nearby soil site is ready when our systems and supplies allow.'}</p></div></div>
        {snapshot.day > 1 && <button className="world-secondary restart-button" onClick={restart} disabled={busy}><RotateCcw size={14}/> RESTART MISSION</button>}
      </aside>
    </section>
    {showScience && <div className="science-toast" role="status"><button aria-label="Close explanation" onClick={() => setShowScience(false)}>×</button><b>HOW THE GAME MODEL WORKS</b><p>Each choice and systems check changes abstract game units. The scenario’s rates and outcomes are created for gameplay; they are not NASA measurements or mission forecasts.</p><small>NASA sourced observations will be attributed separately when added to the mission.</small></div>}
  </main>;
}
