import React, { useState } from 'react';
import { ForwardPassAnimator } from '../components/ForwardPassAnimator';
import { UniversalApproximationViz } from '../components/UniversalApproximationViz';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

export const Architecture: React.FC = () => {
    const [activeLayer, setActiveLayer] = useState<number | null>(null);

    return (
        <section className="space-y-16">

            {/* ── 07 · MLP Architecture ──────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-sm">
                    <span>07</span>
                    <div className="h-px bg-indigo-500/50 w-8" />
                    <span>Architecture</span>
                </div>
                <h2 className="text-4xl font-bold text-white">Multi-Layer Perceptron (MLP)</h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                    Stack multiple layers of perceptrons and you get a Multi-Layer Perceptron (MLP) —
                    the fundamental building block of all deep learning. Each layer transforms the
                    representation into increasingly abstract features.
                </p>
            </div>

            {/* Annotated Architecture Diagram */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Anatomy of an MLP</h3>
                <p className="text-slate-500 text-sm">Hover over each layer to see its role.</p>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 flex justify-center overflow-x-auto">
                    <svg width="700" height="380" viewBox="0 0 700 380" className="max-w-full">
                        <defs>
                            <filter id="glow-violet">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>

                        {/* Layer rects (hover areas) */}
                        {[
                            { x: 60, label: 'Input Layer', color: '#d8b4fe', desc: 'Raw features fed to the network. No computation — just data holders.' },
                            { x: 220, label: 'Hidden Layer 1', color: '#818cf8', desc: 'Learns low-level features. Each neuron detects a different pattern.' },
                            { x: 380, label: 'Hidden Layer 2', color: '#818cf8', desc: 'Combines low-level features into higher-level abstractions.' },
                            { x: 540, label: 'Output Layer', color: '#34d399', desc: 'Produces final prediction. Softmax for classification, linear for regression.' },
                        ].map((layer, li) => (
                            <rect key={li} x={layer.x - 30} y={40} width={60} height={290}
                                fill={activeLayer === li ? layer.color + '11' : 'transparent'}
                                rx={8} className="cursor-pointer transition-all"
                                onMouseEnter={() => setActiveLayer(li)}
                                onMouseLeave={() => setActiveLayer(null)}
                            />
                        ))}

                        {/* All connections */}
                        {[60, 220, 380].map((x1, li) => {
                            const x2 = [220, 380, 540][li];
                            const y1s = li === 0 ? [80, 140, 200, 260, 300] : [80, 140, 200, 260, 300];
                            const y2s = [80, 140, 200, 260, 300];
                            return y1s.flatMap((y1, i) => y2s.map((y2, j) => (
                                <line key={`${li}-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke={activeLayer === li ? '#4c1d95' : '#1e293b'} strokeWidth={1} />
                            )));
                        })}

                        {/* Input Layer nodes (5) */}
                        {[80, 140, 200, 260, 300].map((y, i) => (
                            <g key={i} onMouseEnter={() => setActiveLayer(0)} onMouseLeave={() => setActiveLayer(null)} className="cursor-pointer">
                                <circle cx={60} cy={y} r={18}
                                    fill="#0f172a" stroke={activeLayer === 0 ? '#d8b4fe' : '#7c3aed'} strokeWidth={2}
                                    style={{ filter: activeLayer === 0 ? 'url(#glow-violet)' : 'none' }}
                                />
                                <text x={60} y={y + 4} textAnchor="middle" fill="#c4b5fd" fontSize={10}>x{i + 1}</text>
                            </g>
                        ))}

                        {/* Hidden 1 (5 nodes) */}
                        {[80, 140, 200, 260, 300].map((y, i) => (
                            <g key={i} onMouseEnter={() => setActiveLayer(1)} onMouseLeave={() => setActiveLayer(null)} className="cursor-pointer">
                                <circle cx={220} cy={y} r={18}
                                    fill="#0f172a" stroke={activeLayer === 1 ? '#818cf8' : '#4f46e5'} strokeWidth={2}
                                    style={{ filter: activeLayer === 1 ? 'url(#glow-violet)' : 'none' }}
                                />
                                <text x={220} y={y + 4} textAnchor="middle" fill="#a5b4fc" fontSize={9}>h1{i + 1}</text>
                            </g>
                        ))}

                        {/* Hidden 2 (4 nodes) */}
                        {[110, 170, 220, 280].map((y, i) => (
                            <g key={i} onMouseEnter={() => setActiveLayer(2)} onMouseLeave={() => setActiveLayer(null)} className="cursor-pointer">
                                <circle cx={380} cy={y} r={18}
                                    fill="#0f172a" stroke={activeLayer === 2 ? '#818cf8' : '#4f46e5'} strokeWidth={2}
                                    style={{ filter: activeLayer === 2 ? 'url(#glow-violet)' : 'none' }}
                                />
                                <text x={380} y={y + 4} textAnchor="middle" fill="#a5b4fc" fontSize={9}>h2{i + 1}</text>
                            </g>
                        ))}

                        {/* Output (3 nodes) */}
                        {[140, 200, 260].map((y, i) => (
                            <g key={i} onMouseEnter={() => setActiveLayer(3)} onMouseLeave={() => setActiveLayer(null)} className="cursor-pointer">
                                <circle cx={540} cy={y} r={18}
                                    fill="#0f172a" stroke={activeLayer === 3 ? '#34d399' : '#059669'} strokeWidth={2}
                                    style={{ filter: activeLayer === 3 ? 'url(#glow-violet)' : 'none' }}
                                />
                                <text x={540} y={y + 4} textAnchor="middle" fill="#6ee7b7" fontSize={9}>ŷ{i + 1}</text>
                            </g>
                        ))}

                        {/* Layer labels */}
                        {[
                            { x: 60, label: 'Input', sub: '5 features', color: '#d8b4fe' },
                            { x: 220, label: 'Hidden 1', sub: '5 neurons', color: '#818cf8' },
                            { x: 380, label: 'Hidden 2', sub: '4 neurons', color: '#818cf8' },
                            { x: 540, label: 'Output', sub: '3 classes', color: '#34d399' },
                        ].map((l, i) => (
                            <g key={i}>
                                <text x={l.x} y={340} textAnchor="middle" fill={activeLayer === i ? l.color : '#64748b'} fontSize={11} fontWeight={activeLayer === i ? 'bold' : 'normal'}>{l.label}</text>
                                <text x={l.x} y={355} textAnchor="middle" fill="#475569" fontSize={9}>{l.sub}</text>
                            </g>
                        ))}

                        {/* Info tooltip box */}
                        {activeLayer !== null && (() => {
                            const infos = [
                                { label: 'Input Layer', desc: 'Raw features fed to the network. No computation — just data holders.', color: '#d8b4fe' },
                                { label: 'Hidden Layer 1', desc: 'Learns low-level features. Each neuron: z = Σwᵢxᵢ + b, then f(z).', color: '#818cf8' },
                                { label: 'Hidden Layer 2', desc: 'Combines low-level features into higher-level abstractions.', color: '#818cf8' },
                                { label: 'Output Layer', desc: 'Produces final prediction. Softmax for classification, linear for regression.', color: '#34d399' },
                            ][activeLayer];
                            return (
                                <g>
                                    <rect x={600} y={120} width={88} height={80} fill="#0f172a" stroke={infos.color + '60'} rx={6} />
                                    <text x={644} y={140} textAnchor="middle" fill={infos.color} fontSize={9} fontWeight="bold">{infos.label}</text>
                                    <foreignObject x={606} y={148} width={76} height={52}>
                                        <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.4 }}>{infos.desc}</div>
                                    </foreignObject>
                                </g>
                            );
                        })()}
                    </svg>
                </div>
            </div>

            {/* ── 08 · Forward Propagation ───────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-sm">
                    <span>08</span>
                    <div className="h-px bg-indigo-500/50 w-8" />
                    <span>Information Flow</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Animated Forward Pass</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    Watch how input signals propagate layer by layer. Each neuron computes a
                    weighted sum of its inputs and applies the ReLU activation.
                    Set the input values and press Run to see the network compute.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                            <h4 className="text-indigo-400 font-bold mb-3">Forward Pass Equations</h4>
                            <p className="text-slate-500 text-sm mb-2">For each hidden layer l:</p>
                            <MathEquation formula="\mathbf{z}^{(l)} = W^{(l)} \mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}" block />
                            <MathEquation formula="\mathbf{h}^{(l)} = f(\mathbf{z}^{(l)})" block />
                            <p className="text-slate-500 text-sm mt-3 mb-2">Output layer (softmax for classification):</p>
                            <MathEquation formula="\hat{y}_k = \frac{e^{z_k^{(L)}}}{\sum_j e^{z_j^{(L)}}}" block />
                        </div>
                    </div>
                    <div>
                        <ForwardPassAnimator />
                    </div>
                </div>
            </div>

            {/* ── 09 · Universal Approximation ─────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-sm">
                    <span>09</span>
                    <div className="h-px bg-emerald-500/50 w-8" />
                    <span>Universal Approximation</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Why Neural Networks Can Learn Anything</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    The Universal Approximation Theorem (1989) guarantees that a network with a single hidden layer
                    and enough neurons can approximate <em>any</em> continuous function. Slide the neuron count and
                    watch the approximation improve in real time.
                </p>
                <UniversalApproximationViz />
            </div>

        </section>
    );
};
