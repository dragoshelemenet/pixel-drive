# Pixel Drive v62 — reference lot preview

Pentru actualizare în Codespaces: vezi `INSTALL.md` (instrucțiuni în română).

Complete browser game: Viscri and the original city, school, passenger missions,
traffic, fuel, navigation, quizzes and mobile controls.

In Viscri you start beside the first reference lot. Use **Vezi casa** to inspect
the house, then **Înapoi la condus** to drive. This is an initial reconstruction,
not a finished 1:1 model; see CHANGELOG-v62.md for the remaining differences.

## Run the downloaded release

1. Extract `Pixel-Drive-Viscri-v62-preview.zip` into a new folder. This is the full game,
   not an incremental patch; the old v59 installer is not needed.
2. Open a terminal in the extracted `pixel-drive-v62` folder.
3. Check the release: `python3 tools/verify-release.py`
4. Run: `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist`
5. Visit http://127.0.0.1:8000/nivel-1/ in Chrome or another WebGL-capable browser.

Keep the terminal open while playing; Ctrl+C stops the server. Opening the HTML
file directly is not supported. Python 3 is needed to serve the files, but no npm
installation or build step is needed to play. All game assets are in `dist`.
The game retains progress in the browser's local storage for the same origin.

For Codespaces use `--bind 0.0.0.0`, forward port 8000, and open `/nivel-1/` on
that forwarded address. Keep the forwarded port private unless you intend to share.
For an existing checkout, back it up first and compare the release files before
copying `dist` and `tools`; do not run old update installers over this release.

## Controls and testing

W accelerates; A/D steer. S brakes; release and press S again to reverse.
I interacts, P pauses. The on-screen controls support mobile layouts.

With Node.js installed, from the release root:

```
node tools/tests/surface-regression.cjs
node tools/tests/collision-regression.cjs
node tools/tests/viscri-regression.cjs
```

Optional browser checks require Playwright and Chrome/Chromium. Install Playwright
in a separate test folder, then set `PLAYWRIGHT_MODULE` to its package path and
`CHROMIUM` to the browser executable. With `dist` served on port 8766, run:

```
node tools/tests/viscri-browser.cjs
node tools/tests/browser-performance.cjs
```

`BASE_URL` and `OUTPUT_DIR` configure browser tests. Performance tests serve local
files through Playwright and do not require a server; `GAME_ROOT` can select an
older `dist` directory for comparison. Dependencies and generated screenshots are
not included in this release.

## Optional collision diagnostics

Open `/nivel-1/?collision-debug=1` to show green player bounds, red solids,
yellow road edges, blue traffic and orange attempted impact positions.
`DriveCollisionDebug.events` in the browser console holds up to 100 actual contact
records: simulation time, car model, proposed footprint, collider ID/type/polygon,
road state and collision count. The record does not pretend to know GPU visibility.
Remove the query parameter to disable the overlay and event recording.

See `CHANGELOG-v62.md` for causes, changed files, measured results and limitations.
