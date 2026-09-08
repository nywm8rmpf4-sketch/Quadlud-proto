/* QUADLUD — Soleil/Lune line pattern recognizer P001-P013/P015/P016/P018
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 */
(function(root){'use strict';
const C=root.TangoPatternCore;if(!C)throw new Error('TangoPatternCore required');
const {E,M,S,SAME,OPP,REG,allPairs,vp,rp,conclusionValue,conclusionRelation,makeMatch,scopeLabel}=C;
const coord=C.coord;
function lineCandidates(vs,fam,idx,maxTier){
    const {cells:cs,values:v,relations}=vs.unitFacts(fam,idx),out=[];
    const rel=(i,j)=>relations.get(Math.min(i,j)+'|'+Math.max(i,j));
    const add=m=>{if(REG.byId[m.patternId].expertiseTier<=maxTier&&m.conclusions.length)out.push(m);};
    for(let i=0;i<5;i++){
      const p=rel(i,i+1);if(p==null)continue;const id=p===SAME?'TANGO-P001':'TANGO-P002';
      if(v[i]!==E&&v[i+1]===E)add(makeMatch(id,{family:fam,index:idx},[vp(cs[i],v[i]),rp(cs[i],cs[i+1],p)],cs.slice(i,i+2),[[cs[i],cs[i+1]]],[conclusionValue(cs[i+1],v[i]^p)],p===SAME?'Le signe = conserve le symbole.':'Le signe × impose le symbole opposé.',{where:`${scopeLabel({family:fam,index:idx})}, autour de ${coord(cs[i])}–${coord(cs[i+1])}`}));
      if(v[i+1]!==E&&v[i]===E)add(makeMatch(id,{family:fam,index:idx},[vp(cs[i+1],v[i+1]),rp(cs[i],cs[i+1],p)],cs.slice(i,i+2),[[cs[i],cs[i+1]]],[conclusionValue(cs[i],v[i+1]^p)],p===SAME?'Le signe = conserve le symbole.':'Le signe × impose le symbole opposé.',{symmetryTransform:'reverse-line'}));
    }
    for(let i=0;i<5;i++)if(v[i]!==E&&v[i]===v[i+1]){
      const c=[];if(i>0&&v[i-1]===E)c.push(conclusionValue(cs[i-1],1-v[i]));if(i+2<6&&v[i+2]===E)c.push(conclusionValue(cs[i+2],1-v[i]));
      add(makeMatch('TANGO-P003',{family:fam,index:idx},[vp(cs[i],v[i]),vp(cs[i+1],v[i+1])],cs.slice(Math.max(0,i-1),Math.min(6,i+3)),[[cs[i],cs[i+1]]],c,'Trois symboles identiques consécutifs sont interdits.'));
    }
    for(let i=0;i<4;i++)if(v[i]!==E&&v[i]===v[i+2]&&v[i+1]===E)add(makeMatch('TANGO-P004',{family:fam,index:idx},[vp(cs[i],v[i]),vp(cs[i+2],v[i+2])],cs.slice(i,i+3),[[cs[i],cs[i+2]]],[conclusionValue(cs[i+1],1-v[i])],'Le centre identique aux deux bords créerait un triple.'));
    for(const a of [M,S])if(v.filter(x=>x===a).length===3){const known=cs.filter((_,i)=>v[i]===a);add(makeMatch('TANGO-P005',{family:fam,index:idx},known.map(c=>vp(c,a)),cs,[known],cs.filter((_,i)=>v[i]===E).map(c=>conclusionValue(c,1-a)),'Une ligne contient exactement trois Soleils et trois Lunes.'));}
    for(let i=0;i<4;i++){
      if(v[i]!==E&&rel(i+1,i+2)===SAME&&v[i+1]===E&&v[i+2]===E)add(makeMatch('TANGO-P006',{family:fam,index:idx},[vp(cs[i],v[i]),rp(cs[i+1],cs[i+2],SAME)],cs.slice(i,i+3),[[cs[i]],[cs[i+1],cs[i+2]]],[conclusionValue(cs[i+1],1-v[i]),conclusionValue(cs[i+2],1-v[i])],'Si la paire = prenait le symbole voisin, elle formerait trois identiques.',{}));
      if(rel(i,i+1)===SAME&&v[i+2]!==E&&v[i]===E&&v[i+1]===E)add(makeMatch('TANGO-P006',{family:fam,index:idx},[rp(cs[i],cs[i+1],SAME),vp(cs[i+2],v[i+2])],cs.slice(i,i+3),[[cs[i+2]],[cs[i],cs[i+1]]],[conclusionValue(cs[i],1-v[i+2]),conclusionValue(cs[i+1],1-v[i+2])],'Si la paire = prenait le symbole voisin, elle formerait trois identiques.',{symmetryTransform:'reverse-line'}));
    }
    if(v[0]!==E&&v[0]===v[1]&&v[5]===E)add(makeMatch('TANGO-P007',{family:fam,index:idx},[vp(cs[0],v[0]),vp(cs[1],v[1])],cs,[[cs[0],cs[1]],[cs[5]]],[conclusionValue(cs[5],1-v[0])],'Toutes les complétions légales compatibles imposent l’opposé à l’autre bord.'));
    if(v[5]!==E&&v[5]===v[4]&&v[0]===E)add(makeMatch('TANGO-P007',{family:fam,index:idx},[vp(cs[4],v[4]),vp(cs[5],v[5])],cs,[[cs[4],cs[5]],[cs[0]]],[conclusionValue(cs[0],1-v[5])],'Forme réfléchie : toutes les complétions légales imposent l’opposé à l’autre bord.',{symmetryTransform:'reverse-line'}));
    if(v[0]!==E&&v[0]===v[5]){const c=[];if(v[1]===E)c.push(conclusionValue(cs[1],1-v[0]));if(v[4]===E)c.push(conclusionValue(cs[4],1-v[0]));add(makeMatch('TANGO-P008',{family:fam,index:idx},[vp(cs[0],v[0]),vp(cs[5],v[5])],cs,[[cs[0],cs[5]],[cs[1],cs[4]]],c,'Les deux bords identiques obligent les voisins intérieurs à être opposés.'));}
    if(v[0]!==E&&v[0]===v[4]&&v[5]===E)add(makeMatch('TANGO-P009',{family:fam,index:idx},[vp(cs[0],v[0]),vp(cs[4],v[4])],cs,[[cs[0],cs[4]],[cs[5]]],[conclusionValue(cs[5],1-v[0])],'Le miroir avant-bord ne laisse que l’opposé possible à l’extrémité.'));
    if(v[5]!==E&&v[5]===v[1]&&v[0]===E)add(makeMatch('TANGO-P009',{family:fam,index:idx},[vp(cs[1],v[1]),vp(cs[5],v[5])],cs,[[cs[1],cs[5]],[cs[0]]],[conclusionValue(cs[0],1-v[5])],'Forme réfléchie du miroir avant-bord.',{symmetryTransform:'reverse-line'}));
    if(rel(0,4)===SAME)add(makeMatch('TANGO-P009',{family:fam,index:idx},[rp(cs[0],cs[4],SAME)],cs,[[cs[0],cs[4]],[cs[5]]],[conclusionRelation(cs[4],cs[5],OPP),conclusionRelation(cs[0],cs[5],OPP)],'La forme relationnelle du miroir impose l’opposition avec le bord final.'));
    if(rel(1,5)===SAME)add(makeMatch('TANGO-P009',{family:fam,index:idx},[rp(cs[1],cs[5],SAME)],cs,[[cs[1],cs[5]],[cs[0]]],[conclusionRelation(cs[0],cs[1],OPP),conclusionRelation(cs[0],cs[5],OPP)],'Forme relationnelle réfléchie du miroir avant-bord.',{symmetryTransform:'reverse-line'}));
    if(rel(2,3)===SAME){if(v[0]!==E&&v[5]===E)add(makeMatch('TANGO-P010',{family:fam,index:idx},[vp(cs[0],v[0]),rp(cs[2],cs[3],SAME)],cs,[[cs[0]],[cs[2],cs[3]],[cs[5]]],[conclusionValue(cs[5],1-v[0])],'Dans les deux orientations possibles de la paire centrale, l’autre bord est opposé.'));if(v[5]!==E&&v[0]===E)add(makeMatch('TANGO-P010',{family:fam,index:idx},[rp(cs[2],cs[3],SAME),vp(cs[5],v[5])],cs,[[cs[5]],[cs[2],cs[3]],[cs[0]]],[conclusionValue(cs[0],1-v[5])],'Forme réfléchie de la bascule centrale.',{symmetryTransform:'reverse-line'}));}
    if(rel(0,1)===SAME&&v[5]!==E&&v[0]===E&&v[1]===E)add(makeMatch('TANGO-P011',{family:fam,index:idx},[rp(cs[0],cs[1],SAME),vp(cs[5],v[5])],cs,[[cs[0],cs[1]],[cs[5]]],[conclusionValue(cs[0],1-v[5]),conclusionValue(cs[1],1-v[5])],'La paire = du bord doit prendre l’opposé de l’autre bord.'));
    if(rel(4,5)===SAME&&v[0]!==E&&v[4]===E&&v[5]===E)add(makeMatch('TANGO-P011',{family:fam,index:idx},[vp(cs[0],v[0]),rp(cs[4],cs[5],SAME)],cs,[[cs[4],cs[5]],[cs[0]]],[conclusionValue(cs[4],1-v[0]),conclusionValue(cs[5],1-v[0])],'Forme réfléchie de la paire de bord inversée.',{symmetryTransform:'reverse-line'}));
    for(const [i,j] of allPairs(6)){
      const p=rel(i,j);if(p==null||v[i]!==E||v[j]!==E)continue;const outside=[0,1,2,3,4,5].filter(q=>q!==i&&q!==j);
      for(const a of [M,S])if(outside.filter(q=>v[q]===a).length>=2){const known=outside.filter(q=>v[q]===a).slice(0,2);if(p===OPP){const cons=outside.filter(q=>v[q]===E).map(q=>conclusionValue(cs[q],1-a));add(makeMatch('TANGO-P012',{family:fam,index:idx},[rp(cs[i],cs[j],OPP),...known.map(q=>vp(cs[q],a))],cs,[[cs[i],cs[j]],known.map(q=>cs[q])],cons,'La paire × apporte déjà un Soleil et une Lune ; le quota force les cases libres restantes.'));}else{add(makeMatch('TANGO-P013',{family:fam,index:idx},[rp(cs[i],cs[j],SAME),...known.map(q=>vp(cs[q],a))],cs,[[cs[i],cs[j]],known.map(q=>cs[q])],[conclusionValue(cs[i],1-a),conclusionValue(cs[j],1-a)],'Deux exemplaires sont déjà présents ailleurs : la paire = doit prendre l’autre symbole.'));}}
    }
    for(let e=0;e<5;e++)if(rel(e,e+1)===SAME){const cons=[];for(let j=0;j<5;j++)if(j%2!==e%2&&rel(j,j+1)==null)cons.push(conclusionRelation(cs[j],cs[j+1],OPP));add(makeMatch('TANGO-P015',{family:fam,index:idx},[rp(cs[e],cs[e+1],SAME)],cs,[[cs[e],cs[e+1]],cs],cons,'Sur une ligne 3+3 sans triple, l’égalité fixe la trame complémentaire d’oppositions.'));}
    const oppPairs=allPairs(6).filter(([i,j])=>rel(i,j)===OPP);
    for(let a=0;a<oppPairs.length;a++)for(let b=a+1;b<oppPairs.length;b++){const p=oppPairs[a],q=oppPairs[b];if(new Set([...p,...q]).size!==4)continue;const rem=[0,1,2,3,4,5].filter(x=>!p.includes(x)&&!q.includes(x));if(rem.length===2&&rel(rem[0],rem[1])==null)add(makeMatch('TANGO-P016',{family:fam,index:idx},[rp(cs[p[0]],cs[p[1]],OPP),rp(cs[q[0]],cs[q[1]],OPP)],cs,[[cs[p[0]],cs[p[1]]],[cs[q[0]],cs[q[1]]],[cs[rem[0]],cs[rem[1]]]],[conclusionRelation(cs[rem[0]],cs[rem[1]],OPP)],'Les deux paires × apportent déjà 2 Soleils et 2 Lunes ; les deux cases restantes doivent être opposées.'));}
    const rem=[0,1,2,3,4,5].filter(i=>v[i]===E);if(rem.length===2&&v.filter(x=>x===M).length===2&&v.filter(x=>x===S).length===2&&rel(rem[0],rem[1])==null)add(makeMatch('TANGO-P018',{family:fam,index:idx},cs.filter((_,i)=>v[i]!==E).map(c=>vp(c,vs.value(c))),cs,[cs.filter((_,i)=>v[i]!==E),[cs[rem[0]],cs[rem[1]]]],[conclusionRelation(cs[rem[0]],cs[rem[1]],OPP)],'Le quota est déjà équilibré à 2+2 : les deux trous doivent fournir un Soleil et une Lune.'));
    return out;
  }
root.TangoPatternLineRecognizer={lineCandidates};
if(typeof module!=='undefined'&&module.exports)module.exports=root.TangoPatternLineRecognizer;
})(typeof globalThis!=='undefined'?globalThis:this);
