# 📖 FURQANY 3.0 — Documentation Complète

> **Application web progressive (PWA) pour l'apprentissage du Coran destinée aux enfants dès 4 ans.**
> Déployée sur : [furqany-30.vercel.app](https://furqany-30.vercel.app)

---

## 1. Présentation Générale

**Furqany** est une application éducative islamique conçue pour accompagner les enfants dans la mémorisation et la compréhension du Coran. Elle propose un parcours ludique, gamifié et sécurisé, avec une supervision parentale intégrée.

### Proposition de valeur
- 🎯 **Cible** : Enfants de 4 à 8 ans (et au-delà), accompagnés par leurs parents
- 🌍 **Langues** : Français, Arabe, Anglais (interface trilingue complète)
- 📱 **Format** : PWA installable (fonctionne comme une app native sur mobile et desktop)
- 🔒 **Sécurité** : Validation parentale par code (70000) pour confirmer la mémorisation

---

## 2. Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Framework** | React | 19.2.3 |
| **Build** | Vite | 6.2.0 |
| **Langage** | TypeScript | 5.8.2 |
| **Styling** | Tailwind CSS (CDN) + CSS custom |  |
| **Backend** | Firebase (Auth + Firestore) | 12.10.0 |
| **IA** | Google Gemini (`@google/genai`) | 1.34.0 |
| **i18n** | i18next + react-i18next | 25.8 / 16.5 |
| **Déploiement** | Vercel |  |
| **Typographie arabe** | KFGQPC Uthman Taha Naskh + Amiri + Scheherazade New |  |

---

## 3. Architecture du Projet

```
FURQANY 3.0/
├── index.html              # Point d'entrée HTML (PWA meta, fonts, Tailwind CDN)
├── index.tsx               # Point de montage React (ReactDOM.createRoot)
├── App.tsx                 # Composant racine (1128 lignes) — toute la logique
├── types.ts                # Interfaces TypeScript (Verse, Surah, Badge, UserProgress, AppMode)
├── constants.ts            # Données coraniques (3849 lignes, ~917 Ko de texte arabe/français)
├── adhkars.ts              # Invocations du matin et du soir (texte arabe + traductions)
├── firebase.ts             # Configuration Firebase (Auth + Firestore + persistence offline)
├── geminiService.ts        # Service IA Gemini (explications, compliments, TTS)
├── i18n.ts                 # Configuration i18next (FR/AR/EN)
├── vite.config.ts          # Configuration Vite
├── components/
│   ├── AdhkarsSection.tsx  # Section des invocations (matin/soir)
│   ├── BottomNav.tsx       # Navigation inférieure (version standard)
│   ├── GamesSection.tsx    # Mini-jeux éducatifs coraniques
│   ├── LanguageSwitcher.tsx# Sélecteur de langue (FR/AR/EN)
│   ├── LearningCalendar.tsx# Calendrier de suivi d'apprentissage
│   ├── Loader.tsx          # Écran de chargement animé
│   ├── Mascot.tsx          # Mascotte "Lumi" l'étoile guide
│   ├── PrayerTimes.tsx     # Horaires de prière (géolocalisés)
│   ├── ReciterPicker.tsx   # Choix du réciteur (Al-Banna / Al-Hossary)
│   ├── ThemePicker.tsx     # Choix du thème visuel (4 thèmes)
│   ├── VerseDisplay.tsx    # Affichage des versets (arabe + traduction + audio)
│   └── Premium/
│       ├── PremiumDashboard.tsx       # Tableau de bord premium
│       ├── PremiumGreeting.tsx        # Accueil personnalisé premium
│       ├── PremiumHeader.tsx          # En-tête premium
│       ├── PremiumJourney.tsx         # Parcours d'apprentissage visuel
│       ├── PremiumLearningCalendar.tsx# Calendrier premium amélioré
│       ├── PremiumNav.tsx             # Navigation premium flottante
│       ├── PremiumPrayerTimes.tsx     # Horaires de prière (design premium)
│       └── PremiumStories.tsx         # Histoires et récits coraniques
└── public/
    ├── index.css           # Variables CSS Premium + utilitaires
    ├── logo.png            # Logo de l'application
    ├── og-image.png        # Image pour le partage social (Open Graph)
    ├── manifest.json       # Manifest PWA
    ├── sw.js               # Service Worker (cache offline)
    ├── manual.md           # Manuel d'utilisation
    ├── back1.png — back4.png  # Fonds d'écran pour les 4 thèmes
    ├── 1.png — 4.png       # Images des 4 quartiers coraniques
    └── locales/
        ├── fr/translation.json  # Traductions françaises
        ├── ar/translation.json  # Traductions arabes
        └── en/translation.json  # Traductions anglaises
```

---

## 4. Modèle de Données

### 4.1 Verset (`Verse`)
```typescript
{ number: number, arabic: string, french: string }
```
Chaque verset contient son numéro, le texte arabe authentique et sa traduction française.

### 4.2 Sourate (`Surah`)
```typescript
{
  id: number,          // ID coranique (1 = Al-Fatiha, 114 = An-Nas)
  idString: string,    // ID formaté ("001", "114")
  name: string,        // Translittération ("Al-Fatiha")
  frenchName: string,  // Nom français ("L'Ouverture")
  englishName?: string,// Nom anglais ("The Opening")
  arabicName?: string, // Nom arabe ("الفاتحة")
  verses: Verse[],     // Liste des versets
  isSpecialVerse?: boolean // Verset spécial (ex: Ayat Al-Kursi)
}
```

### 4.3 Progression Utilisateur (`UserProgress`)
```typescript
{
  completedSurahs: number[],    // Sourates mémorisées
  completedVerses: string[],    // Versets validés individuellement
  badges: string[],             // Badges débloqués
  streak: number,               // Série de jours consécutifs
  theme: 'emerald'|'gold'|'indigo'|'rose', // Thème visuel
  reciter: 'hossary'|'albanna', // Réciteur audio
  fontSize: number,             // Taille du texte arabe
  activityLog: { [date]: bool },// Journal d'activité quotidien
  unlockedQuarters: number[],   // Quartiers débloqués (1-4)
  gameStars: number,            // Étoiles pour les jeux
  userName?: string,            // Prénom de l'enfant
  gender?: 'boy'|'girl',        // Genre (pour la mascotte et l'IA)
  isPremium?: boolean,          // Statut premium
  preferredLanguage?: 'fr'|'ar'|'en' // Langue préférée
}
```

### 4.4 Modes de l'Application (`AppMode`)
| Mode | Description |
|------|-------------|
| `SELECTION` | Écran d'accueil — liste des sourates par quartier |
| `LEARNING` | Apprentissage d'une sourate verset par verset |
| `BADGES` | Profil et trophées de l'enfant |
| `GAMES` | Mini-jeux éducatifs |
| `COMPLETED_LIST` | Liste des sourates terminées |
| `ADHKARS` | Invocations du matin et du soir |

---

## 5. Fonctionnalités Détaillées

### 5.1 🎓 Apprentissage Coranique
- **Contenu** : Sourates 1 à 114 avec texte arabe authentique et traduction française
- **Organisation** : 4 quartiers coraniques (Q1: 1-6, Q2: 7-17, Q3: 18-35, Q4: 36-114)
- **Audio** : Récitation par Cheikh Mahmoud Ali Al-Banna ou Cheikh Mahmoud Khalil Al-Hossary (premium)
- **Verset par verset** : Navigation progressive avec texte arabe en police KFGQPC_Hafs
- **Auto-play** : Lecture automatique enchaînant les versets d'une sourate

### 5.2 🤖 Intelligence Artificielle (Gemini)
L'IA "Lumi" est intégrée via Google Gemini et offre :

| Fonctionnalité | Modèle | Description |
|----------------|--------|-------------|
| **Explication de verset** | `gemini-3-flash-preview` | Explication simple et adaptée à l'enfant (max 2 phrases), conforme au dogme sunnite |
| **Compliment personnalisé** | `gemini-3-flash-preview` | Félicitation personnalisée avec le prénom de l'enfant après chaque sourate |
| **Voix de Lumi (TTS)** | `gemini-2.5-flash-preview-tts` | Synthèse vocale féminine et douce (voix "Kore") |

> ⚠️ **Règles strictes de l'IA** : Interdiction d'anthropomorphisme, fidélité au consensus islamique, langage doux et pédagogique. Ces fonctionnalités sont **réservées aux membres Premium**.

### 5.3 🏆 Système de Gamification
- **Badges** : 6 trophées à débloquer (Clé du Trésor, Bouclier d'Or, Rayon de Soleil, Étoile Guide, Maîtresse de Lumière, Grande Championne)
- **Étoiles de jeu** : 20 étoiles de départ, rechargées automatiquement
- **Calendrier d'apprentissage** : Suivi visuel de l'activité quotidienne
- **Série (Streak)** : Compteur de jours consécutifs d'apprentissage
- **Encouragements dynamiques** : Messages aléatoires après chaque validation de verset

### 5.4 🕌 Invocations (Adhkars)
- **Catégories** : Matin, Soir, Les deux
- **Contenu** : Texte arabe + translittération + traduction trilingue (FR/EN/AR)
- **Sources** : Hadith authentiques (Muslim, etc.)
- **Compteur de répétitions** : Nombre de fois à réciter chaque invocation

### 5.5 🕐 Horaires de Prière
- Heures de prière géolocalisées (basées sur la position de l'utilisateur)
- Affichage intégré dans le tableau de bord

### 5.6 🔐 Contrôle Parental
- **Code parental** : `70000` requis pour valider la mémorisation d'une sourate
- **Espace parent** : Accessible depuis le menu principal
- **Manuel** : Guide d'utilisation consultable dans l'application
- **Profil** : Configuration du prénom, genre et âge de l'enfant

### 5.7 🎨 Personnalisation
4 thèmes visuels avec fonds d'écran uniques :
| Thème | Couleur | Fond |
|-------|---------|------|
| 🌹 Rose | Rose/Pink | `back4.png` |
| 🟢 Emerald | Vert émeraude | `back1.png` |
| 🟡 Gold | Or/Ambre | `back2.png` |
| 🔵 Indigo | Bleu indigo | `back3.png` |

### 5.8 🌍 Internationalisation
- **3 langues** : Français (défaut), Arabe (RTL automatique), Anglais
- **Détection automatique** : La langue du navigateur est détectée au premier lancement
- **Switcher** : Bouton de changement de langue sur chaque écran
- **Traductions** : Interface complète, noms de sourates, badges, descriptions

---

## 6. Système Premium

### 6.1 Accès Premium
Les comptes premium bénéficient d'une interface redessinée ("Digital Sanctuary") et de fonctionnalités exclusives.

**Comptes premium actuels** (configurés en dur dans `App.tsx`) :
| Email | Nom affiché | Genre |
|-------|-------------|-------|
| `emilmatan48@gmail.com` | Abdallah | Garçon |
| `novaskilltech@gmail.com` | Nova | Garçon |

### 6.2 Fonctionnalités Premium Exclusives
- ✨ **Interface "Chercheur de Savoir"** : Design moderne et épuré avec charte graphique premium
- 🤖 **IA Lumi** : Explications de versets, compliments personnalisés, voix synthétisée
- 🎙️ **Réciteur Al-Hossary** : Deuxième réciteur disponible uniquement en premium
- 🎨 **Thèmes additionnels** : Accès à tous les thèmes (les non-premium sont limités à "Rose")
- 📊 **Dashboard amélioré** : Tableau de bord avec parcours visuel, calendrier enrichi, histoires

### 6.3 Composants Premium (8 fichiers)
| Composant | Rôle |
|-----------|------|
| `PremiumDashboard` | Conteneur principal, orchestre tous les sous-composants |
| `PremiumHeader` | En-tête avec logo et bouton menu |
| `PremiumGreeting` | Accueil personnalisé ("Assalamu Alaykum, Abdallah") |
| `PremiumNav` | Navigation flottante en bas (Accueil, Apprendre, Dhikr, Stats) |
| `PremiumPrayerTimes` | Horaires de prière stylisés |
| `PremiumLearningCalendar` | Calendrier d'activité avec design premium |
| `PremiumJourney` | Parcours d'apprentissage avec progression visuelle par quartier |
| `PremiumStories` | Section histoires et récits |

---

## 7. Authentification & Base de Données

### 7.1 Authentification
- **Provider** : Google Sign-In via Firebase Authentication (`signInWithPopup`)
- **Flux** : Connexion → Chargement du profil Firestore → Affichage conditionnel (standard/premium)
- **Gestion des erreurs** : Messages spécifiques pour les domaines non autorisés, cookies tiers bloqués

### 7.2 Firestore
- **Collection** : `users/{uid}` — stockage de `UserProgress`
- **Persistence offline** : Activée via `enableIndexedDbPersistence` (mode hors-ligne)
- **Synchronisation** : Chaque modification de `progress` est automatiquement écrite dans Firestore
- **Fallback** : `localStorage` utilisé si l'utilisateur n'est pas connecté

---

## 8. PWA (Progressive Web App)

- **Service Worker** : `public/sw.js` pour le cache offline
- **Manifest** : `manifest.json` avec icônes, nom, couleur du thème
- **Installation** : L'application intercepte l'événement `beforeinstallprompt` et propose l'installation
- **Partage** : API Web Share native (`navigator.share`) pour partager l'application
- **Safe Area** : Support des encoches (notch) iPhone via `env(safe-area-inset-*)

---

## 9. Contenu Coranique

Le fichier `constants.ts` (917 Ko, 3849 lignes) contient l'intégralité des sourates avec :
- Texte arabe authentique (police KFGQPC Uthman Taha Naskh)
- Traduction française
- Organisation en 4 quartiers :
  - **Q1** : Sourates 1-6 (y compris Al-Fatiha et les premiers versets d'Al-Baqara)
  - **Q2** : Sourates 7-17
  - **Q3** : Sourates 18-35
  - **Q4** : Sourates 36-114 (ordre inversé pour commencer par les plus courtes)

---

## 10. Flux Utilisateur Principal

```
1. Ouverture → Écran de chargement (Loader)
2. Connexion Google (si non connecté)
3. Écran de bienvenue (1ère visite)
4. [ Vérification Premium → Dashboard Premium OU Dashboard Standard ]
5. Navigation par quartiers → Sélection d'une sourate
6. Apprentissage verset par verset (texte + audio)
7. Validation parentale (code 70000)
8. Célébration IA (compliment Gemini + badge éventuel)
9. Retour à la sélection
```

---

## 11. Commandes de Développement

```bash
npm run dev      # Démarrer le serveur de développement (Vite)
npm run build    # Build de production
npm run preview  # Prévisualisation du build
npm run lint     # Vérification TypeScript (tsc --noEmit)
npx vercel --prod # Déploiement sur Vercel
```

---

## 12. Variables d'Environnement

| Variable | Usage | Stockage |
|----------|-------|----------|
| `API_KEY` | Clé API Google Gemini | `process.env` (Vercel) |
| Firebase Config | Auth + Firestore | `firebase-applet-config.json` |

---

## 13. Points d'Attention

> [!IMPORTANT]
> - Le code parental est **en dur** (`70000`) — à migrer vers un système configurable par parent
> - Les emails premium sont **en dur** dans `App.tsx` — à migrer vers Firestore
> - Le fichier `constants.ts` fait **917 Ko** — envisager un chargement paresseux ou une API
> - L'historique Git contient des fichiers lourds (~56 MB) — nécessite un nettoyage `git filter-branch`

---

*Document généré le 22 mars 2026 — FURQANY 3.0 by NovaskillTech*
