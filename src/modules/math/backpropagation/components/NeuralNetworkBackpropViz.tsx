/* eslint-disable */
import React, { useState, useCallback } from 'react';

// Network architecture: 3 inputs → 4 hidden → 2 outputs
const LAYERS = [3, 4, 2];
const LAYER_LABELS = ['Input', 'Hidden', 'Output'];

// Sigmoid and its derivative
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const sigmoidDeriv = (s: number) => s * (1 - s);

// Random init helper
const randWeight = () => (Math.random() - 0.5) * 2;

interface NetworkState {
    weights: number[][][]; // weights[layer][to][from]
    biases: number[][];
    activations: number[][];
    zValues: number[][];
    deltas: number[][];
    weightGrads: number[][][];
}

function initNetwork(): NetworkState {
    const weights: number[][][] = [];
    const biases: number[][] = [[]];
    for (let l = 1; l < LAYERS.length; l++) {
        const layerW: number[][] = [];
        const layerB: number[] = [];
        for (let j = 0; j < LAYERS[l]; j++) {
            const neuronW: number[] = [];
            for (let k = 0; k < LAYERS[l - 1]; k++) {
                neuronW.push(randWeight());
            }
            layerW.push(neuronW);
            layerB.push(randWeight() * 0.5);
        }
        weights.push(layerW);
        biases.push(layerB);
    }
    return {
        weights, biases,
        activations: LAYERS.map(n => new Array(n).fill(0)),
        zValues: LAYERS.map(n => new Array(n).fill(0)),
        deltas: LAYERS.map(n => new Array(n).fill(0)),
        weightGrads: weights.map(lw => lw.map(nw => nw.map(() => 0))),
    };
}

function forwardPass(net: NetworkState, input: number[]): NetworkState {
    const activations = net.activations.map(a => [...a]);
    const zValues = net.zValues.map(a => [...a]);
    activations[0] = [...input];

    for (let l = 1; l < LAYERS.length; l++) {
        for (let j = 0; j < LAYERS[l]; j++) {
            let z = net.biases[l][j];
            for (let k = 0; k < LAYERS[l - 1]; k++) {
                z += net.weights[l - 1][j][k] * activations[l - 1][k];
            }
            zValues[l][j] = z;
            activations[l][j] = sigmoid(z);
        }
    }
    return { ...net, activations, zValues };
}

function backwardPass(net: NetworkState, target: number[]): NetworkState {
    const L = LAYERS.length - 1;
    const deltas = net.deltas.map(d => [...d]);
    const weightGrads = net.weightGrads.map(lw => lw.map(nw => [...nw]));

    // Output layer deltas
    for (let j = 0; j < LAYERS[L]; j++) {
        const error = net.activations[L][j] - target[j];
        deltas[L][j] = error * sigmoidDeriv(net.activations[L][j]);
    }

    // Hidden layer deltas
    for (let l = L - 1; l >= 1; l--) {
        for (let j = 0; j < LAYERS[l]; j++) {
            let sum = 0;
            for (let k = 0; k < LAYERS[l + 1]; k++) {
                sum += net.weights[l][k][j] * deltas[l + 1][k];
            }
            deltas[l][j] = sum * sigmoidDeriv(net.activations[l][j]);
        }
    }

    // Weight gradients
    for (let l = 0; l < net.weights.length; l++) {
        for (let j = 0; j < net.weights[l].length; j++) {
            for (let k = 0; k < net.weights[l][j].length; k++) {
                weightGrads[l][j][k] = deltas[l + 1][j] * net.activations[l][k];
            }
        }
    }

    return { ...net, deltas, weightGrads };
}

// Color helpers
function activationColor(val: number): string {
    const intensity = Math.round(val * 255);
    return `rgb(${intensity}, ${Math.round(intensity * 0.8)}, 255)`;
}

function gradientColor(val: number): string {
    const abs = Math.min(Math.abs(val) * 5, 1);
    if (val >= 0) return `rgba(34, 211, 238, ${abs})`; // cyan
    return `rgba(244, 114, 182, ${abs})`; // pink
}

// SVG Layout
const SVG_W = 700;
const SVG_H = 340;
const LAYER_X = [100, 350, 600];

function neuronY(layerIdx: number, neuronIdx: number): number {
    const count = LAYERS[layerIdx];
    const spacing = 70;
    const totalH = (count - 1) * spacing;
    return SVG_H / 2 - totalH / 2 + neuronIdx * spacing;
}

type Phase = 'idle' | 'forward' | 'backward';

export const NeuralNetworkBackpropViz: React.FC = () => {
    const [net, setNet] = useState<NetworkState>(initNetwork);
    const [phase, setPhase] = useState<Phase>('idle');
    const input = [0.8, 0.3, 0.6];
    const target = [0.9, 0.1];

    const runForward = useCallback(() => {
        setNet(prev => forwardPass(prev, input));
        setPhase('forward');
    }, []);

    const runBackward = useCallback(() => {
        setNet(prev => backwardPass(prev, target));
        setPhase('backward');
    }, []);

    const reset = useCallback(() => {
        setNet(initNetwork());
        setPhase('idle');
    }, []);

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Live Neural Network</h3>
                <div className="flex gap-2">
                    <button onClick={runForward}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${phase === 'idle' ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 ring-1 ring-cyan-500/50' : 'bg-white/5 text-gray-500'}`}
                    >1. Forward Pass</button>
                    <button onClick={runBackward}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${phase === 'forward' ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 ring-1 ring-pink-500/50' : 'bg-white/5 text-gray-500'}`}
                        disabled={phase !== 'forward'}
                    >2. Backward Pass</button>
                    <button onClick={reset}
                        className="px-4 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                    >Reset</button>
                </div>
            </div>

            <div className="bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: '380px' }}>
                    {/* Connections */}
                    {net.weights.map((layerW, l) =>
                        layerW.map((neuronW, j) =>
                            neuronW.map((w, k) => {
                                const x1 = LAYER_X[l];
                                const y1 = neuronY(l, k);
                                const x2 = LAYER_X[l + 1];
                                const y2 = neuronY(l + 1, j);
                                const grad = net.weightGrads[l][j][k];
                                const showGrad = phase === 'backward';
                                const color = showGrad ? gradientColor(grad) : `rgba(255,255,255,${Math.min(Math.abs(w) * 0.3, 0.4)})`;
                                const width = showGrad ? Math.max(Math.abs(grad) * 8, 1) : Math.max(Math.abs(w) * 2, 0.5);

                                return (
                                    <line key={`w-${l}-${j}-${k}`}
                                        x1={x1} y1={y1} x2={x2} y2={y2}
                                        stroke={color}
                                        strokeWidth={width}
                                        strokeLinecap="round"
                                    />
                                );
                            })
                        )
                    )}

                    {/* Neurons */}
                    {LAYERS.map((count, l) =>
                        Array.from({ length: count }, (_, j) => {
                            const cx = LAYER_X[l];
                            const cy = neuronY(l, j);
                            const act = net.activations[l][j];
                            const delta = net.deltas[l][j];
                            const fill = phase === 'backward' && l > 0
                                ? gradientColor(delta)
                                : phase !== 'idle'
                                    ? activationColor(act)
                                    : '#334155';

                            return (
                                <g key={`n-${l}-${j}`}>
                                    <circle cx={cx} cy={cy} r={22} fill={fill}
                                        stroke={phase === 'backward' && l > 0 ? '#f472b6' : '#22d3ee'}
                                        strokeWidth={1.5} opacity={0.9}
                                    />
                                    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                                        fill="white" fontSize="10" fontFamily="monospace"
                                    >
                                        {phase !== 'idle' ? act.toFixed(2) : '—'}
                                    </text>
                                    {phase === 'backward' && l > 0 && (
                                        <text x={cx} y={cy + 34} textAnchor="middle"
                                            fill="#f472b6" fontSize="9" fontFamily="monospace"
                                        >
                                            δ={delta.toFixed(3)}
                                        </text>
                                    )}
                                </g>
                            );
                        })
                    )}

                    {/* Layer Labels */}
                    {LAYER_LABELS.map((label, l) => (
                        <text key={`label-${l}`} x={LAYER_X[l]} y={20}
                            textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold"
                        >{label}</text>
                    ))}
                </svg>
            </div>

            {/* Info */}
            <div className="mt-4 flex gap-4 text-xs">
                <div className="flex-1 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                    <div className="text-cyan-400 font-bold mb-1">Forward Pass</div>
                    <div className="text-gray-500">Data flows left→right. Each neuron computes σ(Wx + b). Color = activation value.</div>
                </div>
                <div className="flex-1 p-3 bg-pink-500/5 border border-pink-500/20 rounded-lg">
                    <div className="text-pink-400 font-bold mb-1">Backward Pass</div>
                    <div className="text-gray-500">Errors flow right→left. δ values show each neuron's "blame". Line thickness = gradient magnitude.</div>
                </div>
            </div>
        </div>
    );
};
