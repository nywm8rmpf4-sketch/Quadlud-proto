# QUADLUD Pattern Prototype — Checkpoint PATTERN-PROTO-3-HYBRID

Copyright © 2026 Serge Benoliel. All rights reserved.

## Gate

`READY_FOR_HUMAN_TEST`. Les validations automatisées, sémantiques et la validation exploratoire réalisable sur le site déployé sont passées. Le test humain physique sur iPhone reste le gate externe suivant.

## Architecture

`PatternRecognizer → ExactDeductionValidator → HybridMovePlanner`, avec `PatternArbiter`, `ClassicalEngine`, `HybridBranchSolver` et la projection pédagogique intégrée au prototype.

Le Solveur progresse jusqu’à résolution ou blocage. Le Logic Coach demande le prochain raisonnement. Le Tuteur déroule exactement ce raisonnement, y compris hypothèse, déductions numérotées, contradiction et conclusion réelle.

## Invariants

- P001–P018 reconnus depuis l’état visible ;
- conclusion pattern revalidée exactement ;
- règles classiques par domaines de lignes légales ;
- patterns et règles classiques réappliqués en alternance dans les branches ;
- profondeur hypothétique maximale : 1 ;
- aucune solution cachée stockée ou lue ;
- contexte, focus hypothétique et conclusion réelle visuellement distincts.

## Résultats

- package/syntaxe/ordre/cache PWA : PASS ;
- invariants moteur : PASS, 52 runs ;
- sémantique : PASS, 518 patterns directs, 6 branches, 79 patterns en branche ;
- corpus historique Expert : hybride complet 4/4 ;
- benchmark : PASS, 636 runs sur 53 puzzles, zéro erreur logique ;
- navigateur Chromium local : NON EXÉCUTÉ, téléchargement du binaire expiré ;
- GitHub Pages run 20 (`34275921262`) : PASS ;
- navigateur du site déployé : PASS — Coach Expert, conclusion visuelle unique, application du coup, Undo/Redo/reset, Tuteur de contradiction en 11 écrans avec 7 conséquences réelles, résolution Expert complète en 44 conclusions ;
- inspection visuelle desktop déployée : PASS ;
- test physique Safari/iPhone : NON EXÉCUTÉ, gate humain externe.

## Benchmark

Les patterns en branche réduisent les hypothèses Expert de 270 à 96 et les états explorés de 2 214 à 1 449, sans améliorer le taux de résolution. La médiane Expert régresse de 2 023 ms à 3 586 ms. L’optimisation de reconnaissance incrémentale est donc nécessaire avant toute conclusion de gain temporel.

## Produit principal

Le dépôt et la branche produit n’ont pas été modifiés. Baseline vérifiée : `12bb8e71d1eaa406f176d99403f34305b596e233`.
