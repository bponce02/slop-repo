"""Append our explicit single-thread Fork/Join subset to TeaVM's runtime archive."""
from pathlib import Path
import gzip,struct,subprocess,os,tempfile,urllib.request
root=Path(__file__).resolve().parents[1]
javac=str(Path(os.environ['JAVA_HOME'])/'bin/javac')
jar=root/'build/teavm-classlib-0.16.0.jar'
jar.parent.mkdir(exist_ok=True)
if not jar.exists(): urllib.request.urlretrieve('https://repo.maven.apache.org/maven2/org/teavm/teavm-classlib/0.16.0/teavm-classlib-0.16.0.jar',jar)
with tempfile.TemporaryDirectory() as d:
 subprocess.run([javac,'--release','17','-cp',str(jar),'-d',d,*map(str,(root/'runtime-src').rglob('*.java'))],check=True)
 p=root/'public/vendor/runtime-classlib-teavm.bin'
 raw=gzip.decompress(p.read_bytes()); entries={};i=0
 while i<len(raw):
  n=struct.unpack_from('>H',raw,i)[0];i+=2;name=raw[i:i+n].decode();i+=n
  n=struct.unpack_from('>I',raw,i)[0];i+=4;entries[name]=raw[i:i+n];i+=n
 for f in Path(d).rglob('*.class'):entries[f.relative_to(d).as_posix()]=f.read_bytes()
 data=b''
 for name,content in entries.items():
  n=name.encode();data+=struct.pack('>H',len(n))+n+struct.pack('>I',len(content))+content
 p.write_bytes(gzip.compress(data,mtime=0))
