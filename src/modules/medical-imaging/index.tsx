import type { ConceptModule } from '../../types/module';
import { MedicalImagingTheory } from './Theory';

export const MedicalImagingModule: ConceptModule = {
    id: 'med-img-1',
    title: 'Medical Image Processing',
    description: 'Diagnose with AI: DICOM, U-Net, and Medical GenAI.',
    components: {
        Theory: MedicalImagingTheory,
    },
};
