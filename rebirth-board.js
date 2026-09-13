import {REBIRTH_SQUARES,getRebirthOutcome} from './rebirth-data.js';
import {REBIRTH_WORLD_MAP,FAMILY_COLOURS} from './rebirth-world-map.js';
import {nameText,writeName} from './rebirth-names.js?v=art-20260913';
import {REBIRTH_ICONOGRAPHY,REBIRTH_END_ART,PLAYER_COLOURS} from './rebirth-iconography.js?v=art-20260913';

/** Position diagram: descending rows of eight, as in the supplied reference.
 * All 104 positions retain their original places in the 2D board.
 */
export function createRebirthBoard({document:doc,onInspect}) {
  const board=doc.createElement('section');board.className='rb-board';board.hidden=true;board.setAttribute('aria-label','Two-dimensional Rebirth board');
  const grid=doc.createElement('div');grid.className='rb-board-grid';grid.setAttribute('aria-label','Positions 104 to 1');
  const slots=new Map();
  function tile(number) {
    const square=REBIRTH_SQUARES[number-1],b=doc.createElement('button');b.type='button';b.className='rb-board-cell';b.dataset.square=String(number);
    b.style.setProperty('--square-colour','#'+FAMILY_COLOURS[REBIRTH_WORLD_MAP[number-1].family].toString(16).padStart(6,'0'));
    const num=doc.createElement('strong');num.textContent=String(number);
    const name=doc.createElement('span');name.className='rb-board-name';name.textContent=square.name;
    const players=doc.createElement('span');players.className='rb-board-players';
    const label=doc.createElement('span');label.className='rb-board-label';label.append(num,name);
    const art=REBIRTH_ICONOGRAPHY[number],image=doc.createElement('img');image.className='rb-board-art';image.alt='';image.loading='lazy';image.decoding='async';image.src=art.thumbSrc||art.src;image.addEventListener('error',()=>{image.hidden=true;b.classList.add('art-unavailable');});b.append(image,label,players);
    b.title=`${number} · ${square.name}`;b.addEventListener('click',()=>onInspect(number));slots.set(number,{button:b,players,name});return b;
  }
  for(let n=104;n>=1;n--)grid.append(tile(n));
  const hint=doc.createElement('p');hint.className='rb-board-hint';hint.textContent='Choose any position to read its passage. Outlined positions show possible next destinations.';
  const ending=doc.createElement('figure');ending.className='rb-board-ending';ending.hidden=true;
  const endImage=doc.createElement('img');endImage.alt=REBIRTH_END_ART.alt;endImage.loading='lazy';endImage.addEventListener('error',()=>{endImage.hidden=true;});
  const endCaption=doc.createElement('figcaption');ending.append(endImage,endCaption);board.append(ending,grid,hint);
  return {element:board,slots,
    setActive(on){board.hidden=!on;},
    update(state,selected,nameMode='english') {
      const won=state?.phase==='won';ending.hidden=!won;if(won){if(!endImage.getAttribute('src'))endImage.src=REBIRTH_END_ART.src;endCaption.textContent=`${state.players[state.active].name} · Journey complete`;}
      board.dataset.nameMode=nameMode;
      const routes=new Set(selected===104?[]:Array.from({length:6},(_,i)=>getRebirthOutcome(selected,i+1).to));
      for(const [n,{button,players,name}] of slots){
        writeName(name,n,nameMode);button.title=`${n} · ${nameText(n,nameMode)}`;
        const occupants=state?.players.filter(p=>p.square===n)||[];
        button.classList.toggle('is-selected',n===selected);button.classList.toggle('is-route',routes.has(n)&&n!==selected);
        button.setAttribute('aria-pressed',String(n===selected));
        button.setAttribute('aria-label',`${n} · ${nameText(n,nameMode)}${occupants.length?' · '+occupants.map(p=>`P${p.id+1} ${p.name}`).join(', '):''}`);
        players.replaceChildren();
        for(const p of occupants){const pin=doc.createElement('span');pin.textContent=`P${p.id+1}`;pin.style.background=PLAYER_COLOURS[p.id];pin.title=p.name;pin.classList.toggle('is-current',p.id===state.active);players.append(pin);}
      }
    }
  };
}
