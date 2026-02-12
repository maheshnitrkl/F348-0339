import React, { useState } from 'react';

// A tiny network: 2 inputs → 1 hidden (sigmoid) → 1 output (sigmoid)
// Fixed example values for pedagogical clarity
const EXAMPLE = {
    inputs: [0.05, 0.10],
    weights: { w1: 0.15, w2: 0.20, w3: 0.25, w4: 0.30, w5: 0.40, w6: 0.45, w7: 0.50, w8: 0.55 },
    biases: { b1: 0.35, b2: 0.60 },
    targets: [0.01, 0.99],
};

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

interface Step {
    title: string;
    formula: string;
    calculation: string;
    result: string;
    highlight: 'forward' | 'loss' | 'backward' | 'update';
}

function generateSteps(): Step[] {
    const { inputs, weights: w, biases: b, targets: t } = EXAMPLE;
    const [i1, i2] = inputs;

    // Forward: Hidden layer
    const net_h1 = w.w1 * i1 + w.w2 * i2 + b.b1;
    const out_h1 = sigmoid(net_h1);
    const net_h2 = w.w3 * i1 + w.w4 * i2 + b.b1;
    const out_h2 = sigmoid(net_h2);

    // Forward: Output layer
    const net_o1 = w.w5 * out_h1 + w.w6 * out_h2 + b.b2;
    const out_o1 = sigmoid(net_o1);
    const net_o2 = w.w7 * out_h1 + w.w8 * out_h2 + b.b2;
    const out_o2 = sigmoid(net_o2);

    // Loss
    const E_o1 = 0.5 * (t[0] - out_o1) ** 2;
    const E_o2 = 0.5 * (t[1] - out_o2) ** 2;
    const E_total = E_o1 + E_o2;

    // Backward: Output errors
    const dE_dout_o1 = -(t[0] - out_o1);
    const dout_dnet_o1 = out_o1 * (1 - out_o1);
    const delta_o1 = dE_dout_o1 * dout_dnet_o1;

    const dE_dout_o2 = -(t[1] - out_o2);
    const dout_dnet_o2 = out_o2 * (1 - out_o2);
    const delta_o2 = dE_dout_o2 * dout_dnet_o2;

    // Gradient for w5
    const dE_dw5 = delta_o1 * out_h1;

    return [
        {
            title: 'Step 1: Forward — Hidden Neuron h₁',
            formula: 'net_h1 = w₁·i₁ + w₂·i₂ + b₁',
            calculation: `net_h1 = ${w.w1}×${i1} + ${w.w2}×${i2} + ${b.b1} = ${net_h1.toFixed(4)}`,
            result: `out_h1 = σ(${net_h1.toFixed(4)}) = ${out_h1.toFixed(6)}`,
            highlight: 'forward',
        },
        {
            title: 'Step 2: Forward — Hidden Neuron h₂',
            formula: 'net_h2 = w₃·i₁ + w₄·i₂ + b₁',
            calculation: `net_h2 = ${w.w3}×${i1} + ${w.w4}×${i2} + ${b.b1} = ${net_h2.toFixed(4)}`,
            result: `out_h2 = σ(${net_h2.toFixed(4)}) = ${out_h2.toFixed(6)}`,
            highlight: 'forward',
        },
        {
            title: 'Step 3: Forward — Output Neuron o₁',
            formula: 'net_o1 = w₅·h₁ + w₆·h₂ + b₂',
            calculation: `net_o1 = ${w.w5}×${out_h1.toFixed(4)} + ${w.w6}×${out_h2.toFixed(4)} + ${b.b2} = ${net_o1.toFixed(4)}`,
            result: `out_o1 = σ(${net_o1.toFixed(4)}) = ${out_o1.toFixed(6)}`,
            highlight: 'forward',
        },
        {
            title: 'Step 4: Forward — Output Neuron o₂',
            formula: 'net_o2 = w₇·h₁ + w₈·h₂ + b₂',
            calculation: `net_o2 = ${w.w7}×${out_h1.toFixed(4)} + ${w.w8}×${out_h2.toFixed(4)} + ${b.b2} = ${net_o2.toFixed(4)}`,
            result: `out_o2 = σ(${net_o2.toFixed(4)}) = ${out_o2.toFixed(6)}`,
            highlight: 'forward',
        },
        {
            title: 'Step 5: Compute Loss',
            formula: 'E = ½(target - output)²',
            calculation: `E_o1 = ½(${t[0]} - ${out_o1.toFixed(4)})² = ${E_o1.toFixed(6)}\nE_o2 = ½(${t[1]} - ${out_o2.toFixed(4)})² = ${E_o2.toFixed(6)}`,
            result: `E_total = ${E_o1.toFixed(6)} + ${E_o2.toFixed(6)} = ${E_total.toFixed(6)}`,
            highlight: 'loss',
        },
        {
            title: 'Step 6: Backward — δ at Output o₁',
            formula: 'δ_o1 = -(target - output) × σ\'(net)',
            calculation: `δ_o1 = -(${t[0]} - ${out_o1.toFixed(4)}) × ${out_o1.toFixed(4)} × (1 - ${out_o1.toFixed(4)})`,
            result: `δ_o1 = ${dE_dout_o1.toFixed(4)} × ${dout_dnet_o1.toFixed(4)} = ${delta_o1.toFixed(6)}`,
            highlight: 'backward',
        },
        {
            title: 'Step 7: Backward — δ at Output o₂',
            formula: 'δ_o2 = -(target - output) × σ\'(net)',
            calculation: `δ_o2 = -(${t[1]} - ${out_o2.toFixed(4)}) × ${out_o2.toFixed(4)} × (1 - ${out_o2.toFixed(4)})`,
            result: `δ_o2 = ${dE_dout_o2.toFixed(4)} × ${dout_dnet_o2.toFixed(4)} = ${delta_o2.toFixed(6)}`,
            highlight: 'backward',
        },
        {
            title: 'Step 8: Gradient — ∂E/∂w₅',
            formula: '∂E/∂w₅ = δ_o1 × out_h1',
            calculation: `∂E/∂w₅ = ${delta_o1.toFixed(6)} × ${out_h1.toFixed(6)}`,
            result: `∂E/∂w₅ = ${dE_dw5.toFixed(8)}`,
            highlight: 'backward',
        },
        {
            title: 'Step 9: Update Weight w₅',
            formula: 'w₅_new = w₅ - η × ∂E/∂w₅',
            calculation: `w₅_new = ${w.w5} - 0.5 × ${dE_dw5.toFixed(6)}`,
            result: `w₅_new = ${(w.w5 - 0.5 * dE_dw5).toFixed(6)}`,
            highlight: 'update',
        },
    ];
}

const HIGHLIGHT_COLORS = {
    forward: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', badge: 'bg-cyan-500/20 text-cyan-400' },
    loss: { bg: 'bg-orange-500/5', border: 'border-orange-500/20', badge: 'bg-orange-500/20 text-orange-400' },
    backward: { bg: 'bg-pink-500/5', border: 'border-pink-500/20', badge: 'bg-pink-500/20 text-pink-400' },
    update: { bg: 'bg-green-500/5', border: 'border-green-500/20', badge: 'bg-green-500/20 text-green-400' },
};

export const StepByStepCalculator: React.FC = () => {
    const steps = generateSteps();
    const [currentStep, setCurrentStep] = useState(0);

    const step = steps[currentStep];
    const colors = HIGHLIGHT_COLORS[step.highlight];

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Step-by-Step Calculator</h3>
                <span className="text-xs text-gray-500 font-mono">{currentStep + 1} / {steps.length}</span>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1 mb-6">
                {steps.map((s, i) => (
                    <button key={i} onClick={() => setCurrentStep(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${i === currentStep ? 'w-8' : 'w-2'}`}
                        style={{
                            backgroundColor: i <= currentStep
                                ? s.highlight === 'forward' ? '#22d3ee'
                                    : s.highlight === 'loss' ? '#f59e0b'
                                        : s.highlight === 'backward' ? '#f472b6'
                                            : '#22c55e'
                                : '#334155',
                        }}
                    />
                ))}
            </div>

            {/* Current Step Display */}
            <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 transition-all`}>
                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {step.highlight}
                    </span>
                    <h4 className="text-lg font-bold text-white">{step.title}</h4>
                </div>

                {/* Formula */}
                <div className="bg-black/40 rounded-lg p-4 mb-4 border border-white/5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Formula</div>
                    <div className="font-mono text-base text-white">{step.formula}</div>
                </div>

                {/* Calculation */}
                <div className="bg-black/20 rounded-lg p-4 mb-4 border border-white/5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Substitution</div>
                    {step.calculation.split('\n').map((line, i) => (
                        <div key={i} className="font-mono text-sm text-gray-300">{line}</div>
                    ))}
                </div>

                {/* Result */}
                <div className="bg-black/60 rounded-lg p-4 border border-white/10">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Result</div>
                    <div className="font-mono text-base text-cyan-400 font-bold">{step.result}</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-5 py-2 rounded-lg text-sm font-bold bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >&larr; Previous</button>
                <button
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={currentStep === steps.length - 1}
                    className="px-5 py-2 rounded-lg text-sm font-bold bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >Next Step &rarr;</button>
            </div>
        </div>
    );
};
