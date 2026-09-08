/* QUADLUD — Soleil/Lune visible-state pattern recognizer + exact candidate validator
 * Port of the validated R3/R4 research rules P001-P018.
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 */
(function(root){'use strict';
const E=-1,M=0,S=1,SAME=0,OPP=1;
const REG=root.TangoPatternRegistry;
if(!REG) throw new Error('TangoPatternRegistry required');
const LEGAL=[];
for(let mask=0;mask<64;mask++){
  const a=Array.from({length:6},(_,i)=>(mask>>(5-i))&1);
  if(a.reduce((x,y)=>x+y,0)!==3)continue;
  if([0,1,2,3].some(i=>a[i]===a[i+1]&&a[i]===a[i+2]))continue;
  LEGAL.push(a);
}
if(LEGAL.length!==14)throw new Error('Expected 14 legal Tango lines');
const clone=x=>JSON.parse(JSON.stringify(x));
const ck=c=>c[0]*6+c[1], key=c=>c[0]+','+c[1];
const cell=i=>[Math.floor(i/6),i%6];
const sameCell=(a,b)=>!!a&&!!b&&a[0]===b[0]&&a[1]===b[1];
const pairKey=(a,b)=>[ck(a),ck(b)].sort((x,y)=>x-y).join('|');
const lineCells=(fam,idx)=>fam==='row'?Array.from({length:6},(_,i)=>[idx,i]):Array.from({length:6},(_,i)=>[i,idx]);
const uniqCells=list=>{const s=new Set(),o=[];for(const c of list||[]){if(!c)continue;const k=key(c);if(!s.has(k)){s.add(k);o.push(clone(c));}}return o;};
const allPairs=n=>{const o=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)o.push([i,j]);return o;};
let seq=0;

class VisibleStateAdapter{
  constructor(snapshot){
    if(!snapshot||!Array.isArray(snapshot.state)||snapshot.state.length!==6)throw new Error('Invalid visible snapshot');
    this.state=clone(snapshot.state);
    this.edges=clone(snapshot.edges||[]);
    this.derivedRelations=clone(snapshot.derivedRelations||[]);
    this.givens=new Set(snapshot.givens||[]);
    this._rel=this._buildRelationMap();
  }
  value(c){return this.state[c[0]][c[1]];}
  _setRel(map,a,b,p,meta){const k=pairKey(a,b),old=map.get(k);if(old&&old.parity!==p)throw new Error('Visible relation contradiction');if(!old)map.set(k,{a:clone(a),b:clone(b),parity:p,...meta});}
  _buildRelationMap(){const m=new Map();for(const [r,c,d,s] of this.edges){const a=[r,c],b=d==='r'?[r,c+1]:[r+1,c];this._setRel(m,a,b,s==='='?SAME:OPP,{source:'explicit'});}for(const x of this.derivedRelations){const a=x.a||x.cells?.[0],b=x.b||x.cells?.[1];if(!a||!b)continue;const p=x.parity!=null?Number(x.parity):(x.relation==='SAME'||x.relation==='='?SAME:OPP);this._setRel(m,a,b,p,{source:'derived',sourcePattern:x.sourcePattern||null});}return m;}
  baseRelation(a,b){if(sameCell(a,b))return {a:clone(a),b:clone(b),parity:SAME,source:'identity'};return this._rel.get(pairKey(a,b))||null;}
  graph(){const g=new Map();for(const rel of this._rel.values()){for(const [a,b] of [[rel.a,rel.b],[rel.b,rel.a]]){const k=key(a);if(!g.has(k))g.set(k,[]);g.get(k).push({cell:clone(b),parity:rel.parity,relation:rel});}}return g;}
  relationPath(a,b){if(sameCell(a,b))return {parity:SAME,path:[]};const g=this.graph(),q=[{cell:clone(a),parity:0,path:[]}],seen=new Map([[key(a),0]]);for(let qi=0;qi<q.length;qi++){const cur=q[qi];if(sameCell(cur.cell,b))return {parity:cur.parity,path:cur.path};for(const e of g.get(key(cur.cell))||[]){const np=cur.parity^e.parity,k=key(e.cell);if(seen.has(k)){if(seen.get(k)!==np)throw new Error('Relation graph contradiction');continue;}seen.set(k,np);q.push({cell:e.cell,parity:np,path:cur.path.concat([{a:clone(cur.cell),b:clone(e.cell),parity:e.parity,source:e.relation.source}])});}}return null;}
  relation(a,b){return this.relationPath(a,b);}
  unitFacts(fam,idx){const cells=lineCells(fam,idx),values=cells.map(c=>this.value(c)),relations=new Map();for(const [i,j] of allPairs(6)){const rel=this.relation(cells[i],cells[j]);if(rel)relations.set(i+'|'+j,rel.parity);}return {cells,values,relations};}
  lineModels(fam,idx){const {values,relations}=this.unitFacts(fam,idx);return LEGAL.filter(line=>{for(let i=0;i<6;i++)if(values[i]!==E&&values[i]!==line[i])return false;for(const [ij,p] of relations){const [i,j]=ij.split('|').map(Number);if((line[i]^line[j])!==p)return false;}return true;});}
}

function vp(c,v){return {kind:'value',cell:clone(c),value:v};}
function rp(a,b,p,source='visible'){return {kind:'relation',a:clone(a),b:clone(b),parity:p,source};}
function conclusionValue(c,v){return {kind:'value',cell:clone(c),value:v};}
function conclusionRelation(a,b,p){return {kind:'relation',a:clone(a),b:clone(b),parity:p};}
function entityCell(c){return {kind:'cell',cell:clone(c)};}
function entityRelation(a,b,p){return {kind:'relation',a:clone(a),b:clone(b),parity:p};}
function entityUnit(fam,idx){return {kind:fam==='row'?'row':'column',index:idx};}
function patternName(id){return REG.byId[id]?.nameFr||id;}

function makeMatch(id,scope,premises,contextCells,focusGroups,conclusions,why,meta={}){
  const p=REG.byId[id];
  const focusSequence=(focusGroups||[]).map((cells,i)=>({index:i+1,entities:uniqCells(cells).map(entityCell)}));
  const context=[...(scope.family==='row'||scope.family==='column'?[entityUnit(scope.family,scope.index)]:[]),...uniqCells(contextCells).map(entityCell)];
  const match={
    schema:1,patternId:id,patternName:p.nameFr,expertiseTier:p.expertiseTier,
    recognitionInstanceId:`${id}:${scope.family}:${scope.index??'graph'}:${++seq}`,
    premises:clone(premises||[]),context,focusSequence,
    conclusions:clone(conclusions||[]),symmetryTransform:meta.symmetryTransform||'identity',
    proofRequest:{mode:'exact-candidate-validation',scope:clone(scope)},
    pedagogy:{where:meta.where||scopeLabel(scope),rule:p.mnemonicFr,why,move:null},
    scope:clone(scope),meta:clone(meta),validated:false,validation:null
  };
  return match;
}
function scopeLabel(scope){if(scope.family==='row')return `la ligne ${scope.index+1}`;if(scope.family==='column')return `la colonne ${String.fromCharCode(65+scope.index)}`;return 'la chaîne de relations mise en évidence';}
function premiseVisible(vs,p){if(p.kind==='value')return vs.value(p.cell)===p.value;if(p.kind==='relation'){const rel=vs.relation(p.a,p.b);return !!rel&&rel.parity===p.parity;}return false;}
function conclusionPending(vs,c){if(c.kind==='value')return vs.value(c.cell)===E;const rel=vs.relation(c.a,c.b);return !rel;}

class ExactDeductionValidator{
  validate(vs,match){
    if(match.premises.some(p=>!premiseVisible(vs,p)))return this._fail(match,'premise-not-visible');
    if(!match.conclusions.length)return this._fail(match,'empty-conclusion');
    let ok=true,modelsChecked=0;
    if(match.scope.family==='row'||match.scope.family==='column'){
      const cells=lineCells(match.scope.family,match.scope.index),models=vs.lineModels(match.scope.family,match.scope.index);modelsChecked=models.length;
      if(!models.length)ok=false;
      for(const c of match.conclusions){
        if(c.kind==='value'){const i=cells.findIndex(x=>sameCell(x,c.cell));if(i<0||!models.every(m=>m[i]===c.value)){ok=false;break;}}
        else {const i=cells.findIndex(x=>sameCell(x,c.a)),j=cells.findIndex(x=>sameCell(x,c.b));if(i<0||j<0||!models.every(m=>(m[i]^m[j])===c.parity)){ok=false;break;}}
      }
    } else if(match.scope.family==='graph'){
      for(const c of match.conclusions){
        if(c.kind==='relation'){const path=vs.relationPath(c.a,c.b);if(!path||path.parity!==c.parity){ok=false;break;}}
        else {let proven=false;for(let r=0;r<6&&!proven;r++)for(let col=0;col<6&&!proven;col++){const a=[r,col],av=vs.value(a);if(av===E)continue;const path=vs.relationPath(a,c.cell);if(path&&(av^path.parity)===c.value)proven=true;}if(!proven){ok=false;break;}}
      }
    } else ok=false;
    if(!ok)return this._fail(match,'exact-validation-failed',modelsChecked);
    match.validated=true;match.validation={ok:true,modelsChecked,hiddenSolutionRead:false,oracleGeneratedMove:false};return match;
  }
  _fail(match,reason,modelsChecked=0){match.validated=false;match.validation={ok:false,reason,modelsChecked,hiddenSolutionRead:false,oracleGeneratedMove:false};return match;}
}

root.TangoPatternCore={E,M,S,SAME,OPP,REG,LEGAL,clone,ck,key,cell,sameCell,pairKey,lineCells,uniqCells,allPairs,VisibleStateAdapter,vp,rp,conclusionValue,conclusionRelation,entityCell,entityRelation,entityUnit,makeMatch,scopeLabel,premiseVisible,conclusionPending,ExactDeductionValidator,coord:c=>String.fromCharCode(65+c[1])+(c[0]+1)};
if(typeof module!=='undefined'&&module.exports)module.exports=root.TangoPatternCore;
})(typeof globalThis!=='undefined'?globalThis:this);
