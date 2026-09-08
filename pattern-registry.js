/* QUADLUD — Soleil/Lune pattern registry
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Research registry checkpoint: 09b714b7522b0f94faac8d7c1db786b26c61629d
 */
(function(root){'use strict';
const P=[
['TANGO-P001','equality-echo','Écho d’égalité','Equality Echo',1,'Avec une valeur et un =, recopier la valeur.'],
['TANGO-P002','opposition-flip','Bascule d’opposition','Opposition Flip',1,'Avec une valeur et un ×, inverser la valeur.'],
['TANGO-P003','double-lock','Double verrou','Double Lock',1,'Deux identiques côte à côte repoussent le troisième.'],
['TANGO-P004','sandwich','Sandwich','Sandwich',1,'Deux identiques encadrent forcément l’opposé.'],
['TANGO-P005','full-quota','Quota plein','Full Quota',1,'Trois exemplaires remplissent le quota : tout le reste est opposé.'],
['TANGO-P006','repelled-equal-pair','Paire égale repoussée','Repelled Equal Pair',2,'Une paire = près d’un symbole connu doit prendre l’autre symbole.'],
['TANGO-P007','edge-double','Double au bord','Edge Double',3,'Un double au bord contraint l’autre extrémité.'],
['TANGO-P008','twin-edges','Bords jumeaux','Twin Edges',3,'Deux bords identiques repoussent leurs voisins intérieurs.'],
['TANGO-P009','penultimate-mirror','Miroir avant-bord','Penultimate Mirror',3,'Le miroir avant-bord fixe l’extrémité ; sa forme relationnelle est incluse.'],
['TANGO-P010','central-toggle','Bascule centrale','Central Toggle',3,'Une paire = centrale détermine le bord opposé.'],
['TANGO-P011','inverted-edge-pair','Paire de bord inversée','Inverted Edge Pair',3,'Une paire = de bord prend l’opposé du symbole imposé à l’autre bord.'],
['TANGO-P012','reserved-opposite-pair','Paire × réservée','Reserved Opposite Pair',2,'Une paire × réserve déjà un Soleil et une Lune.'],
['TANGO-P013','saturated-equal-pair','Paire = saturée','Saturated Equal Pair',2,'Une paire = ne peut pas dépasser le quota déjà presque rempli.'],
['TANGO-P014','parity-chain','Chaîne de parité','Parity Chain',2,'Depuis une valeur d’ancrage, suivre la parité des × le long de la chaîne.'],
['TANGO-P015','inverse-equality-echo','Écho inversé','Inverse Equality Echo',2,'Un = révèle la trame opposée de relations ×.'],
['TANGO-P016','double-opposite-reserve','Double opposition','Double Opposition',2,'Deux paires × réservent 2 Soleils et 2 Lunes ; les deux restantes sont opposées.'],
['TANGO-P017','relation-chain','Chaîne relationnelle','Relation Chain',2,'Sans ancrage : parité paire des × donne =, impaire donne × entre extrémités.'],
['TANGO-P018','final-balanced-duo','Duo final','Final Duo',2,'Avec 2 Soleils + 2 Lunes connus et deux trous, les deux trous sont opposés.']
].map(x=>({id:x[0],slug:x[1],nameFr:x[2],nameEn:x[3],expertiseTier:x[4],mnemonicFr:x[5]}));
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const PROFILES=Object.freeze({beginner:{id:'beginner',label:'Débutant',maxTier:1},intermediate:{id:'intermediate',label:'Intermédiaire',maxTier:2},advanced:{id:'advanced',label:'Avancé',maxTier:3}});
root.TangoPatternRegistry={patterns:P,byId,profiles:PROFILES};
if(typeof module!=='undefined'&&module.exports)module.exports=root.TangoPatternRegistry;
})(typeof globalThis!=='undefined'?globalThis:this);
