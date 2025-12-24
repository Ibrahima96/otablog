# 🚨 SOLUTION RAPIDE - Ajouter la colonne WhatsApp

## ⚡ Étapes à suivre MAINTENANT

### 1️⃣ Ouvrez Supabase SQL Editor

Cliquez sur ce lien : **https://supabase.com/dashboard/project/klmqyuvsphfsfypwufkj/editor/17756**

### 2️⃣ Créez une nouvelle requête

- Cliquez sur le bouton **"New query"** ou **"+"**

### 3️⃣ Copiez-collez ce code SQL

```sql
-- Ajouter la colonne whatsapp_number
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Recharger le schéma
NOTIFY pgrst, 'reload schema';
```

### 4️⃣ Exécutez le script

- Cliquez sur le bouton **"Run"** ou appuyez sur **Ctrl+Enter**

### 5️⃣ Vérifiez que ça a fonctionné

Exécutez cette requête pour vérifier :

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'marketplace_items'
ORDER BY ordinal_position;
```

Vous devriez voir `whatsapp_number | text` dans la liste.

---

## 🔄 Redémarrez votre application

Après avoir ajouté la colonne dans Supabase :

1. **Arrêtez le serveur** : Appuyez sur `Ctrl+C` dans le terminal
2. **Redémarrez** : Tapez `npm run dev`

---

## ✅ Test Final

1. Allez sur votre application
2. Créez un nouveau post marketplace
3. Remplissez le champ **"Numéro WhatsApp"**
4. Publiez
5. Allez sur la page **Shop**
6. Le bouton WhatsApp devrait maintenant apparaître ! 🎉

---

## 📝 Code SQL complet (si besoin)

Si vous voulez tout configurer d'un coup, utilisez le fichier :
**`setup_marketplace_whatsapp.sql`**

Mais pour l'instant, les 3 lignes ci-dessus suffisent !
