export const state = {
  floor: 1,
  ttlMinutes: 20,
  width: 0, height: 0,
  tables: [],
  zonesPx: [],
  entrancePx: { x: 0, y: 0 },
  selectedId: null,
  highlightId: null
};

let canvas, ctx, img, eventsBound = false;

const nowMs = () => Date.now();
export const fresh = t => (nowMs() - t.last_update) <= state.ttlMinutes * 60 * 1000;
const dist2 = (a,b) => (a.x-b.x)**2 + (a.y-b.y)**2;

const heatColor = (h,a=0.28) => h<=0.33 ? `rgba(34,197,94,${a})` : (h<=0.66 ? `rgba(245,158,11,${a})` : `rgba(239,68,68,${a})`);

function n2pX(nx){ return Math.round(nx * state.width); }
function n2pY(ny){ return Math.round(ny * state.height); }

function genTablesForZone(z){
  const [nx1,ny1,nx2,ny2] = z.bounds;
  const x1=n2pX(nx1), y1=n2pY(ny1), x2=n2pX(nx2), y2=n2pY(ny2);
  const cols = z.grid?.[0] || 6, rows = z.grid?.[1] || 3;
  const w=x2-x1, h=y2-y1;
  const tables=[];
  for(let r=1;r<=rows;r++){
    for(let c=1;c<=cols;c++){
      const x = Math.round(x1 + (c/(cols+1))*w);
      const y = Math.round(y1 + (r/(rows+1))*h);
      tables.push({ id:`F${state.floor}-${z.id}-${String((r-1)*cols+c).padStart(2,'0')}`, x, y, status:'unknown', last_update:0 });
    }
  }
  return { tables, zpx:{ id:z.id, name:z.name, x1,y1,x2,y2 } };
}

function zoneHeat(zpx){
  const members = state.tables.filter(t => t.x>=zpx.x1 && t.x<=zpx.x2 && t.y>=zpx.y1 && t.y<=zpx.y2);
  const freshOnes = members.filter(fresh);
  const capacity = members.length || 1;
  const occupied = freshOnes.filter(t => t.status==='taken').length;
  return { heat: occupied/capacity };
}

function tableAt(x,y){
  const R=12, r2=R*R;
  for(const t of state.tables){ if((t.x-x)**2+(t.y-y)**2<=r2) return t; }
  return null;
}
export function setTTL(mins){ state.ttlMinutes = mins; }

export function nearestFreshFree(from){
  const cands = state.tables.filter(t => t.status==='free' && fresh(t));
  if(!cands.length) return null;
  let best=cands[0], bestD=dist2(best,from);
  for(let i=1;i<cands.length;i++){ const d=dist2(cands[i],from); if(d<bestD){best=cands[i]; bestD=d;} }
  return best;
}

export function loadFloor(floor, FLOORS){
  state.floor = floor;
  if(!canvas){ canvas=document.getElementById('stage'); ctx=canvas.getContext('2d'); }
  const cfg = FLOORS[floor];
  img = new Image();
  img.src = cfg.image;
  img.onload = () => {
    canvas.width = img.width; canvas.height = img.height;
    state.width = img.width; state.height = img.height;

    state.tables=[]; state.zonesPx=[];
    for(const z of cfg.zones){ const {tables,zpx}=genTablesForZone(z); state.tables.push(...tables); state.zonesPx.push(zpx); }
    state.entrancePx = { x:n2pX(cfg.entrance.x), y:n2pY(cfg.entrance.y) };
    draw();
  };
  if(!eventsBound){
    eventsBound = true;
    canvas.addEventListener('click', (e)=>{
      const r = canvas.getBoundingClientRect();
      const x = Math.round(e.clientX - r.left), y = Math.round(e.clientY - r.top);
      if(e.altKey){ console.log(`{ x:${(x/state.width).toFixed(4)}, y:${(y/state.height).toFixed(4)} } // normalized`); return; }
      const hit = tableAt(x,y); if(!hit) return;
      hit.status = (hit.status==='free') ? 'taken' : 'free';
      hit.last_update = nowMs();
      state.selectedId = hit.id;
      draw();
    });
  }
}

export function draw(){
  if(!ctx || !img) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img,0,0);

  for(const z of state.zonesPx){
    const h = zoneHeat(z).heat;
    ctx.fillStyle = heatColor(h);
    ctx.fillRect(z.x1, z.y1, z.x2-z.x1, z.y2-z.y1);
    ctx.fillStyle='rgba(0,0,0,.7)'; ctx.font='12px sans-serif';
    ctx.fillText(`${z.name} ${(h*100)|0}%`, z.x1+6, z.y1+16);
  }

  // entrance
  ctx.fillStyle = '#2563eb';
  ctx.beginPath(); ctx.arc(state.entrancePx.x, state.entrancePx.y, 6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#1f2937'; ctx.font='12px sans-serif';
  ctx.fillText('Entrance', state.entrancePx.x+10, state.entrancePx.y-8);

  // tables
  for(const t of state.tables){
    const isFresh = fresh(t);
    let color = '#9ca3af';
    if(isFresh) color = (t.status==='free') ? '#22c55e' : '#ef4444';

    if(state.highlightId === t.id){
      ctx.strokeStyle='rgba(37,99,235,.8)'; ctx.lineWidth=3;
      const pulse = 16 + 3*Math.sin(performance.now()/160);
      ctx.beginPath(); ctx.arc(t.x,t.y,pulse,0,Math.PI*2); ctx.stroke();
    }

    ctx.fillStyle=color; ctx.beginPath(); ctx.arc(t.x,t.y,10,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.7)'; ctx.font='11px sans-serif';
    ctx.fillText(t.id.split('-').at(-1), t.x+12, t.y+4);
  }

  if(state.selectedId){
    const s = state.tables.find(t=>t.id===state.selectedId);
    if(s){ ctx.strokeStyle='#111827'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(s.x,s.y,14,0,Math.PI*2); ctx.stroke(); }
  }

  // info
  const info = document.getElementById('info');
  if(info){
    const freshCount = state.tables.filter(fresh).length;
    const freeFresh = state.tables.filter(t=>fresh(t)&&t.status==='free').length;
    const takenFresh = state.tables.filter(t=>fresh(t)&&t.status==='taken').length;
    info.innerHTML = `Floor <b>${state.floor}</b> — Fresh: <b>${freshCount}</b> | Free: <b>${freeFresh}</b> | Taken: <b>${takenFresh}</b> | TTL: <b>${state.ttlMinutes} min</b> | Tables: <b>${state.tables.length}</b>`;
  }
}

// let UI refresh as TTL ages
setInterval(draw, 10000);
