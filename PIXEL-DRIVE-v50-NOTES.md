# Pixel Drive v50 — Corecții priorități, accidente și imagini indicatoare

## Instalare
Acest ZIP este un patch incremental peste proiectul existent actualizat cu v49. Se păstrează întrebările importate (1.208), școala, replay-ul și traficul. Nu reimportați setul RoDrive.

## Modificări
- Coliziunile cu AI sunt analizate în funcție de mișcarea ambelor vehicule și semnalizarea intersecției. Dacă AI a provocat impactul sau cauza nu este clară, 0 puncte penalizare, 0 coliziuni în contor și fără replay de vină. Dacă jucătorul intră evident într-o mașină, penalizarea și replay-ul existente rămân.
- Vehiculele AI de pe drum secundar țin cont de apropierea jucătorului pe drumul principal; la intersecțiile nedirijate cedează dacă jucătorul vine din dreapta.
- La frânare cu S mașina nu trece automat în marșarier dacă ții S continuu după oprire. Eliberează și apasă din nou S pentru a merge înapoi; SPACE rămâne frâna de serviciu.
- Semn nou „Intersecție cu un drum fără prioritate” pe unele intrări ale drumurilor principale la intersecțiile stop/cedează, în 2D/3D și lecția rutieră.
- Întrebările simple de recunoaștere a indicatorului folosesc SVG rutier local direct în fotografie, nu doar link. Pentru situații cu mai multe vehicule, imaginile și sursele existente rămân, fiindcă un singur semn nu descrie integral situația.

## Limite
- Atribuirea răspunderii este o euristică de simulare, nu constatare juridică. Cazurile ambigue nu penalizează jucătorul.
- Pictogramele noi sunt ilustrații educative originale; verificați vizual toate imaginile importate înainte de folosire pentru un examen real.
