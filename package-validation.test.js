/* Copyright © 2026 Serge Benoliel. All rights reserved. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const file of ['pattern-registry.js','puzzles.js','pattern-core.js','pattern-line-recognizer.js','pattern-engine.js','hybrid-engine.js','app.js','sw.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),build=JSON.parse(fs.readFileSync('build-info.json'));
for(const asset of ['styles.css','hybrid.css','pattern-registry.js','puzzles.js','pattern-core.js','pattern-line-recognizer.js','pattern-engine.js','hybrid-engine.js','app.js','manifest.webmanifest']){assert(html.includes(asset)||sw.includes(asset),asset+' absent from package references');assert(fs.existsSync(asset),asset+' missing');}
assert(html.indexOf('pattern-engine.js')<html.indexOf('hybrid-engine.js'));assert(html.indexOf('hybrid-engine.js')<html.indexOf('app.js'));
assert.equal(build.prototype,'PATTERN-PROTO-3-HYBRID');assert.equal(build.hybridBranchMaxHypothesisDepth,1);assert.equal(build.hiddenSolutionStored,false);
assert(sw.includes('quadlud-proto-hybrid-v3'));
console.log('PASS package validation: syntax, assets, script order, build invariants, PWA cache');
