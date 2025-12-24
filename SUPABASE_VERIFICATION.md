# ✅ Guide de Vérification Supabase

## 🎯 Objectif

Vérifier que **toutes les fonctionnalités** sont correctement configurées dans votre base de données Supabase, notamment le champ `whatsapp_number` pour le marketplace.

---

## 📋 Étape 1 : Vérification Rapide

### Ouvrez le SQL Editor dans Supabase

1. Allez sur https://supabase.com/dashboard/project/klmqyuvsphfsfypwufkj/editor/17756
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **New Query**

### Exécutez le Script de Vérification

Copiez et collez le contenu du fichier [`verify_supabase.sql`](file:///c:/Users/UBS/Desktop/gravity/otablog/verify_supabase.sql) et cliquez sur **Run**.

**Résultats attendus :**
- ✅ Toutes les tables existent
- ✅ La colonne `whatsapp_number` existe dans `marketplace_items`
- ✅ Le bucket `community-media` existe
- ✅ Les RLS policies sont actives

---

## 🔧 Étape 2 : Configuration (si nécessaire)

Si la vérification montre des éléments manquants (❌), exécutez le script de configuration.

### Exécutez le Script de Configuration

1. Ouvrez une **nouvelle query** dans le SQL Editor
2. Copiez le contenu de [`setup_marketplace_whatsapp.sql`](file:///c:/Users/UBS/Desktop/gravity/otablog/setup_marketplace_whatsapp.sql)
3. Cliquez sur **Run**

**Ce script va :**
- ✅ Ajouter la colonne `whatsapp_number` si elle n'existe pas
- ✅ Créer les index pour les performances
- ✅ Configurer les RLS policies pour la sécurité
- ✅ Activer Row Level Security

---

## 📊 Vérification Manuelle

### 1. Vérifier la Table `marketplace_items`

Dans le **Table Editor** :
1. Cliquez sur `marketplace_items`
2. Vérifiez que ces colonnes existent :
   - `id` (uuid)
   - `post_id` (uuid)
   - `title` (text)
   - `description` (text)
   - `price` (numeric)
   - `currency` (text)
   - `category` (text)
   - **`whatsapp_number` (text)** ⬅️ Important !
   - `created_at` (timestamptz)

### 2. Vérifier le Storage

Dans **Storage** :
1. Vérifiez que le bucket `community-media` existe
2. Cliquez dessus
3. Vérifiez qu'il est configuré en **Public**

### 3. Vérifier les RLS Policies

Dans **Table Editor** > `marketplace_items` > **RLS Policies** :

Vous devriez voir ces policies :
- ✅ `Public can view marketplace items` (SELECT)
- ✅ `Authenticated users can create marketplace items` (INSERT)
- ✅ `Users can update own marketplace items` (UPDATE)
- ✅ `Users can delete own marketplace items` (DELETE)

---

## 🧪 Test Fonctionnel

### Tester la Création d'un Produit

1. Lancez votre application : `npm run dev`
2. Connectez-vous
3. Allez dans la **Communauté**
4. Cliquez sur **CRÉER UN POST**
5. Sélectionnez **Marketplace**
6. Remplissez le formulaire :
   - Titre
   - Description
   - Prix
   - Catégorie
   - **Numéro WhatsApp** (ex: +33612345678)
7. Uploadez une image
8. Cliquez sur **PUBLIER**

### Vérifier dans Supabase

1. Allez dans **Table Editor** > `marketplace_items`
2. Vous devriez voir votre nouveau produit
3. Vérifiez que la colonne `whatsapp_number` contient votre numéro

### Tester le Lien WhatsApp

1. Allez sur la **page Shop** (cliquez sur "Shop" dans la navigation)
2. Trouvez votre produit
3. Cliquez dessus pour ouvrir les détails
4. Cliquez sur **CONTACTER SUR WHATSAPP**
5. WhatsApp devrait s'ouvrir avec un message pré-rempli

---

## 🚨 Dépannage

### ❌ Erreur : "column whatsapp_number does not exist"

**Solution :**
Exécutez le script [`setup_marketplace_whatsapp.sql`](file:///c:/Users/UBS/Desktop/gravity/otablog/setup_marketplace_whatsapp.sql)

### ❌ Erreur : "permission denied for table marketplace_items"

**Solution :**
Les RLS policies ne sont pas configurées. Exécutez le script de configuration.

### ❌ Le bouton WhatsApp ne s'affiche pas

**Vérifications :**
1. Le produit a-t-il un numéro WhatsApp dans la base de données ?
2. Le numéro est-il au bon format ? (ex: +33612345678)
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

### ❌ Le lien WhatsApp ne fonctionne pas

**Vérifications :**
1. WhatsApp est-il installé sur votre appareil ?
2. Le numéro est-il valide ?
3. Format recommandé : `+[code pays][numéro]` (ex: +33612345678)

---

## 📝 Checklist Complète

Cochez au fur et à mesure :

### Base de Données
- [ ] Table `posts` existe
- [ ] Table `marketplace_items` existe
- [ ] Table `post_likes` existe
- [ ] Table `post_comments` existe
- [ ] Table `profiles` existe
- [ ] Colonne `whatsapp_number` existe dans `marketplace_items`

### Storage
- [ ] Bucket `community-media` existe
- [ ] Bucket est configuré en **Public**
- [ ] Policies de storage sont actives

### RLS Policies
- [ ] RLS activé sur `marketplace_items`
- [ ] Policy SELECT (lecture publique)
- [ ] Policy INSERT (création authentifiée)
- [ ] Policy UPDATE (modification propriétaire)
- [ ] Policy DELETE (suppression propriétaire)

### Tests Fonctionnels
- [ ] Création d'un post marketplace fonctionne
- [ ] Upload d'image fonctionne
- [ ] Numéro WhatsApp est sauvegardé
- [ ] Page Shop affiche les produits
- [ ] Bouton WhatsApp s'affiche
- [ ] Lien WhatsApp fonctionne

---

## 🎉 Tout est OK ?

Si toutes les vérifications sont ✅, votre application est **100% fonctionnelle** !

Vous pouvez maintenant :
- 🛍️ Créer des produits avec contact WhatsApp
- 📱 Partager vos articles avec la communauté
- 💬 Recevoir des messages directs sur WhatsApp
- 🔍 Rechercher et filtrer les produits dans le Shop

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez les erreurs dans le SQL Editor de Supabase
3. Assurez-vous que vos variables d'environnement sont correctes (`.env`)
