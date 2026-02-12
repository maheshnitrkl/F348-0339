import React from 'react';
import type { ConceptModule } from '../../../types/module';

// Minimal Content for Debugging
const BackPropagationContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-24">
            <h1 className="text-4xl font-bold text-cyan-400">Backpropagation Module (Safe Mode)</h1>
            <p className="mt-4">If you can see this, the module routing and registry are working correctly.</p>
            <p className="mt-2 text-gray-400">Debugging component integration...</p>
        </div>
    );
};

export const BackPropagationModule: ConceptModule = {
    id: 'math-3',
    title: 'Backpropagation',
    description: 'The engine of learning: Computational graphs & chain rule.',
    components: {
        Theory: BackPropagationContent,
    },
};
