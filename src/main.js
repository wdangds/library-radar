<<<<<<< HEAD
// src/main.js
import { initUI, setSelectedFloor } from './ui.js';

// These should exist in your other files:
import { loadModel, setCurrentFloor, draw, setTTL } from './state.js';
import { seedRandom } from './seed.js';
// If your finder export is named differently, adjust this import:
import { findNearest } from './find.js';

export async function boot() {
  // Load the building model first (includes schematic floors)
  await loadModel('data/building.example.json');
  
  // Wire UI first
  initUI({
    onFloorChange: (floorId) => {
      setCurrentFloor(floorId);  // switch to the floor
      seedRandom();              // synth data so it looks alive
      draw();
    },
    onRandomize: () => { seedRandom(); draw(); },
    onApplyTTL: (mins) => { setTTL(mins); draw(); },
    onFind: () => { if (typeof findNearest === 'function') findNearest(); draw(); }
  });

  // Default to Floor 1
  setSelectedFloor('F1');
  setCurrentFloor('F1');  // Use the actual floor ID from building.example.json
  seedRandom();
  draw();
}
=======
>>>>>>> parent of 6dd3b51 (update)
