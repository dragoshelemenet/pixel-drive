# Instalare v62 preview în Codespaces

Arhiva conține jocul complet. Încarcă `Pixel-Drive-Viscri-v62-preview.zip` în
`/workspaces/pixel-drive`. Salvează mai întâi orice modificări proprii.

```bash
cd /workspaces/pixel-drive
git switch main
git pull --ff-only origin main
unzip -o Pixel-Drive-Viscri-v62-preview.zip
cp -R pixel-drive-v62/dist/. dist/
cp -R pixel-drive-v62/tools/. tools/
cp pixel-drive-v62/README.md pixel-drive-v62/INSTALL.md pixel-drive-v62/VERSION.json pixel-drive-v62/MANIFEST.json .
cp pixel-drive-v62/CHANGELOG-v*.md .
python3 tools/verify-release.py
node tools/tests/surface-regression.cjs
node tools/tests/collision-regression.cjs
node tools/tests/viscri-regression.cjs
```

Dacă toate verificările trec:

```bash
git add dist tools README.md INSTALL.md CHANGELOG-v*.md VERSION.json MANIFEST.json
git commit -m "Add Viscri road markings and first Street View reference lot"
git push origin main
python3 -m http.server 8000 --bind 0.0.0.0 --directory dist
```

Deschide portul 8000 și ruta `/nivel-1/`. Reîncarcă pagina pentru noua versiune.
Nu folosi installerul vechi de v59. Nu adăuga arhiva ZIP sau folderul extras la commit.

În Viscri pornești lângă prima casă. Apasă **Vezi casa** pentru inspecție.
Modelul este încă aproximativ; vezi `CHANGELOG-v62.md`.
