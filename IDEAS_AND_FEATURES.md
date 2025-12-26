# 🎮 Proposition de Nouvelles Features & Défis : "OtaGrid Evolution"

Basé sur l'inspiration visuelle fournie et l'identité "Cyberpunk/Otaku" du blog, voici une proposition de fonctionnalités pour enrichir l'expérience utilisateur.

## 1. 🧠 Synchronisation Neurale (Engagement Quotidien)
Remplacer le simple "bonus de connexion" par une barre de **Synchronisation** qui reset chaque 24h.

*   **Le Concept** : Plus vous interagissez avec le 'Grid', plus votre synchronisation est élevée.
*   **Objectif** : Atteindre 100% chaque jour.
*   **Actions & Gains** :
    *   🔌 **Connexion** : `+20%`
    *   📖 **Lecture complète d'article** : `+20%` (détecté par scroll)
    *   🧠 **Terminer un Quiz** : `+30%`
    *   💬 **Poster un commentaire** : `+30%`
*   **Récompense Spéciale** : À 100%, l'utilisateur gagne **50 Points d'Aura** bonus et une "Flamme de Synchro" (Streak).

## 2. ✨ Nouvelle Devise : "Points d'Aura"
Séparer la progression (XP/Niveau) de la monnaie (Aura).

*   **XP (Expérience)** : Sert uniquement à monter de niveau (Genin -> Hokage) et débloquer des titres.
*   **Aura (Monnaie)** : Sert à acheter des éléments cosmétiques et utilitaires.
*   **La Boutique "Dark Market" (Idées d'achat)** :
    *   🎨 **Cadres d'Avatar** (Néon, Glitch, Or, Pixel Art).
    *   📟 **Thèmes Terminal** (Matrix Green, Cyber Pink, Retro Amber).
    *   🃏 **Jokers Quiz** : "50/50" ou "Appel à l'IA" pour les questions dures.
    *   🏷️ **Badges Exclusifs** : "Mécène" (Achetable uniquement avec beaucoup d'Aura).

## 3. 🏅 Système de Badges (Succès)
Une collection de badges à débloquer pour montrer ses accomplissements sur le profil.

| Badge | Condition d'obtention |
| :--- | :--- |
| 🚀 **Pionnier OtaGrid** | Avoir créé son compte avant [Date] (Déjà acquis pour toi !). |
| ⚔️ **Dueliste Invaincu** | Gagner 10 duels d'affilée. |
| 🧠 **Cerveau Positronique** | Obtenir 100% de bonnes réponses à 5 quiz "Difficile". |
| ✍️ **Voix du Réseau** | Poster 10 commentaires qui reçoivent des likes. |
| 🕵️ **Glitch Hunter** | Trouver la commande secrète dans le terminal. |

## 4. 🎛️ Refonte du Profil : Le "Dashboard"
Transformer l'actuelle `ProfileCard` en une page complète interactive.

*   **Zone Gauche (Identité)** : Avatar animé, Niveau, Titre, Jauge d'XP.
*   **Zone Centrale (Progression)** :
    *   **Badges** : Grille des badges (verrouillés en gris, débloqués en couleur).
    *   **Prochaine Évolution** : Une grande barre de progression XP montrant clairement ce qui manque pour le prochain rang.
*   **Zone Droite (Stats & Aura)** :
    *   Compteur d'Aura.
    *   Stats globales (Quiz joués, Victoires, Posts lus).
*   **Navigation Intégrée** : boutons rapides vers "Lancer un Quiz", "Boutique", "Inventaire".

## 5. ⚔️ Défis & Interactions Communautaires
*   **Duel Asynchrone** :
    *   Permettre de défier un ami *offline*. Il reçoit une notification : *"bicomlab vous a défié sur 'Naruto' (Score à battre: 850)"*.
*   **Le "Boss de la Semaine"** :
    *   Un Quiz spécial ultra-dur créé par l'admin.
    *   Classement dédié. Les top 3 gagnent un badge unique "Tueur de Boss".

---

### 🚀 Plan d'Action Suggéré
Si cette direction te plaît, voici par où commencer :
1.  **Base de données** : Créer les tables `badges`, `user_badges` et ajouter la colonne `aura` aux profils.
2.  **Back-end** : Créer les fonctions pour attribuer les badges et gérer l'Aura.
3.  **Front-end** : Créer la page `ProfileDashboard.tsx` en inspirant du design uploadé.
