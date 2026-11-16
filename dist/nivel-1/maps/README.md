# Viscri map data

`viscri-data.js` contains a clipped, projected subset of OpenStreetMap geometry for Viscri, Brașov County. It stores mapped road and footway centerlines, building footprints, land-use areas, points of interest, road metadata, and shared road nodes. The data was retrieved from the OpenStreetMap API on 2026-11-16 for the bbox 25.075,46.030,25.105,46.065 and clipped to the playable 384 × 384 game-unit map.

The data is available under the Open Database License (ODbL) 1.0. Attribution: © OpenStreetMap contributors. See <https://www.openstreetmap.org/copyright> for the license and attribution details.

The game projects map geometry into local game coordinates and draws it with generated low-poly materials. Building footprints come from map data; walls, windows, roof shapes, colors, and vegetation are procedural game art. They do not claim to reproduce individual real-world facades. No Google Maps imagery or other proprietary map imagery is included. The starting position and in-game parking marker use the nearest mapped road access to the OSM parking point so the vehicle can reach the activity.

Mapped road tags are used where present. Missing or incomplete tags remain unknown; the game supplies virtual learning activities and illustrative signs for gameplay, which should not be read as a survey of the current real-world traffic signs or road rules at each location. OSM geometry and tags can change and may be incomplete.

## Rendering and streaming

Viscri uses the shared `scene3d.js` cell streamer and the original city's mesh-batching pass. The map-specific builder lives in `real-scenery.js`; the established `scenery.js` house builder remains the default for the original city. Road and footway centerlines are split into short overlapping pieces, and large land-use polygons are clipped into 12-unit tiles. This keeps OSM scenery inside bounded spatial cells instead of leaving long village-scale meshes permanently attached to the active scene. Building walls, window details, and roofs use the existing Pixel Drive material atlas and low-poly styling; roof faces are pitched rather than flat.

## v53 architectural and service kit

`building-kit.js` uses mapped footprints with procedural facade details and roof ridges aligned to the longest footprint edge. Triangle splitting preserves concave footprints while adding actual ridge vertices. It does not infer verified historic facades. `service-layout.js` places fictional gameplay facilities in clear roadside plots without replacing mapped buildings, and adds drivable entrances plus a connected training campus. `services.js` reuses the original detailed service builder through transformed local coordinates. Fine facade details use separate distance-limited chunks. CPU startup still constructs the map geometry; scene streaming is not full memory unloading.
