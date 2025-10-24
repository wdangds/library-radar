// src/main.js
import { FLOORS } from './floors.js';
import { initUI, setSelectedFloor } from './ui.js';

// These should exist in your other files:
import { loadFloor, draw, setTTL } from './state.js';
import { seedRandom } from './seed.js';
// If your finder export is named differently, adjust this import:
import { findNearest } from './find.js';

export function boot() {
  // Wire UI first
  initUI({
    onFloorChange: (floor) => {
      loadFloor(floor, FLOORS);  // rebuild tables/zones for that floor
      seedRandom();               // synth data so it looks alive
      draw();
    },
    onRandomize: () => { seedRandom(); draw(); },
    onApplyTTL: (mins) => { setTTL(mins); draw(); },
    onFind: () => { if (typeof findNearest === 'function') findNearest(); draw(); }
  });

  // Default to Floor 1
  setSelectedFloor(1);
  loadFloor(1, FLOORS);
  seedRandom();
  draw();
}
