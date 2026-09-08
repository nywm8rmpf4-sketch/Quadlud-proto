# QUADLUD Proto — Soleil–Lune / Solveur hybride

Prototype jouable indépendant permettant de tester un solveur pattern-first dans trois usages : Solveur, Logic Coach et Tuteur progressif.

Baseline produit vérifiée : `12bb8e71d1eaa406f176d99403f34305b596e233` (`fix/v3.1.9-hf3.9-semantic-r1`).
Checkpoint recherche patterns : `09b714b7522b0f94faac8d7c1db786b26c61629d`.

## Contrat

- uniquement Soleil–Lune ;
- aucun autre jeu QUADLUD ;
- aucune solution cachée stockée dans les puzzles du prototype ;
- le recognizer propose seulement depuis l’état visible ;
- le validateur exact confirme/rejette une conclusion mais n’invente jamais un match manquant ;
- `HybridMovePlanner` arbitre patterns puis déductions classiques ;
- `HybridBranchSolver` réutilise patterns et règles classiques dans chaque hypothèse ;
- profondeur hypothétique maximale strictement bornée à 1 ;
- Coach et Tuteur consomment le même raisonnement validé ;
- Tuteur : où regarder → règle/hypothèse → conséquences réelles → contradiction → coup ;
- les profils Débutant / Intermédiaire / Avancé limitent réellement la bibliothèque connue.

## Stratégies comparables

- classique ;
- patterns purs P001–P018 ;
- hybride sans patterns dans les branches ;
- hybride complet avec patterns dans les branches.

Le benchmark reproductible utilise 53 puzzles, trois répétitions et un warm-up séparé. Les résultats sont dans `benchmark-results/`. Ils montrent que les patterns en branche réduisent le nombre d’hypothèses et d’états Expert sur ce corpus, mais pas le temps : leur coût de reconnaissance domine encore le gain d’exploration.

Copyright © 2026 Serge Benoliel. All rights reserved.
