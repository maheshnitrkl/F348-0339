/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────────────────────
interface Neuron { id: string; layer: number; index: number; activation: number; preActivation: number; }
interface Connection { from: string; to: string; weight: number; }
interface NetworkConfig { layers: number[]; }

// ── Activation functions ──────────────────────────────────────────────────────
const relu = (x: number) => Math.max(0, x);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

// ── Network builder ──────────────────────────────────────────────────────────
function buildNetwork(config: NetworkConfig, inputValues: number[]) {
    const neurons: Neuron[] = [];
    const connections: Connection[] = [];

    // Seed-based pseudo-random weights for consistency
    let seed = 42;
    const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return ((seed >>> 0) / 0xffffffff) * 2 - 1; };

    // Build neurons
    config.layers.forEach((count, layerIdx) => {
        for (let i = 0; i < count; i++) {
            neurons.push({ id: `L${layerIdx}N${i}`, layer: layerIdx, index: i, activation: 0, preActivation: 0 });
        }
    });

    // Build connections with weights
    for (let l = 0; l < config.layers.length - 1; l++) {
        const fromNeurons = neurons.filter(n => n.layer === l);
        const toNeurons = neurons.filter(n => n.layer === l + 1);
        fromNeurons.forEach(from => {
            toNeurons.forEach(to => {
                connections.push({ from: from.id, to: to.id, weight: rand() * 0.8 });
            });
        });
    }

    // Forward pass
    neurons.filter(n => n.layer === 0).forEach((n, i) => {
        n.activation = inputValues[i] ?? 0;
        n.preActivation = inputValues[i] ?? 0;
    });

    for (let l = 1; l < config.layers.length; l++) {
        const prevNeurons = neurons.filter(n => n.layer === l - 1);
        const currNeurons = neurons.filter(n => n.layer === l);

        currNeurons.forEach(curr => {
            const incoming = connections.filter(c => c.to === curr.id);
            const z = incoming.reduce((sum, c) => {
                const src = neurons.find(n => n.id === c.from)!;
                return sum + src.activation * c.weight;
            }, 0) + 0.1; // bias
            curr.preActivation = z;
            curr.activation = l === config.layers.length - 1 ? sigmoid(z) : relu(z);
        });
    }

    return { neurons, connections };
}

// ── Layout ────────────────────────────────────────────────────────────────────
function getPositions(config: NetworkConfig, W: number, H: number, pad: number) {
    const positions: Record<string, { x: number; y: number }> = {};
    config.layers.forEach((count, l) => {
        const x = pad + (l / (config.layers.length - 1)) * (W - 2 * pad);
        for (let i = 0; i < count; i++) {
            const y = H / 2 + (i - (count - 1) / 2) * (H / (Math.max(...config.layers) + 1));
            positions[`L${l}N${i}`] = { x, y };
        }
    });
    return positions;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const ForwardPassAnimator: React.FC = () => {
    const CONFIGS: Record<string, NetworkConfig> = {
        'Simple (3-2-1)': { layers: [3, 2, 1] },
        'Medium (3-4-3-1)': { layers: [3, 4, 3, 1] },
        'Deep (2-4-4-4-1)': { layers: [2, 4, 4, 4, 1] },
    };

    const [configKey, setConfigKey] = useState('Medium (3-4-3-1)');
    const config = CONFIGS[configKey];
    const [inputs, setInputs] = useState([0.8, 0.3, -0.5]);
    const [animLayer, setAnimLayer] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { neurons, connections } = buildNetwork(config, inputs.slice(0, config.layers[0]));

    const W = 640; const H = 340; const PAD = 60;
    const positions = getPositions(config, W, H, PAD);

    const playAnimation = () => {
        setAnimLayer(0);
        setIsPlaying(true);
        let l = 0;
        const step = () => {
            l++;
            if (l < config.layers.length) {
                setAnimLayer(l);
                timerRef.current = setTimeout(step, 900);
            } else {
                setTimeout(() => { setAnimLayer(null); setIsPlaying(false); }, 900);
            }
        };
        timerRef.current = setTimeout(step, 800);
    };

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    const getColor = (n: Neuron) => {
        if (animLayer === null) return '#1e293b';
        if (n.layer > animLayer) return '#0f172a';
        const intensity = Math.min(Math.abs(n.activation), 1);
        if (n.activation > 0.5) return `hsl(175, 80%, ${20 + intensity * 35}%)`;
        if (n.activation > 0.1) return `hsl(250, 60%, ${20 + intensity * 35}%)`;
        return '#1e293b';
    };

    const getStroke = (n: Neuron) => {
        if (animLayer === null) return '#334155';
        if (n.layer === animLayer) return '#60a5fa';
        if (n.layer < animLayer) return '#0891b2';
        return '#1e293b';
    };

    return (
        <div className="space-y-5">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
                    {Object.keys(CONFIGS).map(k => (
                        <button key={k} onClick={() => { setConfigKey(k); setAnimLayer(null); setIsPlaying(false); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${configKey === k ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-white'}`}>
                            {k}
                        </button>
                    ))}
                </div>
                <button onClick={playAnimation} disabled={isPlaying}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isPlaying ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'}`}>
                    {isPlaying ? '⟳ Propagating…' : '▶ Run Forward Pass'}
                </button>
            </div>

            {/* Input sliders */}
            <div className="flex gap-3 flex-wrap">
                {Array.from({ length: config.layers[0] }, (_, i) => (
                    <div key={i} className="flex-1 min-w-24 bg-slate-900/50 border border-slate-800 rounded-lg p-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">x{i + 1}</span>
                            <span className="text-cyan-400 font-mono">{(inputs[i] ?? 0).toFixed(2)}</span>
                        </div>
                        <input type="range" min="-1" max="1" step="0.05" value={inputs[i] ?? 0}
                            onChange={e => { const v = [...inputs]; v[i] = parseFloat(e.target.value); setInputs(v); }}
                            className="w-full" style={{ accentColor: '#22d3ee' }} />
                    </div>
                ))}
            </div>

            {/* Network Diagram */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
                    {/* Connections */}
                    {connections.map((c, i) => {
                        const from = positions[c.from]; const to = positions[c.to];
                        const fromNeuron = neurons.find(n => n.id === c.from)!;
                        const toNeuron = neurons.find(n => n.id === c.to)!;
                        const active = animLayer !== null && fromNeuron.layer < animLayer;
                        return (
                            <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                stroke={active ? (c.weight > 0 ? '#0891b2' : '#be185d') : '#1e293b'}
                                strokeWidth={active ? Math.abs(c.weight) * 2 + 0.5 : 0.8}
                                opacity={active ? 0.7 : 0.3}
                                style={{ transition: 'all 0.4s ease' }}
                            />
                        );
                    })}

                    {/* Neurons */}
                    {neurons.map(n => {
                        const pos = positions[n.id];
                        const isActive = animLayer !== null && n.layer <= animLayer;
                        return (
                            <g key={n.id}>
                                <circle cx={pos.x} cy={pos.y} r={18}
                                    fill={getColor(n)} stroke={getStroke(n)} strokeWidth={2}
                                    style={{ transition: 'all 0.5s ease', filter: isActive ? 'drop-shadow(0 0 8px #22d3ee88)' : 'none' }}
                                />
                                {isActive && (
                                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize={n.activation > 0.01 ? 9 : 8}>
                                        {n.activation.toFixed(2)}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Layer labels */}
                    {config.layers.map((_, l) => {
                        const lNeurons = neurons.filter(n => n.layer === l);
                        const x = lNeurons.length > 0 ? positions[lNeurons[0].id].x : 0;
                        const label = l === 0 ? 'Input' : l === config.layers.length - 1 ? 'Output' : `Hidden ${l}`;
                        return (
                            <text key={l} x={x} y={H - 8} textAnchor="middle" fill={animLayer === l ? '#22d3ee' : '#475569'} fontSize={10} fontWeight={animLayer === l ? 'bold' : 'normal'}>
                                {label}
                            </text>
                        );
                    })}

                    {/* Layer highlight */}
                    {animLayer !== null && (() => {
                        const layerNeurons = neurons.filter(n => n.layer === animLayer);
                        if (layerNeurons.length === 0) return null;
                        const x = positions[layerNeurons[0].id].x;
                        return <rect x={x - 30} y={20} width={60} height={H - 40} fill="#22d3ee08" rx={8} stroke="#22d3ee22" strokeWidth={1} />;
                    })()}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block bg-cyan-500" />Positive weight</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block bg-pink-600" />Negative weight</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block bg-cyan-900" />Active neuron</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block bg-slate-900 border border-slate-700" />Pending</span>
            </div>
        </div>
    );
};
