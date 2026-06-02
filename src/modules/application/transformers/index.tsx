import type { ConceptModule } from '../../../types/module';
import { Theory } from './Theory';
import { Visualization } from './Visualization';
import { Code } from './Code';

export const TransformersModule: ConceptModule = {
    id: 'adv-3',
    title: 'Transformers',
    description: 'Self-attention, positional encoding, and the architecture revolution.',
    components: {
        Theory: Theory,
        Visualization: Visualization,
        Code: Code
    }
};
