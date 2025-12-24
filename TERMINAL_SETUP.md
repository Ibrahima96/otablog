# 🚀 Guide Rapide - Configuration Terminal

## 📋 Étape 1: Créer les Tables Supabase

### 1.1 Ouvrez Supabase SQL Editor
**URL :** https://supabase.com/dashboard/project/klmqyuvsphfsfypwufkj/editor/17756

### 1.2 Exécutez les Scripts SQL (dans l'ordre)

#### Script 1 : Défis de Duel
```sql
-- Fichier: create_duel_challenges_table.sql
```
✅ Crée la table `duel_challenges` pour les défis persistants

#### Script 2 : Scores de Quiz
```sql
-- Fichier: create_quiz_scores_table.sql
```
✅ Crée la table `quiz_scores` pour le leaderboard

#### Script 3 : Triggers de Compteurs
```sql
-- Fichier: fix_counters_triggers.sql
```
✅ Crée les triggers automatiques pour likes/commentaires

---

## ✅ Étape 2: Redémarrer l'Application

```bash
# Dans le terminal, arrêtez le serveur
Ctrl+C

# Puis relancez
npm run dev
```

---

## 🎮 Étape 3: Tester les Fonctionnalités

### Test 1 : Créer un Défi
```
> /duel Naruto
```
✅ Vous devriez recevoir un code comme `#NAR-1234-5678`

### Test 2 : Persistance
1. Notez le code reçu
2. Rafraîchissez la page (F5)
3. Tapez `/join #NAR-1234-5678`
4. ✅ Le défi se charge !

### Test 3 : Chat IA
```
> Qui est le plus fort entre Goku et Saitama ?
```
✅ L'IA répond en streaming

### Test 4 : Marketplace
1. Créez un post marketplace
2. Ajoutez un numéro WhatsApp (+221...)
3. Prix en FCFA
4. ✅ Le bouton WhatsApp apparaît

---

## 📚 Documentation Complète

- **Guide Terminal :** `TERMINAL_GUIDE.md`
- **Walkthrough :** Voir artifacts
- **Supabase Setup :** `SUPABASE_VERIFICATION.md`

---

## 🎯 Nouvelles Commandes Disponibles

### Commandes de Duel
- `/duel [sujet]` - Créer un défi
- `/solo [sujet]` - Mode entraînement
- `/join [code]` - Rejoindre un défi

### Commandes Système
- `/help` - Liste des commandes
- `/clear` - Nettoyer l'historique
- `/matrix` - Mode Matrix
- `/guide` - Tutoriel animé

### Chat IA
- Tapez n'importe quelle question sans `/`

---

## 💡 Nouveautés v3.0

✅ **Défis Persistants** - Les codes survivent au refresh
✅ **Messages Améliorés** - Emojis et formatage
✅ **Devise FCFA** - Marketplace adapté au Sénégal
✅ **WhatsApp Intégré** - Contact direct vendeurs
✅ **Triggers SQL** - Compteurs automatiques
✅ **Scores Persistants** - Leaderboard permanent

---

## 🐛 Dépannage

### Erreur "table does not exist"
➡️ Exécutez les scripts SQL dans Supabase

### Erreur "whatsapp_number not found"
➡️ Exécutez `add_whatsapp_column.sql`

### Les défis ne se chargent pas
➡️ Vérifiez que `duel_challenges` existe dans Supabase

### Les compteurs restent à 0
➡️ Exécutez `fix_counters_triggers.sql`

---

## ✨ C'est Prêt !

Votre application OtaBlog v3.0 est maintenant **100% fonctionnelle** !

**Commencez à jouer :**
```
> /guide
```

🎉 **Bon jeu !**

