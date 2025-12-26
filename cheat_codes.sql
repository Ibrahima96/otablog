-- ============================================
-- CHEAT CODES / TEST UTILS
-- ============================================

-- 1. SE DONNER DE L'AURA (Monnaie)
-- Remplace l'email ci-dessous par le tien
UPDATE profiles
SET aura = aura + 5000,
    xp = xp + 1000
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'ton-email@ici.com'
);

-- Alternative : Tout le monde devient riche (pour tester en local)
-- UPDATE profiles SET aura = 5000;

-- 2. RESET DU GACHA (Supprimer les badges d'un user)
-- DELETE FROM user_badges 
-- WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'ton-email@ici.com');

-- 3. VÉRIFIER SON SOLDE
-- SELECT username, aura, xp FROM profiles;
