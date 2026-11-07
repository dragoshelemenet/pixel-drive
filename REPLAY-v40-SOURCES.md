# Pixel Drive v40 — Trafic și replay didactic

Această actualizare adaugă trafic mai intens, intersecții nedirijate, replay al abaterilor și un exercițiu obligatoriu de reluare a manevrei.

## Ce conține update-ul

- Trafic obișnuit: 46 vehicule AI pe șosea, plus vehicule din sensurile giratorii (în loc de 24 + cele din giratorii).
- Intersecții cu prioritate de dreapta: 33 din totalul de 56 (înainte erau 23), cu 7 scenarii dedicate de exersare în rotația punctelor de start.
- Replay: ultimele aproximativ 6,5 secunde din *cadrele reale* ale canvasului jocului, capturate la aproximativ 5 cadre/secundă. Nu este un videoclip MP4 separat și nu are sunet.
- Explicație la ecran mare: ce regulă a fost încălcată, ce trebuie făcut și link către legislație.
- Exemplu animat cu două mașini și timpi de așteptare, desenat ca diagramă didactică. Nu este o reconstituire 3D fotorealistă a manevrei.
- „Repetă regulamentar” readuce mașina înaintea abaterii și solicită traversarea corectă / deplasarea prudentă pentru a încheia exercițiul.
- Abaterile urmărite: prioritate de dreapta, STOP, roșu, Cedează trecerea, prioritate la intrarea în giratoriu, depășirea limitei de viteză și coliziuni. Accidentul cu pietonul păstrează ecranul de eșec existent.

## Surse și limitări

1. OUG 195/2002, art. 56–59 — intersecții, viteză la apropiere, prioritate de dreapta și giratorii. https://legislatie.just.ro/Public/DetaliiDocument/74028
2. HG 1391/2006 — marcaje, semafoare, STOP, Cedează trecerea. https://legislatie.just.ro/Public/DetaliiDocument/79058

Acestea sunt reguli pentru simularea educativă. Nu sunt întrebări sau scenarii oficiale DGPCI. Mașinile și situațiile folosesc trafic simulat, nu o evaluare juridică exhaustivă. Corectitudinea manevrei trebuie verificată și în jocul efectiv pe Codespaces, mai ales în modul 3D (cu trafic dens).

## Instalare în Codspaces

1. Încărcați Pixel-Drive-Traffic-Replay-v40.zip în rădăcina repo-ului.
2. Nu reextrageți Pixel-Drive.zip după această actualizare; acesta ar suprascrie fișierele noi.
3. Executați:

```bash
cd /workspaces/pixel-drive
git pull
unzip -o Pixel-Drive-Traffic-Replay-v40.zip -d .
git add dist/nivel-1/ REPLAY-v40-SOURCES.md
git diff --cached --quiet || git commit -m "Add traffic and driving violation replay"
git push origin main
python3 -m http.server 8000 --bind 0.0.0.0 --directory dist
```

Deschideți portul 8000 și `/nivel-1/`, apoi Cmd+Shift+R pentru refresh fără cache.
