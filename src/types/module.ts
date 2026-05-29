import React from 'react';

export interface ConceptModule {
    id: string; // Matches roadmap ID
    title: string;
    description: string;
    components: {
        Theory: React.ComponentType<Record<string, unknown>>;
        Code?: React.ComponentType<Record<string, unknown>>;
        Visualization?: React.ComponentType<Record<string, unknown>>;
    };
    // Optional: configuration for the view
    layout?: 'split' | 'full';
}
