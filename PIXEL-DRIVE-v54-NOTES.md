# Pixel Drive v54 — Viscri scale, road surfaces and replay stability

Base inspected: `4c3f0117b37a7cc379d4257a025d230d15986ac7` (v53), fetched from GitHub main on 17 November 2026. The existing local v53 worktree was left untouched.

## Changes

- Viscri vehicle meshes use 0.67 of the original art scale. Road-boundary collision dimensions follow the visible vehicle and purchased model. Oriented vehicle rectangles replace the broad circle trigger in Viscri, allowing vehicles in opposite lanes to pass without false contact. Original-city collision behavior and art scale remain unchanged.
- The actual OSM road coordinates and widths remain unchanged. Roads have continuous narrow gravel shoulders and distinguish mapped asphalt, unpaved and stone surfaces. `living_street` no longer implies an unpaved road. Stone patterns are procedural art, not copied imagery.
- Removed the large artificial parking rectangle drawn on top of the real starting road. Parking markings in service lots remain.
- Viscri buildings retain all 449 OSM footprints and pitched roofs, windows, shutters, doors, chimneys and original materials. Vertical proportions, door/window sizes and facade spacing are adjusted. These are stylized heights/facades, not surveyed elevations.
- Virtual service facilities are half the previous scale. Plot clearance, rotation, driveway geometry, drivable areas and interaction-point positions use the same transform. Parked vehicle scale is corrected independently. Original service detail is reused, including pumps, canopy, cars, windows and signs. The campus remains accessible and may move because the clear-site search now uses smaller facility plots.
- A closer Viscri camera improves road and car readability; the original city camera is unchanged.
- Removed randomly assigned STOP/yield/roundabout/hazard signs that did not match mapped features or the simulation. Speed boards are derived from road `maxspeed` tags, placed beside permitted travel directions and checked against every road segment and building polygon. They are explicitly marked in data as illustrative way-derived positions, not surveyed sign locations. Unsupported limits retain sector behavior without an invented graphic. Random sign-based starts are replaced by road-aligned speed-practice starts; original-city exercises and the training campus remain.
- Viscri signs use metric model dimensions and face their approach instead of always facing the camera.
- Replay snapshots copy actor state while retaining immutable map/route references, avoiding circular-JSON crashes. Retry does not inject a grid-only NPC without a real route into Viscri traffic.
- Unknown map POIs and merge junctions no longer produce missing educational titles/text or hide known nearby activities.
- Vegetation road clearance uses expanded road distance rather than the old inverted collision margin.
- Changed script URLs use v54 to invalidate cached v53 assets.

## Verification

`node tools/tests/viscri-regression.cjs` exercises both maps: all 1,208 questions, road continuity, service access and non-drivable shop interiors, school-credit callback, held-S braking/repress reverse, accumulated traffic movement, campus startup and ramp, finite Three.js geometry, roof ridge and chunk size. Added assertions exercise cyclic replay capture/interrupt/retry, route identity, unknown POIs, signs against all road segments and separated/touching vehicle rectangles.

`tools/tests/viscri-browser.cjs` runs Chromium/SwiftShader against the real game, with test-only state instrumentation. It checks WebGL, replay capture/retry, the actual school-service/hub UI, city switching in both directions, a mobile viewport and touchscreen indicator. Captures freeze the simulation at selected positions while rendering the real scene; they are not fabricated footage or proof of manually driving the entire village.

Observed result: both cities passed WebGL, 1,208-question availability, replay capture/retry and school-service/hub checks; round-trip city switching and the mobile indicator passed; zero page JavaScript errors. Example Viscri frame: 91 of 807 render chunks active, 6 of 20 traffic meshes active, 128 draw calls. These are one scene snapshot, not worst-case measurements or a hardware FPS claim. CPU geometry checks: Viscri 65,934 source meshes / 1,924 batched meshes / 1,479,464 vertices / no oversized scenery; original city 60,432 / 1,765 / 2,203,747, unchanged from v53.

## Limits and next work

This is an incremental correction, not a completed real-world traffic reconstruction. Junction rules still use simplified cardinal logic, AI routes are not a complete connected road-routing network, and one-way route endpoints can wrap. Road priorities and physical sign locations still need authoritative field/map data. Removing invented signs does not solve those larger routing/priority issues.

Road widths come from the existing imported dataset and are not newly surveyed. Do not interpret the scenery as an exact facade reconstruction. The fuel station, school and other game facilities are virtual additions. No Google imagery or API is used; existing OSM attribution is retained.

The existing chunk/frustum batching remains. All building geometry is still constructed at startup; render visibility is not true CPU-memory unloading. Denser facade spacing increases pre-batch detail geometry versus v53; performance on real mobile hardware and long sessions is unverified. Automatic tests do not establish full legal correctness, all collision responsibility cases, or every vehicle model on every narrow bend.

## Installation

Upload `Pixel-Drive-Viscri-v54.zip` to the repository root in Codespaces. Extract it to the root; it contains only a staging folder. Run the included installer. It validates every payload hash and every target's previous content before changing any target, refuses pre-existing staged changes, and backs up replaced files under the repository git directory. Unrelated newer files are preserved. A mismatched target causes an explicit stop, never a forced overwrite.
