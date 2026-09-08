/* QUADLUD — Soleil/Lune pattern-first hybrid planner
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 */
(function(root){'use strict';
const PE=root.TangoPatternEngine,C=root.TangoPatternCore;
if(!PE||!C)throw new Error('Pattern engine and core required');
const {E,M,S,SAME,OPP,VisibleStateAdapter,PatternRecognizer,PatternArbiter,applyConclusion,diagnoseVisible,isCompleteValid}=PE;
const clone=C.clone,coord=C.coord,key=C.key,lineCells=C.lineCells,sameCell=C.sameCell;

function pendingValueCount(snapshot){return snapshot.state.flat().filter(v=>v===E).length;}
function relationKey(c){return c.kind==='value'?`v:${key(c.cell)}=${c.value}`:`r:${C.pairKey(c.a,c.b)}=${c.parity}`;}
function applyDeduction(snapshot,c,source){
  const next=clone(snapshot);next.derivedRelations=next.derivedRelations||[];
  if(c.kind==='value'){
    const old=next.state[c.cell[0]][c.cell[1]];
    if(old!==E&&old!==c.value)throw new Error('Conflicting value deduction');
    next.state[c.cell[0]][c.cell[1]]=c.value;
  }else{
    const vs=new VisibleStateAdapter(next),rel=vs.relation(c.a,c.b);
    if(rel&&rel.parity!==c.parity)throw new Error('Conflicting relation deduction');
    if(!rel)next.derivedRelations.push({a:clone(c.a),b:clone(c.b),parity:c.parity,sourcePattern:source||null});
  }
  return next;
}

class ClassicalEngine{
  candidates(snapshot){
    const vs=snapshot instanceof VisibleStateAdapter?snapshot:new VisibleStateAdapter(snapshot),out=[];
    for(const family of ['row','column'])for(let index=0;index<6;index++){
      const models=vs.lineModels(family,index);if(!models.length)continue;
      const cells=lineCells(family,index),conclusions=[];
      for(let i=0;i<6;i++)if(vs.value(cells[i])===E&&models.every(m=>m[i]===models[0][i]))conclusions.push({kind:'value',cell:clone(cells[i]),value:models[0][i]});
      if(!conclusions.length)continue;
      const known=cells.filter(c=>vs.value(c)!==E);
      out.push({schema:1,reasoningType:'classical',techniqueId:'CLASSICAL-LINE-DOMAIN',techniqueName:'Complétions légales',
        scope:{family,index},context:[{kind:family==='row'?'row':'column',index},...cells.map(cell=>({kind:'cell',cell:clone(cell)}))],
        premises:known.map(cell=>({kind:'value',cell:clone(cell),value:vs.value(cell)})),
        focusSequence:[{index:1,entities:cells.map(cell=>({kind:'cell',cell:clone(cell)}))}],conclusions,
        pedagogy:{where:C.scopeLabel({family,index}),rule:'Comparer les complétions légales restantes.',why:`Les ${models.length} complétions compatibles donnent toutes la même valeur à la case conclue.`},
        validation:{ok:true,modelsChecked:models.length,hiddenSolutionRead:false,oracleGeneratedMove:false},validated:true});
    }
    return out.sort((a,b)=>a.validation.modelsChecked-b.validation.modelsChecked||a.scope.family.localeCompare(b.scope.family)||a.scope.index-b.scope.index);
  }
  select(snapshot){return this.candidates(snapshot)[0]||null;}
}

function conclusionCells(r){return (r?.conclusions||[]).flatMap(c=>c.kind==='value'?[c.cell]:[c.a,c.b]);}
function contextCells(r){return (r?.context||[]).filter(e=>e.kind==='cell').map(e=>e.cell);}
class HybridArbiter{
  constructor(){this.patternArbiter=new PatternArbiter();}
  selectPattern(matches,previous){return this.patternArbiter.select(matches,previous);}
  score(reasoning,previous){
    let score=reasoning.reasoningType==='pattern'?(reasoning.expertiseTier||1)*100:450;
    const conclusions=conclusionCells(reasoning),context=contextCells(reasoning);
    if(previous){
      const siblings=new Set((previous.conclusions||[]).map(relationKey));
      if((reasoning.conclusions||[]).some(c=>siblings.has(relationKey(c))))score-=300;
      const previousConclusions=conclusionCells(previous);
      if(previousConclusions.some(a=>context.some(b=>sameCell(a,b))))score-=55;
      if(previous.scope?.family===reasoning.scope?.family&&previous.scope?.index===reasoning.scope?.index)score-=45;
    }
    score+=(reasoning.validation?.modelsChecked||0)*0.01;
    return score;
  }
}

function normalizePattern(m){if(!m)return null;m.reasoningType='pattern';m.techniqueId=m.patternId;m.techniqueName=m.patternName;return m;}
function snapshotSignature(s){return s.state.flat().join('')+'|'+(s.derivedRelations||[]).map(x=>`${C.pairKey(x.a,x.b)}:${x.parity}`).sort().join(',');}

class HybridBranchSolver{
  constructor({profile='advanced',patternsInBranches=true,maxHypothesisDepth=1,maxPropagationSteps=250}={}){
    this.profile=profile;this.patternsInBranches=patternsInBranches;this.maxHypothesisDepth=maxHypothesisDepth;this.maxPropagationSteps=maxPropagationSteps;
    if(maxHypothesisDepth!==1)throw new Error('HybridBranchSolver v1 requires maxHypothesisDepth=1');
    this.recognizer=new PatternRecognizer();this.arbiter=new PatternArbiter();this.classical=new ClassicalEngine();
  }
  propagate(snapshot){
    let state=clone(snapshot),previous=null;const trace=[];let patternSteps=0,classicalSteps=0;
    for(let n=0;n<this.maxPropagationSteps;n++){
      const contradiction=diagnoseVisible(state);if(contradiction)return{status:'contradiction',state,trace,contradiction,patternSteps,classicalSteps};
      if(isCompleteValid(state))return{status:'solved',state,trace,patternSteps,classicalSteps};
      let reasoning=null;
      if(this.patternsInBranches)reasoning=normalizePattern(this.arbiter.select(this.recognizer.recognize(state,this.profile),previous));
      if(!reasoning)reasoning=this.classical.select(state);
      if(!reasoning)return{status:'blocked',state,trace,patternSteps,classicalSteps};
      const conclusion=(reasoning.conclusions||[]).find(c=>c.kind==='value')||reasoning.conclusions?.[0];if(!conclusion)return{status:'blocked',state,trace,patternSteps,classicalSteps};
      const before=snapshotSignature(state);state=applyDeduction(state,conclusion,reasoning.techniqueId);
      if(snapshotSignature(state)===before)return{status:'blocked',state,trace,patternSteps,classicalSteps};
      trace.push({index:trace.length+1,reasoning:clone(reasoning),conclusion:clone(conclusion),hypothetical:true});
      if(reasoning.reasoningType==='pattern')patternSteps++;else classicalSteps++;previous=reasoning;
    }
    return{status:'limit',state,trace,patternSteps,classicalSteps};
  }
  testHypothesis(snapshot,cell,value){
    if(this.maxHypothesisDepth!==1)throw new Error('Hypothesis depth invariant violated');
    const assumed=applyDeduction(snapshot,{kind:'value',cell:clone(cell),value},'HYPOTHESIS');
    const immediate=diagnoseVisible(assumed);
    if(immediate)return{cell:clone(cell),value,status:'contradiction',state:assumed,trace:[],contradiction:immediate,patternSteps:0,classicalSteps:0,depth:1};
    return{cell:clone(cell),value,depth:1,...this.propagate(assumed)};
  }
  find(snapshot){
    const empties=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(snapshot.state[r][c]===E)empties.push([r,c]);
    let hypothesesTested=0,statesExplored=0;
    for(const cell of empties){
      const branches=[this.testHypothesis(snapshot,cell,M),this.testHypothesis(snapshot,cell,S)];hypothesesTested+=2;statesExplored+=branches.reduce((n,b)=>n+b.trace.length+1,0);
      const bad=branches.find(b=>b.status==='contradiction'),good=branches.find(b=>b.status!=='contradiction');
      if(bad&&good){const value=1-bad.value;return this._reasoning('CONTRADICTION',snapshot,cell,value,branches,bad,hypothesesTested,statesExplored);}
      if(branches.every(b=>b.status!=='contradiction')){
        const common=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(snapshot.state[r][c]===E&&!(r===cell[0]&&c===cell[1])){
          const a=branches[0].state.state[r][c],b=branches[1].state.state[r][c];if(a!==E&&a===b)common.push({kind:'value',cell:[r,c],value:a});
        }
        if(common.length)return this._reasoning('COMMON-CONSEQUENCE',snapshot,cell,common[0].value,branches,null,hypothesesTested,statesExplored,common[0]);
      }
    }
    return null;
  }
  _reasoning(kind,snapshot,hypothesisCell,value,branches,bad,hypothesesTested,statesExplored,common=null){
    const conclusion=common||{kind:'value',cell:clone(hypothesisCell),value};
    const selected=bad||branches[0],trace=selected.trace||[];
    return{schema:1,reasoningType:'branch',techniqueId:kind,techniqueName:kind==='CONTRADICTION'?'Raisonnement par contradiction':'Conséquence commune',
      scope:{family:'branch',index:null},context:[{kind:'cell',cell:clone(hypothesisCell)},...trace.flatMap(t=>conclusionCells(t.reasoning).map(cell=>({kind:'cell',cell:clone(cell)})))],
      premises:[],focusSequence:[{index:1,entities:[{kind:'cell',cell:clone(hypothesisCell)}]},...trace.map((t,i)=>({index:i+2,entities:conclusionCells(t.reasoning).map(cell=>({kind:'cell',cell:clone(cell)}))}))],
      conclusions:[conclusion],branches:clone(branches),selectedBranch:bad?bad.value:null,hypothesis:{cell:clone(hypothesisCell),value:selected.value},
      branchTrace:clone(trace),contradiction:clone(bad?.contradiction||null),maxHypothesisDepth:1,
      metrics:{hypothesesTested,statesExplored,branchLength:trace.length,patternsInBranch:trace.filter(t=>t.reasoning.reasoningType==='pattern').length,classicalInBranch:trace.filter(t=>t.reasoning.reasoningType==='classical').length},
      pedagogy:{where:`la case ${coord(hypothesisCell)} et ses conséquences`,rule:kind==='CONTRADICTION'?'Tester l’hypothèse opposée.':'Comparer les deux hypothèses.',why:kind==='CONTRADICTION'?`L’hypothèse ${coord(hypothesisCell)} = ${selected.value===S?'Soleil':'Lune'} mène à une contradiction visible.`:'Les deux valeurs possibles conduisent à la même conclusion.'},
      validation:{ok:true,hiddenSolutionRead:false,oracleGeneratedMove:false,hypothesisDepth:1},validated:true};
  }
}

class HybridMovePlanner{
  constructor({profile='advanced',mode='hybrid-full',maxHypothesisDepth=1}={}){
    this.profile=profile;this.mode=mode;this.recognizer=new PatternRecognizer();this.classical=new ClassicalEngine();this.arbiter=new HybridArbiter();
    this.branch=new HybridBranchSolver({profile,patternsInBranches:mode!=='hybrid-no-branch-patterns'&&mode!=='classical',maxHypothesisDepth});
  }
  next(snapshot,previous=null){
    const contradiction=diagnoseVisible(snapshot);if(contradiction)return{reasoningType:'contradiction',contradiction,validated:false};
    let pattern=null;if(this.mode!=='classical')pattern=normalizePattern(this.arbiter.selectPattern(this.recognizer.recognize(snapshot,this.profile),previous));
    if(this.mode==='pattern')return pattern;
    const classical=this.classical.select(snapshot);
    if(pattern&&classical)return this.arbiter.score(pattern,previous)<=this.arbiter.score(classical,previous)?pattern:classical;
    if(pattern)return pattern;if(classical)return classical;
    return this.branch.find(snapshot);
  }
  solve(snapshot,{maxSteps=250}={}){
    let state=clone(snapshot),previous=null;const trace=[];const metrics={steps:0,patternSteps:0,classicalSteps:0,branchSteps:0,hypothesesTested:0,statesExplored:0,patternsInBranches:0,branchLengths:[],patternIds:{},errors:[]};
    for(let i=0;i<maxSteps&&!isCompleteValid(state);i++){
      const reasoning=this.next(state,previous);if(!reasoning||!reasoning.validated)break;
      const conclusion=(reasoning.conclusions||[]).find(c=>c.kind==='value')||reasoning.conclusions?.[0];if(!conclusion)break;
      try{state=applyDeduction(state,conclusion,reasoning.techniqueId);}catch(e){metrics.errors.push(e.message);break;}
      trace.push({index:i+1,reasoning:clone(reasoning),conclusion:clone(conclusion),hypothetical:false});metrics.steps++;
      if(reasoning.reasoningType==='pattern'){metrics.patternSteps++;metrics.patternIds[reasoning.patternId]=(metrics.patternIds[reasoning.patternId]||0)+1;}
      else if(reasoning.reasoningType==='classical')metrics.classicalSteps++;else if(reasoning.reasoningType==='branch'){metrics.branchSteps++;metrics.hypothesesTested+=reasoning.metrics.hypothesesTested;metrics.statesExplored+=reasoning.metrics.statesExplored;metrics.patternsInBranches+=reasoning.metrics.patternsInBranch;metrics.branchLengths.push(reasoning.metrics.branchLength);for(const t of reasoning.branchTrace||[])if(t.reasoning.reasoningType==='pattern'){const id=t.reasoning.patternId;metrics.patternIds[id]=(metrics.patternIds[id]||0)+1;}}
      const bad=diagnoseVisible(state);if(bad){metrics.errors.push('post-deduction:'+bad.kind);break;}previous=reasoning;
    }
    const solved=isCompleteValid(state);return{solved,blocked:!solved&&!metrics.errors.length,state,trace,metrics,remaining:pendingValueCount(state)};
  }
}

root.TangoHybridEngine={ClassicalEngine,HybridArbiter,HybridBranchSolver,HybridMovePlanner,applyDeduction,pendingValueCount,relationKey};
if(typeof module!=='undefined'&&module.exports)module.exports=root.TangoHybridEngine;
})(typeof globalThis!=='undefined'?globalThis:this);
