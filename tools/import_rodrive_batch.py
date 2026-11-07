#!/usr/bin/env python3
"""Import one numbered batch from the CC BY-SA 4.0 RoDrive dataset.

No original reference images are copied. Each question receives an original SVG
illustrative aid generated using its image description/topic. Visually complex
questions must be reviewed by a human before using as official-exam preparation.
"""
import re
import argparse, html, json, os, re, sys, tempfile, urllib.error, urllib.request
from pathlib import Path
from collections import Counter
from datetime import date

SOURCE='https://huggingface.co/datasets/AnonymousDrive/RoDrive'
LICENSE='https://creativecommons.org/licenses/by-sa/4.0/'
NAMES=['anon_questions_with_images.json','questions_without_images.json']
OUG='https://legislatie.just.ro/Public/DetaliiDocument/74028'
HG='https://legislatie.just.ro/Public/DetaliiDocument/79058'
ROOT=Path(__file__).resolve().parents[1]

def get_file(name, folder):
    local=folder/name
    if local.is_file():
        return json.loads(local.read_text(encoding='utf-8'))
    url=f'{SOURCE}/resolve/main/{name}'
    req=urllib.request.Request(url,headers={'User-Agent':'PixelDrive-Educational/1.0','Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=40) as resp:
        data=resp.read()
    value=json.loads(data.decode('utf-8-sig'))
    if not isinstance(value,list):raise ValueError(f'Format neașteptat: {name}')
    folder.mkdir(parents=True,exist_ok=True)
    local.write_bytes(data)
    return value

def norm(s):
    return ' '.join(str(s).strip().split()).casefold().strip('.,;!?')

def merge(rows):
    items={}
    for r in rows:
        if not isinstance(r,dict) or not str(r.get('id','')).isdigit():continue
        key=int(r['id'])
        q=r.get('question','')
        ans=r.get('answers',[])
        corr=r.get('correct_answers',[])
        if not (isinstance(q,str) and q.strip() and isinstance(ans,list) and len(ans)==3 and isinstance(corr,list) and corr):continue
        idx=[i for i,a in enumerate(ans) if norm(a) in {norm(x) for x in corr}]
        if not idx or len(idx)!=len(set(map(norm,corr))):continue
        if key not in items or (r.get('image_description') and not items[key].get('image_description')):
            r=dict(r);r['_idx']=idx;items[key]=r
    return [items[k] for k in sorted(items)]

def esc(s):return html.escape(str(s),quote=True)

def svg(q,n):
    """Road-exam practice illustration drawn from scratch, no external image use."""
    txt=(q.get('image_description') or '')+' '+q.get('question','')
    t=txt.casefold()
    def anyof(*s):return any(x in t for x in s)
    v=n%5
    bg='#dae8ec' if v<2 else '#e6e9df'
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="Ilustrație originală situație rutieră {n}">',
        f'<rect width="640" height="360" fill="{bg}"/>',
        '<rect x="0" y="0" width="640" height="42" fill="#152b28"/><text x="22" y="27" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#f7f6ed">PIXEL DRIVE · SITUAȚIE RUTIERĂ</text>',
        f'<text x="610" y="27" text-anchor="end" font-family="Arial,sans-serif" font-size="13" fill="#bad0c8">#{n:03d}</text>']
    # Simple vector vehicle in plan view
    def car(x,y,color,ang=0):
        return f'<g transform="translate({x} {y}) rotate({ang})"><rect x="-19" y="-33" width="38" height="66" rx="8" fill="{color}" stroke="#25323a" stroke-width="3"/><path d="M-14 -20H14V8H-14Z" fill="#bde1eb" stroke="#344851" stroke-width="2"/><rect x="-15" y="17" width="30" height="8" rx="3" fill="#526777"/></g>'
    def road(vertical=True):
        if vertical:return '<rect x="238" y="42" width="164" height="318" fill="#5b676d"/><path d="M320 48V354" stroke="#f7f4d2" stroke-width="3" stroke-dasharray="19 17"/><path d="M249 44V359M390 44V359" stroke="#e5efed" stroke-width="3"/>'
        return '<rect x="0" y="140" width="640" height="142" fill="#5b676d"/><path d="M8 211H638" stroke="#f7f4d2" stroke-width="3" stroke-dasharray="19 17"/><path d="M0 147H640M0 274H640" stroke="#e5efed" stroke-width="3"/>'
    if anyof('polițist','poliţist','agentul de circulație','semafoare','semafor','lumina roșie','lumină roșie'):
        parts.append(road())
        if anyof('polițist','poliţist','agentul de circulație'):
            parts+=['<circle cx="320" cy="143" r="16" fill="#c69b75" stroke="#25323a" stroke-width="3"/>','<rect x="305" y="158" width="30" height="65" rx="6" fill="#274a74"/>','<path d="M304 177L245 160M337 177L401 162" stroke="#274a74" stroke-width="14" stroke-linecap="round"/>','<path d="M312 225L299 279M329 225L341 279" stroke="#283b4e" stroke-width="15" stroke-linecap="round"/>']
        else:
            active='red' if anyof('roșu','roşu','roșie') else 'yellow' if anyof('galben') else 'green'
            parts+=['<rect x="446" y="83" width="76" height="205" rx="15" fill="#25343a" stroke="#819a97" stroke-width="6"/>',*[(f'<circle cx="484" cy="{y}" r="23" fill="{c if c==active else "#3b4b4c"}" stroke="#162525" stroke-width="4"/>') for c,y in [('red',124),('yellow',188),('green',252)]]]
        parts.append(car(299,275,'#e6b75b'))
    elif anyof('intersecț','prioritate','cedați','ceda','dreapta','sens giratoriu','giratoriu','viraj','virați','viraţi','stânga'):
        parts += ['<rect x="235" y="44" width="170" height="316" fill="#5f6c70"/>','<rect x="0" y="145" width="640" height="132" fill="#5f6c70"/>','<path d="M320 46V133M320 290V357M4 211H222M417 211H635" stroke="#f8e7a9" stroke-width="3" stroke-dasharray="14 13"/>']
        if anyof('giratoriu'):
            parts+=['<circle cx="320" cy="211" r="76" fill="#667375"/>','<circle cx="320" cy="211" r="43" fill="#93ba86"/>','<path d="M368 178A60 60 0 0 1 362 254" fill="none" stroke="#fff3b3" stroke-width="4" stroke-linecap="round"/>']
        parts.append(car(297,315,'#d55d4e'))
        if anyof('dreapta','prioritate','cedați','ceda'):parts.append(car(508,193,'#4076b8',-90))
        if anyof('stânga','virați','viraţi','viraj'):parts.append('<path d="M297 276V212Q300 190 265 190" fill="none" stroke="#fbe38d" stroke-width="7" stroke-linecap="round" stroke-dasharray="11 7"/>')
    elif anyof('pod','depăș','depăş','marcaj','bandă','benzi','linia continuă','linie discontinuă'):
        parts.append(road());parts.append(car(280,275,'#d85f50'));parts.append(car(279,115,'#527caa'))
        if anyof('pod'):
            parts+=['<path d="M219 55V356M419 55V356" stroke="#ddd7bd" stroke-width="12"/>','<path d="M215 55V356M425 55V356" stroke="#4b5754" stroke-width="3" stroke-dasharray="12 15"/>']
        if anyof('continuă','continua'):parts.append('<path d="M320 50V358" stroke="#f7f3cf" stroke-width="4"/>')
    elif anyof('ferat','tren','barier','tramvai'):
        parts.append(road(False));parts+=['<rect x="275" y="50" width="82" height="305" fill="#7d8584" opacity=".65"/>',*[(f'<path d="M{j} 52V353" stroke="#514a48" stroke-width="6"/>') for j in [289,343]],*[(f'<path d="M260 {y}H376" stroke="#59473c" stroke-width="7"/>') for y in range(70,355,32)]]
        parts.append(car(130,208,'#d86657',90))
    elif anyof('pieton','copii','trecere','stație','staţie','autobuz'):
        parts.append(road(False));parts+=[*[(f'<rect x="320" y="{y}" width="66" height="10" fill="#eceee9"/>') for y in range(151,276,22)],car(129,208,'#d86657',90)]
        if anyof('autobuz','stație','staţie'):parts.append('<rect x="478" y="155" width="103" height="54" rx="10" fill="#4a9ab0" stroke="#2b525c" stroke-width="5"/>')
        if anyof('pieton','copii'):parts+=['<circle cx="352" cy="188" r="8" fill="#e6bd94"/>','<path d="M352 198V232M352 210L335 225M352 210L369 225M352 232L339 255M352 232L364 255" fill="none" stroke="#27404d" stroke-width="7" stroke-linecap="round"/>']
    elif anyof('indicat','interzis','limit','acces','semn','obligatoriu'):
        parts.append(road(False))
        if anyof('oprire','stop'):
            parts+=['<polygon points="470,77 513,77 541,108 541,151 513,182 470,182 442,151 442,108" fill="#c84942" stroke="#fff" stroke-width="7"/>','<text x="491" y="136" fill="white" font-size="25" font-family="Arial" font-weight="700" text-anchor="middle">STOP</text>']
        elif anyof('prioritate','cedează','cedați','ceda'):
            parts+=['<polygon points="440,80 544,80 492,180" fill="#f7f5ea" stroke="#c6473e" stroke-width="11"/>']
        else:
            parts+=['<circle cx="492" cy="124" r="57" fill="#f3f7f5" stroke="#c9443e" stroke-width="14"/>','<path d="M465 146L519 95" stroke="#cc4b41" stroke-width="8"/>']
        parts+=['<path d="M492 183V291" stroke="#5d6561" stroke-width="8"/>',car(118,211,'#d86657',90)]
    else:
        parts.append(road(False));parts.append(car(179,213,'#d85f50',90));parts.append(car(432,210,'#4a7a9f',-90))
        if anyof('ploaie','ploa','ceață','ceaţa','ninsoare','vizibilitatea'):
            parts.extend([f'<path d="M{x} {55+(x*7)%58}l-7 29" stroke="#60a5bb" stroke-width="3" opacity=".65"/>' for x in range(20,640,28)])
        elif anyof('noapte','faruri','luminile','ilumin'):
            parts.extend(['<path d="M236 185L360 143V278L236 240Z" fill="#fff0b3" opacity=".27"/>'])
    parts+=['<rect x="0" y="325" width="640" height="35" fill="#152b28"/>',f'<text x="21" y="347" font-family="Arial,sans-serif" font-size="13" fill="#f1f7ee">SCHEMĂ DIDACTICĂ ORIGINALĂ · RoDrive ID {esc(q.get("id",""))}</text>','</svg>']
    return ''.join(parts)

def make_bank():
    return '''/* Pixel Drive questions — RoDrive CC BY-SA 4.0, batch is loaded next. */\n(()=>{\n const questions=[];\n function shuffled(){const a=questions.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}\n function randomExcept(lastId){if(!questions.length)return null;const a=questions.filter(q=>q.id!==lastId);return (a.length?a:questions)[Math.floor(Math.random()*(a.length||questions.length))];}\n window.DriveQuizBank={questions,shuffled,randomExcept};\n})();\n'''

def write_atomic(path,text):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_name(path.name+'.new')
    temp.write_text(text,encoding='utf-8')
    temp.replace(path)


def school_slug(value):
    # ScoalaRutiera full-text search URL; direct IDs require a verified mapping.
    import unicodedata
    value=unicodedata.normalize('NFKD',str(value or '').lower())
    value=''.join(ch for ch in value if not unicodedata.combining(ch))
    value=value.translate(str.maketrans({'ș':'s','ț':'t','ă':'a'}))
    return re.sub(r'[^a-z0-9]+','-',value).strip('-')[:140]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--start',type=int,default=1,help='1-based row start')
    ap.add_argument('--count',type=int,default=50)
    ap.add_argument('--cache-dir',type=Path,default=ROOT/'.cache'/'rodrive')
    ap.add_argument('--test-data-dir',type=Path,default=None,help='Use local JSON files instead of network')
    args=ap.parse_args()
    if args.start<1 or args.count<1 or args.count>200:ap.error('Invalid start/count')
    if args.start!=1 and (args.start-1)%50!=0:ap.error('Batches must begin at 1, 51, 101, 151...')
    folder=args.test_data_dir if args.test_data_dir else args.cache_dir
    print('RoDrive: încarc fișierele CC BY-SA 4.0...')
    try:rows=[dict(q,_sourceFile=name) for name in NAMES for q in get_file(name,folder)]
    except Exception as e:
        print('EROARE: nu s-a putut descărca datasetul. Nu s-a șters banca veche.',file=sys.stderr)
        print(str(e),file=sys.stderr);return 1
    merged=merge(rows)
    subset=merged[args.start-1:args.start-1+args.count]
    if len(subset)!=args.count:
        print(f'EROARE: numai {len(subset)} din {args.count} întrebări disponibile; nimic modificat.',file=sys.stderr);return 2
    if args.start>1:
        first_batch=ROOT/'dist'/'nivel-1'/'quiz-batches'/'batch-01.js'
        if not first_batch.is_file() or 'rodrive-b-0001' not in first_batch.read_text(encoding='utf-8'):
            print('EROARE: lotul 1–50 nu este instalat. Instalează mai întâi v45 (sau păstrează banca existentă).',file=sys.stderr)
            return 3
    out=[];pics={}
    batch_no=(args.start-1)//50+1
    batch_key=f'{batch_no:02d}'
    img_folder=f'rodrive-b{batch_no:02d}'
    for pos,r in enumerate(subset,start=args.start):
        refid=r['id'];qid=f'rodrive-b-{pos:04d}';img=f'/nivel-1/quiz-images/{img_folder}/{pos:04d}.svg'
        pics[pos]=svg(r,pos)
        exp=' '.join(str(r.get('explanation','')).split())
        # Explanation is licensed under CC BY-SA, keep source and attribution explicit.
        obj=dict(id=qid,batch=batch_key,category='Categoria B',question=r['question'].strip(),answers=[a.strip() for a in r['answers']],correctIndices=r['_idx'],
                 correct=r['_idx'][0],explanation=exp[:800],imageUrl=img,imagePage='',fallbackImage=img,
                 imageAlt=f'Ilustrație proprie Pixel Drive pentru situația rutieră #{pos}. Verifică referința originală la sursă.',
                 imageCredit='Ilustrație originală Pixel Drive · schematică, verifică sursa',
                 source=f'RoDrive · ID {refid} · CC BY-SA 4.0',url=SOURCE,sourceUrl='https://www.scoalarutiera.ro/cautare/'+school_slug(r['question']),sourceLabel='Caută întrebarea pe Școala Rutieră',originalDatasetUrl=f'{SOURCE}/blob/main/{r["_sourceFile"]}',
                 sourceQuestionId=str(refid),referenceImageUrl=r.get('image_path') or None,
                 license='CC BY-SA 4.0',licenseUrl=LICENSE)
        out.append(obj)
    game=ROOT/'dist'/'nivel-1'
    # Validate all generated content before replacing any game bank.
    assert len(out)==args.count and len({q['id'] for q in out})==args.count
    js='/* RoDrive 2026 · întrebările '+str(args.start)+'-'+str(args.start+args.count-1)+' din setul curat după ID; CC BY-SA 4.0 */\n(()=>{const b=window.DriveQuizBank;if(!b)throw Error("Missing DriveQuizBank");b.questions.push(...'+json.dumps(out,ensure_ascii=False,separators=(',',':'))+');})();\n'
    for pos,content in pics.items():write_atomic(game/'quiz-images'/img_folder/f'{pos:04d}.svg',content)
    if args.start==1:write_atomic(game/'quiz-bank.js',make_bank())
    batch_file=f'batch-{batch_key}.js'
    write_atomic(game/'quiz-batches'/batch_file,js)
    if args.start>1:
        index=game/'index.html'
        if not index.is_file():raise RuntimeError('Nu există index.html pentru a adăuga lotul următor.')
        h=index.read_text(encoding='utf-8')
        script=f'<script src="/nivel-1/quiz-batches/{batch_file}?v=47"></script>'
        # Remove any older inclusion, then insert in a stable position BEFORE
        # the ScoalaRutiera link overlay (which must see all 100 questions).
        h=re.sub(r'<script src="/nivel-1/quiz-batches/'+re.escape(batch_file)+r'\?v=\d+"></script>','',h)
        after=re.search(r'<script src="/nivel-1/quiz-scoalarutiera-links\.js\?v=\d+"></script>',h)
        if after:
            h=h[:after.start()]+script+h[after.start():]
        else:
            before=re.search(r'<script src="/nivel-1/career\.js\?v=\d+"></script>',h)
            if not before:raise RuntimeError('Nu am găsit scriptul career.js în index.html.')
            h=h[:before.start()]+script+h[before.start():]
        write_atomic(index,h)
    total=len(merged)
    old_state={}
    sf=ROOT/'QUESTION-IMPORT-STATUS.json'
    if sf.is_file():
        try:old_state=json.loads(sf.read_text(encoding='utf-8'))
        except (ValueError, OSError):pass
    prior=[x for x in old_state.get('batches',[]) if x.get('status')=='complete' and x.get('batch')!=batch_key] if args.start>1 else []
    all_batches=sorted(prior+[dict(batch=batch_key,range=f'{args.start}-{args.start+args.count-1}',status='complete',ids=[q['sourceQuestionId'] for q in out])],key=lambda q:q['batch'])
    state=dict(project='Pixel Drive',category='B',source=SOURCE,license='CC BY-SA 4.0',source_total_available=total,
               reference_total_reported_by_scoalarutiera=1208,imported_exact_count=sum(len(x.get('ids',[])) for x in all_batches),imported_exact_source='RoDrive; ordering by numeric RoDrive ID, NOT ScoalaRutiera ordering',
               batches=all_batches,
               next_range=dict(start=args.start+args.count,end=args.start+args.count+args.count-1),
               images=f"{sum(len(b.get('ids',[])) for b in all_batches)} original vector illustrations across completed batches; visual review required")
    write_atomic(ROOT/'QUESTION-IMPORT-STATUS.json',json.dumps(state,ensure_ascii=False,indent=2)+'\n')
    doc=f"""# Pixel Drive — Registrul surselor (RoDrive)

## Progres

- Total întrebări importate: **{state['imported_exact_count']}** din reperul de 1.208.
- Loturi finalizate: {', '.join(b['range'] for b in all_batches)}.
- Următorul lot: **{state['next_range']['start']}–{state['next_range']['end']}**.
- Ordinea este cea a datasetului RoDrive după ID, **nu** ordinea Școala Rutieră.

## Proveniență și utilizare

- Date (întrebări, răspunsuri și explicații): RoDrive — {SOURCE}, sub licența {LICENSE} (CC BY-SA 4.0). Numele autorilor se găsesc în dataset. Această atribuire trebuie păstrată.
- Linkurile vizibile în joc: Școala Rutieră, pentru identificarea întrebării; unele sunt URL-uri directe verificate, altele deschid căutarea pe site.
- Imaginile: {state['imported_exact_count']} scheme SVG realizate de Pixel Drive. **Nu sunt reproduceri fidele ale imaginilor de examen**; verifică indicatoarele, benzile și vehiculele în întrebările vizuale.
- Referințe normative de verificat: OUG 195/2002 — {OUG}; HG 1391/2006 — {HG}.

## Limitări

Unele răspunsuri din sursele terțe pot fi neactualizate. Proiectul nu pretinde certificarea oficială a fiecărui item. Fiecare link se verifică individual înainte de a fi considerat o corespondență exactă.
"""
    write_atomic(ROOT/'QUESTION-SOURCES.md',doc)
    print(f'OK: {len(out)} întrebări exacte din RoDrive, {len(pics)} SVG-uri originale. Total dataset combinat valid: {total}. Urmează: {args.start+args.count}-{args.start+args.count+args.count-1}.')
    print('Am înlocuit întrebările demo și vechi numai după un import reușit.')
    return 0

if __name__=='__main__':sys.exit(main())
