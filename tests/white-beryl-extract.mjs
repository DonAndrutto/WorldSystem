import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'worldsystem-white-beryl-'));
try {
  const output = path.join(temp, 'extract.json');
  const result = spawnSync('python3', ['scripts/extract-white-beryl.py', output], {
    cwd: root, encoding: 'utf8'
  });
  assert.equal(result.status, 0,
    `White Beryl chapter 33 extraction failed: ${result.error?.message || result.stderr || result.stdout}`);
  const checked = fs.readFileSync(path.join(root, 'docs/WHITE-BERYL-CH33-EXTRACT.json'));
  assert.ok(fs.readFileSync(output).equals(checked),
    'White Beryl chapter 33 extract differs from the source DOCX. Run python3 scripts/extract-white-beryl.py and review docs/WHITE-BERYL-CH33-EXTRACT.json.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
console.log('White Beryl chapter 33 DOCX/extract byte parity passed.');
