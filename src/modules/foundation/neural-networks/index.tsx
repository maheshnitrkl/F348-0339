import type { ConceptModule } from '../../../types/module';
import { Theory } from './Theory';

export const NeuralNetworksModule: ConceptModule = {
    id: 'foundation-neural-networks',
    title: 'Neural Networks',
    description: 'From biological inspiration to mathematical models: Perceptrons, MLPs, and Activation Functions.',
    components: {
        Theory: Theory
    },
    layout: 'full'
};
