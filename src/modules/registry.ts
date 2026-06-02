import type { ConceptModule } from '../types/module';
import { CalculusProbabilityModule } from './math/gradient-descent';
import { PhilosophyModule } from './foundation/philosophy';
import { LinearAlgebraModule } from './math/linear-algebra';
import { CalculusModule } from './math/calculus';
import { BackPropagationModule } from './math/backpropagation';
import { SignalProcessingModule } from './math/signal-processing';
import { DLEfficiencyModule } from './advanced/dl-efficiency';
import { CephalometryModule } from './application/cephalometry';
import { MedicalImagingModule } from './medical-imaging';
import { StatisticalLearningModule } from './advanced/statistical-learning';
import { NeuralNetworksModule } from './foundation/neural-networks';
import { RLModule } from './advanced/rl';
import { Transformer } from './foundation/neural-networks/sections/11_Transformer';

export const TransformersModule: ConceptModule = {
    id: 'adv-3',
    title: 'Transformers',
    description: 'Self-attention, positional encoding, and the architecture revolution.',
    components: {
        Theory: Transformer,
    },
    layout: 'full',
};

// Registry of all available modules
const modules: Record<string, ConceptModule> = {
    [CalculusProbabilityModule.id]: CalculusProbabilityModule,
    [PhilosophyModule.id]: PhilosophyModule,
    [LinearAlgebraModule.id]: LinearAlgebraModule,
    [CalculusModule.id]: CalculusModule,
    [BackPropagationModule.id]: BackPropagationModule,
    [SignalProcessingModule.id]: SignalProcessingModule,
    [DLEfficiencyModule.id]: DLEfficiencyModule,
    [CephalometryModule.id]: CephalometryModule,
    [MedicalImagingModule.id]: MedicalImagingModule,
    [StatisticalLearningModule.id]: StatisticalLearningModule,
    [NeuralNetworksModule.id]: NeuralNetworksModule,
    [RLModule.id]: RLModule,
    'adv-3': TransformersModule,
};

export const getModule = (id: string): ConceptModule | undefined => {
    return modules[id];
};

export const getAllModules = (): ConceptModule[] => {
    return Object.values(modules);
};
