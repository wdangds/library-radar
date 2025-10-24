// src/ui.js
import { FLOORS } from './floors.js';

export function initUI({ onFloorChange, onRandomize, onApplyTTL, onFind }) {
  const sel = document.getElementById('floorSelect');
  sel.innerHTML = '';

  // Build options Floor 1..N from FLOORS
  Object.keys(FLOORS).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = `Floor ${k}`;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', e => {
    const f = parseInt(e.target.value, 10);
    onFloorChange && onFloorChange(f);
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

export function setSelectedFloor(n) {
  const sel = document.getElementById('floorSelect');
  if (sel) sel.value = String(n);
}
