# 🗄️ Supabase Setup Guide

## Étape 1: Exécuter la Migration SQL

1. Ouvrez votre [dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Cliquez sur **New query**
5. Copiez-collez le contenu du fichier `supabase/migrations/001_community_tables.sql`
6. Cliquez sur **Run** pour exécuter la migration

La migration va créer :
- ✅ Tables : `posts`, `marketplace_items`, `post_likes`, `post_comments`
- ✅ Storage bucket : `community-media` (pour images/vidéos)
- ✅ Row Level Security (RLS) policies
- ✅ Triggers automatiques pour les compteurs de likes/comments
- ✅ Index pour optimiser les performances

## Étape 2: Vérifier la  Configuration

### Vérifier les Tables
1. Allez dans **Table Editor**
2. Vous devriez voir les tables : `posts`, `marketplace_items`, `post_likes`, `post_comments`

### Vérifier le Storage
1. Allez dans **Storage**
2. Vous devriez voir le bucket `community-media`
3. Cliquez dessus et vérifiez qu'il est configuré en **Public**

### Vérifier RLS
1. Dans **Table Editor**, cliquez sur une table (ex: `posts`)
2. Allez dans l'onglet **RLS Policies**
3. Vous devriez voir plusieurs policies actives

## Étape 3: Tester l'Application

1. **Démarrez votre serveur** : `npm run dev`
2. **Connectez-vous** avec un compte existant ou créez-en un nouveau
3. **Naviguez vers la section Communauté**
4. **Créez un post** :
   - Cliquez sur "CRÉER UN POST"
   - Sélectionnez un type (Image/Vidéo/Marketplace)
   - Uploadez un fichier ou remplissez le formulaire
   - Cliquez sur "PUBLIER"

## 🎯 Fonctionnalités Disponibles

### Pour les Posts
- ✅ Créer des posts (image/vidéo/marketplace)
- ✅ Upload de fichiers vers Supabase Storage
- ✅ Voir tous les posts de la communauté
- ✅ Filtrer par type de post
- ✅ Pagination (charger plus)
- ✅ Liker/unliker des posts
- ✅ Supprimer ses propres posts

### Pour le Marketplace
- ✅ Créer des annonces avec titre, prix, catégorie
- ✅ Afficher les détails des articles en vente
- ✅ Catégories : article, vêtement, accessoire, autre

## 📝 Structure de la Base de Données

### Table `posts`
```sql
id              UUID
user_id         UUID (foreign key to auth.users)
type            TEXT ('image', 'video', 'marketplace')
caption         TEXT
media_url       TEXT (nullable)
created_at      TIMESTAMPTZ
likes_count     INTEGER
comments_count  INTEGER
```

### Table `marketplace_items`
```sql
id          UUID
post_id     UUID (foreign key to posts)
title       TEXT
description TEXT
price       DECIMAL
currency    TEXT
category    TEXT
```

### Storage `community-media`
Structure des fichiers : `{user_id}/{timestamp}.{ext}`
- Accès public en lecture
- Upload restreint aux utilisateurs authentifiés
- Suppression uniquement par le propriétaire

## 🔧 Dépannage

### Erreur "relation does not exist"
➡️ La migration n'a pas été exécutée. Retournez à l'Étape 1.

### Erreur "permission denied"
➡️ Vérifiez que les RLS policies sont actives.

### Upload de fichiers échoue
➡️ Vérifiez que le bucket `community-media` existe et est public.

### Posts ne s'affichent pas
➡️ Ouvrez la console du navigateur (F12) pour voir les erreurs détaillées.

## 📦 Variables d'Environnement Requises

Assurez-vous que votre fichier `.env` contient :

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Prochaines Étapes (Optionnel)

- [ ] Implémenter les commentaires
- [ ] Ajouter la recherche de posts
- [ ] Notifications en temps réel (Supabase Realtime)
- [ ] Système de modération
- [ ] Profils utilisateurs personnalisés
