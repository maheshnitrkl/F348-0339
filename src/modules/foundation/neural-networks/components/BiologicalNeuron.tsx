import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipInfo {
    bio: string;
    math: string;
    color: string;
}

const TOOLTIPS: Record<string, TooltipInfo> = {
    dendrites: { bio: 'Dendrites receive signals from other neurons', math: 'Input features x₁, x₂, … xₙ', color: '#a78bfa' },
    soma: { bio: 'Cell body sums all incoming signals', math: 'Weighted sum: z = Σwᵢxᵢ + b', color: '#60a5fa' },
    axon: { bio: 'Axon fires if the threshold is exceeded', math: 'Activation function: f(z)', color: '#34d399' },
    synapse: { bio: 'Synapse strength controls signal magnitude', math: 'Weights wᵢ (learned parameters)', color: '#fb923c' },
    output: { bio: 'Output signal sent to next neurons', math: 'Neuron output ŷ', color: '#f472b6' },
};

export const BiologicalNeuron: React.FC = () => {
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);

    const tooltip = hoveredPart ? TOOLTIPS[hoveredPart] : null;

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="text-center">
                <p className="text-slate-400 text-sm">Hover over any part to see the mathematical equivalent</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Biological Neuron */}
                <div>
                    <h4 className="text-center text-sm font-mono text-violet-400 uppercase tracking-widest mb-4">Biological Neuron</h4>
                    <svg viewBox="0 0 360 220" className="w-full" style={{ maxHeight: 220 }}>
                        {/* Dendrites */}
                        {[30, 60, 90, 120, 150].map((y, i) => (
                            <g key={i}
                                onMouseEnter={() => setHoveredPart('dendrites')}
                                onMouseLeave={() => setHoveredPart(null)}
                                className="cursor-pointer"
                            >
                                <line x1="10" y1={y} x2="120" y2="110"
                                    stroke={hoveredPart === 'dendrites' ? '#a78bfa' : '#6d28d9'}
                                    strokeWidth={hoveredPart === 'dendrites' ? 3 : 1.5}
                                    strokeLinecap="round"
                                />
                                {/* Synapse dot */}
                                <circle cx="10" cy={y} r="5"
                                    fill={hoveredPart === 'synapse' || hoveredPart === 'dendrites' ? '#fb923c' : '#7c3aed'}
                                    onMouseEnter={() => setHoveredPart('synapse')}
                                    onMouseLeave={() => setHoveredPart(null)}
                                />
                                <text x="20" y={y + 4} fill="#94a3b8" fontSize="10">x{i + 1}</text>
                            </g>
                        ))}

                        {/* Soma / Cell Body */}
                        <ellipse cx="145" cy="110" rx="35" ry="45"
                            fill={hoveredPart === 'soma' ? '#1e3a5f' : '#0f172a'}
                            stroke={hoveredPart === 'soma' ? '#60a5fa' : '#3b82f6'}
                            strokeWidth={hoveredPart === 'soma' ? 3 : 2}
                            onMouseEnter={() => setHoveredPart('soma')}
                            onMouseLeave={() => setHoveredPart(null)}
                            className="cursor-pointer transition-all duration-200"
                        />
                        <text x="145" y="106" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">Cell</text>
                        <text x="145" y="118" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">Body</text>
                        {/* Nucleus */}
                        <circle cx="145" cy="110" r="10" fill="#1e40af" opacity="0.5" />

                        {/* Axon */}
                        <line x1="180" y1="110" x2="260" y2="110"
                            stroke={hoveredPart === 'axon' ? '#34d399' : '#059669'}
                            strokeWidth={hoveredPart === 'axon' ? 5 : 3}
                            onMouseEnter={() => setHoveredPart('axon')}
                            onMouseLeave={() => setHoveredPart(null)}
                            className="cursor-pointer"
                        />
                        <text x="220" y="100" textAnchor="middle" fill="#6ee7b7" fontSize="10">axon</text>

                        {/* Axon Terminal / Output */}
                        <g onMouseEnter={() => setHoveredPart('output')}
                            onMouseLeave={() => setHoveredPart(null)}
                            className="cursor-pointer">
                            {[80, 95, 110, 125, 140].map((y, i) => (
                                <line key={i} x1="260" y1="110" x2="345" y2={y}
                                    stroke={hoveredPart === 'output' ? '#f472b6' : '#be185d'}
                                    strokeWidth={1.5}
                                />
                            ))}
                            <circle cx="345" cy="80" r="5" fill={hoveredPart === 'output' ? '#f472b6' : '#9f1239'} />
                            <circle cx="345" cy="95" r="5" fill={hoveredPart === 'output' ? '#f472b6' : '#9f1239'} />
                            <circle cx="345" cy="110" r="5" fill={hoveredPart === 'output' ? '#f472b6' : '#9f1239'} />
                            <circle cx="345" cy="125" r="5" fill={hoveredPart === 'output' ? '#f472b6' : '#9f1239'} />
                            <circle cx="345" cy="140" r="5" fill={hoveredPart === 'output' ? '#f472b6' : '#9f1239'} />
                        </g>

                        {/* Action Potential Label */}
                        <text x="145" y="175" textAnchor="middle" fill="#64748b" fontSize="10">∑ &gt; threshold → FIRE</text>
                    </svg>
                    <div className="flex justify-center gap-4 flex-wrap mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Dendrites</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />Synapse</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Soma</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Axon</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />Output</span>
                    </div>
                </div>

                {/* Mathematical Perceptron */}
                <div>
                    <h4 className="text-center text-sm font-mono text-indigo-400 uppercase tracking-widest mb-4">Mathematical Perceptron</h4>
                    <svg viewBox="0 0 360 220" className="w-full" style={{ maxHeight: 220 }}>
                        {/* Input nodes */}
                        {[30, 70, 110, 150, 190].map((y, i) => (
                            <g key={i}
                                onMouseEnter={() => setHoveredPart('dendrites')}
                                onMouseLeave={() => setHoveredPart(null)}
                                className="cursor-pointer"
                            >
                                <line x1="60" y1={y} x2="200" y2="110"
                                    stroke={hoveredPart === 'dendrites' ? '#a78bfa' : '#4c1d95'}
                                    strokeWidth={1.5}
                                />
                                <circle cx="35" cy={y} r="18"
                                    fill="#0f172a"
                                    stroke={hoveredPart === 'dendrites' ? '#a78bfa' : '#7c3aed'}
                                    strokeWidth={2}
                                />
                                <text x="35" y={y + 5} textAnchor="middle" fill="#c4b5fd" fontSize="12">x{i + 1}</text>
                                {/* Weight label */}
                                <text x="120" y={y - (110 - y) * 0.3 - 4}
                                    textAnchor="middle" fill={hoveredPart === 'synapse' ? '#fb923c' : '#78716c'} fontSize="9"
                                    onMouseEnter={() => setHoveredPart('synapse')}
                                    onMouseLeave={() => setHoveredPart(null)}
                                >w{i + 1}</text>
                            </g>
                        ))}

                        {/* Summation node (Soma) */}
                        <circle cx="220" cy="110" r="30"
                            fill={hoveredPart === 'soma' ? '#1e3a5f' : '#0f172a'}
                            stroke={hoveredPart === 'soma' ? '#60a5fa' : '#3b82f6'}
                            strokeWidth={hoveredPart === 'soma' ? 3 : 2}
                            onMouseEnter={() => setHoveredPart('soma')}
                            onMouseLeave={() => setHoveredPart(null)}
                            className="cursor-pointer"
                        />
                        <text x="220" y="106" textAnchor="middle" fill="#93c5fd" fontSize="12">Σ</text>
                        <text x="220" y="120" textAnchor="middle" fill="#93c5fd" fontSize="9">+b</text>

                        {/* Activation arrow */}
                        <line x1="250" y1="110" x2="285" y2="110"
                            stroke={hoveredPart === 'axon' ? '#34d399' : '#059669'}
                            strokeWidth={3}
                            onMouseEnter={() => setHoveredPart('axon')}
                            onMouseLeave={() => setHoveredPart(null)}
                        />
                        <text x="268" y="100" textAnchor="middle" fill="#6ee7b7" fontSize="9">f(z)</text>

                        {/* Output node */}
                        <circle cx="320" cy="110" r="22"
                            fill={hoveredPart === 'output' ? '#1a0a1e' : '#0f172a'}
                            stroke={hoveredPart === 'output' ? '#f472b6' : '#db2777'}
                            strokeWidth={hoveredPart === 'output' ? 3 : 2}
                            onMouseEnter={() => setHoveredPart('output')}
                            onMouseLeave={() => setHoveredPart(null)}
                            className="cursor-pointer"
                        />
                        <text x="320" y="115" textAnchor="middle" fill="#fbcfe8" fontSize="12">ŷ</text>

                        {/* Bias */}
                        <circle cx="220" cy="165" r="12" fill="#0f172a" stroke="#6b7280" strokeWidth={1.5} />
                        <text x="220" y="170" textAnchor="middle" fill="#9ca3af" fontSize="10">b</text>
                        <line x1="220" y1="153" x2="220" y2="140" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="3,3" />
                    </svg>
                    <p className="text-center text-xs text-slate-500 mt-2">z = w₁x₁ + w₂x₂ + … + b, then ŷ = f(z)</p>
                </div>
            </div>

            {/* Tooltip Panel */}
            <AnimatePresence>
                {tooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="rounded-xl border p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                        style={{ borderColor: tooltip.color + '44', backgroundColor: tooltip.color + '11' }}
                    >
                        <div>
                            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: tooltip.color }}>Biology</p>
                            <p className="text-slate-300 text-sm">{tooltip.bio}</p>
                        </div>
                        <div>
                            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: tooltip.color }}>Mathematics</p>
                            <p className="text-slate-300 text-sm font-mono">{tooltip.math}</p>
                        </div>
                    </motion.div>
                )}
                {!tooltip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-xl border border-dashed border-white/10 p-4 text-center text-slate-600 text-sm"
                    >
                        ← Hover over neuron parts to see the mapping
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
