import {getRebirthSquare} from './rebirth-data.js';
import {REBIRTH_TIBETAN} from './rebirth-tibetan.js?v=art-20260913';
export const NAME_MODES=Object.freeze(['english','tibetan','both']);
export const normaliseNameMode=value=>NAME_MODES.includes(value)?value:'english';
export function nameText(number,mode='english') {
  const en=getRebirthSquare(number).name,tib=REBIRTH_TIBETAN[number];
  return mode==='tibetan'?tib:mode==='both'?`${en} · ${tib}`:en;
}
export function writeName(node,number,mode='english',prefix='') {
  const doc=node.ownerDocument;node.replaceChildren();
  if(prefix)node.append(doc.createTextNode(prefix));
  if(mode!=='tibetan'){const en=doc.createElement('span');en.lang='en';en.textContent=getRebirthSquare(number).name;node.append(en);}
  if(mode!=='english'){const tib=doc.createElement('span');tib.lang='bo';tib.className='rb-tibetan';tib.textContent=REBIRTH_TIBETAN[number];if(mode==='both')tib.classList.add('rb-name-secondary');node.append(tib);}
  return node;
}
export function createNameSelect(doc,value,onChange) {
  const label=doc.createElement('label');label.className='rb-name-control';
  const caption=doc.createElement('span');caption.textContent='Names';
  const select=doc.createElement('select');select.setAttribute('aria-label','Destination name language');
  for(const [key,text] of [['english','English'],['tibetan','Tibetan'],['both','Both']]){const option=doc.createElement('option');option.value=key;option.textContent=text;select.append(option);}
  select.value=value;select.addEventListener('change',()=>onChange(select.value));label.append(caption,select);return label;
}
