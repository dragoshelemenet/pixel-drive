# v59 — Safe starts, passenger stops, retries and local scenery streaming

Baseline: GitHub main b27db0a, installed v58. This is an incremental update.

## Placement and collision

The previous adapter checked only road coverage when choosing starts. Replay could replace a recorded position with a fixed cardinal intersection offset, without testing buildings. Mission targets used a nearest-centreline projection without checking access or connected roads.

- Shared spatial footprint checks now cover mapped buildings, commercial buildings, parked display/school cars and fuel pump islands. They are independent of whether the 3D objects have been loaded.
- Starts, practice starts and replay fallback positions validate the largest selectable car and a 1.6-unit forward corridor. Initial traffic is cleared from the immediate spawn area. Replay positions also check restored traffic, reset brake state and avoid fixed coordinate offsets on the real map. Failed fourth-collision retries return with one collision attempt available.
- Eligible recorded replay checkpoints must have clear car footprints and launch corridors. A new game state starts a fresh recording buffer, avoiding checkpoints inherited from a previous attempt.
- Pickup, dropoff and parking use connected-road candidates away from junctions, building entrances and other stops. Pickup has a visible pedestrian on the right shoulder. Stops have clear approaches and a tighter interaction radius. These are game mission points near the requested places, not surveyed taxi bays. The church dropoff moves approximately 153 metres to a clear reachable stop; pickup moves approximately 29 metres.
- One active mission marker replaces rings over every POI. The local minimap shows mission stops and services rather than mislabelling all places as bus stops.
- The navigator follows actual road vertices, directed by mapped one-way tags, rather than straight intersection-to-intersection chords. Mission route samples are checked for building clearance. General lane-level traffic/priority modelling remains simplified.

## Signs

- Speed boards require an explicit numeric/urban OSM way limit and either an adjoining effective limit change or a clipped map entry. Duplicate nearby boards are suppressed. No board is generated just because a way exists or because its limit defaults to 50.
- Four Give Way boards are placed at the virtual service exits and face exiting drivers. Exiting in front of approaching road traffic triggers a yield lesson; an empty exit does not.
- Final CPU fixture has 21 signs: 17 speed boards and four service-exit boards. Placements are logical game representations, not surveyed physical sign locations. No random STOP or traffic-light priority is invented for Viscri.

## Loading and rendering

- The production real-map scenery path now creates lightweight recipes/bounds for roads, footways, land patches, trees and service lots, instead of constructing all their meshes during startup.
- Geometry is created only for nearby cells intersecting the camera view (or cockpit mirrors). At most two cells are built per frame with a time budget. Distant or unused regions release geometry, owned materials and service-label textures. A cache is capped at 96 regions; building geometry remains separately capped at 48.
- Objects outside the camera/mirror views are hidden. Small map data, collision/navigation indexes and shared textures remain loaded. The base ground plane, small signs, mission markers and practice-course fixtures remain lightweight static objects with existing culling. This is local procedural geometry streaming, not network chunk downloads.
- Original buildings, roofs, materials and vehicle graphics are reused. The original city's builder and road layout are unchanged.

## Validation

CPU regression passed on both cities:
- 3,568 rendered road samples agree with road containment.
- 36 initial/practice launch simulations across all four selectable car models.
- 38 full replay/retry flows seeded inside different real building footprints, followed by three seconds of driving without a new collision or failure.
- All three mission stopping approaches, interactions and route clearance samples.
- Positive/negative yielding checks at all four virtual exits.
- 120 detailed buildings constructed/released during traversal; zero remaining after leaving.
- 175 environment regions constructed/released during traversal; no geometry at initial recipe creation and no visible regions when all view tests reject them.
- School interactions/rewards, training, 1,208 questions, geometry and chunk checks.

Chromium WebGL integration passed on both cities: failed-building retry and launch, replay/retry, school hub, city round trip and mobile indicator. No page JavaScript errors. Initial observed Viscri view: 6/524 environment cells and 12/449 buildings resident; later sample: 11 environment cells and 35 buildings resident, with distant evictions. Counts depend on camera location and render progress, and are not an FPS guarantee.

Screenshots were inspected for pickup/dropoff placement and final mission markers. Long manual driving sessions, physical mobile hardware and the user's actual GPU/FPS remain unverified. The existing repository also requests missing /shared.css and favicon files; those pre-existing 404s are unrelated to this update.

The installer validates all files before changing any, refuses unexpected edits/staged changes and backs up replaced files under the Git directory. Reload the game after installation.
