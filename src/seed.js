import { state, draw } from './state.js';

export function seedRandom(){
  for(const t of state.tables){
    t.status = Math.random() < 0.55 ? 'free' : 'taken';
    const minsAgo = Math.floor(Math.random() * (state.ttlMinutes * 2));
    t.last_update = Date.now() - minsAgo * 60000;
  }
  draw();
}
