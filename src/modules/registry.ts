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

// Registry of all available modules (Force Refresh)
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
};

export const getModule = (id: string): ConceptModule | undefined => {
    console.log(`🔍 [Registry] Attempting to get module with ID: "${id}"`);
    console.log(`📚 [Registry] Available module IDs:`, Object.keys(modules));
    const module = modules[id];
    if (module) {
        console.log(`✅ [Registry] Found module:`, module.title);
    } else {
        console.error(`❌ [Registry] Module "${id}" not found!`);
    }
    return module;
};

export const getAllModules = (): ConceptModule[] => {
    return Object.values(modules);
};
