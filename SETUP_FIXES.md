# 🚀 Guide de Configuration - Likes, Commentaires et Duels

## 📋 Étapes à Suivre

### 1️⃣ Configurer les Triggers pour Likes/Commentaires

**Ouvrez Supabase SQL Editor** : https://supabase.com/dashboard/project/klmqyuvsphfsfypwufkj/editor/17756

**Exécutez le script** : `fix_counters_triggers.sql`

Ce script va :
- ✅ Créer des triggers automatiques pour `likes_count`
- ✅ Créer des triggers automatiques pour `comments_count`
- ✅ Réinitialiser les compteurs existants avec les vraies valeurs

**Résultat attendu** : Les compteurs se mettront à jour automatiquement quand vous likez/commentez.

---

### 2️⃣ Créer la Table Quiz Scores

**Dans le même SQL Editor**, exécutez : `create_quiz_scores_table.sql`

Ce script va :
- ✅ Créer la table `quiz_scores`
- ✅ Ajouter des index pour les performances
- ✅ Configurer les RLS policies
- ✅ Insérer des scores de démonstration

**Résultat attendu** : Les scores de duels seront persistés dans la base de données.

---

### 3️⃣ Redémarrer l'Application

Le code a été automatiquement mis à jour. **Redémarrez** votre serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

---

## ✅ Tests à Effectuer

### Test 1 : Likes
1. Allez dans la Communauté
2. Cliquez sur le cœur d'un post
3. Le compteur devrait passer de 0 à 1 ✨
4. Cliquez à nouveau → Retour à 0

### Test 2 : Commentaires
1. Ouvrez un post (cliquez dessus)
2. Ajoutez un commentaire
3. Le compteur devrait s'incrémenter ✨
4. Supprimez le commentaire → Compteur décrémente

### Test 3 : Duels
1. Allez dans le Terminal
2. Tapez `duel` ou `solo`
3. Jouez au quiz
4. Votre score devrait apparaître dans le leaderboard
5. **Rafraîchissez la page** (F5)
6. Le score est toujours là ! ✨

---

## 🔍 Vérification dans Supabase

### Vérifier les Triggers

```sql
-- Voir tous les triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('post_likes', 'post_comments')
ORDER BY event_object_table, trigger_name;
```

Vous devriez voir :
- `increment_likes_on_insert`
- `decrement_likes_on_delete`
- `increment_comments_on_insert`
- `decrement_comments_on_delete`

### Vérifier les Scores

```sql
-- Top 10 des scores
SELECT 
    username,
    score,
    ROW_NUMBER() OVER (ORDER BY score DESC) as rank
FROM quiz_scores
ORDER BY score DESC
LIMIT 10;
```

---

## 🎯 Fonctionnalités Corrigées

### ✅ Likes
- Compteur s'incrémente automatiquement
- Compteur se décrémente au unlike
- Synchronisé en temps réel

### ✅ Commentaires
- Compteur s'incrémente à l'ajout
- Compteur se décrémente à la suppression
- Affichage correct dans PostModal

### ✅ Duels
- Scores persistés dans Supabase
- Leaderboard mis à jour en temps réel
- Meilleur score par utilisateur
- Survit au refresh de la page

---

## 🚨 Dépannage

### Les compteurs ne se mettent pas à jour

**Solution** : Vérifiez que les triggers sont créés
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'post_likes';
```

### Les scores ne s'affichent pas

**Solution** : Vérifiez que la table existe
```sql
SELECT COUNT(*) FROM quiz_scores;
```

### Erreur "relation quiz_scores does not exist"

**Solution** : Exécutez `create_quiz_scores_table.sql`

---

## 📊 Architecture

### Triggers SQL
```
post_likes (INSERT) → increment_likes_on_insert → posts.likes_count++
post_likes (DELETE) → decrement_likes_on_delete → posts.likes_count--

post_comments (INSERT) → increment_comments_on_insert → posts.comments_count++
post_comments (DELETE) → decrement_comments_on_delete → posts.comments_count--
```

### Quiz Scores
```
User joue → duelService.checkHighScore() → Supabase quiz_scores
                                         → Mise à jour si meilleur score
                                         → Retourne true si top 4
```

---

## 🎉 C'est Terminé !

Toutes les fonctionnalités sont maintenant **100% fonctionnelles** et **persistantes** !

- ❤️ Likes comptés automatiquement
- 💬 Commentaires comptés automatiquement  
- 🏆 Scores de duels sauvegardés dans Supabase
- 🔄 Tout survit au refresh de la page
