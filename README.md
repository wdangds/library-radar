# Library Radar

Live, privacy-first seat availability for **multi-floor** libraries.
Students see a floor map, zone heat, and the **nearest fresh free table**—no wandering.

---

## 🚀 Quick Start

```bash
# Serve statically (any port is fine)
cd library-radar
python3 -m http.server 5173

# Open in your browser
# http://localhost:5173
```

**Demo flow:** Pick a floor → click **Demo: Randomize** → click **Find Empty Table**.

---

## ✅ What’s in this MVP

* **5 floors** with a simple floor selector.
* Two render modes (per floor):

  * **Image mode:** draw the real floor plan (`image`), with optional **crop** to hide legends/white margins.
  * **Schematic mode:** clean, generated rectangles for zones + auto-placed seat rows (no image needed).
* **Crowd heat overlay** by zone (cool/warm/hot) computed from **fresh** reports.
* **Seat status & freshness:** click a table to toggle **free/taken**; reports **auto-expire** after TTL minutes → stale markers turn **grey**.
* **Nearest free table**: one click highlights the closest **fresh free** seat from the floor’s entrance.
* **Synthetic demo**: “Randomize” populates believable occupancy & staleness.
* **Alt-click coordinate logger**: capture `x,y` for entrance/tables/zones right off the canvas.

---

## 🧱 Project Structure

```
library-seat-radar/
├─ index.html
├─ styles/
│  └─ app.css
├─ assets/
│  └─ maps/
│     ├─ floor-1.jpg ... floor-5.jpg        # optional if using image floors
├─ data/
│  └─ building.example.json                  # multi-floor config
├─ src/
│  ├─ main.js                                # boots UI, events, selector
│  ├─ state.js                               # global state, model loading
│  ├─ draw.js                                # renders image OR schematic floors
│  ├─ floors.js                              # image cache helper
│  ├─ heat.js                                # zoneHeat / floorHeat / colors
│  ├─ find.js                                # nearestFreshFree()
│  ├─ seed.js                                # synthetic seeding (all floors)
│  ├─ ui.js                                  # legend + pointer helpers
│  └─ schematic.js                           # builds schematic floors from spec
└─ scripts/
   └─ serve.sh                               # tiny local server helper
```

---

## 🗺️ Configure Floors (`data/building.example.json`)

Each floor uses **one** of these styles:

### 1) Image mode (with optional crop)

```json
{
  "id": "F4",
  "name": "Floor 4",
  "image": "assets/maps/floor-4.jpg",
  "crop": { "sx": 90, "sy": 60, "sw": 1400, "sh": 950 },  // optional
  "entrance": { "x": 840, "y": 540 },
  "tables": [
    { "id": "F4-T01", "x": 700, "y": 220, "status": "unknown", "last_update": 0 }
  ],
  "zones": [
    { "id": "Z4R", "name": "Study Zone (Right)", "bounds": [660,140,1140,560] }
  ]
}
```

> **Tip:** To find good `crop` values quickly, **Alt-click** the top-left and bottom-right corners you want visible; set `sx,sy` to top-left, `sw,sh` to (x2−x1, y2−y1).

### 2) Schematic mode (clean, generated layout)

```json
{
  "id": "F5",
  "name": "Floor 5 (Schematic)",
  "schematic": {
    "size": { "width": 1200, "height": 900 },
    "areas": [
      { "id": "Z5R", "name": "Study Zone (Right)",  "rect": [660,140,480,420] },
      { "id": "Z5B", "name": "Study Zone (Bottom)", "rect": [300,560,780,220] }
    ],
    "entrance": { "x": 840, "y": 540 },
    "seatRows": [
      { "prefix": "R", "count": 6,  "start": [700,220], "step": [70,0] },
      { "prefix": "R", "count": 6,  "start": [700,300], "step": [70,0] },
      { "prefix": "B", "count": 12, "start": [340,640], "step": [70,0] },
      { "prefix": "B", "count": 6,  "start": [340,720], "step": [70,0] }
    ]
  },
  "tables": [],
  "zones": []
}
```

**How schematic works:** `src/schematic.js` materializes zones from `areas[*].rect` and auto-creates seats from `seatRows` unless you manually provide `tables`/`zones`.

---

## 🧭 Calibration Workflow (2–5 minutes/floor)

1. Start server → open the app.
2. Pick a floor.
3. **Alt-click** the entrance → paste `{x,y}` into the floor’s `entrance`.
4. **Alt-click** each table (or just a sample set) → paste into `tables`:

   ```json
   { "id": "F4-T02", "x": 760, "y": 220, "status": "unknown", "last_update": 0 }
   ```
5. (Optional) Draw zones with two Alt-clicks (top-left, bottom-right) → set `bounds: [x1,y1,x2,y2]`.
6. Save the JSON → refresh.

---

## 🧮 How Heat & Freshness Work

* **Freshness**: a report is *fresh* if `now - last_update ≤ TTL`.

  * Fresh **free** → green dot; fresh **taken** → red dot.
  * Stale/unknown → grey dot.
* **Zone heat** = (# fresh taken) / (zone capacity)
  Bucketed into **cool/warm/hot** for quick read.

---

## 🧰 Troubleshooting

* **Port already in use**
  Use another port or free 5500:

  ```bash
  python3 -m http.server 5173
  # or
  lsof -nP -iTCP:5500 -sTCP:LISTEN
  kill <PID>
  ```
* **`boot` not found**
  Ensure `src/main.js` exports a named `boot`:

  ```js
  export async function boot() { /* ... */ }
  ```

  And in `index.html`:

  ```html
  <script type="module">
    import { boot } from './src/main.js'; boot();
  </script>
  ```
* **Blank canvas / no floors**

  * Serve via `http://` (not `file://`), e.g., `python3 -m http.server 5173`.
  * Check `data/building.example.json` path & validity (no comments, correct image paths).
  * In DevTools Console:

    ```js
    fetch('data/building.example.json').then(r=>r.status)
    ```

---

## 🧪 What’s Next 

### 1) Real-time crowd

* Plug in a lightweight backend (Supabase/Firebase) to store seat updates.
* Basic anti-spam: rate-limit per device; expiry still enforced by TTL.

### 2) **AI “Latent” Phase → 3D Map**

Turn real photos or 2D plans into an explorable **3D** library view:

* **Capture**: short phone video or a set of photos around study areas.
* **Reconstruction** (offline pipeline):

  * **NeRF / Gaussian Splatting** or structure-from-motion to generate a 3D representation from images (model learns a **latent** radiance field).
  * Alternatively, floor-plan → **semantic layout** (walls/tables) via segmentation, then **extrude** to 3D.
* **Simplify**: export a light mesh or splat cloud for the web.
* **Front-end**: render in **Three.js**, reuse our seat IDs/coords as billboards in 3D.
* **Result**: same features (heat, nearest seat) with an optional **3D flyover** toggle.

*(This preserves privacy—no persistent video streams; we reconstruct structure, not people.)*

### 3) Quality of life

* QR check-in per table (adds URL query like `?table=F4-T02&status=free`).
* Keyboard accessibility & tooltips.
* Per-floor overview cards with heat %.

---

## 🔐 Privacy

* No cameras or continuous tracking in the MVP.
* All reports decay via TTL; stale data turns grey automatically.
* Future AI/3D steps run offline from short captures; output is structural, not identifying.

---

## 📝 License

MIT.

---

## 👥 Credits

* **Team:** Wan Dang and Danny Nhan 💪
* Map images belong to their respective libraries; used for prototyping only.

---

## 📎 Appendix: Minimal Example JSON (5 Floors, placeholders)

```json
{
  "ttlMinutes": 20,
  "floors": [
    { "id": "F1", "name": "Floor 1", "image": "assets/maps/floor-1.jpg", "entrance": { "x": 0, "y": 0 }, "tables": [], "zones": [] },
    { "id": "F2", "name": "Floor 2", "image": "assets/maps/floor-2.jpg", "entrance": { "x": 0, "y": 0 }, "tables": [], "zones": [] },
    { "id": "F3", "name": "Floor 3", "image": "assets/maps/floor-3.jpg", "entrance": { "x": 0, "y": 0 }, "tables": [], "zones": [] },
    { "id": "F4", "name": "Floor 4 (cropped)", "image": "assets/maps/floor-4.jpg", "crop": { "sx": 90, "sy": 60, "sw": 1400, "sh": 950 }, "entrance": { "x": 840, "y": 540 }, "tables": [], "zones": [] },
    { "id": "F5", "name": "Floor 5 (schematic)", "schematic": { "size": { "width": 1200, "height": 900 }, "areas": [], "entrance": { "x": 600, "y": 450 }, "seatRows": [] }, "tables": [], "zones": [] }
  ]
}
```
