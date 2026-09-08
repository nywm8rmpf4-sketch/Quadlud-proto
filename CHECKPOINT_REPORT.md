# QUADLUD Pattern Prototype — Checkpoint PATTERN-PROTO-3-HYBRID

Copyright © 2026 Serge Benoliel. All rights reserved.

## Gate

Candidate en attente de validation navigateur déployée. Le test humain physique iPhone reste externe.

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
- navigateur du site déployé : EN ATTENTE.

## Benchmark

Les patterns en branche réduisent les hypothèses Expert de 270 à 96 et les états explorés de 2 214 à 1 449, sans améliorer le taux de résolution. La médiane Expert régresse de 2 023 ms à 3 586 ms. L’optimisation de reconnaissance incrémentale est donc nécessaire avant toute conclusion de gain temporel.

## Produit principal

Le dépôt et la branche produit n’ont pas été modifiés. Baseline vérifiée : `12bb8e71d1eaa406f176d99403f34305b596e233`.
