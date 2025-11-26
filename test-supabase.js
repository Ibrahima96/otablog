// Test de Connexion Supabase et Création de Post
// Ouvrez la console du navigateur (F12) et collez ce code pour tester

import { supabase } from './services/supabaseClient';

// Test 1: Vérifier la connexion Supabase
console.log('=== TEST 1: Connexion Supabase ===');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase configuré:', !!supabase);

// Test 2: Vérifier l'utilisateur connecté
console.log('\n=== TEST 2: Utilisateur ===');
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
console.log('User ID:', user?.id);

if (!user) {
    console.error('❌ ERREUR: Aucun utilisateur connecté!');
    console.log('👉 Solution: Connectez-vous d\'abord');
} else {
    console.log('✅ Utilisateur connecté');
}

// Test 3: Vérifier l'accès aux tables
console.log('\n=== TEST 3: Accès aux tables ===');
const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .limit(1);

if (postsError) {
    console.error('❌ Erreur accès table posts:', postsError);
    console.log('Message:', postsError.message);
    console.log('Code:', postsError.code);
    console.log('Détails:', postsError.details);
    
    if (postsError.message.includes('does not exist')) {
        console.log('👉 Solution: Exécutez la migration SQL dans Supabase Dashboard');
    }
} else {
    console.log('✅ Table posts accessible');
    console.log('Nombre de posts:', posts?.length || 0);
}

// Test 4: Essayer de créer un post simple
if (user) {
    console.log('\n=== TEST 4: Création d\'un post test ===');
    
    const testPost = {
        user_id: user.id,
        type: 'image',
        caption: 'Test post créé depuis le debugger',
        media_url: null
    };
    
    console.log('Données du post:', testPost);
    
    const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert(testPost)
        .select()
        .single();
    
    if (insertError) {
        console.error('❌ Erreur création post:', insertError);
        console.log('Message:', insertError.message);
        console.log('Code:', insertError.code);
        console.log('Détails:', insertError.details);
        console.log('Hint:', insertError.hint);
        
        if (insertError.message.includes('policy')) {
            console.log('👉 Solution: Problème de Row Level Security (RLS)');
            console.log('Vérifiez les policies dans Table Editor > posts > RLS Policies');
        }
    } else {
        console.log('✅ Post créé avec succès!');
        console.log('Post ID:', newPost.id);
        console.log('Post:', newPost);
    }
}

// Test 5: Vérifier le storage bucket
console.log('\n=== TEST 5: Storage Bucket ===');
const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();

if (bucketsError) {
    console.error('❌ Erreur buckets:', bucketsError);
} else {
    console.log('✅ Buckets disponibles:', buckets.map(b => b.name));
    const communityBucket = buckets.find(b => b.name === 'community-media');
    if (communityBucket) {
        console.log('✅ Bucket community-media trouvé');
        console.log('Public:', communityBucket.public);
    } else {
        console.log('❌ Bucket community-media NON trouvé');
        console.log('👉 Solution: Créez le bucket ou exécutez la migration SQL');
    }
}

console.log('\n=== FIN DES TESTS ===');
console.log('Regardez les résultats ci-dessus pour identifier le problème');
