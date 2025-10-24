<<<<<<< HEAD
// src/ui.js
import { state } from './state.js';

export function initUI({ onFloorChange, onRandomize, onApplyTTL, onFind }) {
  const sel = document.getElementById('floorSelect');
  sel.innerHTML = '';

  // Build options from state.floors (loaded from building.example.json)
  state.floors.forEach(floor => {
    const opt = document.createElement('option');
    opt.value = floor.id;
    opt.textContent = floor.name;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', e => {
    const floorId = e.target.value;
    onFloorChange && onFloorChange(floorId);
  });

  document.getElementById('randBtn')?.addEventListener('click', () => {
    onRandomize && onRandomize();
  });

  document.getElementById('applyTTL')?.addEventListener('click', () => {
    const v = parseInt(document.getElementById('ttlInput').value || '20', 10);
    onApplyTTL && onApplyTTL(Math.max(1, v));
  });

  document.getElementById('findBtn')?.addEventListener('click', () => {
    onFind && onFind();
  });
}

export function setSelectedFloor(floorId) {
  const sel = document.getElementById('floorSelect');
  if (sel) sel.value = String(floorId);
}

export function getXY(canvas, evt) {
  const r = canvas.getBoundingClientRect();
  return { x: Math.round(evt.clientX - r.left), y: Math.round(evt.clientY - r.top) };
}

export function mountLegend(el) {
  el.innerHTML = `
    <span>● Green: Free</span> &nbsp; <span>● Red: Taken</span> &nbsp; <span>● Grey: Unknown/Stale</span>
    <div style="margin-top:6px;font-size:12px;color:#555">Alt-click logs coordinates in DevTools to place real tables.</div>
  `;
}
=======
>>>>>>> parent of 6dd3b51 (update)
