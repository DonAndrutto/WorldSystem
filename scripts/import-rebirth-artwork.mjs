#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, '..');
const sourceDir = resolve(process.argv[2] ?? join(projectDir, '..', 'Game of Liberation English titles'));
const outputDir = join(projectDir, 'assets', 'rebirth');
const fullDir = join(outputDir, 'full');
const thumbDir = join(outputDir, 'thumb');

const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const dimensions = path => {
  const output = execFileSync('/usr/bin/sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], { encoding: 'utf8' });
  return {
    width: Number(output.match(/pixelWidth: (\d+)/)?.[1]),
    height: Number(output.match(/pixelHeight: (\d+)/)?.[1]),
  };
};
const encode = (source, destination, width, height, quality) => {
  const size = dimensions(source);
  const scale = Math.min(1, width / size.width, height / size.height);
  const outputWidth = Math.max(1, Math.round(size.width * scale));
  const outputHeight = Math.max(1, Math.round(size.height * scale));
  execFileSync(process.env.REBIRTH_CWEBP || '/opt/homebrew/bin/cwebp', [
    '-quiet', '-q', String(quality), '-alpha_q', '100', '-metadata', 'none',
    '-resize', String(outputWidth), String(outputHeight), source, '-o', destination,
  ]);
};

const pngs = readdirSync(sourceDir).filter(name => name.toLowerCase().endsWith('.png'));
const numbered = new Map();
for (const name of pngs) {
  const match = name.match(/^(\d+)\s+-\s+(.+)\.png$/u);
  if (!match) continue;
  const number = Number(match[1]);
  if (numbered.has(number)) throw new Error(`Duplicate numeric prefix ${number}: ${numbered.get(number)} and ${name}`);
  numbered.set(number, name);
}
const expected = Array.from({ length: 104 }, (_, index) => index + 1);
const missing = expected.filter(number => !numbered.has(number));
const unexpected = [...numbered.keys()].filter(number => number < 1 || number > 104);
if (missing.length || unexpected.length || numbered.size !== 104) {
  throw new Error(`Expected numeric prefixes 1-104 exactly once. Missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}`);
}

const endName = 'Amitabha Stupa Guru.png';
if (!pngs.includes(endName)) throw new Error(`Missing separate game-end artwork: ${endName}`);
mkdirSync(fullDir, { recursive: true });
mkdirSync(thumbDir, { recursive: true });

const assets = [];
for (const number of expected) {
  const sourceName = numbered.get(number);
  const sourcePath = join(sourceDir, sourceName);
  const stem = String(number).padStart(3, '0');
  const fullPath = join(fullDir, `${stem}.webp`);
  const thumbPath = join(thumbDir, `${stem}.webp`);
  encode(sourcePath, fullPath, 768, 768, 84);
  encode(sourcePath, thumbPath, 256, 256, 80);
  assets.push({
    number,
    title: sourceName.replace(/^\d+\s+-\s+|\.png$/gu, ''),
    source: { filename: sourceName, sha256: sha256(sourcePath), bytes: statSync(sourcePath).size, ...dimensions(sourcePath) },
    full: { path: `full/${stem}.webp`, sha256: sha256(fullPath), bytes: statSync(fullPath).size, ...dimensions(fullPath) },
    thumbnail: { path: `thumb/${stem}.webp`, sha256: sha256(thumbPath), bytes: statSync(thumbPath).size, ...dimensions(thumbPath) },
  });
}

const endSource = join(sourceDir, endName);
const endPath = join(outputDir, 'rebirth-end.webp');
encode(endSource, endPath, 1400, 700, 86);
const manifest = {
  schemaVersion: 1,
  importedAt: new Date().toISOString(),
  sourceDirectory: basename(sourceDir),
  policy: 'Technical resize and WebP compression only; full composition and alpha preserved; source originals unchanged.',
  presets: {
    full: { width: 768, height: 768, quality: 84, alphaQuality: 100 },
    thumbnail: { width: 256, height: 256, quality: 80, alphaQuality: 100 },
    end: { width: 1400, height: 700, quality: 86 },
  },
  assets,
  end: {
    source: { filename: endName, sha256: sha256(endSource), bytes: statSync(endSource).size, ...dimensions(endSource) },
    output: { path: 'rebirth-end.webp', sha256: sha256(endPath), bytes: statSync(endPath).size, ...dimensions(endPath) },
  },
};
writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Imported ${assets.length} numbered works and 1 game-end work into ${outputDir}`);
