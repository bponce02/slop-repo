from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
for folder,dest in [('starter','starter.json'),('public/bridge','bridge.json')]:
 base=root/folder
 files={str(p.relative_to(base)):p.read_text() for p in sorted(base.rglob('*')) if p.is_file()}
 (root/'public'/dest).write_text(json.dumps(files,indent=2)+'\n')
