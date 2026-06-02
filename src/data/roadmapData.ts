export interface SkillNode {
    id: string;
    label: string;
    description: string;
    category: 'foundation' | 'math' | 'advanced' | 'application';
    track: string;       // Track row grouping
    order: number;       // Left-to-right order within track
    connections: string[]; // IDs of downstream nodes
    status: 'locked' | 'unlocked' | 'completed' | 'in-progress';
}

export interface Track {
    id: string;
    label: string;
    category: 'foundation' | 'math' | 'advanced' | 'application';
    icon: string;
    description: string;
}

export const tracks: Track[] = [
    { id: 'foundation', label: 'Foundation', category: 'foundation', icon: '🧠', description: 'Core concepts and philosophy of intelligence' },
    { id: 'math', label: 'Mathematics', category: 'math', icon: '∑', description: 'The language of machine learning' },
    { id: 'advanced', label: 'Advanced', category: 'advanced', icon: '⚡', description: 'Deep architectures and optimization' },
    { id: 'application', label: 'Application', category: 'application', icon: '🚀', description: 'Real-world systems and generative models' },
];

export const roadmapData: SkillNode[] = [
    // --- Foundation Track ---
    {
        id: 'foundation-1',
        label: 'Philosophy of AI',
        description: 'Understanding intelligence, the Turing test, and what it means for machines to think.',
        category: 'foundation',
        track: 'foundation',
        order: 0,
        connections: ['eth-1', 'math-lin-alg'],
        status: 'completed',
    },
    {
        id: 'eth-1',
        label: 'AI Ethics & Safety',
        description: 'Bias, fairness, alignment, and responsible AI development.',
        category: 'foundation',
        track: 'foundation',
        order: 1,
        connections: [],
        status: 'locked',
    },

    // --- Math Track ---
    {
        id: 'math-lin-alg',
        label: 'Linear Algebra',
        description: 'Vectors, matrices, eigenvalues — the computational backbone.',
        category: 'math',
        track: 'math',
        order: 0,
        connections: ['math-2'],
        status: 'completed',
    },
    {
        id: 'math-2',
        label: 'Calculus & Probability',
        description: 'Gradients, optimization, and the math of uncertainty.',
        category: 'math',
        track: 'math',
        order: 1,
        connections: ['math-3', 'adv-2'],
        status: 'in-progress',
    },
    {
        id: 'math-3',
        label: 'Backpropagation',
        description: 'The engine of learning: computational graphs and the chain rule.',
        category: 'math',
        track: 'math',
        order: 2,
        connections: ['math-4', 'foundation-neural-networks'],
        status: 'unlocked',
    },
    {
        id: 'math-4',
        label: 'Signal Processing',
        description: 'Fourier transforms, wavelets, and frequency domain analysis.',
        category: 'math',
        track: 'math',
        order: 3,
        connections: ['med-img-1'],
        status: 'unlocked',
    },
    {
        id: 'med-img-1',
        label: 'Medical Image Processing',
        description: 'Diagnose with AI: DICOM, Radon Transform, and U-Net.',
        category: 'math',
        track: 'math',
        order: 4,
        connections: ['app-1'],
        status: 'unlocked',
    },

    // --- Advanced Track ---
    {
        id: 'adv-2',
        label: 'Statistical Learning',
        description: 'SVMs, ensemble methods, and classical ML theory.',
        category: 'advanced',
        track: 'advanced',
        order: 0,
        connections: [],
        status: 'unlocked',
    },
    {
        id: 'foundation-neural-networks',
        label: 'Neural Networks',
        description: 'Perceptrons, MLPs, activation functions, and the building blocks of deep learning.',
        category: 'advanced',
        track: 'advanced',
        order: 1,
        connections: ['adv-5', 'adv-3', 'rl-1', 'gan-1'],
        status: 'in-progress',
    },
    {
        id: 'adv-5',
        label: 'Training Optimization',
        description: 'Mixed precision, learning rate schedules, and efficient training.',
        category: 'advanced',
        track: 'advanced',
        order: 2,
        connections: [],
        status: 'unlocked',
    },
    {
        id: 'rl-1',
        label: 'Reinforcement Learning',
        description: 'Agents, rewards, policies, and learning from interaction.',
        category: 'advanced',
        track: 'advanced',
        order: 3,
        connections: [],
        status: 'unlocked',
    },

    // --- Application Track ---
    {
        id: 'adv-3',
        label: 'Transformers',
        description: 'Self-attention, positional encoding, and the architecture revolution.',
        category: 'application',
        track: 'application',
        order: 0,
        connections: ['llm-1'],
        status: 'unlocked',
    },
    {
        id: 'vis-1',
        label: 'Computer Vision',
        description: 'CNNs, object detection, and visual understanding.',
        category: 'application',
        track: 'application',
        order: 1,
        connections: [],
        status: 'unlocked',
    },
    {
        id: 'app-1',
        label: '3D Cephalometry',
        description: 'Medical AI: 3D landmark detection on CBCT scans.',
        category: 'application',
        track: 'application',
        order: 3,
        connections: [],
        status: 'locked',
    },
    {
        id: 'llm-1',
        label: 'LLMs',
        description: 'GPT, BERT, and large-scale language understanding.',
        category: 'application',
        track: 'application',
        order: 3,
        connections: [],
        status: 'locked',
    },
    {
        id: 'gan-1',
        label: 'GANs',
        description: 'Generative adversarial networks and image synthesis.',
        category: 'application',
        track: 'application',
        order: 4,
        connections: ['adv-4'],
        status: 'locked',
    },
    {
        id: 'adv-4',
        label: 'Diffusion Models',
        description: 'Stable Diffusion, DALL-E, and modern generative AI.',
        category: 'application',
        track: 'application',
        order: 5,
        connections: [],
        status: 'locked',
    },
];
