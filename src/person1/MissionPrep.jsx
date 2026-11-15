import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, FlaskConical, Leaf, Radio, Satellite, Shield, Sparkles, Users } from 'lucide-react';
import MarsPanorama from './MarsPanorama';
import { SCIENCE_SOURCES } from '../shared/scienceSources';

const focusOptions = [
  { id: 'habitat', icon: Shield, label: 'Get the habitat ready', detail: 'Check the crew’s new home before the first surface shift.', lesson: 'Mars has a very thin atmosphere. A habitat must create a protected place for people to live.', crewId: 'mika', voice: 'I’ll run the first habitat checks with you, Commander. Tell me what matters most.' },
  { id: 'samples', icon: FlaskConical, label: 'Read the red ground', detail: 'Give the science team its first chance to study the surface.', lesson: 'Rocks and soil can preserve clues about how Mars changed over time.', crewId: 'sol', voice: 'There’s a whole planet’s history under our boots. Let’s start by asking the ground a question.' },
  { id: 'food', icon: Leaf, label: 'Start growing food', detail: 'Make the first step toward a steady food supply for the crew.', lesson: 'Growing food away from Earth means caring for plants while managing limited supplies.', crewId: 'sol', voice: 'A tiny greenhouse can teach us a lot. I’ll help you start small and observe carefully.' },
];

const payload = [
  { id: 'terrain-camera', icon: Satellite, title: 'Terrain camera', purpose: 'Look over the route before the crew heads out.', intel: 'Mars Trek provides real terrain and elevation layers for Mars.', source: SCIENCE_SOURCES.marsTrek },
  { id: 'sample-case', icon: FlaskConical, title: 'Sample case', purpose: 'Keep a small training sample organized for study.', intel: 'Viking landers helped scientists examine Martian soil and atmosphere.', source: SCIENCE_SOURCES.viking2 },
  { id: 'greenhouse-kit', icon: Leaf, title: 'Greenhouse starter', purpose: 'Begin a small plant-growth learning experiment.', intel: 'The Canadian Space Agency connects food production with nutrition and careful resource use.', source: SCIENCE_SOURCES.csaFood },
  { id: 'crew-journal', icon: Users, title: 'Crew health journal', purpose: 'Record how the team sleeps, moves, and feels during the mission.', intel: 'NASA’s space-biology studies help explain how spaceflight can affect human health.', source: SCIENCE_SOURCES.osdr },
];

export default function MissionPrep({ profile, mission, onLaunch, onBack, busy = false }) {
  const [focus, setFocus] = useState('habitat');
  const [cargo, setCargo] = useState([null, null]);
  const [siteStoryOpen, setSiteStoryOpen] = useState(false);
  const chosenFocus = focusOptions.find(option => option.id === focus) || focusOptions[0];
  const crewVoice = mission.crew.find(member => member.id === chosenFocus.crewId);
  const loadedCount = cargo.filter(Boolean).length;

  function loadPayload(id, slotIndex = -1) {
    setCargo(current => {
      if (current.includes(id)) return current.map(item => item === id ? null : item);
      const next = [...current];
      const emptyIndex = next.findIndex(item => item === null);
      const targetIndex = slotIndex >= 0 ? slotIndex : emptyIndex;
      if (targetIndex < 0) return current;
      next[targetIndex] = id;
      return next;
    });
  }

  function dropPayload(event, slotIndex) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (payload.some(item => item.id === id)) loadPayload(id, slotIndex);
  }

  function cardKeyDown(event, id) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      loadPayload(id);
    }
  }

  const ready = loadedCount === 2 && !busy;
  const preparation = {
    focusId: focus,
    focusLabel: chosenFocus.label,
    landingSiteId: 'utopia-planitia',
    landingSiteLabel: 'Utopia Planitia',
    payloadIds: cargo.filter(Boolean),
    payloadLabels: cargo.filter(Boolean).map(id => payload.find(item => item.id === id)?.title).filter(Boolean),
    cargoRule: 'fictional-training-limit',
  };

  return <main className="prep-screen">
    <div className="prep-sky" aria-hidden="true"><MarsPanorama variant="orbit" className="prep-panorama"/><div className="prep-vignette"/><div className="prep-orbit-path"/><div className="prep-scan-beam"/></div>
    <header className="prep-header">
      <div className="prep-heading-copy"><span className="eyebrow"><span className="eyebrow-line"/> MARS ORBIT · FLIGHT DECK</span><h1>FIRST, WE<br/><em>MAKE A PLAN.</em></h1><p>Commander {profile.callsign}, orbit is stable. Check the landing site, hear your crew, and prepare your first surface shift.</p></div>
      <div className="prep-mission-mark"><Compass size={25}/><span className="prep-mission-kicker">MISSION · {mission.durationDays} SOLS</span><b className="prep-mission-title">FIRST LIGHT</b><small className="prep-mission-subtitle">UTOPIA PLANITIA · MARS</small></div>
    </header>

    <section className="prep-site-card" aria-label="Landing site reconnaissance">
      <div className="prep-site-visual">
        <span className="prep-site-coord">47.64° N<br/>134.29° E</span><span className="prep-site-reticle" aria-hidden="true"><i/><b/></span>
        <span className="prep-site-label"><i/> ORBITAL RECON · SITE IN VIEW</span>
        <button className="prep-scan-toggle" onClick={() => setSiteStoryOpen(open => !open)} aria-expanded={siteStoryOpen}><Compass size={16}/>{siteStoryOpen ? 'RETURN TO ORBIT' : 'EXPLORE THE LANDING SITE'}</button>
      </div>
      <div className="prep-site-copy"><span className="prep-kicker"><span/> LANDING SITE · UTOPIA PLANITIA</span><h2>A safe landing starts <em>from orbit.</em></h2><p>Viking 2 reached this broad northern plain in 1976. Its landing team changed sites after orbital images showed rough terrain near the original target.</p>
        {siteStoryOpen && <div className="prep-site-reveal"><Sparkles size={17}/><span><b>MISSION CONTROL NOTE</b> The first target looked rough from orbit. The team used new images to choose a safer area. Your crew is learning to study a place before committing to a route.</span></div>}
        <small className="prep-map-note">Historical coordinates · illustrative terrain view</small>
      </div>
    </section>

    <section className="prep-focus prep-console" aria-labelledby="focus-title">
      <div className="prep-section-heading"><span className="prep-index">01</span><div><small>INCOMING · CREW CHANNEL</small><h2 id="focus-title">What should we do first?</h2></div><span className="prep-selected-chip"><Radio size={15}/> LIVE FROM THE HABITAT</span></div>
      <div className="crew-briefing"><div className="crew-brief-avatar">{crewVoice?.avatar || '🧑🏽‍🚀'}</div><div className="crew-brief-copy"><span>{crewVoice?.name || 'MISSION CONTROL'} · {crewVoice?.role || 'CREW'}</span><p>“{chosenFocus.voice}”</p></div><div className="crew-wave" aria-label="Crew transmission active"><i/><i/><i/><i/><i/><i/><i/></div></div>
      <div className="focus-options" role="group" aria-label="Choose a first mission focus">{focusOptions.map(({ id, icon: Icon, label, detail }) => <button key={id} className={`focus-option ${focus === id ? 'selected' : ''}`} onClick={() => setFocus(id)} aria-pressed={focus === id}><span className="focus-icon"><Icon size={21}/></span><span className="focus-copy"><b>{label}</b><small>{detail}</small></span><i className="focus-radio">{focus === id && <Check size={14}/>}</i></button>)}</div>
      <div className="focus-science"><span className="science-pulse">✳</span><p><b>WHY THIS MATTERS</b><br/>{chosenFocus.lesson}</p></div>
    </section>

    <section className="prep-cargo prep-console" aria-labelledby="cargo-title">
      <div className="prep-section-heading"><span className="prep-index">02</span><div><small>LOADOUT · TRAINING MANIFEST</small><h2 id="cargo-title">Pack the tools for your first shift</h2></div><span className="cargo-count">{loadedCount}<b> / 2</b></span></div>
      <div className="cargo-workspace">
        <div className="cargo-inventory"><p className="cargo-instruction">Drag a crate into the cargo bay, or tap it to load it.</p><div className="payload-grid">{payload.map(({ id, icon: Icon, title, purpose, intel, source }) => { const slot = cargo.indexOf(id); const selected = slot !== -1; const full = loadedCount === 2 && !selected; return <article key={id} className={`payload-card ${selected ? 'loaded' : ''} ${full ? 'bay-full' : ''}`} draggable={!selected && !full} role="button" tabIndex={full ? -1 : 0} aria-pressed={selected} onClick={() => !full && loadPayload(id)} onKeyDown={event => cardKeyDown(event, id)} onDragStart={event => event.dataTransfer.setData('text/plain', id)}><span className="payload-grip" aria-hidden="true">⠿</span><div className="payload-card-top"><span className="payload-icon"><Icon size={21}/></span><span className="payload-state">{selected ? `LOADED · BAY 0${slot + 1}` : 'TRAINING EQUIPMENT'}</span>{selected && <Check size={17} className="payload-check"/>}</div><h3>{title}</h3><p>{purpose}</p><small className="payload-intel"><b>MISSION INTEL</b> {intel}</small><small className="payload-provenance">RESEARCH CONTEXT · {source.organization}</small></article>; })}</div></div>
        <div className="cargo-bay-wrap"><div className="cargo-bay-heading"><span>LANDER CARGO BAY</span><span>MANIFEST {loadedCount}/2</span></div><div className="cargo-slots" aria-label="Cargo bay"><div className="cargo-rail" aria-hidden="true"/><div className="cargo-slot-row">{cargo.map((id, index) => { const item = payload.find(entry => entry.id === id); const SlotIcon = item?.icon; return <div key={index} className={`cargo-slot ${item ? 'filled' : 'empty'}`} onDragOver={event => event.preventDefault()} onDrop={event => dropPayload(event, index)}><span className="slot-number">BAY 0{index + 1}</span>{item ? <><button className="cargo-unload" onClick={() => loadPayload(item.id)} aria-label={`Unload ${item.title}`}>×</button>{SlotIcon && <SlotIcon size={25}/>}<b>{item.title}</b><small>MANIFESTED</small></> : <><span className="slot-plus">＋</span><b>AWAITING CRATE</b><small>DROP EQUIPMENT HERE</small></>}</div>; })}</div><div className="bay-status"><span className={ready ? 'bay-ready' : ''}><i/>{ready ? 'MANIFEST READY' : 'AWAITING LOADOUT'}</span><span>SIMPLIFIED TRAINING MANIFEST</span></div></div><p className="cargo-rule"><Shield size={15}/> The two-crate limit is a game scenario rule; it does not represent a real spacecraft’s capacity.</p></div>
      </div>
    </section>

    <footer className="prep-footer"><button className="back-link" onClick={onBack}><ArrowLeft size={16}/> BACK TO CREW BRIEFING</button><div className="prep-save-note"><i/> FLIGHT PLAN SAVES AT LAUNCH</div><button className="primary-btn prep-launch-btn" disabled={!ready} onClick={() => onLaunch(preparation)}>{busy ? 'SAVING FLIGHT PLAN…' : ready ? 'SEAL THE MANIFEST' : `LOAD ${2 - loadedCount} MORE CRATE${loadedCount === 1 ? '' : 'S'}`} <ArrowRight size={18}/></button></footer>
  </main>;
}
