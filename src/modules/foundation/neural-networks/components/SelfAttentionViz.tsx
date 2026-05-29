import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calculator, Cpu } from 'lucide-react';

// Data for "The cat sat"
const WORDS = ['The', 'cat', 'sat'];

// In reality, Q = E * Wq. Here we just mock the final Q, K, V vectors for simplicity
const Q = [
  [0.8, 0.2, 0.1],
  [0.3, 0.9, 0.2],
  [0.1, 0.7, 0.9]
];
const K = [
  [0.7, 0.1, 0.2],
  [0.2, 0.8, 0.1],
  [0.1, 0.6, 0.8]
];
const V = [
  [0.5, 0.0, 0.0],
  [0.0, 0.9, 0.0],
  [0.0, 0.0, 0.8]
];

// Precompute Q * K^T
const SCORES = WORDS.map((_, i) => 
  WORDS.map((_, j) => {
    return Q[i].reduce((sum, q_val, dim) => sum + q_val * K[j][dim], 0);
  })
);

// Softmax
const softmax = (arr: number[]) => {
  const exp = arr.map(x => Math.exp(x));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map(x => x / sum);
};

const ATTENTION_WEIGHTS = SCORES.map(row => softmax(row));

export const SelfAttentionViz: React.FC = () => {
    const [activeWord, setActiveWord] = useState<number>(1); // 'cat' by default
    const [step, setStep] = useState<number>(0); // 0: QKV, 1: Scores, 2: Weights, 3: Context

    const steps = [
        { title: "Generate Q, K, V", desc: "Each word's embedding is projected into Query, Key, and Value vectors." },
        { title: "Attention Scores (Q • K)", desc: "The Query of the active word is dotted with every word's Key to get raw scores." },
        { title: "Softmax Weights", desc: "Raw scores are normalized via Softmax into probabilities that sum to 1." },
        { title: "Context Vector", desc: "The final representation is a weighted sum of all Value vectors." }
    ];

    const renderVector = (vec: number[], color: string, label: string) => (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{color}}>{label}</span>
            <div className={`flex flex-col gap-1 p-1.5 rounded bg-black/40 border`} style={{borderColor: `${color}40`}}>
                {vec.map((v, i) => {
                    const intensity = Math.min(255, Math.floor(Math.abs(v) * 200)).toString(16).padStart(2, '0');
                    return (
                        <div key={i} className="w-8 h-8 flex items-center justify-center rounded text-xs font-mono text-white" style={{backgroundColor: `${color}${intensity}`}}>
                            {v.toFixed(1)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Cpu className="text-violet-400" /> Self-Attention Mechanism
                    </h3>
                    <p className="text-slate-400 text-sm">Interactive step-by-step visualization of attention</p>
                </div>
                
                <div className="flex gap-2">
                    {WORDS.map((w, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveWord(i)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                activeWord === i 
                                ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            "{w}"
                        </button>
                    ))}
                </div>
            </div>

            {/* Stepper */}
            <div className="flex gap-2">
                {steps.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                            step === i 
                            ? 'bg-slate-800/80 border-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.5)]' 
                            : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/50'
                        }`}
                    >
                        <div className={`text-xs font-bold mb-1 ${step === i ? 'text-white' : 'text-slate-500'}`}>Step {i + 1}</div>
                        <div className={`text-sm ${step === i ? 'text-violet-300' : 'text-slate-400'}`}>{s.title}</div>
                    </button>
                ))}
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-6 min-h-[360px] relative overflow-hidden flex flex-col items-center">
                <p className="text-slate-400 text-sm mb-6 text-center max-w-2xl mx-auto h-10">{steps[step].desc}</p>
                
                <div className="flex-1 w-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="step0" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="flex justify-around items-center w-full max-w-4xl pt-4">
                                {WORDS.map((w, i) => (
                                    <div key={i} className={`flex flex-col items-center gap-4 transition-all duration-500 ${activeWord !== i ? 'opacity-30 scale-95' : 'scale-105 drop-shadow-2xl'}`}>
                                        <div className="text-lg font-bold text-white px-4 py-2 bg-slate-800 rounded-lg shadow-lg">"{w}"</div>
                                        <div className="flex gap-4">
                                            {renderVector(Q[i], '#f43f5e', 'Query')}
                                            {renderVector(K[i], '#3b82f6', 'Key')}
                                            {renderVector(V[i], '#10b981', 'Value')}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="flex flex-col items-center gap-8 w-full">
                                <div className="flex items-center justify-center gap-12 w-full">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xs text-rose-400 font-bold uppercase tracking-widest">Active Query</span>
                                        <div className="text-lg font-bold text-white px-4 py-2 bg-rose-500/20 border border-rose-500/50 rounded-lg">
                                            "{WORDS[activeWord]}" Q
                                        </div>
                                        <div className="flex gap-1 mt-2">
                                            {Q[activeWord].map((v, i) => <div key={i} className="w-10 h-10 flex items-center justify-center bg-rose-500/20 rounded text-sm font-mono text-rose-200 border border-rose-500/30">{v.toFixed(1)}</div>)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-slate-800 rounded-full border border-slate-700 text-slate-400">
                                            <Calculator size={24} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500">Dot Product</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">All Keys</span>
                                        <div className="flex gap-6 mt-2">
                                            {WORDS.map((w, i) => (
                                                <div key={i} className="flex flex-col items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                    <div className="text-sm font-bold text-blue-300">"{w}" K</div>
                                                    <div className="flex flex-col gap-1">
                                                        {K[i].map((v, j) => <div key={j} className="w-10 h-6 flex items-center justify-center bg-blue-500/20 rounded text-xs font-mono text-blue-200">{v.toFixed(1)}</div>)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-3 w-full max-w-xl mt-4">
                                    <span className="text-xs text-white font-bold uppercase tracking-widest">Raw Attention Scores</span>
                                    <div className="flex justify-between w-full bg-slate-900/80 rounded-xl p-4 border border-slate-700 shadow-inner">
                                        {WORDS.map((w, i) => (
                                            <div key={i} className="flex flex-col items-center w-28 gap-1">
                                                <span className="text-sm text-slate-400 font-medium">"{w}"</span>
                                                <span className={`text-2xl font-mono ${i === activeWord ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>{SCORES[activeWord][i].toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="flex flex-col items-center justify-center h-full gap-8 w-full">
                                <div className="flex items-center justify-center gap-12 w-full max-w-3xl">
                                    <div className="flex-1 flex flex-col items-center gap-3">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Raw Scores</span>
                                        <div className="w-full flex flex-col gap-2">
                                            {WORDS.map((w, i) => (
                                                <div key={i} className="w-full flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                                                    <span className="text-sm text-slate-400 font-medium">"{w}"</span>
                                                    <span className="font-mono text-white text-lg">{SCORES[activeWord][i].toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                        <div className="bg-slate-800/80 p-4 rounded-full border border-slate-700 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                                            <ArrowRight size={32} />
                                        </div>
                                        <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded font-mono font-bold">Softmax</span>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col items-center gap-3">
                                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Attention Probabilities</span>
                                        <div className="w-full flex flex-col gap-2">
                                            {WORDS.map((w, i) => {
                                                const weight = ATTENTION_WEIGHTS[activeWord][i];
                                                return (
                                                    <div key={i} className="w-full flex items-center gap-3 bg-slate-900 p-3 rounded-lg relative overflow-hidden border border-slate-800">
                                                        <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 transition-all duration-1000" style={{width: `${weight * 100}%`}} />
                                                        <span className="text-sm text-slate-300 relative z-10 w-10 font-medium">"{w}"</span>
                                                        <span className={`font-mono relative z-10 text-right flex-1 text-lg ${i === activeWord ? 'text-emerald-400 font-bold' : 'text-emerald-500/70'}`}>{(weight * 100).toFixed(1)}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="flex flex-col items-center justify-center h-full gap-8 w-full">
                                <div className="flex items-center justify-center gap-8 w-full">
                                    {WORDS.map((w, i) => {
                                        const weight = ATTENTION_WEIGHTS[activeWord][i];
                                        return (
                                            <div key={i} className={`flex flex-col items-center gap-3 transition-all ${weight < 0.1 ? 'opacity-30 scale-90' : 'opacity-100 scale-100'}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{(weight).toFixed(2)} ×</div>
                                                    <span className="text-slate-400 text-sm font-medium">"{w}" Value</span>
                                                </div>
                                                {renderVector(V[i], '#10b981', '')}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-violet-500" />
                                    <div className="bg-violet-500 text-white rounded-full p-2 mt-[-4px] z-10 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </div>
                                    <div className="w-px h-8 bg-gradient-to-b from-violet-500 to-transparent mb-[-12px]" />
                                </div>
                                
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-xs text-violet-400 font-bold uppercase tracking-widest">New Contextual Embedding for "{WORDS[activeWord]}"</span>
                                    <div className="flex gap-2 p-3 rounded-xl bg-violet-500/20 border-2 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                                        {/* Compute weighted sum */}
                                        {V[0].map((_, dim) => {
                                            const sum = WORDS.reduce((acc, _, i) => acc + ATTENTION_WEIGHTS[activeWord][i] * V[i][dim], 0);
                                            return (
                                                <div key={dim} className="w-14 h-14 flex items-center justify-center bg-violet-500/30 rounded-lg text-lg text-violet-100 font-bold font-mono border border-violet-400/30">
                                                    {sum.toFixed(2)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-slate-500 text-xs mt-2 max-w-md text-center">
                                        This vector now contains the original meaning of "{WORDS[activeWord]}" enriched with context from the surrounding words based on their attention weights.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
