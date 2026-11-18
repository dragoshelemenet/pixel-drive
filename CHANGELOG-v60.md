# Pixel Drive v60 — collision and contact recovery

Recovered from GitHub main `c656424` (v59). The earlier `/workspaces/pixel-drive`
workspace was not available. The historical 634/2,531-scenario scripts were not in
Git history or the checkout; their reported results are not reused as verification.
The recovered CPU and browser regression scripts were retained and extended.

## Findings and changes

- `dist/nivel-1/simulation.js`, `update`: v59 merged failed road-corner containment
  with physical obstacle collision. In the new deterministic test, 6,884 of 6,958
  obstacle-clear edge passes were penalized. Viscri now checks solids independently
  and permits a narrow shoulder. Leaving the driving area stops movement with an
  explanation, without damage or replay. Returning toward the road remains possible.
  This does not remove Viscri buildings, pumps, parked cars, traffic or pedestrians.
  The original city's existing curb collision behavior is preserved.
- `dist/nivel-1/maps/road-safety.js`, `apply` / `hit`: the service collider previously
  treated the entire rectangle x=4.15..9.2, z=-4.6..4.6 as a building at every facility.
  It now follows each facility's ground-level walls/buildings, steps, parked cars,
  pump islands and columns. Airborne roofs/canopies do not act as ground obstacles.
  Physical impacts use zero extra clearance padding; the existing 0.07 margin is
  retained for conservative spawn/navigation checks. Stable IDs identify 484 solids.
- `simulation.js`: rejected obstacle movement stops the car and rolls back steering.
  A per-object contact latch prevents another penalty for continuing the same contact;
  moving clear releases it, allowing a later impact. Recovery clears the latch.
  Existing traffic fault attribution, replay and pedestrian handling are preserved.
- Vehicle footprints remain oriented rectangles with the existing per-model width
  and length scaling, matching `scene3d.js` / `scenery.js`. Both use the same centered
  four-car mesh family. No single axis-aligned box replaces them.
- `maps/building-stream.js` and `maps/region-stream.js`: geometry within three world
  units loads regardless of camera direction, including immediate loads after a retry
  or teleport. Farther geometry retains view-based loading and 48/96 cache limits.
  Static world collision/navigation data remains independent of GPU geometry: unloading
  distant rendering does not delete real buildings from the world. Returning visits
  do not register duplicate solids. This favors visible nearby obstacles over a strict
  per-frame construction budget; sudden relocation can still cause a frame spike.
- `collision-debug.js` plus `scene3d.js`: optional overlay and bounded contact records,
  enabled only with `?collision-debug=1`. `index.html` identifies v60 and refreshes
  relevant cache versions. No debug mode is enabled during normal gameplay.
- `tools/tests/game-context.cjs` extracts the existing DOM/VM fixture. Collision tests,
  browser performance probe and the existing CPU/browser tests are included.
  `tools/verify-release.py` validates the packaged SHA-256 manifest.

## Verified results

- 43 roads; 6,958 clear-edge cases across all four models, both road sides, forward
  and reverse. Before: 6,884 false penalties and 74 moving cases. After: zero false
  penalties and all 6,958 moving cases. This is a new reproducible fixture, not the
  historical 634/2,531-case test set.
- 43 mapped buildings per car model: 172 real impacts, 172 near misses; holding
  acceleration against the same building for six seconds causes no repeated penalty.
- Both pumps at three approach speeds: six impact/hold/reverse/re-enter sequences.
  Every first and distinct subsequent impact registers; backing away does not penalize.
  A separate rapid departure/recontact case confirms a new impact within two seconds
  is not swallowed by the old global collision cooldown.
  Four pump contact orientations and 20 rotated traffic near-miss/overlap pairs pass.
- 3,568 rendered-road geometry samples; 36 car/scenario launch simulations;
  57 full failure/replay/retry cycles seeded in buildings, each followed by driving.
- Three passenger/parking approaches and interactions, road-following route clearance,
  21 signs and four yield exits; both cities, school callbacks, training, fuel/service
  interactions, traffic progression, brake/reverse behavior and all 1,208 questions.
- Repeated building/environment loading, departure and return; cache bounds and cleanup;
  stable unique collision IDs. Nearby geometry stays resident when outside the view.
- Chrome WebGL integration: both cities, keyboard driving, replay/retry, school UI,
  city round trip, mobile indicator and optional debug overlay. No page JavaScript errors.
  Screenshots of the road, service area, passenger stops, school and mobile layout reviewed.

## Measured performance and remaining limitations

A single ten-second, ten-location headless software-rendering probe at 1280x800:

| Metric | v59 | v60 |
|---|---:|---:|
| First observed render stats | 5,666 ms | 6,782 ms |
| Average frame rate | 7.9 FPS | 7.4 FPS |
| 95th-percentile frame time | 366.7 ms | 483.2 ms |
| Maximum resident buildings in sample | 5 | 19 |
| Maximum resident regions in sample | 12 | 17 |
| Reported JS heap | 36.0 MB | 49.6 MB |

The new version loads more nearby geometry, and this probe is slower. No performance
improvement is claimed. These software-rendered runs include forced relocations and
are not representative of normal hardware GPU driving or a statistically robust
benchmark. Long-drive FPS, sustained memory behavior and physical mobile hardware
remain unverified. The pre-existing mobile layout has some overlapping HUD elements;
this update checks its indicator control, not a full mobile layout redesign.

Road-edge behavior is corrected in Viscri; the original city still treats its curbs
as physical boundaries. Traffic responsibility and road/legal boundaries remain game
heuristics. Three-dimensional overpasses/elevation-aware collision are not introduced.
Building ground polygons do not model every decorative fence, tree, roof or sign.
The pre-existing missing `/shared.css` and favicon requests are still harmless 404s.

## Release

This is a full standalone archive, including `dist`, tests, tools, instructions,
version information and a SHA-256 manifest. Old ZIPs, Git history, installed testing
dependencies and temporary browser captures are excluded. See README for clean setup.
