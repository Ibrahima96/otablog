// Test d'Ajout de Commentaire
// Ouvrez la console du navigateur (F12) et collez ce code pour tester

import { supabase } from './services/supabaseClient';

async function testComment() {
    console.log('=== TEST COMMENTAIRE ===');

    // 1. Vérifier User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('❌ ERREUR: Vous devez être connecté pour ce test');
        return;
    }
    console.log('✅ Utilisateur:', user.email);

    // 2. Récupérer un post
    const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('id')
        .limit(1);

    if (postError || !posts || posts.length === 0) {
        console.error('❌ ERREUR: Impossible de récupérer un post', postError);
        return;
    }
    
    const postId = posts[0].id;
    console.log('✅ Post trouvé:', postId);

    // 3. Tester l'ajout de commentaire
    console.log('👉 Tentative d\'ajout de commentaire...');
    
    const { data, error } = await supabase
        .from('post_comments')
        .insert({
            post_id: postId,
            user_id: user.id,
            text: 'Test commentaire depuis console ' + new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('❌ ÉCHEC de l\'ajout:', error);
        console.log('Code:', error.code);
        console.log('Message:', error.message);
        console.log('Details:', error.details);
        
        if (error.code === '42P01') {
            console.log('🚨 DIAGNOSTIC: La table "post_comments" n\'existe pas !');
            console.log('👉 SOLUTION: Exécutez le fichier community_schema.sql dans Supabase');
        } else if (error.code === '42501') {
            console.log('🚨 DIAGNOSTIC: Erreur de permission (RLS)');
            console.log('👉 SOLUTION: Vérifiez les policies RLS sur post_comments');
        }
    } else {
        console.log('✅ SUCCÈS ! Commentaire ajouté:', data);
    }
}

testComment();
