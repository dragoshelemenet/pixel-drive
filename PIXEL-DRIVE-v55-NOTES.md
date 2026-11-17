# Pixel Drive v55 — Viscri visual-reference correction

Includes v54 fixes and accepts either the verified v53 main or the delivered v54 file versions. GitHub main was re-fetched before this work and remained at `4c3f0117b37a7cc379d4257a025d230d15986ac7`. No remote branch was changed.

## Reference inspection

Google Earth was opened at the requested Viscri search, but the browser reported “WebGL is not supported”; its satellite/3D scene was not inspected. Instead these photographs were visually inspected:

- Amanda Patten / Fundația ADEPT, “Viscri street scene”: https://artsandculture.google.com/asset/viscri-street-scene-amanda-patten-fundatia-adept/jgH90AJUxZEyeg
- Around the World in 80 Clicks, “Row of farmhouses in the main street of Viscri”: https://pictures.traveladventures.org/images/viscri01

The images show painted plaster facades, contrasting window surrounds, tall gables, clay roofs, substantial timber gates and grassy frontage. They are reference observations, not measured geometry or proof of current conditions on every street. Neither photograph nor any Google imagery was downloaded into the game or used as a texture.

## Implemented

- Houses now use painted plaster materials instead of the repeated exposed-brick atlas. Eight deterministic facade colors and five roof tints provide variation while keeping shared materials and the original Pixel Drive tile texture.
- Street-facing elevations use paired/triple windows, varied window proportions, cornices, corner trim and gable vents. Courtyard-side doors replace the repeated central street door. Roof pitches are steeper. Barns and fortified walls keep masonry treatments.
- Timber gates with posts and joinery are generated only where clearance checks allow them. Their placement is a stylized interpretation, not a cadastral reconstruction; real property boundaries have not been imported.
- Road bends use shared mitered edge positions instead of separate strips covered with round discs. UV distance continues across segments, preventing the texture from restarting at every piece. Segments remain at most eight units before width offsets so scenery remains compatible with spatial batching.
- All 449 building footprints, actual imported road coordinates/widths, service functions, original-city art and v54 fixes remain.

## Verification and limits

CPU checks passed on both cities, including a new 90-degree road-bend test comparing both shared edge vertices and texture phase. Viscri: 58,628 source meshes, 1,542 batches, 1,315,856 vertices, no oversized scenery objects. Versus v54 this is approximately 11% fewer vertices and 20% fewer batches in this test, not a measured hardware FPS improvement. Original-city geometry counts remain unchanged.

The browser integration suite covers actual WebGL rendering, replay capture/retry, school-service/hub access, city switching, mobile indicator controls and JavaScript page errors. Both complete browser runs, including the final palette, passed both cities, the round-trip switch and mobile indicator with zero page errors. Screenshots are from the running game at fixed inspection positions, not generated concept images.

This still is stylized scenery. It does not claim exact facade matching, surveyed gates, current street-sign placement, or photorealism. The existing simplified junction priority and AI route limitations described in v54 remain. Road widths have not been inferred from perspective photos. True geometry-memory streaming and physical-phone performance testing are not included.

## Install

Extract the ZIP in the repository root and run `python3 pixel-drive-v55-update/install.py --apply`. All file hashes and supported base versions are checked before any target changes. Unexpected newer edits stop installation; replaced files are backed up under the git directory. It includes the v54 changes, so installing v54 first is unnecessary.
