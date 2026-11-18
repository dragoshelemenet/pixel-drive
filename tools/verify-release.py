#!/usr/bin/env python3
"""Verify every file from a full Pixel Drive release manifest."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'MANIFEST.json').read_text())
for name, expected in manifest.items():
    target = (root / name).resolve()
    if root not in target.parents:
        raise SystemExit('Invalid manifest path: ' + name)
    if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest() != expected:
        raise SystemExit('Missing or changed release file: ' + name)
print(f'Verified {len(manifest)} release files.')
