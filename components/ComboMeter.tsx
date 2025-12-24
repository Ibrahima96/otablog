import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

interface ComboMeterProps {
    combo: number;
}

const ComboMeter: React.FC<ComboMeterProps> = ({ combo }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (combo >= 2) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [combo]);

    if (combo < 2) return null;

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key="combo-meter"
                    className="fixed bottom-8 left-8 z-40 bg-black/80 backdrop-blur-md border border-orange-500/50 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                >
                    <div className="relative">
                        <Flame size={32} className="text-orange-500 animate-pulse" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="absolute inset-0 blur-lg bg-orange-500/50 rounded-full"
                        />
                    </div>
                    <div>
                        <div className="text-xs font-mono text-orange-400 tracking-widest uppercase">Combo</div>
                        <div className="text-3xl font-black text-white italic">
                            {combo}x
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ComboMeter;
