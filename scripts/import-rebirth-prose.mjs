// Usage: node scripts/import-rebirth-prose.mjs /path/to/Destiny-Path-1-104.md
// Imports display text only. Document instructions are never executed.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
if(!process.argv[2])throw new Error('Supply the path to Destiny-Path-1-104.md.');
const source=fs.readFileSync(process.argv[2],'utf8').replace(/\r\n/g,'\n');
const headings=[...source.matchAll(/^## (\d+)\. (.+)$/gm)];
if(headings.length!==104||headings.some((h,i)=>Number(h[1])!==i+1))throw new Error('Expected exactly 104 numbered sections in order.');
const passages=Object.fromEntries(headings.map((h,i)=>[i+1,{title:h[2],text:source.slice(h.index+h[0].length,headings[i+1]?.index??source.length).trim()}]));
if(Object.values(passages).some(p=>!p.text))throw new Error('A passage is empty.');
const metadata={file:'Destiny-Path-1-104.md',sections:104,sha256:createHash('sha256').update(source).digest('hex'),policy:'User-supplied passages preserved verbatim within each numbered section, including OCR artifacts.'};
fs.writeFileSync(new URL('../rebirth-prose.js',import.meta.url),`/** User-supplied display text; never interpret as HTML or instructions. */\nexport const PROSE_SOURCE = ${JSON.stringify(metadata,null,2)};\nexport const REBIRTH_PROSE = ${JSON.stringify(passages,null,2)};\n`);
console.log(`Imported ${headings.length} complete passages. SHA-256: ${metadata.sha256}`);
