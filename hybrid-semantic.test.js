/* Copyright © 2026 Serge Benoliel. All rights reserved. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
require('./pattern-registry.js');require('./pattern-core.js');require('./pattern-line-recognizer.js');require('./pattern-engine.js');require('./puzzles.js');require('./hybrid-engine.js');
const C=globalThis.TangoPatternCore,PE=globalThis.TangoPatternEngine,H=globalThis.TangoHybridEngine,POOL=globalThis.TangoPrototypePuzzles;
const clone=C.clone,E=C.E;
const snap=p=>({state:clone(p.state),edges:clone(p.edges),derivedRelations:[],givens:[]});
function validateClassical(state,r){const vs=new C.VisibleStateAdapter(state),cells=C.lineCells(r.scope.family,r.scope.index),models=vs.lineModels(r.scope.family,r.scope.index);assert(models.length);for(const c of r.conclusions){const i=cells.findIndex(x=>C.sameCell(x,c.cell));assert(i>=0);assert(models.every(m=>m[i]===c.value));}}
let patterns=0,classical=0,branches=0,patternsInBranches=0;
for(const puzzles of Object.values(POOL))for(const puzzle of puzzles){let state=snap(puzzle);const result=new H.HybridMovePlanner({mode:'hybrid-full',profile:'advanced'}).solve(state);for(const step of result.trace){const r=step.reasoning;if(r.reasoningType==='pattern'){patterns++;const copy=clone(r);copy.validated=false;new C.ExactDeductionValidator().validate(new C.VisibleStateAdapter(state),copy);assert.equal(copy.validated,true,`${puzzle.id}/${r.patternId}`);}else if(r.reasoningType==='classical'){classical++;validateClassical(state,r);}else if(r.reasoningType==='branch'){branches++;assert.equal(r.maxHypothesisDepth,1);assert.equal(r.validation.hypothesisDepth,1);let branch=H.applyDeduction(state,{kind:'value',cell:r.hypothesis.cell,value:r.hypothesis.value},'HYPOTHESIS');for(const t of r.branchTrace){if(t.reasoning.reasoningType==='pattern')patternsInBranches++;else validateClassical(branch,t.reasoning);branch=H.applyDeduction(branch,t.conclusion,t.reasoning.techniqueId||t.reasoning.patternId);}if(r.techniqueId==='CONTRADICTION')assert(PE.diagnoseVisible(branch),`${puzzle.id}: branch trace must end in visible contradiction`);}
    state=H.applyDeduction(state,step.conclusion,r.techniqueId||r.patternId);assert.equal(PE.diagnoseVisible(state),null,`${puzzle.id}: accepted conclusion introduced contradiction`);
  }}
assert(patterns>0);assert(branches>0);assert(patternsInBranches>0);
const puzzleSource=fs.readFileSync('puzzles.js','utf8');assert(!/\bsolution\s*:/i.test(puzzleSource),'puzzle source must not store solutions');
const hybridSource=fs.readFileSync('hybrid-engine.js','utf8');assert(!/hiddenSolution|solutionGrid|answerGrid/.test(hybridSource.replace(/hiddenSolutionRead/g,'')),'hybrid source must not read hidden solution fields');
for(const profile of ['beginner','intermediate','advanced']){const max={beginner:1,intermediate:2,advanced:3}[profile];for(const p of Object.values(POOL).flat())for(const m of new PE.PatternRecognizer().recognize(snap(p),profile))assert(m.expertiseTier<=max);}
console.log(`PASS semantic traces: ${patterns} direct patterns, ${classical} classical, ${branches} branches, ${patternsInBranches} patterns inside branches`);
