import type { ConceptModule } from '../../../types/module';
import { CalculusTheory } from './Theory';

export const CalculusModule: ConceptModule = {
    id: 'math-3',
    title: 'Calculus & Backpropagation',
    description: 'The Engine of Learning - Partial Derivatives and the Chain Rule',
    components: {
        Theory: CalculusTheory,
    },
};
