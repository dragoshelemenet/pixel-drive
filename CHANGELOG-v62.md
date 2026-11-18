# Pixel Drive v62 — prima porțiune de referință (preview)

Primul lot este o versiune jucabilă de verificare vizuală, nu o reconstrucție 1:1.
Bază v61 `38818a8`, continuată din snapshot-ul WIP `43060e5`.

## Cum vezi porțiunea

Alege Viscri. Pornirea și restartul sunt fixe lângă lotul 001: x=198.046754,
z=174.734375, unghi=-0.671654 rad. Poziția este validată pentru toate cele patru
mașini și un coridor liber. Apasă **Vezi casa**, în stânga sus, pentru camera apropiată;
**Înapoi la condus** revine la vederea normală. După deplasarea la peste trei unități
de spawn, camera de inspecție se închide automat. Nu înlocuiește camera de instruire.

## Ce este făcut

- Lot mic, rază cinci unități, aproximativ 30 m în fiecare sens în jurul camerei
  Street View 46.0539931,25.09201905. Suprafață de pietriș procedural propriu,
  fără marcaje în această porțiune, după panorama din iunie 2025.
- Profil explicit inițial pentru amprenta OSM `398664586`: fațadă albastru deschis,
  soclu cenușiu, o fereastră frontală înaltă cu tâmplărie brună, fără obloanele generice.
  Acoperiș în patru ape în locul frontonului generic. Țiglă brun-cenușie procedurală
  proprie, evitând roșul materialului comun folosit de restul caselor.
- Materialele de referință sunt reutilizate între reîncărcările clădirii.
- Fețele ascunse nu primesc ferestre și uși generice prezentate ca fiind verificate.
- Pentru verificare s-au folosit perechea Earth 2D și Street View salvată local.
  Capturile Google nu sunt texturi ale jocului și nu sunt în dist.
- Tronsoanele din afara lotului rămân de verificat separat; pe DJ104L la est există
  marcaj central în Street View iulie 2025. Nu s-au eliminat global toate marcajele.

## Fișiere principale

`maps/viscri-world.js`: lot și spawn sigur; `joc.js`: start/restart fix în Viscri;
`maps/real-scenery.js`: suprafața locală; `maps/building-kit.js`: profilul arhitectural
și materialele proprii; `scene3d.js`: buton/cameră de inspecție; `index.html`: v62/cache.
Sunt incluse `handoff.md`, instrucțiunile și testele.

## Verificări

- Cele patru modele pornesc din lot și rulează fără coliziune imediată.
- 6.958 cazuri de margine de drum: zero penalizări false; 172 impacturi cu clădiri,
  172 treceri apropiate, șase secvențe pompe, 20 perechi trafic și recontact rapid.
- Testele CPU pe ambele orașe, 57 retry-uri, trei misiuni, 3.568 probe de drum,
  școală, servicii, semne și încărcare/descărcare progresivă.
- Testele suprafețelor: faza marcajelor și textura terenului, fără regresii.
- Chrome/WebGL: pornire, camera apropiată, tastatură, replay/retry, școală, ambele
  orașe, schimbarea orașelor, indicator mobil și diagnostic coliziuni. Capturile
  lotului și casei au fost inspectate. Nu se revendică îmbunătățire FPS.

## Limite ale acestei prime porțiuni

Casa este încă aproximativă: identificarea completă a ansamblului, dimensiunile
verticale, poarta, peretele de piatră, terasa, soclul pe teren în pantă și detaliile
ascunse de arbori/schele nu sunt finalizate. Anexa și vecinii rămân generici.
Nu sunt modelate încă toate gardurile sau denivelările. Nu folosi acest lot drept
referință finală 1:1. Următorul pas este încă un unghi Street View și potrivirea
sigură a anexei, apoi comparația fațadei/aliniamentelor cu Earth 2D.

Arhiva este completă și se poate rula separat de instalarea v61. Instrucțiunile
Codespaces copiază fișierele numai când utilizatorul le execută.
