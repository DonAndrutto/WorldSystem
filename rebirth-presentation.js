import {REBIRTH_ICONOGRAPHY,REBIRTH_END_ART} from './rebirth-iconography.js?v=art-20260913';
import {writeName,createNameSelect} from './rebirth-names.js?v=art-20260913';
// The die is resolved and saved by the engine before this presentation starts.
// Animation never draws a second random result and can safely be interrupted.
export const ROLL_DURATION = 2500;
export function createRebirthPresentation({document:doc, onReveal, onFinish, onDismiss=()=>{}, onReset=()=>{}, soundEnabled=()=>true, nameMode=()=>'english', onNameMode=()=>{}}) {
  const win=doc.defaultView;
  const dialog=doc.createElement('dialog');dialog.className='rb-reveal';
  dialog.setAttribute('aria-labelledby','rb-reveal-title');
  dialog.innerHTML='<p class="rb-reveal-who"></p><div class="rb-reveal-die" aria-hidden="true">⚀</div><p class="rb-reveal-face"></p><h2 id="rb-reveal-title">The die is cast…</h2><p class="rb-reveal-copy"></p><details class="rb-reveal-passage" hidden><summary>Read the full passage</summary><div class="rb-popup-prose"></div></details><figure class="rb-reveal-art" hidden></figure><footer class="rb-reveal-footer"><button class="btn rb-primary" type="button" disabled>Continue</button><button class="btn rb-popup-reset" type="button">Reset game</button></footer>';
  doc.body.append(dialog);
  const face=dialog.querySelector('.rb-reveal-die'),title=dialog.querySelector('h2'),copy=dialog.querySelector('.rb-reveal-copy'),close=dialog.querySelector('.rb-primary'),passage=dialog.querySelector('.rb-reveal-passage');
  function fullText(text) {
    const body=dialog.querySelector('.rb-popup-prose');body.replaceChildren();passage.open=false;passage.hidden=!text;
    for(const paragraph of (text||'').split(/\n\n+/)){const p=doc.createElement('p');p.textContent=paragraph;body.append(p);}
  }
  let shownPlace=null;
  const namesControl=createNameSelect(doc,nameMode(),onNameMode);namesControl.classList.add('rb-popup-names');dialog.querySelector('.rb-reveal-who').after(namesControl);
  function refreshNames() {namesControl.querySelector('select').value=nameMode();if(shownPlace?.square&&!shownPlace.ceremony)writeName(title,shownPlace.square,nameMode(),`${shownPlace.square} · `);}
  function showArt(place) {
    const figure=dialog.querySelector('.rb-reveal-art');figure.replaceChildren();const art=place.ending?REBIRTH_END_ART:REBIRTH_ICONOGRAPHY[place.square];figure.hidden=!art?.src;
    if(!art?.src)return;const image=doc.createElement('img');image.src=art.src;image.alt=art.alt;image.decoding='async';image.addEventListener('error',()=>{figure.hidden=true;});const link=doc.createElement('a');link.href=art.src;link.target='_blank';link.rel='noopener';link.className='rb-art-link';link.setAttribute('aria-label','Open full artwork');const hint=doc.createElement('span');hint.textContent='View artwork ↗';link.append(image,hint);figure.append(link);
    if(place.ending){const caption=doc.createElement('figcaption');caption.textContent='Amitabha · Stupa · Guru';figure.append(caption);}
  }
  let timer=null,pulse=null,event=null,revealed=false,finished=false,audio=null,voices=[];
  const glyphs=['⚀','⚁','⚂','⚃','⚄','⚅'];
  function stopSound() {for(const o of voices){try{o.stop();}catch{}}voices=[];}
  function tone(at,freq,duration,gain) {
    if(!audio||!soundEnabled())return;
    const oscillator=audio.createOscillator(),amp=audio.createGain();
    oscillator.type='sine';oscillator.frequency.setValueAtTime(freq,at);oscillator.frequency.exponentialRampToValueAtTime(freq*.72,at+duration);
    amp.gain.setValueAtTime(.0001,at);amp.gain.exponentialRampToValueAtTime(gain,at+.008);amp.gain.exponentialRampToValueAtTime(.0001,at+duration);
    oscillator.connect(amp);amp.connect(audio.destination);oscillator.start(at);oscillator.stop(at+duration+.02);
    oscillator.onended=()=>{oscillator.disconnect();amp.disconnect();voices=voices.filter(o=>o!==oscillator);};voices.push(oscillator);
  }
  function playSound() {
    if(!soundEnabled())return;
    try {
      const Context=win.AudioContext||win.webkitAudioContext;if(!Context)return;
      if(!audio)audio=new Context();
      // Created/resumed only in the user's roll gesture; failures stay silent.
      const pendingEvent=event;
      Promise.resolve(audio.resume()).then(()=>{
        if(!event||event!==pendingEvent||!soundEnabled())return;
        const t=audio.currentTime;
        [0,.14,.31,.53,.80,1.13].forEach((offset,i)=>tone(t+offset,460+i*42,.12,.032));
        tone(t+1.68,660,.72,.025);tone(t+1.70,990,.85,.010);
      }).catch(()=>{});
    } catch {/* Audio is optional; the game remains fully playable. */}
  }
  function reveal() {
    if(!event||revealed)return;revealed=true;
    win.clearInterval(pulse);pulse=null;face.textContent=glyphs[event.die-1];
    dialog.classList.remove('is-rolling');dialog.classList.add('is-arrival');
    dialog.querySelector('.rb-reveal-face').textContent=`${event.die} · ${['SA','A','GA','DA','RA','YA'][event.die-1]}`;
    shownPlace=event;title.textContent=event.title;refreshNames();copy.textContent=event.copy;showArt(event);
    fullText(event.passage);dialog.classList.toggle('is-nirvana',event.square===104);
    onReveal();
  }
  function finish() {if(finished||!event)return;finished=true;reveal();close.disabled=false;if(!passage.open)close.focus({preventScroll:true});onFinish();}
  function cancel() {
    const hadEvent=!!event;
    win.clearTimeout(timer);win.clearInterval(pulse);timer=null;pulse=null;stopSound();
    if(event){reveal();finish();event=null;}
    if(dialog.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
    if(hadEvent)onDismiss();
  }
  close.addEventListener('click',cancel);
  dialog.querySelector('.rb-popup-reset').addEventListener('click',()=>{cancel();onReset();});
  dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});
  dialog.addEventListener('keydown',e=>e.stopPropagation());
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)cancel();});
  return {dialog,cancel,stopSound,refreshNames,
    showPlace(place) {
      cancel();event=null;revealed=true;finished=true;
      face.hidden=true;dialog.querySelector('.rb-reveal-face').textContent='';
      dialog.querySelector('.rb-reveal-who').textContent=place.square===104?'Beyond the round of rebirth':'A place on the journey';
      shownPlace=place;title.textContent=place.title;refreshNames();copy.textContent=place.copy;fullText(place.passage);showArt(place);
      dialog.classList.remove('is-rolling');dialog.classList.add('is-arrival');dialog.classList.toggle('is-nirvana',place.square===104);
      close.textContent='Close';close.disabled=false;
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
      passage.querySelector('summary').focus();
    },
    play(nextEvent) {
      cancel();event=nextEvent;shownPlace=null;revealed=false;finished=false;dialog.querySelector('.rb-reveal-art').hidden=true;namesControl.querySelector('select').value=nameMode();
      title.textContent='The die is cast…';copy.textContent='Where will this life lead?';face.hidden=false;passage.hidden=true;passage.open=false;close.textContent='Continue';dialog.classList.remove('is-nirvana');
      dialog.querySelector('.rb-reveal-who').textContent=`${event.player} · ${event.ceremony?'Stupa ceremony':'A new turn of the wheel'}`;
      dialog.querySelector('.rb-reveal-face').textContent='';face.textContent='◇';
      dialog.classList.remove('is-arrival');dialog.classList.add('is-rolling');close.disabled=true;
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
      if(win.matchMedia('(prefers-reduced-motion: reduce)').matches){reveal();finish();return;}
      playSound();let frame=0;
      pulse=win.setInterval(()=>{face.textContent=glyphs[(frame++)%6];},130);
      timer=win.setTimeout(()=>{reveal();timer=win.setTimeout(finish,ROLL_DURATION-1650);},1650);
    }
  };
}
