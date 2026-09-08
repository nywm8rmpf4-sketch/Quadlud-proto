/* Copyright © 2026 Serge Benoliel. All rights reserved. */
'use strict';
const assert=require('node:assert/strict');
require('./pattern-registry.js');require('./pattern-core.js');require('./pattern-line-recognizer.js');require('./pattern-engine.js');require('./puzzles.js');require('./hybrid-engine.js');
const H=globalThis.TangoHybridEngine,PE=globalThis.TangoPatternEngine,POOL=globalThis.TangoPrototypePuzzles;
const clone=x=>JSON.parse(JSON.stringify(x));
function snap(p){return{state:clone(p.state),edges:clone(p.edges),derivedRelations:[],givens:[]};}
let total=0;
for(const mode of ['pattern','classical','hybrid-no-branch-patterns','hybrid-full'])for(const [difficulty,puzzles] of Object.entries(POOL))for(const puzzle of puzzles){
  const planner=new H.HybridMovePlanner({mode,profile:'advanced',maxHypothesisDepth:1}),result=planner.solve(snap(puzzle));total++;
  assert.equal(result.metrics.errors.length,0,`${mode}/${puzzle.id}: ${result.metrics.errors}`);
  assert.equal(PE.diagnoseVisible(result.state),null,`${mode}/${puzzle.id}: final state contradictory`);
  for(const step of result.trace){
    assert.equal(step.reasoning.validation?.hiddenSolutionRead,false,`${mode}/${puzzle.id}: hidden solution flag`);
    assert.equal(step.reasoning.validation?.oracleGeneratedMove,false,`${mode}/${puzzle.id}: oracle move flag`);
    if(step.reasoning.reasoningType==='branch')assert.equal(step.reasoning.maxHypothesisDepth,1,`${mode}/${puzzle.id}: branch depth`);
  }
}
const experts=POOL.expert.map(p=>new H.HybridMovePlanner({mode:'hybrid-full'}).solve(snap(p)));
assert.equal(experts.filter(x=>x.solved).length,4,'hybrid-full must solve four prototype Expert puzzles');
assert(experts.some(x=>x.metrics.patternsInBranches>0),'expected patterns inside at least one hypothetical branch');
console.log(`PASS hybrid engine invariants: ${total} strategy/puzzle runs; Expert ${experts.filter(x=>x.solved).length}/4`);
