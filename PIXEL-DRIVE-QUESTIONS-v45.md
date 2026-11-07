# Pixel Drive v45 — Lot 01: 50 întrebări din RoDrive (CC BY-SA 4.0)

Update **numai pentru întrebări**. Nu modifică semnalizările, replay-ul, traficul sau fizica mașinii.

## Instalare

1. Oprește serverul Python (`Ctrl + C`).
2. Încarcă `Pixel-Drive-Questions-RoDrive-v45.zip` în rădăcina repository-ului din Codespaces.
3. Rulează, în ordinea de mai jos:

```bash
set -e
cd /workspaces/pixel-drive
git pull
unzip -o Pixel-Drive-Questions-RoDrive-v45.zip -d .
python3 tools/import_rodrive_batch.py --start 1 --count 50
git add dist/nivel-1/ tools/import_rodrive_batch.py QUESTION-SOURCES.md QUESTION-IMPORT-STATUS.json PIXEL-DRIVE-QUESTIONS-v45.md
git diff --cached --quiet || git commit -m "Import first 50 CC-licensed driving questions"
git push origin main
python3 -m http.server 8000 --bind 0.0.0.0 --directory dist
```

**Internet necesar la import.** Scriptul descarcă 2 JSON-uri publice de pe Hugging Face, le verifică și înlocuiește banca veche numai când setul de 50 este disponibil. Dacă descărcarea eșuează, **nu șterge întrebările vechi**, iar comanda de import va ieși cu eroare. În acel caz, nu continua cu `git add/commit`, ci reîncearcă importul.

## Conținut

- Lotul 1: 50 de întrebări reale, cu textul și variantele din setul **RoDrive**. Lista este sortată după **ID numeric** și sunt selectate primele 50 de înregistrări valide.
- Pot fi unul, două sau trei răspunsuri corecte; în joc selectezi toate variantele și apoi apeși **Verifică**.
- **50 SVG-uri originale**, create pe baza descrierii situației sau a temei întrebării; **nu** sunt copii ale imaginilor din dataset. Sunt scheme de antrenament — unele trebuie revizuite individual pentru întrebările care depind de detalii vizuale specifice.
- La fiecare întrebare apare link către fișierul datasetului cu **ID-ul întrebării**; dacă exista o imagine originală, apare separat și linkul către imaginea de referință.
- Sursa: https://huggingface.co/datasets/AnonymousDrive/RoDrive, licență CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/.
- **Important:** ordinea RoDrive nu e neapărat aceeași cu ordinea din lista **Școala Rutieră 1–1.208**. Nu pretindem că am importat exact primele 50 în ordinea de pe acel site.
- Regulile și explicațiile trebuie revizuite periodic față de legislația actuală: https://legislatie.just.ro/Public/DetaliiDocument/74028 și https://legislatie.just.ro/Public/DetaliiDocument/79058.

## Continuare

După instalarea lotului 01, pentru întrebările 51–100 rulezi:

```bash
python3 tools/import_rodrive_batch.py --start 51 --count 50
```

Scriptul generează `batch-02.js`, 50 de SVG-uri noi și actualizează `QUESTION-IMPORT-STATUS.json`. **Nu șterge lotul 01.** Apoi faci commit/push și pornești serverul cu aceeași comandă ca mai sus.

## Licențe și atribuire

RoDrive este afișat pe Hugging Face cu licența **CC BY-SA 4.0**. Fișierele de chestionare importate se reutilizează cu atribuire și condițiile de partajare ale acestei licențe, pe care trebuie să le păstrezi dacă publici proiectul. Ilustrațiile SVG sunt originale pentru acest update; nu au fost descărcate imagini din dataset. Licența nu reprezintă o verificare juridică independentă pentru fiecare element al datasetului. Pentru erorile din set, autorii proiectului original au prioritate față de implementarea jocului.
