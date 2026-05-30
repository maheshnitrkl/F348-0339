import type { ConceptModule } from '../../../types/module';
import { RLTheory } from './Theory';

export const RLModule: ConceptModule = {
    id: 'rl-1',
    title: 'Reinforcement Learning',
    description: 'Agents, rewards, policies, and learning from interaction.',
    components: {
        Theory: RLTheory,
    },
    layout: 'full',
};
