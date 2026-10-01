"""Extract the supplied chapter without discarding table cells or merge metadata.
Block numbers are zero-based body-child offsets in word/document.xml.
"""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import json
ROOT = Path(__file__).resolve().parent.parent
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{'+NS['w']+'}'
with ZipFile(ROOT/'docs/White Beryl Chapter 33.docx') as z:
    body = ET.fromstring(z.read('word/document.xml')).find('w:body', NS)
blocks = []
for i, e in enumerate(body):
    if e.tag == W+'tbl':
        rows=[]
        for row in e.findall('w:tr',NS):
            cells=[]
            for cell in row.findall('w:tc',NS):
                span=cell.find('w:tcPr/w:gridSpan',NS)
                merge=cell.find('w:tcPr/w:vMerge',NS)
                cells.append({'text':' '.join(t.text or '' for t in cell.findall('.//w:t',NS)),
                    'span':int(span.get(W+'val')) if span is not None else 1,
                    'merge':merge.get(W+'val','continue') if merge is not None else None})
            rows.append(cells)
        blocks.append({'block':i,'table':rows})
    else:
        text=' '.join(t.text or '' for t in e.findall('.//w:t',NS))
        if text: blocks.append({'block':i,'text':text})
(ROOT/'docs/WHITE-BERYL-CH33-EXTRACT.json').write_text(json.dumps(blocks,ensure_ascii=False,indent=2)+'\n')
print(f'Extracted {len(blocks)} blocks, including {sum("table" in b for b in blocks)} tables')
