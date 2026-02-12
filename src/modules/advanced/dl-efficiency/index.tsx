import type { ConceptModule } from '../../../types/module';
import { DLEfficiencyTheory } from './Theory';

export const DLEfficiencyModule: ConceptModule = {
    id: 'adv-5',
    title: 'Memory Optimization & Training Acceleration',
    description: 'Gradient Checkpointing and Mixed Precision Training',
    components: {
        Theory: DLEfficiencyTheory,
    },
};
