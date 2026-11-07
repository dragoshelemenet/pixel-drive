#!/usr/bin/env python3
"""Pixel Drive v48: install all 1,208 RoDrive questions in a single operation.

The public dataset (CC BY-SA 4.0) is downloaded exactly once to a local cache
on the user's Codespace. Builds all 25 numbered batches plus their own
illustrative SVGs BEFORE replacing the live quiz bank. Run once, not 25 times.

The order is RoDrive numeric ID, NOT ScoalaRutiera question order. School links
are exact for previously verified matches, and on-site search for unmatched rows.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import importlib.util
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import shutil

SCRIPT_DIR = Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('rodrive_shared',SCRIPT_DIR/'import_rodrive_batch.py')
shared=importlib.util.module_from_spec(spec)
spec.loader.exec_module(shared)
TARGET_COUNT=1208
PAGE_SIZE=50
SOURCE=shared.SOURCE
LICENSE=shared.LICENSE
SITE='https://www.scoalarutiera.ro/'


def make_question(record, position:int, name:str):
    idx=record['_idx']
    img=f'/nivel-1/quiz-images/rodrive-all/{position:04d}.svg'
    desc=' '.join(str(record.get('image_description') or '').split())
    asset=record.get('image_path')
    qid=f'rodrive-b-{position:04d}'
    return {
      'id':qid,'batch':f'{(position-1)//50+1:02d}',
      'category':'Categoria B','question':record['question'].strip(),
      'answers':[str(a).strip() for a in record['answers']],
      'correctIndices':idx,'correct':idx[0],
      'explanation':' '.join(str(record.get('explanation','')).split())[:1600],
      'imageUrl':img,'imagePage':'','fallbackImage':img,
      'imageAlt':f'Schemă originală orientativă pentru întrebarea {position}; verifică imaginea de referință atunci când întrebarea depinde de detaliile vizuale.',
      'imageCredit':'Pixel Drive · schemă originală orientativă (nu imagine oficială)',
      'imageDescription':desc,'needsImageReview':bool(asset),
      'source':f'RoDrive · ID {record["id"]} · CC BY-SA 4.0',
      'url':SOURCE,
      'sourceUrl':SITE+'cautare/'+shared.school_slug(record['question']),
      'sourceLabel':'Caută întrebarea pe Școala Rutieră',
      'originalDatasetUrl':f'{SOURCE}/blob/main/{name}',
      'sourceQuestionId':str(record['id']),
      'referenceImageUrl':asset if asset else None,
      'license':'CC BY-SA 4.0','licenseUrl':LICENSE,
    }


def build_index(original, filecount):
    # Only change quiz scripts; preserve game, HUD, replay and drive mechanics.
    original=re.sub(r'<script src="/nivel-1/quiz-batches/batch-\d+\.js\?v=\d+"></script>','',original)
    original=re.sub(r'<script src="/nivel-1/quiz-scoalarutiera-links\.js\?v=\d+"></script>','',original)
    marker=re.search(r'<script src="/nivel-1/career\.js\?v=\d+"></script>',original)
    if not marker:raise RuntimeError('Lipsește scriptul career.js; nu s-a modificat index.html.')
    scripts=''.join(f'<script src="/nivel-1/quiz-batches/batch-{n:02d}.js?v=48"></script>' for n in range(1,filecount+1))
    scripts+='<script src="/nivel-1/quiz-scoalarutiera-links.js?v=48"></script>'
    original=original[:marker.start()]+scripts+original[marker.start():]
    original=re.sub(r'/nivel-1/quiz-bank\.js\?v=\d+', '/nivel-1/quiz-bank.js?v=48',original)
    return original


def main():
    parser=argparse.ArgumentParser(description='Importă integral cele 1208 întrebări într-o singură operațiune')
    parser.add_argument('--project-root',type=Path,default=SCRIPT_DIR.parent)
    parser.add_argument('--data-dir',type=Path,default=None,help='Dataset local cu cele două fișiere JSON, altfel descarcă automat')
    parser.add_argument('--dry-run',action='store_true',help='Validează, generează în dosar temporar, nu publică în joc')
    args=parser.parse_args()
    root=args.project_root.resolve()
    game=root/'dist'/'nivel-1'
    if not (game/'index.html').exists():
        parser.error(f'Nu am găsit fișierul {game/"index.html"}')
    cache=(args.data_dir or root/'.cache'/'rodrive')
    print('Pixel Drive v48: încarc datele RoDrive (CC BY-SA 4.0)...',flush=True)
    try:
      records=[]
      for name in shared.NAMES:
        for rec in shared.get_file(name,cache):
          records.append(dict(rec,_sourceFile=name))
      merged=shared.merge(records)
    except Exception as exc:
      print('EROARE: descărcarea a eșuat. Banca existentă NU a fost modificată.',file=sys.stderr)
      print(exc,file=sys.stderr)
      return 1
    if len(merged)!=TARGET_COUNT:
      print(f'EROARE: {len(merged)} înregistrări valide, erau așteptate {TARGET_COUNT}. Nu se modifică banca existentă.',file=sys.stderr)
      return 2
    if len({str(r['id']) for r in merged})!=TARGET_COUNT:
      print('EROARE: duplicate în dataset. Nimic modificat.',file=sys.stderr)
      return 2
    if len({r['question'].strip() for r in merged})<1000:
      print('EROARE: prea multe întrebări duplicate textual. Nimic modificat.',file=sys.stderr)
      return 2
    print(f'OK: validate {len(merged)} întrebări, inclusiv răspunsuri multiple.',flush=True)

    # Generate in staging. Neither the live question bank nor index.html changes
    # if dataset download or validation fails.
    with tempfile.TemporaryDirectory(prefix='.pixel-drive-v48-',dir=root) as tmp:
      stage=Path(tmp)
      stgame=stage/'dist'/'nivel-1'
      batchdir=stgame/'quiz-batches'
      imagedir=stgame/'quiz-images'/'rodrive-all'
      batchdir.mkdir(parents=True)
      imagedir.mkdir(parents=True)
      batches=[];qids=[]
      visual_review=[]
      for pos0 in range(0,len(merged),PAGE_SIZE):
        subset=merged[pos0:pos0+PAGE_SIZE]
        output=[]
        for idx,r in enumerate(subset, start=pos0+1):
          q=make_question(r,idx,r['_sourceFile'])
          output.append(q)
          qids.append(q['id'])
          if q['needsImageReview']:
              visual_review.append({'position':idx,'rodrive_id':r['id'],'sourceQuestion':r['question'],'referenceImageUrl':r.get('image_path'), 'localImage':q['imageUrl'],'reviewed':False})
          (imagedir/f'{idx:04d}.svg').write_text(shared.svg(r,idx),encoding='utf-8')
        number=pos0//PAGE_SIZE+1
        jscode=f'/* Pixel Drive · RoDrive CC BY-SA 4.0 · poziții {pos0+1}–{pos0+len(subset)}; ordine numerică ID */\n'
        jscode+='(()=>{const b=window.DriveQuizBank;if(!b)throw Error("Missing DriveQuizBank");b.questions.push(...'
        jscode+=json.dumps(output,ensure_ascii=False,separators=(',',':'))+');})();\n'
        (batchdir/f'batch-{number:02d}.js').write_text(jscode,encoding='utf-8')
        batches.append({'batch':f'{number:02d}','range':f'{pos0+1}-{pos0+len(subset)}','status':'complete','count':len(subset), 'ids':[str(r['id']) for r in subset]})
        print(f'Lot {number:02d}/25: {pos0+1}–{pos0+len(subset)}',flush=True)
      if len(qids)!=TARGET_COUNT or len(set(qids))!=TARGET_COUNT:raise AssertionError('ID-uri duplicate generate')
      if len(list(imagedir.glob('*.svg')))!=TARGET_COUNT:raise AssertionError('Imagini SVG incomplete')
      if len(batches)!=25 or batches[-1]['count']!=8:raise AssertionError('Număr loturi invalid')

      newindex=build_index((game/'index.html').read_text(encoding='utf-8'),len(batches))
      assert newindex.count('quiz-scoalarutiera-links.js?v=48')==1
      assert newindex.count('quiz-batches/batch-')==25
      assert newindex.index('quiz-batches/batch-25.js')<newindex.index('quiz-scoalarutiera-links.js')<newindex.index('career.js')
      (stgame/'index.html').write_text(newindex,encoding='utf-8')
      (stgame/'quiz-bank.js').write_text(shared.make_bank(),encoding='utf-8')
      tracking={'project':'Pixel Drive','category':'B',
        'source':SOURCE,'license':'CC BY-SA 4.0',
        'reference_total_reported_by_scoalarutiera':1208,
        'source_total_available':TARGET_COUNT,
        'imported_exact_count':TARGET_COUNT,
        'imported_exact_source':'RoDrive sorted by numeric RoDrive ID; not ScoalaRutiera ordering',
        'batches':batches,'next_range':None,
        'school_links':{'previously_verified_direct':48,'remaining':'search on ScoalaRutiera; not claimed exact direct matches'},
        'images':{'original_svg_count':TARGET_COUNT,'needs_review_count':len(visual_review), 'not_official':True},
        'completed_at_utc':datetime.now(timezone.utc).isoformat()}
      (stage/'QUESTION-IMPORT-STATUS.json').write_text(json.dumps(tracking,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
      (stage/'QUESTION-IMAGE-REVIEW.json').write_text(json.dumps({'total':TARGET_COUNT,'visual_questions_for_manual_review':visual_review},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
      sources=f'''# Pixel Drive — întrebări categoria B, import integral v48

- Total: **{TARGET_COUNT}/{TARGET_COUNT} întrebări** din RoDrive, în ordine după ID.
- 25 loturi, ultimul 1201–1208. Următorul lot: **niciunul**.
- Text, variante, răspunsuri, explicații: [RoDrive]({SOURCE}) · [CC BY-SA 4.0]({LICENSE}). Păstrează atribuirea și condițiile licenței la redistribuire.
- Linkuri din joc: [Școala Rutieră]({SITE}), cu legături directe pentru 48 de întrebări deja asociate; restul deschid căutarea site-ului. Nu s-a pretins potrivire directă pentru toate.
- Fiecare întrebare are o imagine SVG originală orientativă creată automat. **{len(visual_review)} au imagini de referință în dataset și necesită revizuire vizuală**; diagramele nu sunt reprezentări oficiale și pot omite detalii decisive. Vedeți `QUESTION-IMAGE-REVIEW.json`.
- Legislație de reverificat individual: [OUG 195/2002](https://legislatie.just.ro/Public/DetaliiDocument/74028), [HG 1391/2006](https://legislatie.just.ro/Public/DetaliiDocument/79058).
- Sursa de date și ordinea întrebărilor sunt diferite de Școala Rutieră; banca nu este certificată ca replica 1:1 a examenului DGPCI.
'''
      (stage/'QUESTION-SOURCES.md').write_text(sources,encoding='utf-8')
      if args.dry_run:
          print('DRY RUN: 1208/1208 validate, nu s-a modificat jocul.')
          return 0
      # Publish only after all files are generated and validated.
      for src in sorted(batchdir.glob('batch-*.js')):
          dest=game/'quiz-batches'/src.name
          dest.parent.mkdir(parents=True,exist_ok=True)
          os.replace(src,dest)
      for src in sorted(imagedir.glob('*.svg')):
          dest=game/'quiz-images'/'rodrive-all'/src.name
          dest.parent.mkdir(parents=True,exist_ok=True)
          os.replace(src,dest)
      for src,dest in [
          (stgame/'quiz-bank.js',game/'quiz-bank.js'),
          (stage/'QUESTION-SOURCES.md',root/'QUESTION-SOURCES.md'),
          (stage/'QUESTION-IMPORT-STATUS.json',root/'QUESTION-IMPORT-STATUS.json'),
          (stage/'QUESTION-IMAGE-REVIEW.json',root/'QUESTION-IMAGE-REVIEW.json'),
          (stgame/'index.html',game/'index.html')]:
          os.replace(src,dest)
    print(f'SUCCESS: {TARGET_COUNT}/{TARGET_COUNT} întrebări, 25 loturi, {TARGET_COUNT} scheme SVG originale.',flush=True)
    print('Sursa fiecărei întrebări este accesibilă pe Școala Rutieră (direct sau prin căutare).',flush=True)
    print('Următorul lot: niciunul. Actualizează browserul cu Cmd+Shift+R.',flush=True)
    return 0

if __name__=='__main__':
    sys.exit(main())
