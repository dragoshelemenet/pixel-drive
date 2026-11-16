# Pixel Drive — Viscri architectural detail, v53

Baseline: GitHub main 2db48f0e7c249acdd3bba3595f4f8945c05ffbfb, fetched and pulled on 2026-11-16. Main was already current. The installed repository contains the v50 fixes, v49 school hub and all 1,208 questions. This incremental package also includes the earlier local Viscri/city-selection integration; v51/v52 are not prerequisites.

## Implemented in this update

- A dedicated footprint-based building kit for the 449 OSM building records. It uses the original shared brick/tile atlas and material system, not Google imagery or newly generated replacement textures.
- Oriented pitched roofs triangulated across a real ridge, closed masonry gables, foundation plinths, cornices, framed glass windows, mullions, sills, shutters, timber doors, steps, downpipes and chimney caps. Barn/shed and retail records receive different treatments; the named fortified wall is not roofed as a house. Church-tagged geometry uses a taller shell. This is procedural architecture, not a surveyed reconstruction of the church or individual facades.
- Full original petrol station, school, showroom and workshop models, including fuel hoses/dispensers, canopy, school cars, parking lines, showroom vehicles and workshop equipment. Original builder bodies are byte-for-byte unchanged after the map dispatch.
- Clear roadside plots selected against mapped roads/buildings and other service lots. Facilities are explicitly fictional gameplay additions. The school was placed outside the dense historic core because its original model needs a larger clear plot. The real houses were not cleared to make room.
- Driveways and forecourts connected to the drivable surface. Building interiors remain non-drivable. A clear training campus has a road connection and the original kiosk/tasks/cones/ramp.
- Fixed earlier Viscri road subdivision dropping long segments, traffic route filtering removing subdivided roads, and traffic progress resetting each frame. NPCs now accumulate route distance and use a forward obstacle check and lane offset. This remains a simple route-following AI, not a finished arbitrary-road intersection scheduler.
- Fixed the previous update's ramp location mismatch, including the original city.
- Original leaf-card materials for vegetation. Distant facade details are separated from shells into 34-unit detail chunks; shells use the existing 70-unit range and frustum checks. The original city's detail behavior is unchanged.

## Verified

Run `node tools/tests/viscri-regression.cjs` from the repository root.

The CPU test uses the shipped Three.js and actual game scripts with a minimal DOM stub. It checks both city selections; 1,208 questions; service interaction dispatch; the school-to-hub callback and +150 credit award; training startup sequence and ramp elevation; brake hold/release/reverse behavior; accumulated AI movement; road-length preservation; connected service entrances; training access; non-drivable shop interiors; finite geometry; raised roof ridges; and static batching bounds.

Viscri scenery/services: 53,132 generated meshes, 1,188,344 vertices before batching, 807 spatial groups including detail groups, 1,871 meshes after all groups are batched, no scenery/service mesh over the streamer's 16-unit bounds. These are CPU geometry counts, not simultaneously visible draw calls or measured FPS. The tests exclude the full scene renderer and its dynamic objects. All map geometry is still constructed in CPU memory at startup; distant chunks are detached from the active rendering scene, not unloaded from memory or downloaded on demand.

Original scenery and service builder bodies were compared with main and match. Syntax and whitespace checks passed.

## Not verified / still required

Chromium could not launch in this execution environment (`socket() failed: Operation not permitted`). No actual browser screenshots, visual comparison, FPS measurement, touch-device test, mirror/render test, full school UI flow or end-to-end educational replay playthrough was completed. DOM callback tests do not establish full UI correctness. Review both maps in a browser before treating this as a finished release.

The earlier real-map adapter still supplies illustrative learning signs and simplified junction connections. Exact turn restrictions, all-way AI priority handling and robust routing across arbitrary OSM geometry need further integration/playtesting. The retained replay system is not evidence that every new-road scenario works. This update is a substantial architecture/services increment, not a claim that every original-city feature has been fully validated in Viscri.

Facades, roof forms, inferred residential variants and vegetation are stylized. Only the supplied mapped footprints/road geometry and available OSM tags are geographic evidence. Service additions are not claims about real local businesses. OSM data provenance/licence: dist/nivel-1/maps/README.md.

## Install

Upload Pixel-Drive-Viscri-v53.zip to /workspaces/pixel-drive. The included installer accepts the inspected main versions, prior v51/v52 package versions or these exact v53 files. It refuses conflicting edits and backs up replaced files to a temporary directory before installation. It does not modify unrelated files.

Start the server after installation:

    python3 -m http.server 8000 --bind 0.0.0.0 --directory dist

Installer tests passed on a clean main checkout and previous v51/v52 packages; a deliberately modified conflicting file was refused without any writes.
