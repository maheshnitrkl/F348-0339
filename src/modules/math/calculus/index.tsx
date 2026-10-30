import type { ConceptModule } from '../../../types/module';
import { CalculusTheory } from './Theory';
import { CalculusCode } from './Code';

export const CalculusModule: ConceptModule = {
    // Must not collide with the Backpropagation module ('math-3'): two registry
    // entries with the same id silently drop one of the modules.
    id: 'math-calc',
    title: 'Calculus & Gradients',
    description: 'Partial derivatives and the chain rule — the mechanics behind gradient-based learning.',
    components: {
        Theory: CalculusTheory,
        Code: CalculusCode,
    },
};

