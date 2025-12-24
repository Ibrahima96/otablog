import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Lock } from 'lucide-react';

interface Challenge {
    id: string;
    title: string;
    description: string;
    reward: string;
    completed: boolean;
    locked: boolean;
    icon: React.ReactNode;
}

const DAILY_CHALLENGES: Challenge[] = [
    {
        id: '1',
        title: "Première Victoire",
        description: "Gagnez une partie de Quiz Battle aujourd'hui",
        reward: "50 XP",
        completed: true,
        locked: false,
        icon: <Star size={20} className="text-yellow-400" />
    },
    {
        id: '2',
        title: "Expert Shonen",
        description: "Répondez correctement à 5 questions Shonen d'affilée",
        reward: "Badge Shonen",
        completed: false,
        locked: false,
        icon: <Star size={20} className="text-neonPink" />
    },
    {
        id: '3',
        title: "Marathon Otaku",
        description: "Jouez 30 minutes au total",
        reward: "100 XP",
        completed: false,
        locked: true,
        icon: <Lock size={20} className="text-gray-500" />
    }
];

const DailyChallenges: React.FC = () => {
    return (
        <div className="bg-midnight/30 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="text-yellow-400 fill-current" /> Défis Du Jour
            </h3>

            <div className="space-y-4">
                {DAILY_CHALLENGES.map((challenge) => (
                    <div
                        key={challenge.id}
                        className={`flex items-center p-3 rounded-lg border transition-all ${challenge.completed
                                ? 'bg-green-500/10 border-green-500/30'
                                : challenge.locked
                                    ? 'bg-white/5 border-white/5 opacity-50'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="mr-3 p-2 rounded-full bg-black/20">
                            {challenge.completed ? <CheckCircle size={16} className="text-green-400" /> : challenge.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm font-bold ${challenge.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                {challenge.title}
                            </h4>
                            <p className="text-xs text-gray-400">{challenge.description}</p>
                        </div>
                        <div className="text-xs font-mono font-bold text-cyanLight bg-cyanLight/10 px-2 py-1 rounded">
                            {challenge.reward}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyChallenges;
