# Duel de Dés 🎲

Jeu de dés avec mise, **2 joueurs en pass-and-play** sur un même écran.
Next.js en **export statique**, aucun backend, fonctionne hors-ligne une fois chargé,
déployé sur **GitHub Pages**.

**Jouer :** https://EdOneApp.github.io/Duel-de-D-s/

---

## Règles

- Chaque joueur démarre avec un capital de jetons identique (200 / 500 / 1000 au choix).
- Avant chaque manche, une **mise commune** est fixée (10 à 100 jetons, plafonnée au solde
  du joueur le plus pauvre). Les deux joueurs misent, le pot vaut `2 × mise`.
- Chacun lance 2 dés à son tour ; l'appareil passe de main en main (écran « Passez l'appareil »).
- **La somme la plus haute remporte le pot.**
- **Égalité :** la mise reste engagée et grossit la cagnotte de la manche suivante.
- **Fin de partie :** un joueur tombe à 0 jeton, ou la limite de manches est atteinte
  (5 / 10 / 15 / 20) — le plus haut solde gagne.

### Règles bonus (activables en pré-partie)

- **Double 6 :** gain automatique du round + bonus de 50 % du pot (prélevé sur l'adversaire).
- **Double 1 :** perte automatique du round.
- **Double 6 l'emporte sur Double 1** si les deux surviennent.

---

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) — `output: 'export'` |
| Langage | TypeScript |
| Style | Tailwind CSS |
| Animations | Framer Motion (+ confettis canvas maison) |
| État | `useReducer` — logique pure isolée dans `lib/gameReducer.ts` |
| Sons | Web Audio API synthétisée (aucun fichier binaire) |
| Persistance | `localStorage` (reprise après rafraîchissement) |
| Tests | Vitest — 24 tests sur la logique de jeu |

Aucun `fetch` réseau, aucune API tierce.

---

## Développement

```bash
npm install
npm run dev        # http://localhost:3000/Duel-de-D-s/
npm test           # tests unitaires du gameReducer
npm run build      # génère out/ (export statique)
npx serve out      # servir le build (voir note basePath ci-dessous)
```

> **basePath :** le site est servi sous `/Duel-de-D-s` (nom du dépôt). Pour tester
> `out/` en local sans ce préfixe : `NEXT_PUBLIC_BASE_PATH= npm run build`.

---

## Déploiement

Automatique via **GitHub Actions** (`.github/workflows/deploy.yml`) à chaque push sur `main` :
`npm ci` → `npm test` → `npm run build` → publication de `out/` sur GitHub Pages.

Activation unique côté dépôt : **Settings → Pages → Source : GitHub Actions**.

---

## Structure

```
app/
  layout.tsx            polices, métadonnées
  page.tsx              écran d'accueil (noms, options, règles)
  game/page.tsx         orchestration du jeu (phases, animations, persistance)
components/
  Dice.tsx              dés animés (SVG/CSS + Framer Motion, 3D)
  BetSlider.tsx         choix de la mise
  PlayerPanel.tsx       solde animé + état du tour
  PassScreen.tsx        écran « Passez l'appareil »
  RoundResult.tsx       révélation de la manche
  VictoryScreen.tsx     écran de victoire + confettis + récap
  HistoryLog.tsx        historique déroulant des manches
  Confetti.tsx          confettis canvas
  MuteButton.tsx        coupe-son
lib/
  gameReducer.ts        logique pure (actions, transitions, résolution)
  types.ts              modèle de données
  storage.ts            localStorage (partie + config + mute)
  sound.ts              sons synthétisés
__tests__/
  gameReducer.test.ts   tests unitaires
```

---

## Accessibilité

Contrastes AA, focus clavier visible, cibles tactiles ≥ 44 px, `prefers-reduced-motion`
respecté (les dés changent de face sans rotation complète).
