import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FeedbackType = 'success' | 'error' | 'combo';

interface FeedbackContextType {
    triggerFeedback: (type: FeedbackType) => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (!context) throw new Error('useFeedback must be used within FeedbackProperties');
    return context;
};

export const FeedbackOverseer: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [shake, setShake] = useState(false);
    const [flash, setFlash] = useState<'green' | 'red' | null>(null);

    const triggerFeedback = useCallback((type: FeedbackType) => {
        if (type === 'error') {
            setShake(true);
            setFlash('red');
            setTimeout(() => {
                setShake(false);
                setFlash(null);
            }, 500);
        } else if (type === 'success') {
            setFlash('green');
            setTimeout(() => setFlash(null), 500);
        }
    }, []);

    return (
        <FeedbackContext.Provider value={{ triggerFeedback }}>
            <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative min-h-screen w-full"
            >
                {children}

                {/* Flash Overlay */}
                <AnimatePresence>
                    {flash && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.2 }}
                            exit={{ opacity: 0 }}
                            className={`fixed inset-0 pointer-events-none z-50 ${flash === 'green' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </FeedbackContext.Provider>
    );
};
