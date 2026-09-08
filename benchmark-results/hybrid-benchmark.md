# Benchmark solveur hybride Soleil–Lune

Corpus : 53 puzzles (13 existants + 40 générés, seed 0x514c5544), 3 répétitions, warm-up 8/stratégie. Génération exclue du chronométrage.

| Stratégie | Difficulté | Résolution | Moyenne ms | Médiane ms | p95 ms | σ ms | Coups moy. | Patterns | Classiques | Hypothèses | États | Patterns branche |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A-classical | easy | 9.1% | 267.13 | 247.92 | 467.47 | 118.45 | 16.0 | 0 | 525 | 6 | 33 | 0 |
| A-classical | medium | 35.7% | 285.04 | 266.86 | 524.95 | 149.28 | 20.3 | 0 | 852 | 0 | 0 | 0 |
| A-classical | hard | 35.7% | 960.99 | 355.72 | 6117.53 | 1584.49 | 19.4 | 0 | 789 | 462 | 5271 | 0 |
| A-classical | expert | 28.6% | 1257.61 | 1061.34 | 2736.36 | 839.79 | 18.4 | 0 | 720 | 408 | 3456 | 0 |
| B-pattern-pure | easy | 9.1% | 151.70 | 142.86 | 248.18 | 46.98 | 24.5 | 810 | 0 | 0 | 0 | 0 |
| B-pattern-pure | medium | 35.7% | 218.96 | 200.19 | 491.28 | 126.97 | 27.9 | 1173 | 0 | 0 | 0 | 0 |
| B-pattern-pure | hard | 35.7% | 241.13 | 202.67 | 624.13 | 164.43 | 25.4 | 1065 | 0 | 0 | 0 | 0 |
| B-pattern-pure | expert | 0.0% | 229.93 | 186.17 | 524.59 | 140.41 | 20.7 | 870 | 0 | 0 | 0 | 0 |
| C-hybrid-no-branch-patterns | easy | 9.1% | 779.63 | 817.49 | 1497.11 | 365.44 | 25.2 | 828 | 0 | 6 | 33 | 0 |
| C-hybrid-no-branch-patterns | medium | 35.7% | 749.18 | 719.85 | 1313.70 | 359.42 | 27.9 | 1173 | 0 | 0 | 0 | 0 |
| C-hybrid-no-branch-patterns | hard | 35.7% | 1691.71 | 1023.93 | 9192.43 | 2410.03 | 27.0 | 1119 | 3 | 102 | 1152 | 0 |
| C-hybrid-no-branch-patterns | expert | 28.6% | 2758.17 | 2023.30 | 6629.19 | 1821.85 | 29.9 | 1215 | 0 | 270 | 2214 | 0 |
| D-hybrid-full | easy | 9.1% | 1093.82 | 1026.69 | 2141.11 | 598.81 | 25.2 | 828 | 0 | 6 | 36 | 12 |
| D-hybrid-full | medium | 35.7% | 968.23 | 932.85 | 1805.60 | 577.17 | 27.9 | 1173 | 0 | 0 | 0 | 0 |
| D-hybrid-full | hard | 35.7% | 2701.71 | 1357.61 | 18631.52 | 4845.60 | 27.0 | 1119 | 3 | 78 | 1191 | 315 |
| D-hybrid-full | expert | 28.6% | 4147.61 | 3585.66 | 10016.29 | 2742.79 | 29.9 | 1215 | 0 | 96 | 1449 | 651 |

Les temps sont ceux du solveur complet sur un seul environnement Node ; ils ne mesurent pas le rendu UI.
