import React from 'react';
import type { ActivationType } from '../PlaygroundEngine';
import type { DatasetType } from '../Datasets';

interface ControlPanelProps {
    activation: ActivationType;
    setActivation: (a: ActivationType) => void;
    learningRate: number;
    setLearningRate: (lr: number) => void;
    dataset: DatasetType;
    setDataset: (d: DatasetType) => void;
    noise: number;
    setNoise: (n: number) => void;
    batchSize: number;
    setBatchSize: (b: number) => void;
    regType: 'l1' | 'l2' | 'none';
    setRegType: (r: 'l1' | 'l2' | 'none') => void;
    regRate: number;
    setRegRate: (r: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    activation, setActivation,
    learningRate, setLearningRate,
    dataset, setDataset,
    noise, setNoise,
    batchSize, setBatchSize,
    regType, setRegType,
    regRate, setRegRate
}) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            
            {/* DATASET & NOISE */}
            <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-orange-400">📊</span> Data
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(['spiral', 'circle', 'xor', 'gaussian', 'medical-anomaly'] as DatasetType[]).map(d => (
                        <button
                            key={d}
                            onClick={() => setDataset(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                                dataset === d 
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' 
                                    : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                            }`}
                        >
                            {d.replace('-', ' ')}
                        </button>
                    ))}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Noise</span>
                        <span className="font-mono text-cyan-400">{(noise * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))}
                        className="w-full accent-orange-500" 
                    />
                </div>
            </div>

            <hr className="border-slate-800" />

            {/* HYPERPARAMETERS */}
            <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-cyan-400">⚙️</span> Hyperparameters
                </h3>
                
                <div className="space-y-4">
                    {/* Activation */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 block">Activation</label>
                        <div className="flex flex-wrap gap-2">
                            {(['relu', 'tanh', 'sigmoid', 'linear'] as ActivationType[]).map(a => (
                                <button
                                    key={a}
                                    onClick={() => setActivation(a)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                                        activation === a 
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                                            : 'bg-slate-800 text-slate-500 border border-transparent hover:text-slate-300'
                                    }`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Learning Rate */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Learning Rate</span>
                            <span className="font-mono text-cyan-400">{learningRate.toFixed(3)}</span>
                        </div>
                        <input 
                            type="range" min="0.001" max="0.1" step="0.001" 
                            value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                            className="w-full accent-cyan-500" 
                        />
                    </div>

                    {/* Batch Size */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Batch Size</span>
                            <span className="font-mono text-cyan-400">{batchSize}</span>
                        </div>
                        <input 
                            type="range" min="10" max="100" step="10" 
                            value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value))}
                            className="w-full accent-cyan-500" 
                        />
                    </div>

                    {/* Regularization */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <label className="text-xs text-slate-400 block">Regularization</label>
                        <div className="flex gap-2">
                            {(['none', 'l1', 'l2'] as const).map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRegType(r)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all uppercase ${
                                        regType === r 
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                            : 'bg-slate-800 text-slate-500 border border-transparent hover:text-slate-300'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    {regType !== 'none' && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Reg Rate</span>
                                <span className="font-mono text-purple-400">{regRate.toExponential(2)}</span>
                            </div>
                            <input 
                                type="range" min="-5" max="-1" step="0.5" 
                                value={Math.log10(regRate)} 
                                onChange={(e) => setRegRate(Math.pow(10, parseFloat(e.target.value)))}
                                className="w-full accent-purple-500" 
                            />
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
