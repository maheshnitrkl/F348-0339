import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { NeuralNet, type ActivationType, type NetworkConfig, type DataPoint } from './playground/PlaygroundEngine';
import { generateDataset, type DatasetType } from './playground/Datasets';
import { NetworkBuilder } from './playground/components/NetworkBuilder';
import { DecisionBoundaryViz } from './playground/components/DecisionBoundaryViz';
import { ControlPanel } from './playground/components/ControlPanel';

export const Playground: React.FC = () => {
    // Hyperparameters
    const [activation, setActivation] = useState<ActivationType>('relu');
    const [learningRate, setLearningRate] = useState(0.01);
    const [hiddenLayers, setHiddenLayers] = useState<number[]>([4, 4]);
    const [batchSize, setBatchSize] = useState(30);
    const [regType, setRegType] = useState<'l1' | 'l2' | 'none'>('none');
    const [regRate, setRegRate] = useState(0.001);
    
    // Dataset
    const [datasetType, setDatasetType] = useState<DatasetType>('spiral');
    const [noise, setNoise] = useState(0.2);
    const [dataset, setDataset] = useState<DataPoint[]>([]);
    
    // Engine State
    const [network, setNetwork] = useState<NeuralNet | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [epoch, setEpoch] = useState(0);
    const [loss, setLoss] = useState(0);

    const animRef = useRef<number | null>(null);

    // Generate Dataset
    const regenerateData = useCallback(() => {
        setDataset(generateDataset(datasetType, 200, noise));
    }, [datasetType, noise]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        regenerateData();
    }, [regenerateData]);

    // Build Network
    const rebuildNetwork = useCallback(() => {
        setIsPlaying(false);
        const config: NetworkConfig = {
            inputSize: 2,
            hiddenLayers,
            outputSize: 1,
            activation,
            learningRate,
            regularizationType: regType,
            regularizationRate: regRate
        };
        const newNet = new NeuralNet(config);
        setNetwork(newNet);
        setEpoch(0);
        setLoss(0);
    }, [hiddenLayers, activation, learningRate, regType, regRate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        rebuildNetwork();
    }, [rebuildNetwork]);

    // Update Learning Rate without rebuilding
    useEffect(() => {
        if (network) {
            network.updateConfig({
                learningRate,
                regularizationType: regType,
                regularizationRate: regRate
            });
        }
    }, [learningRate, regType, regRate, network]);

    // Training Loop
    useEffect(() => {
        if (!isPlaying || !network || dataset.length === 0) return;

        let active = true;

        const loop = () => {
            if (!active) return;

            // Simple SGD mini-batch
            // We just shuffle and pick the first `batchSize` elements for speed
            const shuffled = [...dataset].sort(() => 0.5 - Math.random());
            const batch = shuffled.slice(0, batchSize);
            
            // Train 5 steps per frame to speed up visual convergence
            let currentLoss = 0;
            for(let i=0; i<5; i++) {
                currentLoss = network.trainBatch(batch);
            }

            setEpoch(prev => prev + 5);
            setLoss(currentLoss);

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);

        return () => {
            active = false;
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [isPlaying, network, dataset, batchSize]);

    return (
        <div className="space-y-8 pb-24">
            <header className="border-b border-white/10 pb-6 mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <Activity className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Neural Network Sandbox</h1>
                        <p className="text-slate-400 mt-1">Design, train, and visualize a neural network in real-time right in your browser.</p>
                    </div>
                </div>
            </header>

            {/* Top Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            isPlaying 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                    >
                        {isPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Train</>}
                    </button>
                    
                    <button 
                        onClick={rebuildNetwork}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-slate-400 bg-slate-800 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all"
                    >
                        <RotateCcw size={18} /> Reset
                    </button>
                </div>

                <div className="flex items-center gap-8 bg-slate-950/50 px-6 py-2 rounded-xl border border-slate-800/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Epoch</span>
                        <span className="font-mono text-xl text-white">{epoch.toString().padStart(5, '0')}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Loss</span>
                        <span className="font-mono text-xl text-rose-400">{loss > 0 ? loss.toFixed(4) : '---'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                
                {/* Left Column: Controls */}
                <div className="xl:col-span-1 space-y-6">
                    <ControlPanel 
                        activation={activation} setActivation={setActivation}
                        learningRate={learningRate} setLearningRate={setLearningRate}
                        dataset={datasetType} setDataset={setDatasetType}
                        noise={noise} setNoise={setNoise}
                        batchSize={batchSize} setBatchSize={setBatchSize}
                        regType={regType} setRegType={setRegType}
                        regRate={regRate} setRegRate={setRegRate}
                    />
                </div>

                {/* Middle Column: Architecture Builder */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-white mb-4 ml-2">Architecture</h3>
                        <NetworkBuilder 
                            hiddenLayers={hiddenLayers} 
                            onLayersChange={setHiddenLayers} 
                            network={network}
                        />
                    </div>
                </div>

                {/* Right Column: Visualization */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
                        <h3 className="text-sm font-bold text-white mb-4 self-start ml-2">Output</h3>
                        <DecisionBoundaryViz data={dataset} network={network} />
                        <div className="w-full flex justify-between mt-4 px-2 text-xs font-mono">
                            <span className="text-orange-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Class 0</span>
                            <span className="text-blue-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Class 1</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
