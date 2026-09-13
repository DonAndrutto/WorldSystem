import {REBIRTH_SQUARES,getRebirthOutcome} from './rebirth-data.js';
import {REBIRTH_WORLD_MAP,FAMILY_COLOURS} from './rebirth-world-map.js';
import {PLAYER_COLOURS} from './rebirth-iconography.js';

/** Position diagram: descending rows of eight, as in the supplied reference.
 * Nirvana is deliberately detached above the grid, while keeping identity 104.
 */
export function createRebirthBoard({document:doc,onInspect}) {
  const board=doc.createElement('section');board.className='rb-board';board.hidden=true;board.setAttribute('aria-label','Two-dimensional Rebirth board');
  const beyond=doc.createElement('div');beyond.className='rb-board-beyond';
  const grid=doc.createElement('div');grid.className='rb-board-grid';grid.setAttribute('aria-label','Positions 103 to 1');
  const slots=new Map();
  function tile(number) {
    const square=REBIRTH_SQUARES[number-1],b=doc.createElement('button');b.type='button';b.className='rb-board-cell';b.dataset.square=String(number);
    b.style.setProperty('--square-colour','#'+FAMILY_COLOURS[REBIRTH_WORLD_MAP[number-1].family].toString(16).padStart(6,'0'));
    const num=doc.createElement('strong');num.textContent=String(number);
    const name=doc.createElement('span');name.className='rb-board-name';name.textContent=square.name;
    const players=doc.createElement('span');players.className='rb-board-players';b.append(num,name,players);
    b.title=`${number} · ${square.name}`;b.addEventListener('click',()=>onInspect(number));slots.set(number,{button:b,players});return b;
  }
  const nirvana=tile(104);nirvana.classList.add('rb-board-nirvana');
  const caption=doc.createElement('small');caption.textContent='Beyond the round of rebirth';nirvana.append(caption);beyond.append(nirvana);
  const gap=doc.createElement('span');gap.className='rb-board-gap';gap.setAttribute('aria-hidden','true');grid.append(gap);
  for(let n=103;n>=1;n--)grid.append(tile(n));
  const hint=doc.createElement('p');hint.className='rb-board-hint';hint.textContent='Choose any position to read its passage. Outlined positions show possible next destinations.';
  board.append(beyond,grid,hint);
  return {element:board,slots,
    setActive(on){board.hidden=!on;},
    update(state,selected) {
      const routes=new Set(selected===104?[]:Array.from({length:6},(_,i)=>getRebirthOutcome(selected,i+1).to));
      for(const [n,{button,players}] of slots){
        const occupants=state?.players.filter(p=>p.square===n)||[];
        button.classList.toggle('is-selected',n===selected);button.classList.toggle('is-route',routes.has(n)&&n!==selected);
        button.setAttribute('aria-pressed',String(n===selected));
        button.setAttribute('aria-label',`${n} · ${REBIRTH_SQUARES[n-1].name}${occupants.length?' · '+occupants.map(p=>`P${p.id+1} ${p.name}`).join(', '):''}`);
        players.replaceChildren();
        for(const p of occupants){const pin=doc.createElement('span');pin.textContent=`P${p.id+1}`;pin.style.background=PLAYER_COLOURS[p.id];pin.title=p.name;pin.classList.toggle('is-current',p.id===state.active);players.append(pin);}
      }
    }
  };
}
