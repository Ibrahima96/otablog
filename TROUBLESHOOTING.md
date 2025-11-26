# 🐛 Guide de Dépannage : Échec de Création de Post

## Étape 1 : Vérifier la Console du Navigateur

1. Ouvrez les outils de développement : **F12**
2. Allez dans l'onglet **Console**
3. Essayez de créer un post
4. Regardez l'erreur complète

### Erreurs Courantes et Solutions :

#### ❌ "relation 'posts' does not exist"
**Cause :** Les tables n'ont pas été créées  
**Solution :** Exécutez la migration SQL (voir Étape 2)

#### ❌ "new row violates row-level security policy"
**Cause :** Problème de permissions RLS  
**Solution :** Vérifiez que vous êtes connecté et que les policies RLS sont correctes (voir Étape 3)

#### ❌ "storage/bucket-not-found"
**Cause :** Le bucket `community-media` n'existe pas  
**Solution :** Créez le bucket manuellement ou via la migration SQL

#### ❌ "Invalid user ID" ou "user is null"
**Cause :** L'utilisateur n'est pas authentifié correctement  
**Solution :** Déconnectez-vous et reconnectez-vous

---

## Étape 2 : Exécuter la Migration SQL

### Instructions Détaillées :

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez au SQL Editor**
   - Menu gauche → **SQL Editor**
   - Cliquez sur **New query**

3. **Copiez la Migration**
   - Ouvrez `supabase/migrations/001_community_tables.sql`
   - Copiez TOUT le contenu (Ctrl+A, Ctrl+C)

4. **Exécutez la Migration**
   - Collez dans l'éditeur SQL
   - Cliquez sur **Run** (en bas à droite)
   - Attendez le message "Success"

5. **Vérifiez les Tables**
   - Menu gauche → **Table Editor**
   - Vous devriez voir : `posts`, `marketplace_items`, `post_likes`, `post_comments`

---

## Étape 3 : Vérifier les Permissions (RLS)

### Dans Supabase Dashboard :

1. **Table Editor** → Sélectionnez `posts`
2. Cliquez sur **RLS Policies**
3. Vérifiez que ces policies existent :
   - ✅ "Posts are viewable by everyone" (SELECT)
   - ✅ "Users can create their own posts" (INSERT)
   - ✅ "Users can update their own posts" (UPDATE)
   - ✅ "Users can delete their own posts" (DELETE)

4. Si elles manquent, ré-exécutez la migration SQL

---

## Étape 4 : Vérifier le Storage Bucket

1. **Storage** (menu gauche)
2. Vérifiez que `community-media` existe
3. Si non :
   - Cliquez **New bucket**
   - Nom : `community-media`
   - Cochez **Public bucket**
   - Créez

---

## Étape 5 : Vérifier l'Authentification

### Test Simple :

```javascript
// Dans la console du navigateur (F12), tapez :
console.log(supabase.auth.getUser());
```

**Résultat attendu :** Vous devriez voir votre objet `user` avec un `id`

**Si `user` est null :**
1. Déconnectez-vous
2. Reconnectez-vous
3. Réessayez

---

## Étape 6 : Test Manuel dans Supabase

### Créer un Post Manuellement :

1. **Table Editor** → `posts`
2. Cliquez **Insert row**
3. Remplissez :
   ```
   user_id: [votre UUID d'utilisateur]
   type: image
   caption: Test post
   media_url: null
   ```
4. Cliquez **Save**

**Si ça fonctionne :** Le problème vient du code frontend  
**Si ça échoue :** Le problème vient de la configuration Supabase

---

## Étape 7 : Vérifier les Variables d'Environnement

### Fichier `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

### Vérification :

1. Les variables commencent bien par `VITE_`
2. L'URL et la clé sont correctes (copiées depuis Supabase Dashboard → Settings → API)
3. **Redémarrez le serveur** après modification du `.env` : `npm run dev`

---

## Étape 8 : Mode Debug Avancé

### Ajoutez des Logs dans `communityService.ts` :

```typescript
// Dans createPost(), ligne ~56
console.log('Creating post with:', {
  userId,
  type: params.type,
  caption: params.caption,
  hasFile: !!params.mediaFile
});

// Après l'insert
console.log('Post created:', postData);
```

Rechargez la page et essayez de créer un post. Regardez les logs dans la console.

---

## Solutions Rapides

### Solution 1 : Reset Complet

```bash
# 1. Stop le serveur (Ctrl+C)
# 2. Clear cache
rm -rf node_modules/.vite

# 3. Redémarrer
npm run dev
```

### Solution 2 : Vérifier User ID

Dans `CreatePostModal.tsx`, ajoutez avant `createPost()` :

```typescript
console.log('User ID:', user.id);
if (!user.id) {
  alert('Erreur: User ID manquant');
  return;
}
```

---

## Checklist de Diagnostic

- [ ] Migration SQL exécutée
- [ ] Tables `posts`, `marketplace_items` visibles dans Table Editor
- [ ] Bucket `community-media` existe dans Storage
- [ ] RLS policies actives sur la table `posts`
- [ ] Variables `.env` avec préfixe `VITE_`
- [ ] Serveur redémarré après modification `.env`
- [ ] Utilisateur connecté (vérifiable dans console)
- [ ] Console du navigateur ouverte pour voir l'erreur

---

## Besoin d'Aide ?

**Informations à fournir :**
1. Message d'erreur exact dans la console
2. Capture d'écran de Table Editor montrant les tables
3. Confirmation que la migration SQL a été exécutée
4. À quelle étape précise ça bloque (sélection fichier, formulaire, ou après "PUBLIER")

---

## Test Minimal

**Pour tester sans fichier (plus simple) :**

1. Créez un post **Marketplace** (pas besoin de fichier)
2. Remplissez : titre, prix, description
3. Cliquez PUBLIER
4. Si ça marche → le problème vient de l'upload de fichiers
5. Si ça échoue → le problème est plus profond (tables/RLS)
