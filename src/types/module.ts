import React from 'react';

export interface ConceptModule {
    id: string; // Matches roadmap ID
    title: string;
    description: string;
    components: {
        Theory: React.ComponentType;
        Code?: React.ComponentType;
        Visualization?: React.ComponentType;
    };
    // Optional: configuration for the view
    layout?: 'split' | 'full';
}
