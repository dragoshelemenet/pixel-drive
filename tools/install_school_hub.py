#!/usr/bin/env python3
"""Install Pixel Drive's integrated learning portal without overwriting other game updates.

Edits the CURRENT career.js + index.html in place, so it preserves the v48 importer,
replay, HUD, quiz link mapping, traffic and existing game state.
"""
from pathlib import Path
import argparse
import re
import sys

ROOT=Path(__file__).resolve().parent.parent
LABEL_OLD='<button id="start-quiz">Începe chestionarul · 10 întrebări</button>'
LABEL_NEW='<button id="start-quiz">Teste • Învățare și chestionare ↗</button>'
CALL_OLD="panel.querySelector('#start-quiz').onclick=()=>{quiz={index:0,right:0,questions:DriveQuizBank.shuffled().slice(0,10)};question();};"
CALL_NEW="""panel.querySelector('#start-quiz').onclick=()=>{
  if(window.PixelSchoolHub?.open){window.PixelSchoolHub.open({onResult:result=>{
    schoolResult=result;
    if(result.pass){data.money+=150;data.passes++;save();lastHudText='';}
  }});}
  else {quiz={index:0,right:0,questions:DriveQuizBank.shuffled().slice(0,10)};question();}
 };"""
CSS='<link rel="stylesheet" href="/nivel-1/school-hub.css?v=49">'
JS='<script src="/nivel-1/school-hub.js?v=49"></script>'

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--project-root',type=Path,default=ROOT)
    args=ap.parse_args()
    game=args.project_root/'dist'/'nivel-1'
    career=game/'career.js'
    index=game/'index.html'
    files=[game/'school-hub.js',game/'school-hub.css',career,index]
    missing=[str(p) for p in files if not p.exists()]
    if missing:
        print('Lipsesc fișierele: '+', '.join(missing),file=sys.stderr)
        return 1
    code=career.read_text(encoding='utf-8')
    html=index.read_text(encoding='utf-8')
    # Verify exact expected integration points BEFORE altering either file.
    if CALL_OLD not in code and CALL_NEW not in code:
        print('Nu pot găsi handler-ul original pentru #start-quiz. Nu am modificat nimic.',file=sys.stderr)
        return 2
    if not re.search(r'</head>',html,re.I) or not re.search(r'</body>',html,re.I):
        print('index.html nu are structură completă. Nu am modificat nimic.',file=sys.stderr)
        return 2
    if CALL_OLD in code:
        code=code.replace(CALL_OLD,CALL_NEW,1)
    if LABEL_OLD in code:
        code=code.replace(LABEL_OLD,LABEL_NEW,1)
    # Cache keys prevent loading the older files after a hard refresh.
    if 'school-hub.css?v=49' not in html:
        html=re.sub(r'</head>',CSS+'</head>',html,count=1,flags=re.I)
    if 'school-hub.js?v=49' not in html:
        html=re.sub(r'</body>',JS+'</body>',html,count=1,flags=re.I)
    if html.count('school-hub.js?v=49')!=1 or html.count('school-hub.css?v=49')!=1:
        print('Inserarea scriptului a eșuat verificarea anti-duplicat. Nu am modificat nimic.',file=sys.stderr)
        return 2
    career.write_text(code,encoding='utf-8')
    index.write_text(html,encoding='utf-8')
    print('OK: Școala auto -> Teste deschide noul centru de învățare.')
    print('OK: păstrate 25 de loturi RoDrive (dacă au fost deja importate).')
    print('OK: script/style v49 înscrise o singură dată.')
    return 0

if __name__=='__main__':raise SystemExit(main())
