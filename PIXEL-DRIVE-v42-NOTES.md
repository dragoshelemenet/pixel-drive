# Pixel Drive v42 — changelog

- Replay: fiecare cadru salvat conține viteza în KM/H, limita curentă și semnalizarea; la impact sunt afișate datele din momentul abaterii, nu doar viteza 0 după coliziune.
- Mouse: click scurt stânga = semnal stânga, click scurt dreapta = semnal dreapta. Același click dezactivează. Drag în habitaclu continuă să miște privirea; clicurile pe butoanele 3D nu activează accidental semnalizarea.
- Telefon/tabletă: butoane de semnalizare tactile persistente, stare activă evidențiată.
- Accelerație: 0.22 față de 0.50 în v41, cu creștere și mai lentă aproape de limita legală; frâna și viteza maximă au rămas neschimbate.
- Trafic: aproximativ 18 vehicule suplimentare pe străzile existente, unele mai lente în zone congestionate, plus distanță de urmărire puțin mai mare.
- Optimizări: simulare trafic depărtat la frecvență redusă; mașinile 3D sunt create când intră în raza de vizibilitate; celulele 3D statice sunt grupate/activate gradual când devin vizibile. Harta nu este descărcată în bucăți de pe internet; geometria statică se construiește încă în browser la pornire. Aceasta este culling + pregătire locală progresivă, nu streaming complet de asset-uri.
- Timerul de 1 minut, sistemul de chestionare și replay-ul educativ rămân intacte.
