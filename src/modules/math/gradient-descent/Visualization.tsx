import React, { useState } from 'react';
import { RotateCw, Play, Pause, RefreshCw } from 'lucide-react';
import { GradientDescentPlot } from '../../../components/visualizations/GradientDescentPlot';
import { NeuralNetworkGraph } from '../../../components/visualizations/NeuralNetworkGraph';

export const GradientDescentVisualization: React.FC = () => {
    const [activeVis, setActiveVis] = useState<'descent' | 'network'>('descent');

    // Gradient Descent Controls
    const [learningRate, setLearningRate] = useState(0.01);
    const [isRunning, setIsRunning] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const handleReset = () => {
        setIsRunning(false);
        setResetKey(prev => prev + 1);
    };

    return (
        <div className="w-full h-[80vh] min-h-[500px] relative rounded-xl overflow-hidden border border-white/10 bg-black/20">
            {/* Header / Controls */}
            <div className="absolute top-4 left-4 z-10 w-full pr-8 flex flex-col md:flex-row justify-between gap-4 pointer-events-none">

                {/* Left Side: Toggle & Info */}
                <div className="flex gap-2 pointer-events-auto">
                    <button
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors"
                        onClick={() => setActiveVis(v => v === 'descent' ? 'network' : 'descent')}
                        title="Switch Visualization"
                    >
                        <RotateCw size={18} />
                    </button>

                    {activeVis === 'descent' && (
                        <div className="flex gap-2 bg-black/60 backdrop-blur rounded-lg p-2 border border-white/10">
                            {/* Controls */}
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                className={`p-1.5 rounded-md transition-colors ${isRunning ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                                title={isRunning ? "Pause" : "Start Gradient Descent"}
                            >
                                {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            </button>
                            <button
                                onClick={handleReset}
                                className="p-1.5 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                                title="Reset Position"
                            >
                                <RefreshCw size={16} />
                            </button>

                            <div className="w-px h-full bg-white/20 mx-1"></div>

                            <div className="flex flex-col justify-center gap-1">
                                <div className="flex justify-between items-center w-32">
                                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Learning Rate</label>
                                    <span className="text-[10px] font-mono text-cyan-400">{learningRate.toFixed(3)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.001" max="0.1" step="0.001"
                                    value={learningRate}
                                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                                    className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                />
                            </div>
                        </div>
                    )}

                    {activeVis === 'network' && (
                        <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--color-electric-cyan)] border border-[var(--color-electric-cyan)]/20 flex items-center">
                            Architecture: MLP
                        </div>
                    )}
                </div>

                {/* Right Side: Tab Switcher */}
                <div className="pointer-events-auto flex gap-2 self-start">
                    <button
                        onClick={() => setActiveVis('descent')}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${activeVis === 'descent' ? 'bg-white/20 border-white/50 text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:text-gray-300'}`}
                    >
                        3D Surface
                    </button>
                    <button
                        onClick={() => setActiveVis('network')}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${activeVis === 'network' ? 'bg-white/20 border-white/50 text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:text-gray-300'}`}
                    >
                        Graph
                    </button>
                </div>
            </div>

            {/* Visualizations */}
            <div className="w-full h-full relative">
                {activeVis === 'descent' ? (
                    <React.Suspense fallback={<div className="text-white text-center p-20">Loading 3D Engine...</div>}>
                        <GradientDescentPlot
                            learningRate={learningRate}
                            isRunning={isRunning}
                            resetKey={resetKey}
                        />
                    </React.Suspense>
                ) : (
                    <NeuralNetworkGraph />
                )}
            </div>
        </div>
    );
};
