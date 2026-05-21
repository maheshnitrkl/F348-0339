import React from 'react';

export interface ConceptModule {
    id: string; // Matches roadmap ID
    title: string;
    description: string;
    components: {
        Theory: React.ComponentType<any>;
        Code?: React.ComponentType<any>;
        Visualization?: React.ComponentType<any>;
    };
    // Optional: configuration for the view
    layout?: 'split' | 'full';
}
