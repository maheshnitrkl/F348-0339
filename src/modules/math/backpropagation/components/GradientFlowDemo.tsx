/* eslint-disable */
import React, { useState, useMemo } from 'react';

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const sigmoidDeriv = (x: number) => { const s = sigmoid(x); return s * (1 - s); };
const relu = (x: number) => Math.max(0, x);
const reluDeriv = (x: number) => x > 0 ? 1 : 0;
const tanh_ = (x: number) => Math.tanh(x);
const tanhDeriv = (x: number) => 1 - Math.tanh(x) ** 2;
const leakyRelu = (x: number) => x > 0 ? x : 0.01 * x;
const leakyReluDeriv = (x: number) => x > 0 ? 1 : 0.01;
const elu = (x: number) => x > 0 ? x : 1.0 * (Math.exp(x) - 1);
const eluDeriv = (x: number) => x > 0 ? 1 : 1.0 * Math.exp(x);
const swish = (x: number) => x * sigmoid(x);
const swishDeriv = (x: number) => { const s = sigmoid(x); return s + x * s * (1 - s); };

type ActivationType = 'sigmoid' | 'relu' | 'tanh' | 'leakyRelu' | 'elu' | 'swish';

const ACTIVATIONS: Record<ActivationType, { fn: (x: number) => number; deriv: (x: number) => number; color: string; label: string }> = {
    sigmoid: { fn: sigmoid, deriv: sigmoidDeriv, color: '#3b82f6', label: 'Sigmoid' },
    relu: { fn: relu, deriv: reluDeriv, color: '#22c55e', label: 'ReLU' },
    tanh: { fn: tanh_, deriv: tanhDeriv, color: '#f59e0b', label: 'Tanh' },
    leakyRelu: { fn: leakyRelu, deriv: leakyReluDeriv, color: '#8b5cf6', label: 'Leaky ReLU' },
    elu: { fn: elu, deriv: eluDeriv, color: '#ec4899', label: 'ELU' },
    swish: { fn: swish, deriv: swishDeriv, color: '#14b8a6', label: 'Swish' },
};

export const GradientFlowDemo: React.FC = () => {
    const [depth, setDepth] = useState(8);
    const [activation, setActivation] = useState<ActivationType>('sigmoid');

    // Simulate gradient magnitude through layers
    const gradientMagnitudes = useMemo(() => {
        const mags: number[] = [1.0]; // Start with gradient = 1 at output
        const actConfig = ACTIVATIONS[activation];

        for (let i = 1; i < depth; i++) {
            // Simulate: gradient *= weight * activation_derivative
            // For demonstration, use typical derivative values
            const typicalInput = 0.5 + Math.random() * 0.5; // Typical pre-activation value
            const derivValue = actConfig.deriv(typicalInput);
            const weight = 0.8 + Math.random() * 0.4; // Typical weight magnitude
            const prevMag = mags[i - 1] * derivValue * weight;
            mags.push(Math.max(prevMag, 1e-10)); // Clamp to avoid log(0)
        }

        return mags.reverse(); // Layer 0 (input) is first
    }, [depth, activation]);

    const maxMag = Math.max(...gradientMagnitudes);

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Gradient Flow Analysis</h3>
                    <p className="text-xs text-gray-500 mt-1">See how gradients vanish or explode across network depth</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-6 mb-6">
                <label className="text-sm text-gray-400 flex items-center gap-3">
                    Network Depth:
                    <input type="range" min="3" max="20" value={depth}
                        onChange={e => setDepth(parseInt(e.target.value))}
                        className="w-32 accent-cyan-500"
                    />
                    <span className="text-cyan-400 font-mono font-bold w-6">{depth}</span>
                </label>
                <div className="flex gap-2">
                    {(Object.keys(ACTIVATIONS) as ActivationType[]).map(key => (
                        <button key={key} onClick={() => setActivation(key)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activation === key ? 'ring-1' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            style={activation === key ? { backgroundColor: `${ACTIVATIONS[key].color}20`, color: ACTIVATIONS[key].color, borderColor: `${ACTIVATIONS[key].color}50` } : {}}
                        >{ACTIVATIONS[key].label}</button>
                    ))}
                </div>
            </div>

            {/* Gradient Heatmap */}
            <div className="bg-black/40 rounded-lg border border-white/5 p-4">
                <div className="flex items-end gap-1 h-40 justify-center">
                    {gradientMagnitudes.map((mag, i) => {
                        const normalizedHeight = maxMag > 0 ? (mag / maxMag) * 100 : 0;
                        const intensity = maxMag > 0 ? mag / maxMag : 0;
                        const isVanishing = mag < 0.01;

                        return (
                            <div key={i} className="flex flex-col items-center justify-end gap-1 h-full" style={{ width: `${Math.max(600 / depth, 20)}px` }}>
                                {/* Bar */}
                                <div className="w-full relative rounded-t-sm transition-all duration-300"
                                    style={{
                                        height: `${Math.max(normalizedHeight, 2)}%`,
                                        backgroundColor: isVanishing
                                            ? `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`
                                            : `rgba(34, 211, 238, ${0.2 + intensity * 0.8})`,
                                        boxShadow: intensity > 0.5
                                            ? `0 0 ${intensity * 20}px rgba(34, 211, 238, ${intensity * 0.5})`
                                            : 'none',
                                    }}
                                />
                                {/* Label */}
                                <span className="text-[9px] text-gray-600 font-mono">L{i}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Scale labels */}
                <div className="flex justify-between mt-3 text-[10px] text-gray-600 font-mono">
                    <span>Input Layer</span>
                    <span>Output Layer</span>
                </div>
            </div>

            {/* Diagnostic */}
            <div className={`mt-4 p-3 rounded-lg border text-sm ${gradientMagnitudes[0] < 0.001
                ? 'bg-red-500/10 border-red-500/20 text-red-300'
                : gradientMagnitudes[0] > 10
                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                    : 'bg-green-500/10 border-green-500/20 text-green-300'
                }`}>
                {gradientMagnitudes[0] < 0.001 ? (
                    <><strong>⚠️ Vanishing Gradients!</strong> The gradient at the input layer is {gradientMagnitudes[0].toExponential(2)} — the early layers won't learn. This often happens with saturating activations.</>
                ) : gradientMagnitudes[0] > 10 ? (
                    <><strong>💥 Exploding Gradients!</strong> The gradient magnitude is {gradientMagnitudes[0].toFixed(1)} — training becomes unstable. Use gradient clipping or normalization.</>
                ) : (
                    <><strong>✅ Healthy Gradients.</strong> Gradient magnitude at input is {gradientMagnitudes[0].toFixed(4)} — learning will be stable across all layers.</>
                )}
            </div>
        </div>
    );
};
