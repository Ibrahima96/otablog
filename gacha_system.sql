-- ============================================
-- SYSTEME GACHA D'INVOCATION
-- ============================================

-- 1. SEED DE NOUVEAUX BADGES (ITEMS GACHA)
-- On ajoute des items sympas pour le Gacha
INSERT INTO badges (slug, name, description, icon, rarity, xp_reward, aura_reward) VALUES 
('cyber_katana', 'Cyber Katana', 'Une lame forgée dans des bits de données.', '🗡️', 'epic', 500, 0),
('mecha_helmet', 'Casque Mecha', 'Interface neuronale directe.', '🤖', 'rare', 200, 0),
('ramen_bowl', 'Rame Ultime', 'Nourriture des dieux otaku.', '🍜', 'common', 50, 0),
('retro_console', 'Console Rétro', 'Pour les vrais nostalgiques.', '🕹️', 'common', 50, 0),
('golden_ticket', 'Ticket Doré', 'Accès VIP au sanctuaire.', '🎫', 'legendary', 1000, 0),
('neon_sneakers', 'Baskets Néon', 'Courent plus vite que la lumière.', '👟', 'rare', 150, 0),
('dragon_scales', 'Écailles de Dragon', 'Matériau d''artisanat rare.', '🐉', 'epic', 600, 0),
('mystery_potion', 'Potion Mystère', 'Goutte bizarre, effet inconnu.', '🧪', 'common', 20, 0)
ON CONFLICT (slug) DO NOTHING;

-- 2. FONCTION DE TIRAGE GACHA (Weighted Random)
CREATE OR REPLACE FUNCTION perform_summon(p_user_id UUID, p_cost INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_user_aura INTEGER;
    v_roll FLOAT;
    v_rarity TEXT;
    v_badge RECORD;
    v_outcome TEXT;
    v_xp_refund INTEGER DEFAULT 50; -- XP donné si doublon
BEGIN
    -- 1. Vérifier l'Aura
    SELECT aura INTO v_user_aura FROM profiles WHERE id = p_user_id;
    
    IF v_user_aura < p_cost OR v_user_aura IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pas assez d''Aura !');
    END IF;

    -- 2. Déduire le coût
    UPDATE profiles SET aura = aura - p_cost WHERE id = p_user_id;

    -- 3. Déterminer la rareté (RNG)
    v_roll := random();
    
    IF v_roll < 0.05 THEN
        v_rarity := 'legendary'; -- 5%
    ELSIF v_roll < 0.20 THEN
        v_rarity := 'epic';      -- 15% (total cumulé 20%)
    ELSIF v_roll < 0.50 THEN
        v_rarity := 'rare';      -- 30% (total cumulé 50%)
    ELSE
        v_rarity := 'common';    -- 50%
    END IF;

    -- 4. Choisir un badge aléatoire de cette rareté
    -- S'il n'y a pas de badge de cette rareté, fallback sur common
    SELECT * INTO v_badge 
    FROM badges 
    WHERE rarity = v_rarity 
    ORDER BY random() 
    LIMIT 1;

    IF v_badge IS NULL THEN
         SELECT * INTO v_badge FROM badges WHERE rarity = 'common' ORDER BY random() LIMIT 1;
    END IF;

    -- 5. Vérifier si doublon
    PERFORM 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id;
    
    IF FOUND THEN
        -- Doublon : On donne de l'XP en compensation
        UPDATE profiles SET xp = xp + v_xp_refund WHERE id = p_user_id;
        v_outcome := 'duplicate';
    ELSE
        -- Nouveau : On insère
        INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        v_outcome := 'new';
    END IF;

    -- 6. Retourner le résultat
    RETURN jsonb_build_object(
        'success', true,
        'outcome', v_outcome,
        'badge', jsonb_build_object(
            'id', v_badge.id,
            'name', v_badge.name,
            'slug', v_badge.slug,
            'icon', v_badge.icon,
            'rarity', v_badge.rarity,
            'description', v_badge.description
        ),
        'remaining_aura', v_user_aura - p_cost
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION perform_summon TO authenticated;
