# Pixel Drive — handoff

Salvat: **2026-11-18 19:37:24 EET — Europe/Bucharest**

**STARE: prima porțiune v62 preview; fidelitatea arhitecturală rămâne în lucru.**

Snapshot-ul de context anterior conține referințe în `reference-images/`.
Utilizatorul a reluat lucrul după salvare. Livrarea curentă este v62-preview,
cu primul lot jucabil și cameră de inspecție. Continuă de aici, nu reface v60/v61.

## Continuare după snapshot

Stare curentă: **v62 preview jucabil**, primul lot arhitectural încă aproximativ.
Ultimul snapshot WIP a fost `43060e5`; vezi `CHANGELOG-v62.md` pentru această continuare.
Testele CPU pe ambele orașe, spawn și suprafețe trec; testul de coliziuni păstrează
6.958 cazuri fără penalizări false și 172 impacturi reale. Camera **Vezi casa** oferă
comparație apropiată și revine la condus prin același buton. Imagini joc în outputs.

Profilul casei are acum acoperiș în patru ape, material propriu de țiglă brun-cenușie,
fereastră mai îngustă/înaltă și eliminarea detaliilor generice de pe fețele ascunse.
Nu este 1:1. Nu s-au construit încă poarta, peretele de piatră și terenul în pantă.
Identificarea completă a ansamblului și anexei trebuie verificată în încă un unghi.
Arhiva de joc preview nu include capturile Google; arhiva de context anterioară le are.

## Direcție acceptată de utilizator

De azi înainte, reconstruim Viscri în porțiuni mici, documentate individual în
browser. Pentru FIECARE clădire folosim o pereche: **Google Earth 2D** pentru
amprentă, orientare, volum/acoperiș și relația cu strada; **Street View** pentru
fațadă, ferestre, uși, poartă, soclu, culori și materiale. Scopul cerut este o
asemănare cât mai apropiată de 1:1. Nu numi un model generic sau o estimare „1:1”.
Prioritatea explicită: clădirile să semene cât mai mult; textura străzii poate fi
aproximativă; iarba contează mai puțin. Livrăm câte un lot compact și spawn fix
acolo, pentru verificare imediată. Nu reconstrui tot satul dintr-un singur pas.

## Metodă obligatorie pentru continuare

1. Intră efectiv în Google Earth/Street View în browser. Inspectează, nu deduce
   fațade/markaje numai din OSM sau dintr-o captură satelitară neclară.
2. Salvează cele două capturi cu atribuirile Google, data imaginii, poziția camerei
   și linkul. Identifică sigur clădirea în amprentele existente înainte să pretinzi
   o corespondență exactă. Poziția camerei NU este poziția clădirii.
3. Construiește modelul și materialele proprii după aceste referințe. Nu lipi
   capturile Google pe mesh-uri și nu distribui pixeli Google ca texturi fără
   drepturi de reutilizare. Referințele vizuale rămân separate de asset-urile jocului.
4. Reproduce mai întâi silueta, orientarea, proporțiile, numărul/poziția golurilor,
   culoarea fațadei, forma și culoarea acoperișului, poarta/soclul. Nu inventa părțile
   ascunse: marchează-le estimative și caută alt unghi.
5. Compară captura jocului cu ambele referințe. Verifică spawn, coliziuni și streaming.
   Livrează ZIP testat, instrucțiuni Codespaces și spune concret ce nu e încă fidel.

## Descoperire importantă: marcaje pe tronsoane

În centrul inspectat: panorama Via Transilvanica, iunie 2025, suprafață cu pietriș,
fără marcaje vizibile. Pe DJ104L la est de sat, aproximativ 46.054268,25.106984,
Street View iulie 2025: **există marcaj alb central**. Deci nici „fără marcaje peste
tot”, nici marcaje uniforme ca v61. Analizează separat fiecare tronson, inclusiv
intrările în sat. Nu confunda eticheta albă DJ104L sau săgețile navigării cu vopseaua.

## Stare recuperată și prima porțiune v62

Repo local: `/Users/sogardoc/Documents/ChatGPT/Dragosh Projects/pixel-drive`.
Remote: https://github.com/dragoshelemenet/pixel-drive . Conectorul are acces de citire;
nu s-a făcut push. v60: `4d3f210`; v61: `38818a8`.

Lot 001: în dreptul panoramei 46.0539931,25.09201905, centru joc aproximativ
x=198.616392,z=173.758938. Rază 5 unități, adică aproximativ 30 m în fiecare sens.
Porțiune mică de stradă, nu reconstrucție completă a cartierului. Profil inițial pe
amprenta OSM `398664586`: fațadă albastru deschis, soclu cenușiu, tâmplărie brună,
fereastră frontală simplă, acoperiș brun-cenușiu. Identificarea exactă a întregului
ansamblu și detaliile ascunse de arbori/scaffolding rămân de verificat; **nu este 1:1**.
Anexa `399418852` și vecinii sunt încă generici. Nu prezenta lotul drept finalizat
arhitectural. Următorul pas: verifică acoperișul, poarta, peretele de piatră și
numărul ferestrelor din încă un unghi, apoi rafinează profilul acestei case.

Lotul folosește pietriș procedural propriu și omite marcajele numai în această rază.
Restul hărții rămâne la v61 până la verificare pe tronsoane. Spawn-ul este ales cu
`safePose` în dreptul lotului, pe un coridor liber; pornirea UI și restartul nu mai
aleg aleator exerciții în Viscri când `referenceLot` există. Exercițiile și orașul
original rămân disponibile; biblioteca de scenarii nu este ștearsă.

## Referințe locale (copiate și în reference-images/ în arhiva de context)

Folder: `/Users/sogardoc/Documents/ChatGPT/Dragosh Projects/outputs/`
- `Viscri-lot1-earth.png`: contur și orientare, imagine satelitară afișată 8/5/2025.
- `Viscri-lot1-street.png`: fațada albastră și strada, iunie 2025.
- `Viscri-DJ104L-marcaje-iulie-2025.png`: dovadă a marcajului central exterior.

Panorama lotului:
https://earth.google.com/web/search/Viscri,+Romania/@46.0539931,25.09201905,544.91077343a,0d,60y,0h,85t,0r/data=CiwiJgokCcr6Y1Bw2zBAEcj6Y1Bw2zDAGTDSHhpkwUdAIZof6N--NUjAQgIIASIgChxDSUFCSWhDMmZVaTZHNmZ3QzZBU29IQkNmdHh5EAU6AwoBMEICCABKDQj___________8BEAA

## Cod și verificare

- `maps/viscri-world.js`: `referenceLot`, proiecție și spawn după validarea lumii.
- `joc.js`: dezactivează alegerea aleatoare la start/restart pentru lotul activ.
- `maps/real-scenery.js`: pietriș propriu, profil local, rețete streaming.
- `maps/building-kit.js`: profil inițial explicit pentru ID-ul casei.
- `tools/tests/*`: păstrează testele v60/v61; rulează și testul lotului.

Din rădăcina repo:
```
node tools/tests/reference-lot-regression.cjs
node tools/tests/collision-regression.cjs
node tools/tests/viscri-regression.cjs
node tools/tests/surface-regression.cjs
```
Browser: `PLAYWRIGHT_MODULE=/private/tmp/pixel-drive-test-tools/node_modules/playwright`
și server pe portul 8766 pentru `tools/tests/viscri-browser.cjs`.
Nu pretinde FPS îmbunătățit; benchmark-ul software v60 era lent. Pe mobil există
suprapuneri HUD preexistente. Livrările sunt arhive complete, fără installerul v59.
