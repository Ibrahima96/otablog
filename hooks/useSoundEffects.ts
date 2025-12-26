import { useCallback } from 'react';

// Sons par défaut (Data URIs courts pour l'exemple, à remplacer par de vrais fichiers)
// Note: Pour une prod, utiliser des fichiers .mp3/.wav dans public/sounds/
const SOUNDS = {
    hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Bip court
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Click tech
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Success chime
    error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Error buzz
    gacha_roll: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3', // Mechanical roll
    gacha_reveal: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Tada reveal
};

export const useSoundEffects = () => {
    const play = useCallback((soundName: keyof typeof SOUNDS, volume = 0.5) => {
        try {
            const audio = new Audio(SOUNDS[soundName]);
            audio.volume = volume;
            audio.play().catch(err => {
                // Autoplay policy might block audio if no user interaction first
                console.warn('Audio play failed:', err);
            });
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }, []);

    return {
        playHover: () => play('hover', 0.1),
        playClick: () => play('click', 0.2),
        playSuccess: () => play('success', 0.3),
        playError: () => play('error', 0.2),
        playGachaRoll: () => play('gacha_roll', 0.4),
        playGachaReveal: () => play('gacha_reveal', 0.5),
    };
};
