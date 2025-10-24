import { currentFloor, fresh, state } from './state.js';
import { zoneHeat, heatColor } from './heat.js';
import { getFloorImage } from './floors.js';

let ctx, canvas;

export async function attach(canvasEl) {
  canvas = canvasEl; ctx = canvas.getContext('2d');
}

export async function draw(infoEl) {
  const floor = currentFloor();
  if (!floor) return;
  const img = await getFloorImage(floor);

  canvas.width = img.width;  // use natural size (fastest)
  canvas.height = img.height;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0);

  // zones
  for (const z of floor.zones) {
    const [x1,y1,x2,y2] = z.bounds;
    const stats = zoneHeat(z, floor.tables, fresh);
    ctx.fillStyle = heatColor(stats.heat, 0.28);
    ctx.fillRect(x1,y1,x2-x1,y2-y1);
    ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.font = "12px sans-serif";
    ctx.fillText(`${z.name} ${(stats.heat*100)|0}%`, x1+6, y1+16);
  }

  // entrance
  if (floor.entrance) {
    ctx.fillStyle = "#2563eb";
    ctx.beginPath(); ctx.arc(floor.entrance.x, floor.entrance.y, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle="#1f2937"; ctx.font="12px sans-serif";
    ctx.fillText("Entrance", floor.entrance.x+10, floor.entrance.y-8);
  }

  // tables
  for (const t of floor.tables) {
    const isFresh = fresh(t);
    let color = "#9ca3af";
    if (isFresh) color = (t.status === "free") ? "#22c55e" : "#ef4444";

    if (state.highlightId === t.id) {
      ctx.strokeStyle = "rgba(37,99,235,.8)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(t.x, t.y, 16, 0, Math.PI*2); ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(t.x, t.y, 10, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.font = "11px sans-serif";
    ctx.fillText(t.id, t.x+12, t.y+4);
  }

  const freshCount = floor.tables.filter(fresh).length;
  const freeFresh = floor.tables.filter(t => fresh(t) && t.status === "free").length;
  const takenFresh = floor.tables.filter(t => fresh(t) && t.status === "taken").length;
  infoEl.innerHTML = `Floor: <b>${floor.name}</b> — Fresh: <b>${freshCount}</b> | Free: <b>${freeFresh}</b> | Taken: <b>${takenFresh}</b> | TTL: <b>${state.ttlMinutes}m</b>`;
}

export function tableAt(x,y) {
  const floor = currentFloor();
  const R=12;
  return floor.tables.find(t => (t.x-x)**2 + (t.y-y)**2 <= R*R) || null;
}
