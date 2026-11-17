# v57 — Viscri building streaming and wider playable roads

Baseline: GitHub main 799107f, installed v56.

- Detailed buildings are now created near the player, at most one per frame. No building geometry is constructed during initial scenery assembly. Original architecture and textures are reused.
- Buildings beyond 28 game units are detached and their owned geometry/materials disposed. At most 48 buildings are retained; visible architecture is limited to 20 units and the camera frustum, with nearby/mirror coverage. Shared surface textures are retained.
- Small source map data stays in memory. Roads, land parcels, services and vegetation still use existing static geometry and chunk culling; this is not full network/world asset streaming.
- Static scenery activation range in Viscri reduced to 30 units; merges limited to one chunk per frame. Minimap redraw throttled to approximately 6.7 Hz and expensive road glow removed. Viscri pixel ratio capped at 1; original city setting unchanged.
- Playable road widths are at least 6.5 metres, except service/track at 3.5 metres. Wider imported roads are retained; original widths remain as sourceWidth. Road centres/footprints remain OSM-derived. Widening is an explicit gameplay adjustment, not a claim of surveyed local widths. Rendering, traffic, collision, safe spawns, sign placement and service placement all use the same adjusted widths.

Tests: CPU regression on both cities including 36 launch cases, school, replay, 1208 questions, geometry and chunks. Streaming traversal test constructed and evicted 120 buildings, with a peak of 19 resident buildings in that test; teleporting away left zero groups/windows. Browser integration checks WebGL, both cities, replay/retry, school hub, city switching and mobile indicator. Actual Viscri browser sample: 25 resident / 449 total, 22 visible, 13 evictions. These counts are not FPS measurements; performance on the user's hardware and long driving sessions remains unverified.

Installation: use the guarded installer from the repository root, then reload the game. Unmodified original-city layout and architectural kit are preserved. Backups are stored under the Git directory.
