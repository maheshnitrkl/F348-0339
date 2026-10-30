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
import { TransformersModule } from './application/transformers';

const moduleList: ConceptModule[] = [
    CalculusProbabilityModule,
    PhilosophyModule,
    LinearAlgebraModule,
    CalculusModule,
    BackPropagationModule,
    SignalProcessingModule,
    DLEfficiencyModule,
    CephalometryModule,
    MedicalImagingModule,
    StatisticalLearningModule,
    NeuralNetworksModule,
    RLModule,
    TransformersModule,
];

const modules: Record<string, ConceptModule> = {};
for (const mod of moduleList) {
    // Two modules sharing an id used to silently overwrite each other, which made
    // a whole module unreachable from the catalog and from its roadmap node.
    if (modules[mod.id] && import.meta.env.DEV) {
        console.error(
            `Duplicate module id "${mod.id}": "${modules[mod.id].title}" is shadowed by "${mod.title}".`
        );
    }
    modules[mod.id] = mod;
}

export const getModule = (id: string): ConceptModule | undefined => {
    return modules[id];
};

export const getAllModules = (): ConceptModule[] => {
    return Object.values(modules);
};
