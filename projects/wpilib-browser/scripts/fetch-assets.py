from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request, hashlib, json
root=Path(__file__).resolve().parents[1]/'public'
assets={f'vendor/{n}':f'https://teavm.org/playground/3/{n}' for n in ['compiler.wasm','compiler.wasm-runtime.js','compile-classlib-teavm.bin','runtime-classlib-teavm.bin']}
for module in ['wpimath','wpiutil','wpiunits','wpilibj','wpilibNewCommands','hal','ntcore','wpinet','cscore','cameraserver']:
 a=module+'-java'; assets[f'lib/{a}.jar']=f'https://frcmaven.wpi.edu/artifactory/api/download/release/edu/wpi/first/{module}/{a}/2025.3.2/{a}-2025.3.2.jar'
for group,artifact,version in [('org.ejml','ejml-'+m,'0.43.1') for m in ['simple','core','ddense','fdense','cdense','zdense','dsparse','fsparse']]+[('us.hebi.quickbuf','quickbuf-runtime','1.3.3')]+[('com.fasterxml.jackson.core','jackson-'+m,'2.15.2') for m in ['annotations','core','databind']]:
 assets[f'lib/{artifact}.jar']=f'https://repo.maven.apache.org/maven2/{group.replace(".","/")}/{artifact}/{version}/{artifact}-{version}.jar'
assets['lib/teavm-jso.jar']='https://repo.maven.apache.org/maven2/org/teavm/teavm-jso/0.16.0/teavm-jso-0.16.0.jar'
def fetch(item):
 name,url=item; p=root/name; p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():
  print('Downloading',name,flush=True)
  with urllib.request.urlopen(url,timeout=120) as r: data=r.read()
  if name.endswith('.jar') and not data.startswith(b'PK'): raise ValueError('Not a JAR: '+url)
  p.write_bytes(data)
 return dict(path=name,url=url,build=('teavm-javac 208d4c97a602 + diagnostic patch + runtime-src sequential subset' if name.startswith('vendor/') else None),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
with ThreadPoolExecutor(max_workers=8) as pool: manifest=list(pool.map(fetch,assets.items()))
(root/'assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
