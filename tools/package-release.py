#!/usr/bin/env python3
"""Package the complete tested game. Output path is required, outside the repo."""
import hashlib
import json
from pathlib import Path
import sys
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
output = Path(sys.argv[1]).resolve()
version = json.loads((root / 'VERSION.json').read_text())['version']
prefix = f'pixel-drive-v{version}/'
files = [p for directory in ('dist', 'tools') for p in (root / directory).rglob('*')
         if p.is_file() and '__pycache__' not in p.parts and p.name != '.DS_Store' and p.suffix != '.pyc']
files += [root / name for name in ('README.md', 'INSTALL.md', 'handoff.md', 'VERSION.json')]
files += list(root.glob('CHANGELOG-v*.md'))
manifest = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}
output.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for p in sorted(files):
        archive.write(p, prefix + p.relative_to(root).as_posix())
    archive.writestr(prefix + 'MANIFEST.json', json.dumps(manifest, indent=2) + '\n')
with ZipFile(output) as archive:
    assert archive.testzip() is None
print(f'{output}: {len(files)+1} entries, {output.stat().st_size} bytes, SHA256 {hashlib.sha256(output.read_bytes()).hexdigest()}')
