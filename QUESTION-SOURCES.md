# Pixel Drive — Registrul surselor pentru chestionare

Ultima actualizare: 2026-11-07.

## Status

- Lot 00: 3 întrebări demonstrative deja existente (STOP, roșu, pietoni).
- Lot 01: 49 întrebări NOI originale, în `dist/nivel-1/quiz-batches/batch-01.js`.
- TOTAL în joc: 52 întrebări (nu reprezintă toată baza oficială DGPCI).
- Următorul lot: nu este încă inclus. Nu se declară completate loturi viitoare.

## Proveniență și drept de utilizare

Întrebările sunt redactate ORIGINAL pentru Pixel Drive după normele legale din România. **Nu** sunt copiate automat dintr-o bancă DGPCI/DRPCIV, un site comercial sau un dataset cu licență neclară. Fiecare întrebare are `source` (act normativ și articol) și `url` către Portalul Legislativ.

Surse normative primare:

1. OUG 195/2002 privind circulația pe drumurile publice: https://legislatie.just.ro/Public/DetaliiDocument/74028
2. HG 1391/2006, regulament de aplicare: https://legislatie.just.ro/Public/DetaliiDocument/285008

Surse pentru eventuala extindere a catalogului (NEIMPORTATE):

- RoDrive — dataset Universitatea din București: https://zenodo.org/records/21401022 (licența de reutilizare trebuie confirmată înainte de import).
- SoferOnline — index cu ~1455 întrebări: https://soferonline.ro/chestionare-auto/categoria-b (nu am permisiune confirmată de republicare).

Imagini: 3 întrebări inițiale folosesc URL-uri Wikimedia Commons și imagini locale de rezervă, cu credite. Întrebările noi folosesc ilustrații SVG originale Pixel Drive sau indicatoarele deja prezente în proiect, fără a copia imagini de pe site-urile de chestionare.

## Lot 01 — distribuție (49 întrebări originale)

- Calea ferată: 3
- Depășire: 4
- Indicatoare: 3
- Manevre: 4
- Oprire: 4
- Prioritate: 7
- Semafoare: 7
- Siguranță: 9
- Viteză: 8

## Schema pentru următoarele loturi

- Pune câte un fișier `quiz-batches/batch-02.js`, `batch-03.js` etc. și încarcă-l în `index.html` după `quiz-bank.js`, înainte de `career.js`.
- Fiecare întrebare are ID unic, categorie, întrebare originală, 3 răspunsuri, indice răspuns corect, explicație, articol normativ, URL către sursa normativă, imagine și creditul imaginii.
- Adaugă în acest document totalul real și sursele fiecărui lot, numai după publicarea lui.
- Dacă ulterior dorești exact setul DGPCI, trebuie obținută o sursă cu permisiune clară de redistribuire și verificată actualitatea datelor.
