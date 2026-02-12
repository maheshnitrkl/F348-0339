import React, { useState, useEffect, useRef } from 'react';
import { SignalGenerator } from '../utils/SignalGenerator';
import { WaveformViz } from './WaveformViz';
import { SpectrumViz } from './SpectrumViz';
import { DFT } from '../utils/DFT';
import { MathEquation } from './common/MathEquation';
import { ComplexPlaneViz } from './common/ComplexPlaneViz';

export const BiomedicalLab: React.FC = () => {
    // Mode: ECG or EEG
    const [mode, setMode] = useState<'ecg' | 'eeg'>('ecg');

    // ECG State
    const [heartRate, setHeartRate] = useState(60);
    const [ecgNoise, setEcgNoise] = useState(0);

    // EEG State
    const [brainState, setBrainState] = useState<'relaxed' | 'active' | 'drowsy' | 'deep_sleep'>('relaxed');

    // Data Refs
    const [signalData, setSignalData] = useState<number[]>([]);
    const [spectrumData, setSpectrumData] = useState<number[]>([]);
    const requestRef = useRef<number | null>(null);

    // Constants
    const SAMPLE_RATE = 250; // Higher rate for bio signals
    const DURATION = 2; // Seconds

    useEffect(() => {
        const animate = () => {
            let signal: number[] = [];

            if (mode === 'ecg') {
                signal = SignalGenerator.generateECG(SAMPLE_RATE, DURATION, heartRate, ecgNoise);
            } else {
                signal = SignalGenerator.generateEEG(SAMPLE_RATE, DURATION, brainState);
            }

            // Compute Spectrum (useful for EEG)
            const spectrum = DFT.computeMagnitude(signal);

            setSignalData(signal);
            setSpectrumData(spectrum);

            if (mode === 'ecg' && ecgNoise > 0) {
                requestRef.current = requestAnimationFrame(animate);
            } else if (mode === 'eeg') {
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        // Initial run
        animate();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [mode, heartRate, ecgNoise, brainState]);


    return (
        <div className="flex flex-col gap-6 p-6 bg-slate-900/80 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Biomedical Signal Workstation</h2>
                    <p className="text-gray-400 text-sm">Analyze physiological signals (ECG & EEG)</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('ecg')}
                        className={`px-4 py-1 rounded text-sm font-bold ${mode === 'ecg' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        ECG (Heart)
                    </button>
                    <button
                        onClick={() => setMode('eeg')}
                        className={`px-4 py-1 rounded text-sm font-bold ${mode === 'eeg' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        EEG (Brain)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="bg-black/20 p-4 rounded-lg space-y-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-white/10 pb-2">
                        Patient Parameters
                    </h3>

                    {mode === 'ecg' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 flex justify-between">
                                    <span>Heart Rate (BPM)</span>
                                    <span className="text-red-400">{heartRate}</span>
                                </label>
                                <input
                                    type="range" min="40" max="180" step="1"
                                    value={heartRate}
                                    onChange={(e) => setHeartRate(parseInt(e.target.value))}
                                    className="w-full accent-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 flex justify-between">
                                    <span>Artifact Noise</span>
                                    <span className="text-gray-400">{ecgNoise.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range" min="0" max="0.5" step="0.01"
                                    value={ecgNoise}
                                    onChange={(e) => setEcgNoise(parseFloat(e.target.value))}
                                    className="w-full accent-gray-500"
                                />
                            </div>
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-200">
                                <strong>Clinical Note:</strong> Observe the P-QRS-T complex. The QRS complex represents ventricular depolarization (the main pump).
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500">Mental State</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['relaxed', 'active', 'drowsy', 'deep_sleep'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setBrainState(s)}
                                            className={`p-2 rounded text-xs capitalize transition-all ${brainState === s ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {s.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
                                <strong>Neurology Note:</strong>
                                {brainState === 'relaxed' && " Alpha waves (8-13Hz) dominate when eyes are closed and relaxed."}
                                {brainState === 'active' && " Beta waves (13-30Hz) appear during active thinking and concentration."}
                                {brainState === 'drowsy' && " Theta waves (4-8Hz) increase during drowsiness and meditation."}
                                {brainState === 'deep_sleep' && " Delta waves (0.5-4Hz) are characteristic of deep slow-wave sleep."}
                            </div>
                        </>
                    )}

                    {/* Filter Design / Maths */}
                    <div className="mt-8 border-t border-white/10 pt-4">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
                            Signal Filtering
                        </h3>
                        <div className="text-xs text-gray-400 mb-4">
                            <p className="mb-2">Digital filters are used to remove noise (artifacts). A simple Notch Filter can remove 60Hz power line noise.</p>
                            <MathEquation formula="H(z) = \frac{(z - e^{j\omega_0})(z - e^{-j\omega_0})}{(z - re^{j\omega_0})(z - re^{-j\omega_0})}" block />
                        </div>
                        <div className="flex justify-center bg-black/40 rounded-lg p-2">
                            <ComplexPlaneViz
                                width={180}
                                height={180}
                                points={[
                                    { re: 0.707, im: 0.707, type: 'zero', color: '#3b82f6', label: 'z1' },
                                    { re: 0.707, im: -0.707, type: 'zero', color: '#3b82f6', label: 'z2' },
                                    { re: 0.6, im: 0.6, type: 'pole', color: '#ef4444', label: 'p1' },
                                    { re: 0.6, im: -0.6, type: 'pole', color: '#ef4444', label: 'p2' },
                                ]}
                            />
                        </div>
                        <p className="text-[10px] text-center text-gray-500 mt-1">Pole-Zero Plot (Z-Plane)</p>
                    </div>
                </div>

                {/* Display */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <h3 className={`text-sm font-bold ${mode === 'ecg' ? 'text-red-400' : 'text-blue-400'}`}>
                                {mode === 'ecg' ? 'ECG Lead II' : 'EEG Channel Fpz-Cz'}
                            </h3>
                        </div>
                        <WaveformViz
                            data={signalData}
                            color={mode === 'ecg' ? '#ef4444' : '#3b82f6'}
                            height={200}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-bold text-purple-400">Power Spectrum Density</h3>
                            <span className="text-xs text-gray-600">Frequency Analysis</span>
                        </div>
                        <SpectrumViz
                            magnitudes={spectrumData}
                            color={mode === 'ecg' ? '#fca5a5' : '#93c5fd'}
                            height={150}
                        />
                        {mode === 'eeg' && (
                            <div className="flex justify-between text-[10px] text-gray-500 font-mono px-2">
                                <span>Delta</span>
                                <span>Theta</span>
                                <span>Alpha</span>
                                <span>Beta</span>
                                <span>Gamma</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
