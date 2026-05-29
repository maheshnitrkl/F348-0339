/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ArchType = 'mlp' | 'cnn' | 'rnn' | 'lstm' | 'transformer' | 'autoencoder';

interface ArchConfig {
    label: string;
    tagline: string;
    color: string;
    icon: string;
    era: string;
    problem: string;
    keyIdea: string;
    formula: string;
    medicalUse: string;
    params: string;
    diagram: React.ReactNode;
}

const W = 280; const H = 160;

const MLP_Diagram = () => (
    <svg viewBox="0 0 280 160" className="w-full">
        {[[40, 40, 80, 120], [140, 50, 80, 110], [240, 80]].map((col, li) => {
            const ns = col.slice(2); const x = col[0];
            return (
                <g key={li}>
                    {ns.map((y, ni) => (
                        <g key={ni}>
                            {li < 2 && col.slice(2).map((y2, ni2) => (
                                <line key={ni2} x1={x} y1={y} x2={[140, 240][li]} y2={[50, 80, 110][li === 0 ? ni2 : 0] ?? 80}
                                    stroke="#4c1d95" strokeWidth="1" />
                            ))}
                            <circle cx={x} cy={y} r={14} fill="#0f172a" stroke={['#7c3aed', '#3b82f6', '#10b981'][li]} strokeWidth={2} />
                        </g>
                    ))}
                </g>
            );
        })}
        <text x={40} y={148} textAnchor="middle" fill="#64748b" fontSize={9}>Input</text>
        <text x={140} y={148} textAnchor="middle" fill="#64748b" fontSize={9}>Hidden</text>
        <text x={240} y={148} textAnchor="middle" fill="#64748b" fontSize={9}>Output</text>
    </svg>
);

const CNN_Diagram = () => (
    <svg viewBox="0 0 280 160" className="w-full">
        {/* Input "image" */}
        {[[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]].map(([r, c], i) => (
            <rect key={i} x={10 + c * 20} y={40 + r * 20} width={18} height={18} fill="#1e1b4b" stroke="#4c1d95" strokeWidth={1} rx={2} />
        ))}
        {/* Kernel */}
        <rect x={70} y={50} width={30} height={30} fill="#312e81" stroke="#818cf8" strokeWidth={1.5} rx={3} />
        <text x={85} y={70} textAnchor="middle" fill="#a5b4fc" fontSize={9}>K</text>
        {/* Arrow */}
        <path d="M108 65 L130 65" stroke="#475569" strokeWidth={1.5} markerEnd="url(#arrowNN)" />
        {/* Feature map */}
        {[[0, 0], [0, 1], [1, 0], [1, 1]].map(([r, c], i) => (
            <rect key={i} x={135 + c * 16} y={47 + r * 16} width={14} height={14} fill="#172554" stroke="#3b82f6" strokeWidth={1} rx={2} />
        ))}
        {/* Pool */}
        <path d="M175 65 L195 65" stroke="#475569" strokeWidth={1.5} />
        <rect x={200} y={52} width={22} height={22} fill="#052e16" stroke="#10b981" strokeWidth={1.5} rx={3} />
        <text x={211} y={67} textAnchor="middle" fill="#6ee7b7" fontSize={8}>Pool</text>
        {/* FC */}
        <path d="M230 63 L248 63" stroke="#475569" strokeWidth={1.5} />
        <rect x={250} y={55} width={20} height={20} fill="#0f172a" stroke="#f59e0b" strokeWidth={1.5} rx={3} />
        <text x={260} y={68} textAnchor="middle" fill="#fcd34d" fontSize={8}>FC</text>

        <text x={85} y={12} textAnchor="middle" fill="#6366f1" fontSize={9} fontWeight="bold">Convolution</text>
        <text x={85} y={150} textAnchor="middle" fill="#64748b" fontSize={9}>Input Image</text>
        <text x={160} y={150} textAnchor="middle" fill="#64748b" fontSize={9}>Feature Maps</text>
        <text x={260} y={150} textAnchor="middle" fill="#64748b" fontSize={9}>Output</text>
        <defs><marker id="arrowNN" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6z" fill="#475569" /></marker></defs>
    </svg>
);

const RNN_Diagram = () => (
    <svg viewBox="0 0 280 160" className="w-full">
        {[60, 140, 220].map((x, i) => (
            <g key={i}>
                <rect x={x - 28} y={55} width={56} height={50} fill="#0f172a" stroke="#0891b2" strokeWidth={1.5} rx={6} />
                <text x={x} y={84} textAnchor="middle" fill="#67e8f9" fontSize={10} fontWeight="bold">RNN</text>
                {/* Hidden state loop */}
                {i < 2 && <path d={`M${x + 28} 80 Q${x + 55} 30 ${x + 84} 80`} fill="none" stroke="#0891b2" strokeWidth={1.5} strokeDasharray="4,3" markerEnd="url(#arrowRNN)" />}
                {/* Input */}
                <text x={x} y={148} textAnchor="middle" fill="#475569" fontSize={9}>x{i + 1}</text>
                <line x1={x} y1={138} x2={x} y2={108} stroke="#475569" strokeWidth={1} />
                {/* Output */}
                <text x={x} y={30} textAnchor="middle" fill="#475569" fontSize={9}>h{i + 1}</text>
                <line x1={x} y1={52} x2={x} y2={38} stroke="#475569" strokeWidth={1} />
            </g>
        ))}
        <text x={140} y={12} textAnchor="middle" fill="#22d3ee" fontSize={9} fontWeight="bold">Recurrent Connection (shared weights)</text>
        <defs><marker id="arrowRNN" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6z" fill="#0891b2" /></marker></defs>
    </svg>
);

const LSTM_Diagram = () => (
    <svg viewBox="0 0 280 160" className="w-full">
        {/* Cell */}
        <rect x={60} y={40} width={160} height={85} fill="#0f172a" stroke="#8b5cf6" strokeWidth={2} rx={8} />
        {/* Gates */}
        {[['f', 90, '#ef4444', 'Forget'], ['i', 120, '#3b82f6', 'Input'], ['o', 150, '#10b981', 'Output']].map(([g, x, c, label]) => (
            <g key={g as string}>
                <circle cx={x as number} cy={95} r={14} fill="#0f172a" stroke={c as string} strokeWidth={1.5} />
                <text x={x as number} y={99} textAnchor="middle" fill={c as string} fontSize={9} fontWeight="bold">{g}</text>
            </g>
        ))}
        {/* Cell state line */}
        <line x1={60} y1={60} x2={220} y2={60} stroke="#fbbf24" strokeWidth={2} strokeDasharray="none" />
        <text x={140} y={55} textAnchor="middle" fill="#fbbf24" fontSize={8}>Cell State (long-term memory)</text>
        <text x={140} y={145} textAnchor="middle" fill="#64748b" fontSize={9}>Input/Output flow (short-term)</text>
        {/* In/Out */}
        <text x={20} y={98} fill="#475569" fontSize={9}>h_{"{t-1}"}</text>
        <line x1={55} y1={95} x2={60} y2={95} stroke="#475569" strokeWidth={1} />
        <text x={230} y={98} fill="#475569" fontSize={9}>h_t</text>
        <line x1={220} y1={95} x2={225} y2={95} stroke="#475569" strokeWidth={1} />
    </svg>
);

const Transformer_Diagram = () => (
    <svg viewBox="0 0 280 160" className="w-full">
        {/* Attention heads */}
        {[60, 120, 180, 240].map((x, i) => (
            <g key={i}>
                <rect x={x - 22} y={60} width={44} height={35} fill="#0f172a" stroke="#f59e0b" strokeWidth={1.5} rx={5} />
                <text x={x} y={82} textAnchor="middle" fill="#fcd34d" fontSize={8}>Attn{i + 1}</text>
                <line x1={x} y1={95} x2={140} y2={115} stroke="#f59e0b" strokeWidth={1} opacity={0.4} />
            </g>
        ))}
        {/* Multi-head Attn concat */}
        <rect x={100} y={116} width={80} height={28} fill="#0f172a" stroke="#f59e0b" strokeWidth={2} rx={5} />
        <text x={140} y={134} textAnchor="middle" fill="#fcd34d" fontSize={9} fontWeight="bold">Concat+FF</text>
        {/* Q K V */}
        {[['Q', 80], ['K', 140], ['V', 200]].map(([l, x]) => (
            <g key={l as string}>
                <circle cx={x as number} cy={42} r={12} fill="#0f172a" stroke="#a78bfa" strokeWidth={1.5} />
                <text x={x as number} y={46} textAnchor="middle" fill="#c4b5fd" fontSize={9}>{l}</text>
                <line x1={x as number} y1={54} x2={x as number} y2={60} stroke="#a78bfa" strokeWidth={1} />
            </g>
        ))}
        <text x={140} y={12} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold">Multi-Head Self-Attention</text>
        <text x={140} y={22} textAnchor="middle" fill="#64748b" fontSize={8}>Parallel attention heads → concatenate</text>
        <text x={140} y={155} textAnchor="middle" fill="#64748b" fontSize={9}>Output</text>
    </svg>
);

const AE_Diagram = () => (
    <svg viewBox="0 0 280 160" className="w-full">
        {[[40, 4], [100, 2], [140, 1], [180, 2], [240, 4]].map(([x, n], li) => {
            const colors = ['#7c3aed', '#4f46e5', '#ec4899', '#4f46e5', '#7c3aed'];
            return (
                <g key={li}>
                    {Array.from({ length: n }, (_, ni) => {
                        const y = 80 + (ni - (n - 1) / 2) * 30;
                        return <circle key={ni} cx={x} cy={y} r={12} fill="#0f172a" stroke={colors[li]} strokeWidth={2} />;
                    })}
                </g>
            );
        })}
        {/* Lines */}
        {[[40, 4, 100, 2], [100, 2, 140, 1], [140, 1, 180, 2], [180, 2, 240, 4]].map(([x1, n1, x2, n2], ci) => (
            Array.from({ length: n1 }, (_, i) => Array.from({ length: n2 }, (_, j) => (
                <line key={`${ci}-${i}-${j}`} x1={x1} y1={80 + (i - (n1 - 1) / 2) * 30} x2={x2} y2={80 + (j - (n2 - 1) / 2) * 30} stroke="#334155" strokeWidth={0.8} />
            )))
        ))}
        <text x={90} y={12} textAnchor="middle" fill="#7c3aed" fontSize={9} fontWeight="bold">Encoder</text>
        <text x={140} y={12} textAnchor="middle" fill="#ec4899" fontSize={9} fontWeight="bold">Latent z</text>
        <text x={190} y={12} textAnchor="middle" fill="#7c3aed" fontSize={9} fontWeight="bold">Decoder</text>
        <text x={140} y={152} textAnchor="middle" fill="#64748b" fontSize={9}>Compress → Reconstruct</text>
    </svg>
);

const ARCHS: Record<ArchType, ArchConfig> = {
    mlp: {
        label: 'MLP', tagline: 'The Foundation', color: '#8b5cf6', icon: '🧠', era: '1958–present',
        problem: 'Tabular data, structured features, classification & regression',
        keyIdea: 'Stack of linear layers + non-linear activations. Every neuron connects to every other.',
        formula: 'h = ReLU(Wx + b), ŷ = softmax(Vh)',
        medicalUse: 'Patient risk scoring, lab value classification, electronic health records',
        params: 'O(n·m) per layer, where n=inputs, m=neurons',
        diagram: <MLP_Diagram />,
    },
    cnn: {
        label: 'CNN', tagline: 'Vision Master', color: '#3b82f6', icon: '🖼️', era: '1989–present',
        problem: 'Image classification, object detection, spatial pattern recognition',
        keyIdea: 'Shared convolutional kernels exploit spatial locality and translation invariance.',
        formula: '(f * g)[n] = Σₖ f[k]·g[n-k]  →  feature maps',
        medicalUse: 'X-ray classification, tumor segmentation, MRI analysis (your specialty!)',
        params: 'O(k²·cᵢₙ·cₒᵤₜ) per conv layer — far fewer than MLP on images',
        diagram: <CNN_Diagram />,
    },
    rnn: {
        label: 'RNN', tagline: 'Memory for Sequences', color: '#0891b2', icon: '🔄', era: '1986–present',
        problem: 'Sequential data: text, time series, speech, DNA sequences',
        keyIdea: 'Hidden state persists across time steps, creating implicit memory of past inputs.',
        formula: 'hₜ = tanh(Wₓxₜ + Wₕhₜ₋₁ + b)',
        medicalUse: 'ECG anomaly detection, longitudinal patient records, drug response sequences',
        params: 'Same weights reused at every time step (parameter efficient)',
        diagram: <RNN_Diagram />,
    },
    lstm: {
        label: 'LSTM', tagline: 'Long-Term Memory', color: '#7c3aed', icon: '🗃️', era: '1997–present',
        problem: 'Long-range sequence dependencies where vanilla RNNs fail',
        keyIdea: 'Cell state (long-term memory) + gated updates (forget, input, output gates).',
        formula: 'fₜ=σ(Wf·[hₜ₋₁,xₜ]),  Cₜ=fₜ⊙Cₜ₋₁+iₜ⊙C̃ₜ',
        medicalUse: 'ICU patient trajectory modeling, clinical note analysis, vital sign forecasting',
        params: '4× the parameters of RNN (one set per gate)',
        diagram: <LSTM_Diagram />,
    },
    transformer: {
        label: 'Transformer', tagline: 'Attention is All You Need', color: '#f59e0b', icon: '⚡', era: '2017–present',
        problem: 'Any sequence-to-sequence task — now also vision, audio, and multi-modal',
        keyIdea: 'Self-attention computes pairwise relationships between ALL tokens simultaneously.',
        formula: 'Attention(Q,K,V) = softmax(QKᵀ/√d)·V',
        medicalUse: 'Medical report generation, genomics, protein structure (AlphaFold2), pathology slides',
        params: 'O(n²·d) attention — scales with sequence length squared',
        diagram: <Transformer_Diagram />,
    },
    autoencoder: {
        label: 'Autoencoder', tagline: 'Compress & Reconstruct', color: '#ec4899', icon: '🗜️', era: '1986–present',
        problem: 'Unsupervised representation learning, dimensionality reduction, anomaly detection',
        keyIdea: 'Encoder compresses input to latent code z; Decoder reconstructs from z.',
        formula: 'z = enc(x),  x̂ = dec(z),  L = ||x - x̂||²',
        medicalUse: 'MRI denoising, anomaly detection in scans, latent space for generation (VAE, DDPM!)',
        params: 'Symmetric encoder/decoder; bottleneck z forces compression',
        diagram: <AE_Diagram />,
    },
};

export const ArchitectureCards: React.FC = () => {
    const [expanded, setExpanded] = useState<ArchType | null>(null);

    return (
        <div className="space-y-6">
            <p className="text-slate-400 text-sm">Click any architecture to explore its design, key equations, and medical imaging applications.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(ARCHS) as ArchType[]).map(key => {
                    const arch = ARCHS[key];
                    const isOpen = expanded === key;
                    return (
                        <motion.button
                            key={key}
                            layout
                            onClick={() => setExpanded(isOpen ? null : key)}
                            className={`text-left rounded-2xl border p-4 transition-all duration-300 ${isOpen ? 'col-span-2 md:col-span-3' : ''}`}
                            style={{
                                borderColor: isOpen ? arch.color + '80' : '#334155',
                                backgroundColor: isOpen ? arch.color + '08' : '#0f172a',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{arch.icon}</span>
                                    <div>
                                        <div className="font-bold text-white">{arch.label}</div>
                                        <div className="text-xs" style={{ color: arch.color }}>{arch.tagline}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600 hidden md:block">{arch.era}</span>
                                    <span className="text-slate-500">{isOpen ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden"
                                    >
                                        {/* Diagram */}
                                        <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5">
                                            {arch.diagram}
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 text-left">
                                            <div className="space-y-1">
                                                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: arch.color }}>Use Case</p>
                                                <p className="text-slate-300 text-sm">{arch.problem}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: arch.color }}>Key Idea</p>
                                                <p className="text-slate-400 text-sm">{arch.keyIdea}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: arch.color }}>Core Equations</p>
                                                <code className="text-xs bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg block font-mono">{arch.formula}</code>
                                            </div>
                                            <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg px-3 py-2">
                                                <p className="text-xs font-mono uppercase tracking-widest text-violet-400 mb-0.5">🏥 Medical Imaging</p>
                                                <p className="text-slate-400 text-xs">{arch.medicalUse}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-600">⚙ {arch.params}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
