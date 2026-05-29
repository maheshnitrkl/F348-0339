/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type ActivationType = 'sigmoid' | 'relu' | 'tanh';

const ACT_FNS: Record<ActivationType, { label: string; color: string; fn: (x: number) => number; deriv: (x: number) => number }> = {
    sigmoid: { label: 'Sigmoid', color: '#818cf8', fn: x => 1 / (1 + Math.exp(-x)), deriv: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); } },
    relu: { label: 'ReLU', color: '#34d399', fn: x => Math.max(0, x), deriv: x => x > 0 ? 1 : 0 },
    tanh: { label: 'Tanh', color: '#f472b6', fn: x => Math.tanh(x), deriv: x => 1 - Math.pow(Math.tanh(x), 2) },
};

export const VanishingGradientViz: React.FC = () => {
    const [activation, setActivation] = useState<ActivationType>('sigmoid');
    const [numLayers, setNumLayers] = useState(6);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animProgress, setAnimProgress] = useState(0);
    const animRef = useRef<number | null>(null);

    const cfg = ACT_FNS[activation];

    // Compute gradient magnitude through layers
    // Start with gradient = 1 at output, multiply by derivative at each layer
    // Assume average activation input is 0 for sigmoid/tanh (worst case)
    const getGradients = () => {
        const grads = [1.0];
        const maxDeriv = activation === 'relu' ? 1 : activation === 'sigmoid' ? 0.25 : 1.0;
        for (let i = 0; i < numLayers - 1; i++) {
            grads.unshift(grads[0] * maxDeriv);
        }
        return grads;
    };

    const gradients = getGradients();
    const maxGrad = Math.max(...gradients);

    const runAnimation = () => {
        setIsAnimating(true);
        setAnimProgress(0);
        let start: number;
        const duration = 1800;
        const animate = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setAnimProgress(progress);
            if (progress < 1) animRef.current = requestAnimationFrame(animate);
            else setIsAnimating(false);
        };
        animRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => { runAnimation(); }, [activation, numLayers]);
    useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

    const barColors = {
        sigmoid: { strong: '#ef4444', weak: '#1e1b4b' },
        relu: { strong: '#10b981', weak: '#064e3b' },
        tanh: { strong: '#f472b6', weak: '#1f1230' },
    };
    const colors = barColors[activation];

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h4 className="text-white font-bold">Gradient Flow Through Layers</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Watch how gradients shrink (or stay stable) as they flow backward</p>
                </div>
                <div className="flex gap-2">
                    {(Object.keys(ACT_FNS) as ActivationType[]).map(a => (
                        <button key={a} onClick={() => setActivation(a)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activation === a ? 'border shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white border border-transparent'}`}
                            style={activation === a ? { borderColor: ACT_FNS[a].color, backgroundColor: ACT_FNS[a].color + '22', color: ACT_FNS[a].color } : {}}
                        >
                            {ACT_FNS[a].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layers & Depth Slider */}
            <div className="flex items-center gap-4">
                <span className="text-slate-500 text-xs">Depth:</span>
                <input type="range" min="3" max="10" step="1" value={numLayers}
                    onChange={e => setNumLayers(parseInt(e.target.value))}
                    className="flex-1" style={{ accentColor: cfg.color }} />
                <span className="text-slate-400 text-sm font-mono w-16">{numLayers} layers</span>
            </div>

            {/* Gradient Bar Visualization */}
            <div className="space-y-1.5">
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${numLayers}, 1fr)` }}>
                    {gradients.map((g, i) => {
                        const normalizedHeight = maxGrad > 0 ? g / maxGrad : 0;
                        const layerProgress = (i + 1) / numLayers;
                        const visible = animProgress >= (1 - layerProgress) * 0.8;
                        const animatedHeight = visible ? normalizedHeight * Math.min(1, (animProgress - (1 - layerProgress) * 0.8) / 0.2) : 0;

                        return (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className="text-xs font-mono text-slate-500 h-5 flex items-end">
                                    {(g * 100).toFixed(1)}%
                                </div>
                                <div className="w-full h-32 bg-slate-800/50 rounded-lg relative overflow-hidden flex flex-col justify-end">
                                    <motion.div
                                        className="w-full rounded-t-lg"
                                        style={{
                                            height: `${Math.max(2, animatedHeight * 100)}%`,
                                            background: `linear-gradient(to top, ${cfg.color}, ${cfg.color}44)`,
                                            boxShadow: animatedHeight > 0.1 ? `0 0 12px ${cfg.color}66` : 'none',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <div className="text-xs text-slate-600">L{i + 1}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Direction arrow */}
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span>← Gradient flows backward (early layers)</span>
                    <span>(output layer) forward →</span>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`rounded-xl px-4 py-3 border text-sm font-semibold ${activation === 'relu'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                {activation === 'relu'
                    ? '✅ ReLU preserves gradient magnitude (derivative = 1 for positive inputs). No vanishing!'
                    : activation === 'sigmoid'
                        ? `❌ Sigmoid: max derivative is only 0.25. With ${numLayers} layers: 0.25^${numLayers - 1} = ${(Math.pow(0.25, numLayers - 1) * 100).toFixed(4)}% gradient remaining!`
                        : `⚠️ Tanh: max derivative is 1.0, but still saturates. Deep nets still suffer.`
                }
            </div>

            {/* Math insight */}
            <div className="bg-slate-800/40 rounded-lg px-4 py-3 text-sm">
                <p className="text-slate-400">
                    During backprop, the chain rule multiplies gradients at each layer:
                </p>
                <p className="text-white font-mono mt-1 text-xs">
                    ∂L/∂w₁ = ∂L/∂yₙ · f'(zₙ) · f'(zₙ₋₁) · … · f'(z₁)
                </p>
                <p className="text-slate-500 text-xs mt-1">
                    If f'(z) &lt; 1 (sigmoid max = 0.25), the product shrinks exponentially with depth.
                </p>
            </div>
        </div>
    );
};
