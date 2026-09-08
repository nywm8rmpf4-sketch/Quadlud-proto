# Analyse du benchmark hybride Soleil–Lune

Copyright © 2026 Serge Benoliel. All rights reserved.

## Protocole

- 53 puzzles : 13 du prototype validé et 40 puzzles supplémentaires générés avec la seed `0x514c5544` ;
- répartition : 11 Facile, 14 Moyen, 14 Difficile, 14 Expert ;
- 4 stratégies, 3 répétitions, 8 warm-ups par stratégie ;
- 636 résolutions complètes ;
- génération exclue du chronométrage ;
- même processus Node et même environnement pour toutes les variantes.

Les catégories des puzzles générés décrivent leur densité de prémisses ; elles ne constituent pas une calibration de difficulté humaine. Les grilles supplémentaires sont volontairement peu contraintes et plusieurs restent indécidables avec une profondeur hypothétique limitée à 1.

## Faits mesurés

- aucune erreur logique ni contradiction après coup accepté sur 636 runs ;
- patterns purs : 0 % de résolution Expert, médiane 186 ms ;
- hybride sans patterns en branche, Expert : 28,6 % résolus, médiane 2 023 ms, 270 hypothèses, 2 214 états explorés ;
- hybride complet, Expert : 28,6 % résolus, médiane 3 586 ms, 96 hypothèses, 1 449 états explorés et 651 déductions pattern en branche ;
- en Expert, les patterns en branche réduisent de 64,4 % le nombre d’hypothèses et de 34,6 % les états explorés, mais augmentent la médiane temporelle de 77,2 % ;
- en Difficile, l’hybride complet teste 78 hypothèses contre 102, mais explore 1 191 états contre 1 152 et présente un p95 nettement plus élevé ;
- P005, P002 et P003 sont les familles les plus fréquentes dans l’hybride complet ; P010, P011 et P017 ne sont pas observés sur ce corpus.

## Interprétation

La réduction d’exploration est réelle, mais le recognizer actuel rescane toutes les lignes, colonnes et chaînes après chaque micro-déduction. Son coût domine le bénéfice structurel dans les branches. Le résultat ne justifie donc pas de présenter l’hybride complet comme plus rapide dans cette version.

Le moteur classique reste indispensable pour les états non couverts par P001–P018 et la contradiction reste indispensable pour les quatre Expert historiques. Les patterns restent pédagogiquement utiles et rapides lorsqu’ils résolvent directement l’état.

## Hypothèses à tester ensuite

- reconnaissance incrémentale limitée aux unités modifiées ;
- cache des PatternMatch par signature d’unité ;
- application groupée des conclusions sœurs déjà validées ;
- ordre des hypothèses guidé par le gain attendu ;
- nouveau benchmark sur un corpus Expert unique et calibré humainement.

Les résultats détaillés et chaque run figurent dans `benchmark-results/hybrid-benchmark.json`.
