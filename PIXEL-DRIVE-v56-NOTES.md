# v56 — Fix blocked Viscri driving starts

Baseline: GitHub main 576bb71 (installed v55).

Reproduced on v55: six of eight practice starts cannot move and repeatedly count curb collisions. A fixed quarter-road-width lane offset puts vehicle corners outside narrow roads. Very short first segments also offer insufficient launch clearance.

Select road-aligned starts with clearance for the largest selectable vehicle and 1.6 game units of forward travel. Narrow roads use a smaller offset. Road containment checks the union of nearby road segments instead of only the nearest centreline, preventing narrow branches from masking wider roads at junctions.

No building, texture, vehicle physics or original-city layout changes. Collision penalties remain enabled.

Validation: 36 three-second launch simulations (default plus eight exercises, four vehicle models, AI traffic active) all move over 0.9 units without collision. Full CPU regression passes both maps, 1208 questions, replay capture/retry, school interactions, service geometry and chunk bounds. Browser integration could not run in this session: Chromium socket creation is denied by the execution environment. No claim of visual or physical mobile testing.

After installing, reload the game and restart the route to discard the old invalid starting position. Installer refuses unexpectedly modified files and backs up replaced files under the Git directory.
