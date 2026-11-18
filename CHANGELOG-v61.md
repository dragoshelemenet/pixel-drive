# Pixel Drive v61 — road markings and continuous terrain textures

Based on v60 commit `4d3f210`. This update addresses the screenshot showing a
textured grass patch surrounded by flat green land and roads without markings.

## Changes

- `dist/nivel-1/maps/real-scenery.js`: mapped land parcels used untextured materials
  above the already textured base ground. Non-water parcels now share the grass
  texture, with restrained forest/farmland tint variation. Their UV coordinates
  use world X/Z at the same scale as the ground, avoiding phase/scale jumps across
  the 12-unit terrain tiles. Water remains a water surface.
- The same renderer adds dashed center lines and continuous edge lines to paved
  roads at least 0.95 world units wide, including village stone paving. Paint follows
  the joined road normals and maintains its dash phase across segments and streamed
  chunks. Intersections have gaps; one-way roads omit the opposing-lane divider;
  tracks, service lanes, footpaths and dirt/gravel roads remain unpainted.
- These are illustrative gameplay markings, not a claim about surveyed Viscri paint
  or road legality. No new traffic rules or collision obstacles are generated.
- Geometry stays inside the existing streamed road recipes and spatial batching.
  Collision, spawning, traffic, navigation and the original city's rendering are
  unchanged from v60.
- `index.html` identifies v61 and refreshes asset cache versions. Packaging reads
  the version from `VERSION.json`; the full archive includes the v60 change report.

## Checks

- `surface-regression.cjs`: continuous terrain UVs across nine tiles; 24 paint pieces
  in a controlled 20-unit road fixture; dash phase across streaming boundaries;
  direct/streamed geometry agreement; unpaved, one-way and intersection exclusions.
- Existing CPU regression passed in both cities: 3,568 road samples, 57 retries,
  three mission approaches, 21 signs, four yield exits, streaming and school checks.
- Collision regression passed: 6,958 edge cases with zero false penalties; 172 building
  impacts and 172 near misses; six pump sequences; 20 traffic footprint pairs; rapid
  distinct recontact still registers.
- Chrome/WebGL browser regression covers both cities, keyboard movement, replay,
  school hub, city switching, mobile indicator and debug overlay. Road and fuel-area
  screenshots were inspected for the terrain/markings correction.

No hardware-FPS improvement is claimed. Added paint is simple geometry using one
shared material; long-drive hardware performance and pre-existing mobile HUD overlap
remain outside this focused visual correction. See CHANGELOG-v60.md for earlier limits.
