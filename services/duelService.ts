import { QuizScore } from '../types';

// Mock initial data
const INITIAL_TOP_DUELISTS: QuizScore[] = [
    { userId: 'god_1', username: 'Saitama_99', score: 99999, rank: 1, avatarUrl: '' },
    { userId: 'solo_2', username: 'Kirito_Solo', score: 85000, rank: 2, avatarUrl: '' },
    { userId: 'pro_3', username: 'Faker_KR', score: 72400, rank: 3, avatarUrl: '' },
    { userId: 'noob_4', username: 'NoobMaster69', score: 68000, rank: 4, avatarUrl: '' },
];

class DuelService {
    private topScores: QuizScore[] = [...INITIAL_TOP_DUELISTS];

    async getTopDuelists(): Promise<QuizScore[]> {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...this.topScores];
    }

    async checkHighScore(score: number, username: string): Promise<boolean> {
        // Check if score qualifies for top 4
        const lowestTopScore = this.topScores.length < 4 ? 0 : this.topScores[3].score;

        if (score > lowestTopScore) {
            // Add new score
            const newEntry: QuizScore = {
                userId: `user_${Date.now()}`,
                username,
                score,
                rank: 0, // Will be recalculated
                avatarUrl: ''
            };

            this.topScores.push(newEntry);

            // Sort desc
            this.topScores.sort((a, b) => b.score - a.score);

            // Keep top 4
            this.topScores = this.topScores.slice(0, 4);

            // Recalculate ranks
            this.topScores = this.topScores.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));

            return true; // High score updated
        }

        return false;
    }
}

export const duelService = new DuelService();
