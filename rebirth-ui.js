import { REBIRTH_SQUARES, getRebirthSquare, getRebirthOutcome } from './rebirth-data.js';
import { REBIRTH_WORLD_MAP } from './rebirth-world-map.js';
import { createGame, rollGame, nextPlayer, chooseStarter, rollDie, restoreGame, rollCeremony } from './rebirth-engine.js';
import { REBIRTH_PROSE } from './rebirth-prose.js';
import { REBIRTH_ICONOGRAPHY, PLAYER_COLOURS } from './rebirth-iconography.js';
import { createRebirthPresentation } from './rebirth-presentation.js';

const SAVE_KEY='ws-rebirth-v1';
const LETTERS=['SA','A','GA','DA','RA','YA'], FACES=['⚀','⚁','⚂','⚃','⚄','⚅'];

export function createRebirthUI({panel,marker,scene,onFocus,onOverview,onChange,playArea,storage,die=rollDie}) {
  const doc=panel.ownerDocument;
  if(storage===undefined){try{storage=doc.defaultView.localStorage;}catch{storage=null;}}
  const el=(tag,text,cls)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const button=(text,fn,cls='btn')=>{const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;};
  let state=null, selected=24, active=false, resetting=false, notice='',storageFailed=false;
  let busy=false,fullBoard=false,sound=true,draftNames='Traveller';
  try {const saved=storage.getItem(SAVE_KEY);if(saved){state=restoreGame(saved);if(!state)notice='The saved journey could not be read. Start a new journey below.';}} catch {storageFailed=true;}
  if(state)selected=state.players[state.active].square;
  try {sound=storage.getItem('ws-rebirth-sound')!=='0';}catch{}
  const pins=el('div',undefined,'rb-player-markers');pins.hidden=true;marker.parentElement.append(pins);
  const leaders=doc.createElementNS('http://www.w3.org/2000/svg','svg');leaders.classList.add('rb-player-leaders');pins.append(leaders);
  const pinButtons=[];
  const presentation=createRebirthPresentation({document:doc,soundEnabled:()=>sound,
    onReveal:()=>{selected=state.players[state.active].square;render();if(active&&!fullBoard)onFocus(selected);},
    onFinish:()=>{busy=false;render();},onDismiss:()=>{if(active)play.querySelector('[data-rb-action="advance"]')?.focus({preventScroll:true});}});
  panel.innerHTML=`<header class="rb-heading"><span class="rb-kicker">Mipham’s game of liberation</span><h2>Rebirth</h2><p>One world. Many lives. A path to freedom.</p></header>
    <div class="rb-status" role="status" aria-live="polite" aria-atomic="true"></div>
    <div class="rb-play"></div>
    <details class="rb-destinations"><summary>Explore the 104 destinations</summary><label for="rb-search">Find a destination</label><input id="rb-search" type="search" placeholder="Number, name or path…" autocomplete="off"><label for="rb-destination">Destination</label><select id="rb-destination"></select><p class="rb-count"></p></details>
    <section class="rb-place" aria-label="Selected destination"></section>
    <details class="rb-rules"><summary>How to play &amp; sources</summary><p>Begin on 24, the Heavenly Highway. Roll once and follow the destination for that face. The first traveller to reach 104 wins. A face with no move keeps you where you are.</p><p>At Vajra Hell (1) and Cessation (48), collect one 1, two 2s, three 3s, four 4s, five 5s and six 6s. A needed roll lets you roll again; an already completed face ends your turn. Your counts remain between turns. Completing every count releases you to 9 or 52.</p><p>Arrival at a trap ends that turn. Counting starts on your next turn; leaving the trap ends that turn. A new visit starts with empty counts. Players take turns in the order their names were entered, beginning with the lowest preliminary roll. Tied lowest players roll again.</p><p>After victory, the winner may roll a 1 or 2 to enter the stupa. This ceremony does not change who won.</p><p>Based on Tatz &amp; Kent, <em>Rebirth: The Tibetan Game of Liberation</em> (1977). This edition follows the researched English reference: 23 / 6 goes to 4, and 76 / 3 goes to 73. Painted-board alternatives remain under review. The trap timing above is an explicit play convention.</p><p>New lotus waystations represent paths and places absent from the original WorldSystem. Their arrangement is schematic; it does not assert geographical positions or distances. The book’s religious classifications reflect its historical perspective.</p><a href="docs/rebirth.md" target="_blank" rel="noopener">Read the implementation and source notes ↗</a></details>`;
  const status=panel.querySelector('.rb-status'),play=panel.querySelector('.rb-play'),place=panel.querySelector('.rb-place');
  const search=panel.querySelector('#rb-search'),select=panel.querySelector('#rb-destination');
  function options() {
    const term=search.value.trim().toLocaleLowerCase();select.replaceChildren();
    const matches=REBIRTH_SQUARES.filter(s=>`${s.number} ${s.name} ${REBIRTH_WORLD_MAP[s.number-1].family}`.toLocaleLowerCase().includes(term));
    for(const s of matches){const option=el('option',`${s.number} · ${s.name}`);option.value=String(s.number);select.append(option);}
    select.disabled=!matches.length;
    if(matches.some(s=>s.number===selected))select.value=String(selected);
    panel.querySelector('.rb-count').textContent=`${matches.length} destinations${term?' found':''}. Looking does not move your traveller.`;
  }
  search.addEventListener('input',options);select.addEventListener('change',()=>inspect(Number(select.value)));
  function save() {try {storage.setItem(SAVE_KEY,JSON.stringify(state));storageFailed=false;}catch {storageFailed=true;}}
  function inspect(number,focus=true) {selected=number;render();if(active&&focus&&!fullBoard)onFocus(number);}
  function setBoardView(on) {fullBoard=on;render();if(active){if(fullBoard)onOverview();else onFocus(selected);}}
  function changed(next) {state=next;selected=state.players[state.active].square;notice='';save();render();if(active&&!fullBoard)onFocus(selected);}
  function safe(fn) {try{fn();}catch(err){notice=err.message;render();}}
  function start(names) {
    const clean=names.map(n=>n.trim()).filter(Boolean);
    // Validate before drawing preliminary dice.
    createGame(clean);const opening=chooseStarter(clean.length,die);
    state=createGame(clean,opening.starter);selected=24;resetting=false;save();
    notice=opening.rounds.length ? `${opening.rounds.map((round,i)=>`Starting roll ${i+1}: ${round.map(r=>`${clean[r.player]} ${r.die}`).join(', ')}.`).join(' ')} ${clean[opening.starter]} begins.` : 'Your journey begins on the Heavenly Highway.';
    render();if(active&&!fullBoard)onFocus(selected);
  }
  function advance() {
    if(!state||resetting||busy||presentation.dialog.open)return;
    if(state.phase==='turn_complete'){changed(nextPlayer(state));return;}
    safe(()=>{
      const result=die(),player=state.players[state.active],ceremony=state.phase==='won';
      const next=ceremony?rollCeremony(state,result):rollGame(state,result);
      if(next===state)return;
      state=next;notice='';busy=true;save();
      const event=state.last, destination=state.players[state.active].square;
      let title=`${destination} · ${getRebirthSquare(destination).name}`;
      let copy=event?.kind==='counted'?'A needed count is collected. You may roll again.':event?.kind==='unneeded'?'This face is already complete. The turn ends.':event?.kind==='escaped'?'All six counts are complete. The way opens.':event?.kind==='won'?'Nirvana is reached. The journey is won.':destination===player.square?'You remain at this destination.':'A new destination on your journey.';
      if(ceremony){title=state.ceremony.inStupa?'The stupa is entered':'The stupa awaits';copy=state.ceremony.inStupa?'The journey and its final ceremony are complete.':'Roll a 1 or 2 to complete the ceremony.';}
      // Commit once before the suspense; closing, mode changes and reloads retain this result.
      play.querySelector('[data-rb-action="advance"]').disabled=true;
      presentation.play({player:player.name,die:result,title,copy,ceremony});
    });
  }
  function renderPlay() {
    play.replaceChildren();
    if(!state||resetting) {
      play.append(el('h3',resetting?'Begin a new journey':'Who is travelling?'),el('p','Play solo, or pass the device clockwise. Enter one name per line, up to 12 travellers.'));
      const form=el('form'),label=el('label','Travellers, in seating order'),names=el('textarea');
      label.htmlFor='rb-names';names.id='rb-names';names.rows=3;names.maxLength=491;names.value=draftNames;names.required=true;
      names.addEventListener('input',()=>{draftNames=names.value;});
      const submit=el('button','Begin journey','btn rb-primary');submit.type='submit';
      form.append(label,names,submit);form.addEventListener('submit',e=>{e.preventDefault();safe(()=>start(names.value.split('\n')));});play.append(form);
      if(resetting)play.append(button('Keep current journey',()=>{resetting=false;render();}));
      return;
    }
    const player=state.players[state.active];
    const turn=el('div',undefined,'rb-turn');turn.append(el('span',state.phase==='won'?'Journey complete':`Turn ${state.turn}`,'rb-kicker'),el('h3',state.phase==='won'?`${player.name} reaches Nirvana`:player.name));play.append(turn);
    const where=button(`${player.square} · ${getRebirthSquare(player.square).name}`,()=>inspect(player.square),'rb-current');play.append(where);
    const dice=el('div',undefined,'rb-dice-row');const face=el('span',state.last?FACES[state.last.die-1]:'◇','rb-die');face.setAttribute('aria-hidden','true');
    const action=button(state.phase==='won'?(state.ceremony?.inStupa?'The stupa is entered':'Roll for the stupa'):state.phase==='turn_complete'?(state.players.length===1?'Continue journey':'Next traveller'):'Roll the die',advance,'btn rb-primary');
    action.dataset.rbAction='advance';action.disabled=busy||!!state.ceremony?.inStupa;
    if(busy)action.textContent='The die is cast…';
    dice.append(face,action);play.append(dice);
    if(state.last)play.append(el('p',`Last roll: ${state.last.die} · ${LETTERS[state.last.die-1]}`,'rb-kicker'));
    if(player.counters) {
      play.append(el('p','Collect each face to leave. A needed face earns another roll.','rb-small'));
      const counts=el('div',undefined,'rb-counters');
      player.counters.forEach((count,i)=>{const c=el('div',undefined,count===i+1?'complete':'');c.append(el('span',`${i+1} · ${LETTERS[i]}`),el('strong',`${count} / ${i+1}`));counts.append(c);});play.append(counts);
    }
    if(state.players.length>1) {
      const roster=el('details'),summary=el('summary',`${state.players.length} travellers`);roster.append(summary);
      state.players.forEach((p,i)=>{const b=button(`${i===state.active?'› ':''}P${i+1} · ${p.name} · ${p.square}`,()=>inspect(p.square),'rb-roster');b.style.borderLeft=`4px solid ${PLAYER_COLOURS[i]}`;roster.append(b);});play.append(roster);
    }
    const links=el('div',undefined,'rb-links');links.append(button('Find my traveller',()=>{fullBoard=false;inspect(player.square);}));
    const board=button('Full board',()=>setBoardView(!fullBoard));board.setAttribute('aria-pressed',String(fullBoard));board.dataset.rbBoard='';links.append(board);play.append(links);
    const audioButton=button(sound?'Sound on':'Sound off',()=>{sound=!sound;if(!sound)presentation.stopSound();try{storage.setItem('ws-rebirth-sound',sound?'1':'0');}catch{}render();},'btn rb-sound');
    audioButton.setAttribute('aria-pressed',String(sound));audioButton.setAttribute('aria-label','Gentle dice sounds');play.append(audioButton);
    const history=el('details');history.append(el('summary','Journey journal'));
    const list=el('ol',undefined,'rb-journal');
    for(const e of state.history.slice(-12).reverse())list.append(el('li',`Turn ${e.turn} · ${state.players[e.player].name} rolled ${e.die}: ${e.from} → ${e.to}${e.kind==='counted'?' (count collected)':e.kind==='unneeded'?' (face already complete)':''}.`));
    if(!state.history.length)history.append(el('p','Your first roll begins the journal.'));else history.append(list);
    history.append(button('Begin a new journey…',()=>{draftNames=state.players.map(p=>p.name).join('\n');resetting=true;render();}));play.append(history);
  }
  function render() {
    const restoreActionFocus=doc.activeElement?.dataset.rbAction==='advance';
    renderPlay();
    if(restoreActionFocus)play.querySelector('[data-rb-action="advance"]')?.focus({preventScroll:true});
    const s=getRebirthSquare(selected),map=REBIRTH_WORLD_MAP[selected-1];place.replaceChildren();
    place.append(el('span',`${map.family} · ${String(selected).padStart(3,'0')}`,'rb-kicker'),el('h3',s.name),el('p',s.summary));
    const art=REBIRTH_ICONOGRAPHY[selected];
    if(art.src){const figure=el('figure',undefined,'rb-iconography'),image=el('img');image.src=art.src;image.alt=art.alt;image.loading='lazy';image.addEventListener('error',()=>{figure.hidden=true;});figure.append(image,el('figcaption',art.credit));place.append(figure);}
    const passage=el('details',undefined,'rb-full-passage');passage.append(el('summary','Read the full passage'));
    const text=el('div',undefined,'rb-prose');
    for(const paragraph of REBIRTH_PROSE[selected].text.split(/\n\n+/))text.append(el('p',paragraph));
    passage.append(text,el('p','Full text from the supplied Destiny Path Catalogue. Original wording and OCR artifacts are preserved.','rb-source'));place.append(passage);
    const outcomes=Array.from({length:6},(_,i)=>getRebirthOutcome(selected,i+1));
    if(selected===104)place.append(el('p','Winning destination. A 1 or 2 completes the optional stupa ceremony.','rb-small'));
    else if(selected===1||selected===48)place.append(el('p',`Complete all six counts to reach ${outcomes[0].to} · ${getRebirthSquare(outcomes[0].to).name}.`,'rb-small'));
    else {
      const grid=el('div',undefined,'rb-outcomes');grid.setAttribute('aria-label','Destinations for each die face');
      outcomes.forEach(o=>{const b=button('',()=>inspect(o.to),'rb-outcome');b.append(el('span',`${o.die} · ${LETTERS[o.die-1]}`),el('span',o.to===selected?'Remain here':`${o.to} · ${getRebirthSquare(o.to).name}`));grid.append(b);});place.append(grid);
    }
    place.append(el('p',`${map.kind==='game-only'?'Game-only waystation':map.kind==='grouped'?'Grouped realms in this world':'Existing place in this world'} · Book ${s.citation.printedPages.length>1?'pages':'page'} ${s.citation.printedPages.join(', ')}`,'rb-source'));
    let message=notice;
    if(!message&&state?.last){const e=state.last;message=`${state.players[e.player].name} rolled ${e.die}. `+({counted:'A needed count was collected. Roll again.',unneeded:'That face is complete. The turn ends.',escaped:`All counts complete. Continue at ${e.to}.`,stay:'Remain at this destination.',won:'Nirvana is reached. The journey is won.',move:`${e.from} → ${e.to} · ${getRebirthSquare(e.to).name}.`}[e.kind]||'');}
    if(state?.ceremony)message+=state.ceremony.inStupa?' The stupa is entered.':` Stupa roll: ${state.ceremony.die}. Roll again when ready.`;
    if(storageFailed)message+=' Saving is unavailable. Keep this tab open to retain your journey.';
    if(status.textContent!==message)status.textContent=message;
    status.hidden=!message;
    marker.textContent=`${selected} · ${s.name}`;marker.title=s.name;
    scene.update(state,selected,selected===104||selected===1||selected===48?[]:outcomes.map(o=>o.to));
    while(pinButtons.length<(state?.players.length||0)) {
      const i=pinButtons.length,b=button('',()=>inspect(state.players[i].square),'rb-player-pin');b.style.setProperty('--player-colour',PLAYER_COLOURS[i]);
      const line=doc.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('stroke',PLAYER_COLOURS[i]);leaders.append(line);
      pins.append(b);pinButtons.push({button:b,line});
    }
    pinButtons.forEach(({button:b,line},i)=>{
      const player=state?.players[i];b.hidden=!player;line.style.display=player?'':'none';if(!player)return;
      b.replaceChildren(el('strong',`P${i+1}`),el('span',player.name),el('small',String(player.square)));
      b.classList.toggle('is-current',i===state.active);
      b.setAttribute('aria-label',`Player ${i+1}, ${player.name}, at ${player.square}, ${getRebirthSquare(player.square).name}${i===state.active?', current turn':''}`);
    });
    if([...select.options].some(o=>Number(o.value)===selected))select.value=String(selected);
    onChange();
  }
  marker.addEventListener('click',()=>{panel.hidden=false;place.scrollIntoView({block:'nearest',behavior:'auto'});});
  options();render();
  return {inspect,advance,start,setBoardView,get state(){return state;},get selected(){return selected;},get fullBoard(){return fullBoard;},presentation,
    setActive(on){active=on;if(!on)presentation.cancel();marker.hidden=!on;pins.hidden=!on;scene.setActive(on);if(on)render();},
    hideMarkers(){marker.hidden=true;pins.hidden=true;},
    project(camera,width,height){
      if(!active)return;pins.hidden=false;
      const p=scene.points.get(selected).clone().project(camera);
      marker.hidden=state?.players.some(player=>player.square===selected)||p.z>1||p.z<-1||Math.abs(p.x)>1||Math.abs(p.y)>1;
      marker.style.left=`${(p.x+1)*width/2}px`;marker.style.top=`${(1-p.y)*height/2-28}px`;
      const area=playArea?playArea():{x:width/2,y:height/2,w:width-30,h:height-30};
      const pinWidth=width<=700?128:160,pinHeight=34;
      const left=area.x-area.w/2+4,right=area.x+area.w/2-pinWidth-4,top=area.y-area.h/2+4,bottom=area.y+area.h/2-pinHeight-4;
      const used=[];leaders.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const order=(state?.players||[]).map((_,i)=>i).sort((a,b)=>Number(b===state.active)-Number(a===state.active));
      for(const i of order){
        const pos=scene.tokenPoint(i).clone().project(camera),sx=(pos.x+1)*width/2,sy=(1-pos.y)*height/2;
        let chosen;
        const candidates=[[sx-pinWidth/2,sy-54],[sx+18,sy-17],[sx-pinWidth-18,sy-17],[sx-pinWidth/2,sy+20]];
        for(let y=top;y<=bottom;y+=pinHeight+5)for(let x=left;x<=right;x+=pinWidth+5)candidates.push([x,y]);
        for(const [x0,y0] of candidates){const x=Math.max(left,Math.min(right,x0)),y=Math.max(top,Math.min(bottom,y0));if(!used.some(r=>x<r.x+pinWidth+4&&x+pinWidth+4>r.x&&y<r.y+pinHeight+4&&y+pinHeight+4>r.y)){chosen={x,y};break;}}
        chosen||={x:left,y:top+i*(pinHeight+3)};used.push(chosen);
        const {button:b,line}=pinButtons[i];b.style.left=`${chosen.x}px`;b.style.top=`${chosen.y}px`;b.style.width=`${pinWidth}px`;
        line.setAttribute('x1',String(Math.max(0,Math.min(width,sx))));line.setAttribute('y1',String(Math.max(0,Math.min(height,sy))));
        line.setAttribute('x2',String(chosen.x+pinWidth/2));line.setAttribute('y2',String(chosen.y+pinHeight));line.style.display=pos.z>1||pos.z<-1?'none':'';
      }
    }
  };
}
