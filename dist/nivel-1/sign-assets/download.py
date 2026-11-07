import urllib.request,urllib.parse,hashlib,json,concurrent.futures
from pathlib import Path
root=Path(__file__).parent
assets={'stop':'B02','yield':'B01','priority':'B03','roundabout':'D07','crossing':'G01','limit30':'C29 (30)','limit50':'C29 (50)','parking':'G34','noStopping':'C39','noParking':'C38','children':'A23','roadworks':'A27','slippery':'A19','bump':'A18'}
def download(pair):
 key,code=pair;n='RO_road_sign_'+code.replace(' ','_')+'.svg';h=hashlib.md5(n.encode()).hexdigest();u=f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/'+urllib.parse.quote(n)
 b=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'PixelDriveEducationalGame/1.0 (road sign attribution research)'}),timeout=40).read();assert b'<svg' in b
 (root/(key+'.svg')).write_bytes(b)
 old=code[0] in 'BC';return key,dict(file=key+'.svg',source='https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(n),original=u,author='Alex:D' if old else 'Gigillo83',license='CC BY-SA 3.0' if old else 'CC BY-SA 4.0',licenseUrl='https://creativecommons.org/licenses/by-sa/'+('3.0' if old else '4.0')+'/',changes='Unmodified SVG source',bytes=len(b))
results={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
 fs={ex.submit(download,p):p for p in assets.items()}
 for f in concurrent.futures.as_completed(fs):
  try:k,v=f.result();results[k]=v;print(k,v['bytes'],flush=True)
  except Exception as e:print('FAILED',fs[f],e,flush=True)
(root/'manifest.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
