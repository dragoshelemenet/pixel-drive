# Pixel Drive v46 — Linkuri corecte pentru întrebările importate

## Ce modifică
- Toate cele 50 de întrebări din primul lot afișează sub întrebare un link pe **www.scoalarutiera.ro** în loc de Hugging Face.
- 48 linkuri deschid pagina directă, identificată prin text și variante de răspuns.
- Întrebările **26** și **45** duc la căutarea de pe Școala Rutieră: URL-ul exact al paginii de categoria B nu a fost verificat, deci nu inventăm un ID.
- Linkurile se afișează și la școala auto și în quizul automat de 60 secunde; nu se modifică răspunsurile, imaginile și celelalte sisteme ale jocului.
- Importurile viitoare (51–100 etc.) vor folosi căutarea pe Școala Rutieră în mod implicit, până la adăugarea unui ID de pagină verificat.

## Atribuire conținut
Textele întrebărilor importate și explicațiile lor provin din datasetul **RoDrive**, licență **CC BY-SA 4.0**: https://huggingface.co/datasets/AnonymousDrive/RoDrive . Linkul Școala Rutieră este **o referință de vizualizare a întrebării**, nu sursa licenței datelor importate. Desenele SVG sunt originale Pixel Drive.

## Următorul lot
51–100 (nu este inclus în acest ZIP).

## Instalare
1. Oprește serverul cu Ctrl+C.
2. `unzip -o Pixel-Drive-Quiz-Links-v46.zip -d .`
3. Commit/push și repornește serverul `python3 -m http.server 8000 --bind 0.0.0.0 --directory dist`.
