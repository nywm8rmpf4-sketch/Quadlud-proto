/* QUADLUD — Soleil/Lune pattern engine orchestration + graph patterns P014/P017
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 */
(function(root){'use strict';
const C=root.TangoPatternCore,L=root.TangoPatternLineRecognizer;
if(!C||!L)throw new Error('Pattern core and line recognizer required');
const {E,M,S,SAME,OPP,REG,LEGAL,clone,ck,key,sameCell,pairKey,allPairs,VisibleStateAdapter,ExactDeductionValidator,vp,rp,conclusionValue,conclusionRelation,makeMatch,conclusionPending}=C;
const coord=C.coord;
class PatternRecognizer{
 constructor(){this.validator=new ExactDeductionValidator();}
 recognize(snapshot,profile='advanced'){
  const vs=snapshot instanceof VisibleStateAdapter?snapshot:new VisibleStateAdapter(snapshot);
  const maxTier=typeof profile==='number'?profile:(REG.profiles[profile]?.maxTier||3),matches=[];
  for(const fam of ['row','column'])for(let idx=0;idx<6;idx++)matches.push(...L.lineCandidates(vs,fam,idx,maxTier));
  matches.push(...this._p014(vs,maxTier),...this._p017(vs,maxTier));
  const out=[];
  for(const m of matches){m.conclusions=m.conclusions.filter(c=>conclusionPending(vs,c));if(!m.conclusions.length)continue;this.validator.validate(vs,m);if(m.validated)out.push(m);}
  return dedupeMatches(out).sort(matchComparator);
 }
 _components(vs){const g=vs.graph(),nodes=[...g.keys()].map(k=>k.split(',').map(Number)),seen=new Set(),out=[];for(const start of nodes.sort((a,b)=>ck(a)-ck(b))){if(seen.has(key(start)))continue;const q=[start],comp=[];seen.add(key(start));for(let qi=0;qi<q.length;qi++){const u=q[qi];comp.push(u);for(const e of g.get(key(u))||[])if(!seen.has(key(e.cell))){seen.add(key(e.cell));q.push(e.cell);}}out.push(comp.sort((a,b)=>ck(a)-ck(b)));}return out;}
 _p014(vs,maxTier){if(maxTier<2)return[];const out=[];for(const comp of this._components(vs)){const anchors=comp.filter(c=>vs.value(c)!==E);if(!anchors.length)continue;const a=anchors[0],av=vs.value(a),cons=[],prem=[vp(a,av)],focus=[];for(const c of comp){if(sameCell(c,a))continue;const path=vs.relationPath(a,c);if(!path)continue;for(const step of path.path){prem.push(rp(step.a,step.b,step.parity,step.source));focus.push([step.a,step.b]);}if(vs.value(c)===E)cons.push(conclusionValue(c,av^path.parity));}if(cons.length)out.push(makeMatch('TANGO-P014',{family:'graph',component:comp.map(clone)},dedupePremises(prem),comp,focus.concat([cons.filter(x=>x.kind==='value').map(x=>x.cell)]),cons,'Chaque = conserve la valeur et chaque × l’inverse ; la parité cumulée transporte la valeur d’ancrage.',{where:'la chaîne reliée à '+coord(a)}));}return out;}
 _p017(vs,maxTier){if(maxTier<2)return[];const out=[];for(const comp of this._components(vs)){if(comp.length<3)continue;const cons=[],prem=[],focus=[];const anchor=comp[0];for(const c of comp.slice(1)){const path=vs.relationPath(anchor,c);for(const step of path?.path||[]){prem.push(rp(step.a,step.b,step.parity,step.source));focus.push([step.a,step.b]);}}for(const [i,j] of allPairs(comp.length)){const a=comp[i],b=comp[j];if(vs.baseRelation(a,b))continue;const path=vs.relationPath(a,b);if(path)cons.push(conclusionRelation(a,b,path.parity));}if(cons.length)out.push(makeMatch('TANGO-P017',{family:'graph',component:comp.map(clone)},dedupePremises(prem),comp,focus.concat([cons.flatMap(c=>[c.a,c.b])]),cons,'Comptez les × sur le chemin : un nombre pair donne = entre les extrémités, un nombre impair donne ×.',{where:'la chaîne de relations sélectionnée'}));}return out;}
}
function dedupePremises(ps){const s=new Set(),o=[];for(const p of ps){const k=JSON.stringify(p);if(!s.has(k)){s.add(k);o.push(p);}}return o;}
function conclusionKey(c){return c.kind==='value'?`v:${key(c.cell)}=${c.value}`:`r:${pairKey(c.a,c.b)}=${c.parity}`;}
function dedupeMatches(ms){const seen=new Set(),o=[];for(const m of ms){m.conclusions.sort((a,b)=>conclusionKey(a).localeCompare(conclusionKey(b)));const k=m.patternId+'|'+m.scope.family+'|'+(m.scope.index??'g')+'|'+m.conclusions.map(conclusionKey).join(';');if(!seen.has(k)){seen.add(k);o.push(m);}}return o;}
function matchComparator(a,b){return a.expertiseTier-b.expertiseTier||a.patternId.localeCompare(b.patternId)||(a.scope.index??99)-(b.scope.index??99)||a.recognitionInstanceId.localeCompare(b.recognitionInstanceId);}
class PatternArbiter{select(matches,previous=null){if(!matches?.length)return null;const scored=matches.map(m=>({m,score:this.score(m,previous)}));scored.sort((a,b)=>a.score-b.score||matchComparator(a.m,b.m));return scored[0].m;}score(m,prev){let s=m.expertiseTier*100;if(prev){if(prev.patternId===m.patternId)s-=25;if(prev.scope?.family===m.scope.family&&prev.scope?.index===m.scope.index)s-=40;const pc=extractConclusionCells(prev),mc=contextCells(m);if(pc.some(a=>mc.some(b=>sameCell(a,b))))s-=20;}s+=m.conclusions.length>1?-5:0;return s;}}
function contextCells(m){return(m.context||[]).filter(x=>x.kind==='cell').map(x=>x.cell);}
function extractConclusionCells(m){return(m.conclusions||[]).flatMap(c=>c.kind==='value'?[c.cell]:[c.a,c.b]);}
function applyConclusion(snapshot,c,sourcePattern){const s=clone(snapshot);s.derivedRelations=s.derivedRelations||[];if(c.kind==='value'){if(s.state[c.cell[0]][c.cell[1]]!==E)throw new Error('Conclusion value not pending');s.state[c.cell[0]][c.cell[1]]=c.value;}else{s.derivedRelations.push({a:clone(c.a),b:clone(c.b),parity:c.parity,sourcePattern});}return s;}
function isCompleteValid(snapshot){const vs=new VisibleStateAdapter(snapshot);for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(vs.value([r,c])===E)return false;for(const fam of ['row','column'])for(let i=0;i<6;i++)if(vs.lineModels(fam,i).length!==1)return false;return true;}
function diagnoseVisible(snapshot){let vs;try{vs=new VisibleStateAdapter(snapshot);}catch(e){return{kind:'RELATION_CONFLICT',message:e.message};}for(const fam of ['row','column'])for(let i=0;i<6;i++){const{values}=vs.unitFacts(fam,i),sun=values.filter(x=>x===S).length,moon=values.filter(x=>x===M).length;if(sun>3||moon>3)return{kind:'QUOTA',family:fam,index:i};for(let j=0;j<4;j++)if(values[j]!==E&&values[j]===values[j+1]&&values[j]===values[j+2])return{kind:'TRIPLE',family:fam,index:i};if(vs.lineModels(fam,i).length===0)return{kind:'NO_LINE_MODEL',family:fam,index:i};}return null;}
root.TangoPatternEngine={E,M,S,SAME,OPP,LEGAL,VisibleStateAdapter,ExactDeductionValidator,PatternRecognizer,PatternArbiter,applyConclusion,isCompleteValid,diagnoseVisible,coord,scopeLabel:C.scopeLabel,conclusionKey};
if(typeof module!=='undefined'&&module.exports)module.exports=root.TangoPatternEngine;
})(typeof globalThis!=='undefined'?globalThis:this);
