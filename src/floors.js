// Study-zone–only model with normalized bounds (0..1).
// Images must exist at assets/maps/floor-1.jpg ... floor-5.jpg

export const FLOORS = {
  1: {
    image: 'assets/maps/floor-1.jpg',
    entrance: { x: 0.52, y: 0.95 },
    zones: [
      { id: 'F1Z1', name: 'Reading Area', bounds: [0.12, 0.78, 0.88, 0.93], grid: [8, 2] }
    ]
  },
  2: {
    image: 'assets/maps/floor-2.jpg',
    entrance: { x: 0.50, y: 0.90 },
    zones: [
      { id: 'F2Z1', name: 'Research Commons', bounds: [0.47, 0.18, 0.95, 0.78], grid: [6, 3] }
    ]
  },
  3: {
    image: 'assets/maps/floor-3.jpg',
    entrance: { x: 0.12, y: 0.92 },
    zones: [
      { id: 'F3Z1', name: 'Study Zone', bounds: [0.12, 0.78, 0.88, 0.94], grid: [8, 2] }
    ]
  },
  4: {
    image: 'assets/maps/floor-4.jpg',
    entrance: { x: 0.80, y: 0.92 },
    zones: [
      { id: 'F4Z1', name: 'Study Zone (Right)',  bounds: [0.60, 0.24, 0.95, 0.75], grid: [6, 3] },
      { id: 'F4Z2', name: 'Study Zone (Bottom)', bounds: [0.12, 0.80, 0.88, 0.94], grid: [8, 2] }
    ]
  },
  5: {
    image: 'assets/maps/floor-5.jpg',
    entrance: { x: 0.80, y: 0.92 },
    zones: [
      { id: 'F5Z1', name: 'Grad Student Research', bounds: [0.62, 0.22, 0.95, 0.78], grid: [6, 3] }
    ]
  }
};
