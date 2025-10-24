import { state, nearestFreshFree, draw } from './state.js';

export function findNearest(){
  const best = nearestFreshFree(state.entrancePx);
  const info = document.getElementById('info');
  if(!best){
    if(info) info.innerHTML = 'No fresh free tables — try Randomize or reduce TTL.';
    state.highlightId = null; draw(); return;
  }
  state.highlightId = best.id;
  setTimeout(()=>{ state.highlightId=null; draw(); }, 1800);
  if(info) info.innerHTML = `Nearest <b>fresh free</b> table: <b>${best.id}</b>.`;
  draw();
}
