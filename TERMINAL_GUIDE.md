# 📖 Guide Complet du Terminal OtaBlog v3.0

## 🎯 Introduction

Le Terminal OtaBlog est votre interface de commande cyberpunk pour interagir avec l'IA, créer des défis de quiz et défier la communauté.

---

## 🎮 Commandes de Duel

### `/duel [sujet]`
Créer un défi de quiz sur un sujet de votre choix.

**Exemple :**
```
> /duel Naruto
```

**Résultat :**
- L'IA génère 5 questions sur le sujet
- Vous recevez un code unique (ex: `#NAR-1234-5678`)
- Jouez d'abord pour définir le score à battre
- Partagez le code avec vos amis

**Nouveauté :** Les défis sont maintenant **persistants** ! Le code fonctionne même après refresh.

---

### `/solo [sujet]`
Mode entraînement solo sans créer de défi.

**Exemple :**
```
> /solo One Piece
```

**Résultat :**
- Quiz de 5 questions
- Pas de code généré
- Parfait pour s'entraîner

---

### `/join [code]`
Rejoindre un défi existant avec son code.

**Exemple :**
```
> /join #NAR-1234-5678
```

**Résultat :**
- Charge le défi depuis la base de données
- Affiche le créateur et le score à battre
- Lance le quiz

**Astuce :** Le code doit commencer par `#` et contenir au moins 5 caractères.

---

## 💬 Commandes de Chat

### Discussion Libre
Tapez n'importe quelle question sans `/` pour discuter avec l'IA.

**Exemples :**
```
> Qui est le plus fort entre Goku et Saitama ?
> Explique-moi la blockchain
> Recommande-moi un anime
```

L'IA répond en streaming avec un contexte de conversation.

---

## ⚙️ Commandes Système

### `/help`
Affiche la liste de toutes les commandes disponibles.

```
> /help
```

---

### `/clear`
Nettoie l'historique du terminal.

```
> /clear
```

**Résultat :** Terminal nettoyé, prêt pour une nouvelle session.

---

### `/matrix`
Active/désactive le mode Matrix (effet visuel).

```
> /matrix
```

**Effet :** Pluie de caractères verts style Matrix.

---

### `/guide` ou `/tuto`
Relance le tutoriel d'introduction animé.

```
> /guide
```

**Effet :** Animation de synchronisation neurale avec guide complet.

---

## 🎯 Flux Complet d'un Défi

### Étape 1 : Créer le Défi
```
> /duel Dragon Ball
```

**Réponse :**
```
🤖 Analyse du sujet "Dragon Ball"...
⚙️ Génération du protocole de duel...

✅ Duel généré avec succès !

📚 Sujet: Dragon Ball
📋 CODE DÉFI: #DRA-4521-7890

💡 Jouez d'abord pour définir le score à battre !
```

### Étape 2 : Jouer au Quiz
- Cliquez sur "COMMENCER LE DUEL"
- Répondez aux 5 questions
- Obtenez votre score (ex: 450 points)

**Réponse :**
```
🎯 MISSION ACCOMPLIE.
Score enregistré : 450.

📋 CODE DÉFI CONFIRMÉ : #DRA-4521-7890

💬 Partagez ce code pour défier d'autres membres !
```

### Étape 3 : Partager le Code
Envoyez `#DRA-4521-7890` à vos amis via WhatsApp, Discord, etc.

### Étape 4 : Vos Amis Rejoignent
```
> /join #DRA-4521-7890
```

**Réponse :**
```
🔍 Recherche du défi #DRA-4521-7890...

✅ Défi trouvé !

📚 Sujet: "Dragon Ball"
👤 Créateur: YourUsername
🏆 Score à battre: 450

⚔️ Prêt à relever le défi ?
```

### Étape 5 : Résultat
Après avoir joué :

**Si victoire (score > 450) :**
```
🏆 VICTOIRE !
Vous avez battu YourUsername de 50 points !

Votre Score : 500 vs 450
```

**Si défaite (score < 450) :**
```
💀 ÉCHEC.
YourUsername conserve son titre.

Votre Score : 400 vs 450
```

---

## 💡 Astuces et Conseils

### Format des Codes
- **Valide :** `#NAR-1234-5678`
- **Invalide :** `NAR123`, `#NAR`

Les codes sont générés automatiquement et sont uniques.

### Persistance des Défis
- Les défis sont stockés dans Supabase
- Ils survivent au refresh de la page
- Expiration automatique après 7 jours

### Sujets Recommandés
- **Anime/Manga :** Naruto, One Piece, Dragon Ball, Attack on Titan
- **Tech :** JavaScript, React, IA, Blockchain
- **Culture :** Histoire, Géographie, Science
- **Gaming :** League of Legends, Valorant, Minecraft

### Optimiser vos Scores
- Lisez bien chaque question
- Pas de pénalité pour mauvaise réponse
- Plus vous répondez vite, plus vous gagnez de points
- Score max par question : 200 points

---

## 🚀 Nouveautés v3.0

### ✅ Défis Persistants
Les codes de défi ne disparaissent plus au refresh !

### ✅ Messages Améliorés
- Emojis pour meilleure lisibilité
- Formatage multi-lignes
- Feedback détaillé

### ✅ Codes Plus Robustes
Format `#XXX-XXXX-XXXX` pour éviter les collisions.

### ✅ Validation Améliorée
- Vérification du format de code
- Messages d'erreur explicites
- Vérification utilisateur connecté

---

## 🎨 Personnalisation

### Mode Matrix
Activez le mode Matrix pour un effet visuel cyberpunk :
```
> /matrix
```

### Thème Cyberpunk
Le terminal utilise un thème néon avec :
- Texte rose/cyan
- Effets de glow
- Animations fluides

---

## 🐛 Dépannage

### "Erreur 404: Le code de défi est introuvable"
**Cause :** Code invalide ou défi expiré (>7 jours)
**Solution :** Vérifiez le code ou demandez-en un nouveau

### "Vous devez être connecté"
**Cause :** Pas d'utilisateur authentifié
**Solution :** Connectez-vous via le bouton en haut à droite

### Le quiz ne se charge pas
**Cause :** Problème de connexion à l'IA
**Solution :** Réessayez ou rafraîchissez la page

---

## 📊 Statistiques

### Voir vos Stats
Bientôt disponible avec `/stats` :
- Total de points
- Duels gagnés/perdus
- Streak actuel
- Rang global

---

## 🎯 Prochainement

### Nouvelles Commandes
- `/leaderboard` - Top 10 des joueurs
- `/stats` - Vos statistiques
- `/fortune` - Citation inspirante
- `/8ball [question]` - Boule magique
- `/flip` - Pile ou face
- `/roll 2d6` - Lancer de dés
- `/share [code]` - Partage WhatsApp

### Nouvelles Fonctionnalités
- Système de badges
- Tournois avec brackets
- Modes de jeu (Survie, Contre-la-montre)
- Notifications en temps réel

---

## 💬 Support

Besoin d'aide ? Tapez simplement votre question dans le terminal !

**Exemples :**
```
> Comment créer un défi ?
> Pourquoi mon code ne fonctionne pas ?
> C'est quoi le mode Matrix ?
```

L'IA est là pour vous aider ! 🤖

---

## 🎉 Conclusion

Le Terminal OtaBlog v3.0 est votre portail vers une expérience de quiz interactive et sociale.

**Commencez maintenant :**
```
> /duel [votre sujet préféré]
```

**Bon jeu ! 🎮✨**
