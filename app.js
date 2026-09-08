/* QUADLUD — Soleil/Lune playable pattern prototype
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Product baseline: 12bb8e71d1eaa406f176d99403f34305b596e233
 * Pattern research checkpoint: 09b714b7522b0f94faac8d7c1db786b26c61629d
 */
(function(){'use strict';
const PE=globalThis.TangoPatternEngine, REG=globalThis.TangoPatternRegistry, POOL=globalThis.TangoPrototypePuzzles;
if(!PE||!REG||!POOL)throw new Error('Prototype modules missing');
const {E,M,S,SAME,OPP}=PE;
const clone=x=>JSON.parse(JSON.stringify(x));
let game=null, givens=new Set(), undo=[], redo=[], puzzleCursor={easy:0,medium:0,hard:0,expert:0};
let recognizer=new PE.PatternRecognizer(),arbiter=new PE.PatternArbiter(),lastMatch=null;
let coachMatch=null,tutorMatch=null,tutorStage=-1,solverRunning=false;

function $ (id){return document.getElementById(id);}
function profile(){return $('profile').value;}
function selectedDifficulty(){return $('difficulty').value;}
function snap(){return {state:clone(game.state),edges:clone(game.edges),derivedRelations:clone(game.derivedRelations||[]),givens:[...givens]};}
function restore(s){game={id:game?.id||'restored',difficulty:game?.difficulty||selectedDifficulty(),state:clone(s.state),edges:clone(s.edges),derivedRelations:clone(s.derivedRelations||[])};givens=new Set(s.givens||[]);clearGuidance();render();}
function pushUndo(){undo.push(snap());if(undo.length>120)undo.shift();redo=[];}
function clearGuidance(){coachMatch=null;tutorMatch=null;tutorStage=-1;lastMatch=null;renderCoach();renderTutor();clearHighlights();}
function newGame(){const d=selectedDifficulty(),list=POOL[d],i=puzzleCursor[d]++%list.length,p=list[i];game={id:p.id,difficulty:d,state:clone(p.state),edges:clone(p.edges),derivedRelations:[]};givens=new Set();for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(game.state[r][c]!==E)givens.add(r*6+c);undo=[];redo=[];clearGuidance();render();status(`Nouvelle partie ${labelDifficulty(d)} — ${p.id}.`,'ok');}
function labelDifficulty(d){return {easy:'Facile',medium:'Moyen',hard:'Difficile',expert:'Expert'}[d]||d;}
function symbol(v){return v===S?'☀️':v===M?'🌙':'';}
function symbolWord(v){return v===S?'Soleil':v===M?'Lune':'vide';}
function coord(c){return PE.coord(c);}
function cycleCell(r,c){if(givens.has(r*6+c)||solverRunning)return;const before=snap(),old=game.state[r][c],nv=old===E?S:old===S?M:E;game.state[r][c]=nv;const bad=PE.diagnoseVisible(snap());if(bad){game.state=before.state;status('Coup illégal : '+diagnosisText(bad)+'.','error');render();return;}undo.push(before);redo=[];clearGuidance();render();if(PE.isCompleteValid(snap()))victory();else status(`${coord([r,c])} = ${symbolWord(nv)}.`,'');}
function diagnosisText(b){if(b.kind==='TRIPLE')return 'trois symboles identiques consécutifs';if(b.kind==='QUOTA')return 'plus de trois symboles identiques sur une ligne';if(b.kind==='NO_LINE_MODEL')return 'aucune complétion légale possible';return 'contradiction avec les relations';}
function victory(){status('🎉 Grille résolue : toutes les lignes et colonnes respectent les règles.','win');$('victory').classList.remove('hidden');setTimeout(()=>$('victory').classList.add('hidden'),1800);}

function matches(){return recognizer.recognize(snap(),profile());}
function chooseMatch(){return arbiter.select(matches(),lastMatch);}
function chooseConclusion(m){if(!m)return null;return m.conclusions.find(c=>c.kind==='value')||m.conclusions[0];}
function applyOne(m,source){if(!m||!m.validated)return false;const c=chooseConclusion(m);if(!c)return false;pushUndo();const next=PE.applyConclusion(snap(),c,m.patternId);game.state=next.state;game.derivedRelations=next.derivedRelations;lastMatch=m;coachMatch=null;tutorMatch=null;tutorStage=-1;render();status(`${source} : ${m.patternId.replace('TANGO-','')} ${m.patternName} → ${conclusionText(c)}.`,'ok');if(PE.isCompleteValid(snap()))victory();return true;}
function solverStep(){const m=chooseMatch();if(!m){status('Solveur patterns bloqué : aucun P001–P018 connu ne s’applique.','warn');return;}highlightMatch(m,'move');applyOne(m,'Solveur patterns');}
async function solveUntilBlocked(){if(solverRunning)return;solverRunning=true;$('solveAllBtn').disabled=true;let n=0,ids=new Set();try{while(n<250&&!PE.isCompleteValid(snap())){const m=chooseMatch();if(!m)break;ids.add(m.patternId);if(!applyOne(m,'Solveur'))break;n++;if(n%5===0)await new Promise(r=>setTimeout(r,0));}if(PE.isCompleteValid(snap()))status(`Solveur patterns : grille résolue en ${n} conclusions, ${ids.size} patterns distincts.`,'win');else status(`Solveur patterns bloqué après ${n} conclusions (${ids.size} patterns distincts). ${game.state.flat().filter(x=>x===E).length} cases restent inconnues.`,'warn');}finally{solverRunning=false;$('solveAllBtn').disabled=false;render();}}

function coach(){const m=chooseMatch();coachMatch=m;if(!m){renderCoach();status('Logic Coach : aucun pattern connu ne fournit actuellement de coup.','warn');return;}lastMatch=m;highlightMatch(m,'move');renderCoach();status(`Logic Coach : ${m.patternId.replace('TANGO-','')} reconnu et validé.`,'ok');}
function renderCoach(){const box=$('coachBox');if(!coachMatch){box.innerHTML='<p>Appuyez sur <strong>Conseil</strong> pour chercher un coup démontré par un pattern visible.</p>';return;}const m=coachMatch,c=chooseConclusion(m),p=REG.byId[m.patternId];box.innerHTML=`<div class="pattern-head"><span class="badge">${m.patternId.replace('TANGO-','')}</span><strong>${esc(p.nameFr)}</strong><span class="tier">N${p.expertiseTier}</span></div><p>${esc(p.mnemonicFr)}</p><p><strong>Coup conseillé :</strong> ${esc(conclusionText(c))}</p><p class="validation">✓ Conclusion revalidée exactement depuis l’état visible.</p><button id="coachPlay" class="primary small">Jouer ce coup</button>`;$('coachPlay').onclick=()=>applyOne(coachMatch,'Logic Coach');}

function tutorStart(){tutorMatch=chooseMatch();tutorStage=0;if(!tutorMatch){renderTutor();status('Tuteur : aucun pattern connu ne fournit actuellement de coup.','warn');return;}lastMatch=tutorMatch;renderTutor();render();status(`Tuteur : raisonnement ${tutorMatch.patternId.replace('TANGO-','')} prêt.`,'ok');}
function tutorNext(){if(!tutorMatch)return tutorStart();if(tutorStage<3){tutorStage++;renderTutor();render();}else applyOne(tutorMatch,'Tuteur');}
function tutorPrev(){if(tutorMatch&&tutorStage>0){tutorStage--;renderTutor();render();}}
function renderTutor(){const box=$('tutorBox');if(!tutorMatch){box.innerHTML='<p>Le Tuteur déroule un pattern en quatre temps : <strong>où regarder → règle → pourquoi → coup</strong>.</p>';return;}const m=tutorMatch,p=REG.byId[m.patternId],c=chooseConclusion(m);const texts=[`<strong>Où regarder :</strong> ${esc(m.pedagogy.where)}`,`<strong>Pattern :</strong> ${esc(p.nameFr)} — ${esc(p.mnemonicFr)}`,`<strong>Pourquoi :</strong> ${esc(m.pedagogy.why)}`,`<strong>Coup :</strong> ${esc(conclusionText(c))}`];box.innerHTML=`<div class="pattern-head"><span class="badge">${m.patternId.replace('TANGO-','')}</span><strong>${esc(p.nameFr)}</strong><span class="tier">N${p.expertiseTier}</span></div><div class="tutor-progress">${[0,1,2,3].map(i=>`<span class="dot ${i<=tutorStage?'on':''}">${i+1}</span>`).join('')}</div><p>${texts[tutorStage]}</p>${tutorStage>=2?'<p class="validation">La justification affichée provient des prémisses capturées lors de la reconnaissance du pattern.</p>':''}<div class="row"><button id="tutorPrev" class="small" ${tutorStage===0?'disabled':''}>←</button><button id="tutorNext" class="primary small">${tutorStage===3?'Jouer':'Suivant →'}</button></div>`;$('tutorPrev').onclick=tutorPrev;$('tutorNext').onclick=tutorNext;}

function conclusionText(c){if(!c)return '—';return c.kind==='value'?`${coord(c.cell)} = ${symbolWord(c.value)}`:`${coord(c.a)} ${c.parity===SAME?'=':'×'} ${coord(c.b)}`;}
function premiseText(p){return p.kind==='value'?`${coord(p.cell)} = ${symbolWord(p.value)}`:`${coord(p.a)} ${p.parity===SAME?'=':'×'} ${coord(p.b)}`;}
function esc(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

function clearHighlights(){document.querySelectorAll('.cell').forEach(x=>x.classList.remove('context','focus','conclusion'));}
function highlightedMatch(){if(tutorMatch)return tutorMatch;if(coachMatch)return coachMatch;return null;}
function highlightMatch(m,phase){if(!m)return;clearHighlights();const context=(m.context||[]).filter(x=>x.kind==='cell').map(x=>x.cell);for(const c of context)getCell(c)?.classList.add('context');let focus=[];if(tutorMatch){const max=tutorStage<=0?0:Math.min(tutorStage-1,(m.focusSequence||[]).length-1);if(tutorStage>=1&&m.focusSequence?.length)focus=(m.focusSequence[max]?.entities||[]).filter(x=>x.kind==='cell').map(x=>x.cell);}else focus=(m.focusSequence||[]).flatMap(s=>(s.entities||[]).filter(x=>x.kind==='cell').map(x=>x.cell));for(const c of focus)getCell(c)?.classList.add('focus');if((tutorMatch&&tutorStage===3)||phase==='move'){for(const c of m.conclusions){for(const x of c.kind==='value'?[c.cell]:[c.a,c.b])getCell(x)?.classList.add('conclusion');}}}
function getCell(c){return document.querySelector(`.cell[data-r="${c[0]}"][data-c="${c[1]}"]`);}

function render(){renderBoard();$('undoBtn').disabled=!undo.length;$('redoBtn').disabled=!redo.length;const m=highlightedMatch();if(m)requestAnimationFrame(()=>highlightMatch(m,coachMatch?'move':null));}
function renderBoard(){const b=$('board');b.innerHTML='';const blank=document.createElement('div');blank.className='coord';b.appendChild(blank);for(let c=0;c<6;c++){const x=document.createElement('div');x.className='coord';x.textContent='ABCDEF'[c];b.appendChild(x);}for(let r=0;r<6;r++){const y=document.createElement('div');y.className='coord';y.textContent=r+1;b.appendChild(y);for(let c=0;c<6;c++){const el=document.createElement('button');el.type='button';el.className='cell';el.dataset.r=r;el.dataset.c=c;if(givens.has(r*6+c))el.classList.add('given');el.textContent=symbol(game.state[r][c]);el.setAttribute('aria-label',`${coord([r,c])} ${symbolWord(game.state[r][c])}`);el.onclick=()=>cycleCell(r,c);b.appendChild(el);}}requestAnimationFrame(renderRelations);}
function renderRelations(){const layer=$('relations');layer.innerHTML='';const wrap=$('boardWrap'),wr=wrap.getBoundingClientRect();const all=[];for(const [r,c,d,s] of game.edges){const a=[r,c],bb=d==='r'?[r,c+1]:[r+1,c];all.push({a,b:bb,parity:s==='='?SAME:OPP,derived:false});}for(const x of game.derivedRelations||[])all.push({a:x.a,b:x.b,parity:Number(x.parity),derived:true});for(const x of all){const a=getCell(x.a),b=getCell(x.b);if(!a||!b)continue;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),ax=(ar.left+ar.right)/2-wr.left,ay=(ar.top+ar.bottom)/2-wr.top,bx=(br.left+br.right)/2-wr.left,by=(br.top+br.bottom)/2-wr.top,dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx)*180/Math.PI;const line=document.createElement('div');line.className='rel-line '+(x.derived?'derived':'explicit');line.style.left=ax+'px';line.style.top=ay+'px';line.style.width=len+'px';line.style.transform=`rotate(${ang}deg)`;line.style.setProperty('--counter',`${-ang}deg`);const mark=document.createElement('span');mark.textContent=x.parity===SAME?'=':'×';line.appendChild(mark);layer.appendChild(line);}}
function status(t,kind=''){$('status').textContent=t;$('status').className='status '+kind;}

function doUndo(){if(!undo.length)return;redo.push(snap());restore(undo.pop());status('Annulation effectuée.','');}
function doRedo(){if(!redo.length)return;undo.push(snap());restore(redo.pop());status('Rétablissement effectué.','');}
function reset(){const d=game.difficulty,list=POOL[d],p=list.find(x=>x.id===game.id)||list[0];game.state=clone(p.state);game.edges=clone(p.edges);game.derivedRelations=[];givens=new Set();for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(game.state[r][c]!==E)givens.add(r*6+c);undo=[];redo=[];clearGuidance();render();status('Partie réinitialisée.','');}

function buildPatternList(){$('patternList').innerHTML=REG.patterns.map(p=>`<div class="pat"><span class="badge">${p.id.replace('TANGO-','')}</span><div><strong>${esc(p.nameFr)}</strong><small>${esc(p.mnemonicFr)}</small></div><span class="tier">N${p.expertiseTier}</span></div>`).join('');}
function init(){
 $('newBtn').onclick=newGame;$('resetBtn').onclick=reset;$('undoBtn').onclick=doUndo;$('redoBtn').onclick=doRedo;$('coachBtn').onclick=coach;$('tutorBtn').onclick=tutorStart;$('solverStepBtn').onclick=solverStep;$('solveAllBtn').onclick=solveUntilBlocked;$('profile').onchange=()=>{clearGuidance();render();status('Bibliothèque de patterns : '+REG.profiles[profile()].label+'.','');};$('difficulty').onchange=newGame;
 buildPatternList();newGame();window.addEventListener('resize',()=>requestAnimationFrame(renderRelations));if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
globalThis.QuadludPlayableProto={getSnapshot:()=>snap(),recognize:()=>matches(),diagnose:()=>PE.diagnoseVisible(snap()),solverStep,coach,tutorStart};
})();
