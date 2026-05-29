/* eslint-disable */
import { ScatterChart, BarChart } from 'lucide-react';
import type { ConceptModule } from '../../../types/module';
import { Theory } from './Theory';

export const StatisticalLearningModule: ConceptModule = {
    id: 'adv-2',
    title: 'Statistical Learning',
    description: 'Bridging classical statistics and modern machine learning: Bias-Variance, Regularization, and SVMs.',
    components: {
        Theory: Theory,
    },
    layout: 'full',
};
