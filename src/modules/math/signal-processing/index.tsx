import type { ConceptModule } from '../../../types/module';
import { SignalProcessingTheory } from './Theory';
import { SignalProcessingHub } from './components/SignalProcessingHub';
import { SignalProcessingCode } from './Code';

export const SignalProcessingModule: ConceptModule = {
    id: 'math-4',
    title: 'Signal Processing',
    description: 'Seeing Sound - From FFT to Wavelets & Biomedical Signals',
    components: {
        Theory: SignalProcessingTheory,
        Visualization: SignalProcessingHub,
        Code: SignalProcessingCode,
    },
};
