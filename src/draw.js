import { currentFloor, fresh, state } from './state.js';
import { zoneHeat, heatColor } from './heat.js';
import { getFloorImage } from './floors.js'; // caches images per floor

let ctx, canvas;

export async function attach(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
}

// Draw the current floor (image+optional crop OR schematic)
export async function draw(infoEl) {
  const f = currentFloor();
  if (!f) return;

  if (f.schematic) {
    // ======= SCHEMATIC MODE =======
    const { width, height } = f._schematicSize || { width: 1200, height: 900 };
    canvas.width = width;
    canvas.height = height;

    // background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // zones (with heat overlay)
    for (const z of f.zones) {
      const [x1, y1, x2, y2] = z.bounds;
      const stats = zoneHeat(z, f.tables, fresh);
      ctx.fillStyle = heatColor(stats.heat, 0.22);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = "rgba(0,0,0,.20)";
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = "rgba(0,0,0,.74)";
      ctx.font = "12px sans-serif";
      ctx.fillText(`${z.name}`, x1 + 6, y1 + 16);
    }

    // entrance
    if (f.entrance) {
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(f.entrance.x, f.entrance.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1f2937";
      ctx.font = "12px sans-serif";
      ctx.fillText("Entrance", f.entrance.x + 10, f.entrance.y - 8);
    }

    // tables / seats
    renderTables(f);

  } else if (f.image) {
    // ======= IMAGE MODE (optional crop) =======
    const img = await getFloorImage(f);
    const crop = f.crop || { sx: 0, sy: 0, sw: img.width, sh: img.height };

    canvas.width = crop.sw;
    canvas.height = crop.sh;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      crop.sx, crop.sy, crop.sw, crop.sh,
      0, 0, crop.sw, crop.sh
    );

    // zones (with heat overlay)
    for (const z of f.zones) {
      const [x1, y1, x2, y2] = z.bounds;
      const stats = zoneHeat(z, f.tables, fresh);
      ctx.fillStyle = heatColor(stats.heat, 0.28);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = "rgba(0,0,0,.74)";
      ctx.font = "12px sans-serif";
      ctx.fillText(`${z.name}`, x1 + 6, y1 + 16);
    }

    // entrance
    if (f.entrance) {
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(f.entrance.x, f.entrance.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1f2937";
      ctx.font = "12px sans-serif";
      ctx.fillText("Entrance", f.entrance.x + 10, f.entrance.y - 8);
    }

    // tables / seats
    renderTables(f);
  }

  // footer info
  const freshCount = f.tables.filter(fresh).length;
  const freeFresh = f.tables.filter(t => fresh(t) && t.status === "free").length;
  const takenFresh = f.tables.filter(t => fresh(t) && t.status === "taken").length;
  infoEl.innerHTML =
    `Floor: <b>${f.name}</b> — Fresh: <b>${freshCount}</b> | Free: <b>${freeFresh}</b> | Taken: <b>${takenFresh}</b> | TTL: <b>${state.ttlMinutes}m</b>`;
}

function renderTables(f) {
  for (const t of f.tables) {
    const isFresh = fresh(t);
    let color = "#9ca3af"; // stale/unknown
    if (isFresh) color = t.status === "free" ? "#22c55e" : "#ef4444";

    // highlight animation / ring
    if (state.highlightId === t.id) {
      ctx.strokeStyle = "rgba(37,99,235,.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 16, 0, Math.PI * 2);
      ctx.stroke();
    }

    // seat dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // label
    ctx.fillStyle = "rgba(0,0,0,.74)";
    ctx.font = "11px sans-serif";
    ctx.fillText(t.id, t.x + 12, t.y + 4);
  }
}

// Hit test for clicks (works for both schematic & image modes)
export function tableAt(x, y) {
  const f = currentFloor();
  if (!f) return null;
  const R = 12;
  return f.tables.find(t => (t.x - x) ** 2 + (t.y - y) ** 2 <= R * R) || null;
}
