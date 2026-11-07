# Pixel Drive v43 — Turn signals and instructional replay

## Desktop / mobile controls
- Q toggles the left signal; E toggles the right signal.
- Left and right mouse buttons **no longer activate turn signals**. Mouse controls for looking around and clicking car controls remain intact.
- Phone/touch uses the existing on-screen left/right signal buttons.

## Rear turn indicator lamps
- Player car has four new amber lens meshes, with separate rear left/right units.
- Flash rate 1.5 Hz, synchronized to the same game indicator state used by the 2D renderer.

## Mandatory replay for forgotten signal
- Checks only meaningful intersection turns, not small steering corrections or driving straight.
- Checks if the correct signal was enabled *before* the junction entry line and still on while turning.
- Wrong / missing signal: -60 in-game points, replay with captured speed, explainer, animated signaling demonstration, and required retry.
- Roundabout exit signaling is not automatically assessed in this first version, to avoid confusing it with ordinary intersection-turn detection.

## Legal basis
- OUG 195/2002, art. 54(1)–(2) (signal ahead of change in direction and maintain throughout):
  https://legislatie.just.ro/Public/DetaliiDocument/74028
- Educational traffic simulator; not an official examination or legal assessment.

## Installation
Unzip over the current repository AFTER pulling latest changes; do not re-extract Pixel-Drive.zip.
