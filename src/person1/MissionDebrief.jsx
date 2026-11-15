import { ArrowLeft, ArrowRight, Check, Compass, Medal, Radio, Star } from 'lucide-react';

function objectiveLabel(objective) {
  if (typeof objective === 'string') return objective;
  return objective?.label || objective?.title || objective?.id || 'Mission objective';
}

export default function MissionDebrief({ profile, mission, run, onReturn }) {
  const report = run.finalReport || {};
  const snapshot = report.finalSnapshot || run.latestSnapshot || {};
  const objectives = report.objectiveStates || snapshot.objectiveStates || [];
  const completed = objectives.filter(item => item.status === 'complete' || item.completed === true).length;
  const totalObjectives = objectives.length || mission.objectives.length;
  const sols = report.solsElapsed ?? snapshot.sol ?? run.currentSol;
  const decisions = report.decisions || snapshot.decisions || [];
  const resources = snapshot.resources || [];
  const preparation = run.preparation;
  const statusLabel = report.status || run.status || 'complete';
  const statusCopy = statusLabel === 'success' || statusLabel === 'complete'
    ? 'MISSION COMPLETE · CREW RETURNED'
    : statusLabel === 'aborted' ? 'MISSION ENDED EARLY · REVIEW THE FLIGHT LOG' : 'MISSION RESULTS READY';

  return <div className="debrief-screen">
    <div className="debrief-sky" aria-hidden="true" />
    <span className="eyebrow"><span className="eyebrow-line"/> FLIGHT RECORDER · FINAL TRANSMISSION</span>
    <div className="debrief-title"><div><h1>MISSION<br/><em>DEBRIEF.</em></h1><p>Commander {profile.callsign}, here’s what your crew recorded on {mission.destination}.</p></div><div className="debrief-medal"><Medal size={28}/><span>FIRST LIGHT</span><strong>01</strong></div></div>
    <div className="debrief-status"><span><i/> {statusCopy}</span><span>MISSION · {mission.id.toUpperCase()}</span></div>
    <div className="debrief-stats"><article><small>TIME ON MARS</small><strong>{sols}<em> SOLS</em></strong><span>As recorded by the world module</span></article><article><small>OBJECTIVES</small><strong>{completed}<em> / {totalObjectives}</em></strong><span>Confirmed by mission telemetry</span></article><article><small>CREW CHANNEL</small><strong>{run.crewCheckIns?.length || 0}<em> CHECK-INS</em></strong><span>Conversations saved to your flight log</span></article></div>
    {preparation && <section className="debrief-section"><h2><Compass size={17}/> PREFLIGHT PLAN</h2><div className="debrief-preparation"><div><small>COMMANDER FOCUS</small><strong>{preparation.focusLabel}</strong></div><div><small>LANDING REGION</small><strong>{preparation.landingSiteLabel}</strong></div><div><small>TRAINING CARGO</small><strong>{preparation.payloadLabels?.join(' · ') || 'No cargo recorded'}</strong></div></div></section>}
    {objectives.length > 0 && <section className="debrief-section"><h2><Check size={17}/> OBJECTIVE RECORD</h2><ul className="debrief-objectives">{objectives.map((objective, index) => { const done = objective.status === 'complete' || objective.completed === true; return <li key={objective.id || index} className={done ? 'complete' : ''}><i>{done ? <Check size={12}/> : String(index + 1).padStart(2, '0')}</i><span>{objectiveLabel(objective)}</span><b>{done ? 'COMPLETE' : 'INCOMPLETE'}</b></li>; })}</ul></section>}
    {resources.length > 0 && <section className="debrief-section"><h2><Radio size={17}/> LAST REPORTED TELEMETRY</h2><div className="debrief-readings">{resources.map(reading => <div key={reading.id}><span>{reading.label}</span><strong>{reading.value} {reading.unit}</strong><small>{reading.sourceKind === 'measured' ? 'MEASURED' : reading.sourceKind === 'derived' ? 'DERIVED' : 'FICTIONAL SCENARIO'}</small></div>)}</div></section>}
    {decisions.length > 0 && <section className="debrief-section"><h2><Star size={17}/> COMMAND DECISIONS</h2><ol className="debrief-decisions">{decisions.map((decision, index) => <li key={decision.id || index}><span>SOL {decision.sol ?? '—'}</span><p>{decision.summary || decision.choiceLabel || decision.text || 'Decision recorded by the world module.'}</p></li>)}</ol></section>}
    <div className="debrief-footnote">This report includes only information sent by the mission world module and player actions saved in this browser.</div>
    <button className="debrief-return" onClick={onReturn}><ArrowLeft size={15}/> BACK TO FLIGHT RECORD <ArrowRight size={15}/></button>
  </div>;
}
