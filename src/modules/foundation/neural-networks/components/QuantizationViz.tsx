import React, { useState, useMemo } from 'react';
import { HardDrive, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

type Precision = 'FP32' | 'FP16' | 'INT8' | 'INT4';

const PRECISION_INFO = {
    'FP32': { bits: 32, states: '4.2 Billion', desc: 'Standard deep learning training precision. High memory footprint.', memory: '100%' },
    'FP16': { bits: 16, states: '65,536', desc: 'Half-precision. Standard for modern GPU inference.', memory: '50%' },
    'INT8': { bits: 8, states: '256', desc: 'Quantized standard for edge devices (phones, IoT).', memory: '25%' },
    'INT4': { bits: 4, states: '16', desc: 'Aggressive quantization used for massive LLMs (like LLaMA on MacBooks).', memory: '12.5%' }
};

export const QuantizationViz: React.FC = () => {
    const [precision, setPrecision] = useState<Precision>('FP32');

    // Generate smooth dummy data for a weight matrix distribution
    const rawWeights = useMemo(() => {
        const weights = [];
        for (let i = 0; i < 200; i++) {
            // Smooth curve
            const x = (i / 200) * 4 - 2; 
            const val = Math.exp(-x * x) * Math.sin(x * 6); 
            weights.push(val); 
        }
        return weights;
    }, []);

    // Apply Quantization
    const quantizedWeights = useMemo(() => {
        if (precision === 'FP32' || precision === 'FP16') return rawWeights;
        
        const levels = precision === 'INT8' ? 256 : 16;
        const max = 1;
        const min = -1;
        const step = (max - min) / levels;

        return rawWeights.map(w => {
            const bucket = Math.round((w - min) / step);
            return min + bucket * step;
        });
    }, [rawWeights, precision]);

    const info = PRECISION_INFO[precision];

    return (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <HardDrive className="text-amber-400" /> Quantization Simulator
                    </h3>
                    <p className="text-slate-400 text-sm">Observe the effects of reducing precision on model weights</p>
                </div>
                
                <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(Object.keys(PRECISION_INFO) as Precision[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPrecision(p)}
                            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${
                                precision === p 
                                ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visualizer */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[300px]">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Weight Distribution Profile</h4>
                    
                    <div className="flex-1 flex items-end justify-between gap-[2px] relative group h-48 w-full mt-4">
                        {/* Midline */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800" />
                        
                        {quantizedWeights.map((w, i) => {
                            const h = Math.abs(w) * 50; // 0 to 50% relative to midline
                            const isPositive = w >= 0;
                            const color = isPositive ? '#10b981' : '#f43f5e';
                            return (
                                <div key={i} className={`flex-1 flex ${isPositive ? 'items-end pb-[50%]' : 'items-start pt-[50%]'} h-full relative`}>
                                    <motion.div 
                                        initial={false}
                                        animate={{ height: `${h}%` }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        className="w-full transition-colors duration-300"
                                        style={{ backgroundColor: color, opacity: precision === 'FP32' ? 0.7 : 1 }}
                                    />
                                </div>
                            );
                        })}
                        
                        {/* Overlay to show quantization banding */}
                        {precision === 'INT4' && (
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                {[...Array(17)].map((_, i) => (
                                    <div key={i} className="w-full h-px bg-white/50" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
                    <div>
                        <div className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                            {precision}
                            {precision === 'INT4' && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded uppercase tracking-wider border border-amber-500/30">Extreme</span>}
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed min-h-[40px]">{info.desc}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Bits per Weight</div>
                            <div className="text-xl font-mono text-amber-400">{info.bits}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Possible Values</div>
                            <div className="text-xl font-mono text-blue-400">{info.states}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center justify-between">
                                <span>Memory Footprint</span>
                                <span className="text-emerald-400 font-bold">{info.memory}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700">
                                <motion.div 
                                    className="h-full bg-emerald-500"
                                    initial={{ width: '100%' }}
                                    animate={{ width: info.memory }}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3">
                        <Zap className="text-amber-500 shrink-0" size={20} />
                        <p className="text-xs text-amber-200/70 leading-relaxed">
                            Lower precision dramatically increases inference speed on GPUs and TPUs by utilizing dedicated integer tensor cores.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
