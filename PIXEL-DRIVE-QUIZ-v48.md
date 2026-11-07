# Pixel Drive v48 — IMPORT INTEGRAL 1.208 întrebări categoria B

## Un singur update, fără v46 / v47 separate

Acest ZIP include TOATĂ logica v46 și v47 pentru linkurile către Școala Rutieră,
plus un nou importator integral `tools/import_rodrive_all.py`.

ATENȚIE: Din cauza accesului limitat la rețea în mediul de creare a arhivei,
ZIP-ul NU include deja fișierele de date RoDrive de 1.208 întrebări.
Importatorul le descarcă de pe RoDrive la momentul instalării în Codespaces.
Este O SINGURĂ comandă, un singur import, un singur ZIP. Nu mai sunt necesare
alte loturi. Dacă sursa nu poate fi accesată sau dacă nu sunt EXACT 1.208
înregistrări valide, importul este oprit și banca existentă rămâne funcțională.

## Rezultat după instalarea și importarea cu succes

- 1.208 întrebări reale RoDrive cu text/variante/explicații și răspunsuri multiple.
- 25 fișiere cu loturi 01–25 (ultimul 1201–1208) + 1.208 SVG-uri
  ORIGINALE, dar orientative și care trebuie revizuite; nu sunt imaginile oficiale.
- Fiecare întrebare are link către Școala Rutieră. Primele 48
  corespondențe directe verificate din v46 sunt incluse; restul folosesc
  CĂUTAREA Școala Rutieră, nu linkuri inventate la altă întrebare.
- Totul se încarcă în UI: quiz aleator la 60 secunde și școala auto.
- Registru cu număr exact importat și revizia imaginilor.
- Alte sisteme de joc (trafic, replay, mașină, HUD) rămân nemodificate.

## INSTALARE / PORNIRE SERVER

1. Încarcă `Pixel-Drive-Questions-ALL-v48.zip` în rădăcina repository-ului.
2. Oprește serverul vechi folosind Ctrl+C.
3. Execută aceste comenzi (cu internet în Codespaces):

    set -e
    cd /workspaces/pixel-drive
    git pull
    unzip -o Pixel-Drive-Questions-ALL-v48.zip -d .
    python3 tools/import_rodrive_all.py
    git add dist/nivel-1/ tools/import_rodrive_batch.py tools/import_rodrive_all.py QUESTION-IMPORT-STATUS.json QUESTION-IMAGE-REVIEW.json QUESTION-SOURCES.md QUIZ-LINKS-v46.md PIXEL-DRIVE-QUIZ-v48.md
    git diff --cached --quiet || git commit -m "Install complete 1208 Romanian driving questions"
    git push origin main
    python3 -m http.server 8000 --bind 0.0.0.0 --directory dist

4. Deschide Port 8000 > `/nivel-1/`, apoi Cmd+Shift+R.

## Surse / limitări

- RoDrive: https://huggingface.co/datasets/AnonymousDrive/RoDrive
- Licență dataset: https://creativecommons.org/licenses/by-sa/4.0/
- Pagini vizibile în joc: https://www.scoalarutiera.ro/
- Ordinea RoDrive NU este ordinea Școala Rutieră.
- Elementele vizuale trebuie verificate atent. Scriptul NU poate certifica
  corectitudinea schemelor produse automat, iar întrebările trebuie revizuite
  pentru corectitudine legală în 2026 înainte de utilizare ca examinare oficială.
