# v58 — Match Viscri road collision to visible bends

Baseline cd7b08c (v57). The renderer uses mitered joined road edges, while roadAt only checked capsules around straight centreline segments. Miter corners and visible gravel shoulders could be rejected as obstacles.

World road cross-section normals are now computed once and reused by the renderer. Collision accepts the same two triangles per joined segment, plus existing capsule junction coverage. The visible .14-unit gravel shoulder is included. Surface candidates use a spatial index; no full road scan per corner. Original city and obstacle penalties remain unchanged.

Validation: 3568 interior points sampled from rendered road triangles, including bends, pass roadAt with the actual .02 driving margin. Off-map terrain remains blocked. Full CPU regression includes launches, traffic, replay, school, question bank and streaming. No new interactive browser or device driving verification in this update.
