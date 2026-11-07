# Pixel Drive v49 — Centru de învățare în Școala Auto

## Instalare

1. Extrage `Pixel-Drive-School-Hub-v49.zip` în rădăcina repository-ului Pixel Drive.
2. Rulează `python3 tools/install_school_hub.py` din rădăcina proiectului.
3. Confirmă modificările cu `git add`, `git commit`, `git push`, apoi pornește serverul pe portul 8000.

Installerul editează doar handler-ul pentru butonul `#start-quiz` din `dist/nivel-1/career.js` și adaugă referințe la cele două fișiere noi în `dist/nivel-1/index.html`. Nu rescrie niciun quiz, imagine, replay, model 3D sau mecanică de condus. Se poate rula de mai multe ori fără duplicarea elementelor.

## Funcții

- Centrul de învățare pe ecran complet se deschide din Școala auto → **Teste • Învățare și chestionare**.
- Acasă: bancă instalată, întrebări parcurse, întrebări corecte, greșeli, reluare de unde ai rămas.
- Mediu de învățare GENERAL, cu fiecare întrebare disponibilă.
- 18 capitole tematice (clasificare automată pe baza textului, nu metadatele oficiale din DGPCI).
- Recapitulare întrebări greșite, întrebări salvate și căutare după text.
- Examen generat aleator: 26 întrebări, 30 minute, 22 răspunsuri corecte pentru promovare; +150 CR la promovare (compatibil cu cariera existentă).
- Teste predefinite: seturi stabile de 26 întrebări din ordinea instalată; ultimul set poate reutiliza câteva întrebări.
- Suport pentru mai multe răspunsuri corecte (A+B, A+B+C).
- Explicații, imagini existente și linkurile existente către Școala Rutieră.
- Progres și istoric examen în localStorage-ul browserului, pe dispozitiv.
- Funcționează cu banca activă (50, 100 sau 1.208 întrebări); nu descarcă din nou RoDrive.
- Responsive pentru desktop și telefon.

**Notă:** Clasificarea celor 18 capitole este una automată și aproximativă. Întrebările dependente de o imagine au scheme orientative din versiunea v48; nu sunt garantate identice cu fotografiile oficiale. Nu reprezintă portalul oficial de examinare.

## Verificări locale

- `node --check school-hub.js` — OK.
- Instalator executat de două ori — fără dubluri, 25 de scripturi existente pentru v48 păstrate.
- Browser Playwright/Chromium: dashboard 18 categorii, mod învățare, răspunsuri multiple, examen, rezultat, +150 CR, închidere și revenire la joc.
- Browser Playwright/Chromium: mod mobil 390 × 844, învățare și navigare.
