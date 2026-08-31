# Cahier des charges — "Duel de Dés"
### Jeu de dés avec mise, 2 joueurs en pass-and-play, Next.js statique déployé sur GitHub Pages

---

## 1. Contexte et objectifs

Créer un jeu web interactif de dés avec système de mise, jouable à deux sur un même écran (pass-and-play), sans aucun backend, animé, et déployable en tant que site statique sur GitHub Pages.

**Contraintes non négociables :**
- Aucun serveur, aucune base de données, aucune API externe.
- Fonctionne 100% offline une fois chargé (PWA-friendly).
- Doit se lancer sans erreur dès le premier déploiement.
- Stack imposée : **Next.js** (export statique).

---

## 2. Règles du jeu

### 2.1 Mise en place
- 2 joueurs, chacun démarre avec **500 jetons** (200 / 500 / 1000 configurable).
- Avant chaque manche, les deux joueurs valident une **mise commune** (slider/input, 10 à 100 jetons, plafonnée au solde du joueur le plus pauvre).

### 2.2 Déroulement d'une manche
1. Écran "Au tour de Joueur 1" → Joueur 1 lance 2 dés, animation de roulement (~1,2s).
2. L'appareil affiche "Passez à Joueur 2" → Joueur 2 lance ses 2 dés.
3. Comparaison des sommes :
   - **Somme la plus haute gagne** → remporte le pot (2× la mise).
   - **Égalité** → la mise reste engagée, elle s'ajoute au pot de la manche suivante (effet "cagnotte").
4. Résultat animé (confettis, mise à jour des soldes en incrémentation visuelle).

### 2.3 Règle bonus (optionnelle, activable)
- **Double 6** : gain automatique du round + bonus de 50% du pot.
- **Double 1** : perte automatique du round.
- Double 6 l'emporte sur Double 1 si les deux surviennent.

### 2.4 Fin de partie
- Un joueur atteint 0 jeton → l'autre est déclaré vainqueur.
- Ou : nombre de manches max atteint (5 / 10 / 15 / 20) → le plus haut solde gagne.
- Écran de victoire avec récap (manches jouées, égalités, plus gros gain, soldes) + bouton "Rejouer".

---

## 3. Périmètre fonctionnel

| # | Fonctionnalité | Priorité | État |
|---|---|---|---|
| F1 | Écran d'accueil (règles + noms des joueurs + démarrer) | Must | ✅ |
| F2 | Saisie des noms des 2 joueurs | Must | ✅ |
| F3 | Choix de la mise à chaque manche (input/slider) | Must | ✅ |
| F4 | Animation de lancer de dés (rotation 3D) | Must | ✅ |
| F5 | Écran "Passez l'appareil" entre les tours | Must | ✅ |
| F6 | Calcul automatique du résultat + attribution du pot | Must | ✅ |
| F7 | Affichage des soldes en temps réel avec incrémentation animée | Must | ✅ |
| F8 | Historique des manches (mini-log déroulant) | Should | ✅ |
| F9 | Écran de victoire + confettis + statistiques | Must | ✅ |
| F10 | Bouton "Rejouer" / "Nouvelle partie" | Must | ✅ |
| F11 | Persistance de la partie en cours (localStorage) | Should | ✅ |
| F12 | Son (dés, victoire) avec bouton mute | Could | ✅ (synthétisé Web Audio) |
| F13 | Thème casino sombre | Could | ✅ |
| F14 | Règles activables/désactivables (double 6, double 1) | Could | ✅ |
| F15 | PWA (installable, offline) | Could | ⛔ non implémenté (offline OK via cache navigateur) |

---

## 4. Spécifications techniques

### 4.1 Stack
- **Next.js 14** (App Router), **TypeScript**, export statique (`output: 'export'`).
- **Tailwind CSS**, **Framer Motion**.
- State management : `useReducer` local, logique pure dans `lib/gameReducer.ts`.
- Aucun `fetch` réseau, aucun service tiers.

### 4.2 Configuration GitHub Pages

```js
// next.config.js
const nextConfig = {
  output: 'export',
  basePath: '',            // domaine personnalisé servi à la racine (duel.myoctogone.com)
  images: { unoptimized: true },
  trailingSlash: true,
};
```

- Le dépôt Pages est configuré avec le domaine personnalisé **duel.myoctogone.com**
  (fichier `public/CNAME`), servi à la racine — d'où `basePath` vide.
  Pour un déploiement sous `https://<user>.github.io/Duel-de-D-s/`, builder avec
  `NEXT_PUBLIC_BASE_PATH=/Duel-de-D-s`.
- Déploiement via **GitHub Actions** (`actions/deploy-pages`) sur push vers `main`.

### 4.3 Modèle de données

Voir `lib/types.ts`. Actions du reducer : `SETUP`, `PLACE_BET`, `ROLL_P1`, `CONFIRM_PASS`,
`ROLL_P2`, `RESOLVE_ROUND`, `NEXT_ROUND`, `RESET`, `HYDRATE`.

Phases : `setup` → `betting` → `rolling-p1` → `passing` → `rolling-p2` → `reveal` → (`betting` | `gameover`).

---

## 5. Direction artistique

- **Palette** : feutrine vert bouteille `#0B3D2E`, accent doré `#D4AF37`, blanc cassé `#F2EFE9`.
- **Typographie** : Oswald (display condensée) + Inter (texte), auto-hébergées (offline).
- **Signature** : les dés sont l'élément héros — lancer animé (rotation 3D, rebond, ombre portée).
- **Mouvement** : un temps fort par manche (lancer + révélation).
- **Accessibilité** : contrastes AA, focus visible, `prefers-reduced-motion`, cibles ≥ 44px.

---

## 6. Écrans

Accueil · Jeu (tour du joueur) · Passez l'appareil · Révélation · Victoire.

---

## 7. Compatibilité

Mobile-first. Chrome / Safari (iOS) / Firefox / Edge, 2 dernières versions. 360px à 1920px.

---

## 8. Tests

| Type | Détail | État |
|---|---|---|
| Unitaires | `gameReducer.ts` — transitions, égalité, fin de partie, mise invalide, bonus | ✅ 24 tests (Vitest) |
| Build | `next build` avec `output: 'export'` → `out/` fonctionnel | ✅ |
| CI | Tests + build exécutés à chaque push avant déploiement | ✅ |

---

## 9. Livrables

1. Dépôt GitHub avec le code source complet. ✅
2. Workflow GitHub Actions de déploiement automatique. ✅ (`.github/workflows/deploy.yml`)
3. Site fonctionnel sur `https://duel.myoctogone.com/`. ✅
4. Ce document de spécifications. ✅

---

## 10. Écarts par rapport au cahier initial

- **Sons** : synthétisés via l'API Web Audio plutôt que des fichiers `.mp3`/`.wav`, pour
  garantir le fonctionnement 100% offline sans aucun asset binaire.
- **PWA (F15)** : non implémentée (priorité *Could*). Le jeu reste jouable hors-ligne grâce
  au cache du navigateur une fois la page chargée.
- **Confettis** : implémentation canvas maison (pas de dépendance externe).
