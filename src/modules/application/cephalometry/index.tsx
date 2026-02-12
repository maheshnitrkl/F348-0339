import type { ConceptModule } from '../../../types/module';
import { CephalometryTheory } from './Theory';

export const CephalometryModule: ConceptModule = {
    id: 'app-1',
    title: '3D Cephalometric Landmark Detection',
    description: 'Medical imaging in 3D coordinate systems',
    components: {
        Theory: CephalometryTheory,
    },
};
