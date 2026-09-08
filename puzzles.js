/* QUADLUD — Soleil/Lune prototype puzzle pool
 * Public puzzle state extracted from the current product generator templates.
 * Hidden solutions are deliberately NOT included.
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 */
(function(root){'use strict';
const E=-1;
const POOL={
 easy:[
 {id:'easy-01',state:[[E,E,E,E,E,E],[E,E,E,0,E,0],[E,E,E,E,E,E],[E,E,E,E,E,E],[1,E,1,1,E,E],[E,E,E,E,E,E]],edges:[[4,1,'d','×'],[1,1,'r','='],[0,2,'d','='],[0,4,'d','='],[5,4,'r','×']]}
 ],
 medium:[
 {id:'medium-01',state:[[0,E,E,E,1,E],[E,E,E,E,E,E],[E,E,E,E,E,1],[E,E,0,E,E,E],[E,E,E,E,E,E],[E,E,0,1,E,E]],edges:[[1,4,'r','='],[2,3,'d','='],[3,3,'d','×'],[4,3,'r','='],[1,1,'r','×']]},
 {id:'medium-02',state:[[E,1,E,E,0,1],[E,E,E,E,0,E],[E,E,E,E,E,E],[E,E,E,E,E,1],[E,E,E,E,E,E],[E,E,E,E,E,E]],edges:[[2,2,'d','='],[3,3,'r','×'],[1,5,'d','×'],[4,2,'r','×'],[2,1,'r','='],[4,4,'d','×'],[4,2,'d','×']]},
 {id:'medium-03',state:[[0,E,E,E,E,E],[E,E,E,E,0,E],[E,E,E,E,E,E],[E,E,E,E,E,E],[0,E,E,E,E,0],[1,E,E,E,E,E]],edges:[[5,1,'r','='],[2,3,'d','×'],[4,2,'r','×'],[0,2,'r','×'],[3,0,'d','='],[1,1,'d','='],[1,2,'r','=']]},
 {id:'medium-04',state:[[E,E,E,E,0,E],[E,E,E,E,E,E],[1,0,E,E,E,E],[E,E,E,E,E,E],[E,E,E,E,E,E],[E,E,E,1,E,E]],edges:[[3,0,'d','×'],[0,0,'d','='],[4,2,'d','×'],[0,4,'d','='],[2,2,'r','×'],[4,4,'d','×'],[3,1,'r','×'],[1,0,'r','=']]}
 ],
 hard:[
 {id:'hard-01',state:[[E,E,E,E,E,E],[0,E,E,E,E,E],[E,E,E,E,E,E],[E,E,E,E,1,E],[E,E,1,E,E,E],[E,1,E,E,E,E]],edges:[[1,0,'d','='],[2,2,'d','×'],[1,5,'d','×'],[4,4,'d','='],[0,2,'d','='],[2,3,'r','=']]},
 {id:'hard-02',state:[[0,E,E,E,E,E],[E,E,E,0,E,E],[E,1,E,E,1,E],[E,E,E,E,E,E],[E,E,E,E,E,E],[E,E,E,1,E,E]],edges:[[3,2,'d','×'],[3,0,'d','='],[5,4,'r','='],[4,2,'r','×'],[4,2,'d','×']]},
 {id:'hard-03',state:[[E,E,E,E,E,E],[E,E,E,E,E,E],[E,E,0,E,E,E],[E,E,E,E,E,E],[E,E,1,E,E,E],[E,E,E,0,E,E]],edges:[[4,1,'r','='],[1,5,'d','='],[0,0,'d','='],[3,3,'r','×'],[0,1,'r','='],[1,1,'d','×'],[3,5,'d','=']]},
 {id:'hard-04',state:[[E,E,E,E,E,0],[E,E,E,E,E,E],[E,1,0,E,E,E],[E,E,E,E,E,E],[E,E,1,E,E,E],[1,E,E,E,E,E]],edges:[[0,5,'d','='],[0,3,'r','×'],[1,0,'d','='],[0,2,'d','×'],[4,5,'d','=']]}
 ],
 expert:[
 {id:'expert-01',state:[[E,E,E,E,E,E],[0,E,E,1,E,E],[E,E,E,E,E,0],[E,E,E,E,E,E],[E,E,E,E,E,E],[E,E,0,0,E,E]],edges:[[1,2,'r','×'],[2,4,'d','='],[1,0,'d','×'],[4,0,'d','='],[2,1,'r','×'],[3,2,'d','='],[2,5,'d','×']]},
 {id:'expert-02',state:[[E,E,E,E,E,E],[0,E,E,0,1,0],[E,E,E,E,E,E],[E,E,0,E,E,E],[E,E,E,E,E,E],[E,1,E,E,E,E]],edges:[[2,0,'d','×'],[2,2,'r','='],[2,1,'d','×'],[3,3,'d','×'],[0,0,'d','×'],[0,3,'r','=']]},
 {id:'expert-03',state:[[E,E,E,E,E,E],[1,E,E,E,E,E],[E,E,E,0,1,E],[E,E,E,E,E,E],[E,E,E,E,E,E],[E,E,E,E,E,E]],edges:[[5,4,'r','='],[0,3,'r','×'],[1,3,'d','×'],[1,1,'d','='],[2,4,'r','×'],[2,3,'d','×'],[2,2,'r','×'],[4,3,'r','×'],[2,0,'d','=']]},
 {id:'expert-04',state:[[E,E,E,E,E,E],[E,E,E,E,E,E],[0,E,E,E,E,E],[E,E,E,E,E,E],[E,E,E,E,E,E],[E,0,E,E,E,E]],edges:[[4,2,'r','='],[0,3,'d','='],[5,1,'r','×'],[2,5,'d','×'],[1,3,'r','×'],[2,1,'r','×'],[0,5,'d','='],[1,2,'r','×'],[0,0,'r','×'],[4,4,'d','×']]}
 ]
};
root.TangoPrototypePuzzles=POOL;
if(typeof module!=='undefined'&&module.exports)module.exports=POOL;
})(typeof globalThis!=='undefined'?globalThis:this);
