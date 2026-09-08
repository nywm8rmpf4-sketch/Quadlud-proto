# QUADLUD Proto — Soleil–Lune / Patterns

Prototype jouable indépendant permettant de tester l’intégration de la bibliothèque de patterns P001–P018 dans trois usages : solveur perceptif, Logic Coach et Tuteur progressif.

Baseline produit vérifiée : `12bb8e71d1eaa406f176d99403f34305b596e233` (`fix/v3.1.9-hf3.9-semantic-r1`).
Checkpoint recherche patterns : `09b714b7522b0f94faac8d7c1db786b26c61629d`.

## Contrat

- uniquement Soleil–Lune ;
- aucun autre jeu QUADLUD ;
- aucune solution cachée stockée dans les puzzles du prototype ;
- le recognizer propose seulement depuis l’état visible ;
- le validateur exact confirme/rejette une conclusion mais n’invente jamais un match manquant ;
- Coach et Tuteur consomment le même `PatternMatch` validé ;
- Tuteur : où regarder → règle → pourquoi → coup ;
- les profils Débutant / Intermédiaire / Avancé limitent réellement la bibliothèque connue.

Les parties Expert peuvent volontairement bloquer avec P001–P018 : ce blocage fait partie du pilote.

Copyright © 2026 Serge Benoliel. All rights reserved.
