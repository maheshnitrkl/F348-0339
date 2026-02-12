import React, { useState, useEffect, useRef } from 'react';
import { SignalGenerator, type WaveformType } from '../utils/SignalGenerator';
import { DFT } from '../utils/DFT';
import { WaveformViz } from './WaveformViz';
import { SpectrumViz } from './SpectrumViz';
import { SpectrogramViz } from './SpectrogramViz';
import { MathEquation } from './common/MathEquation';
import { ComplexPlaneViz } from './common/ComplexPlaneViz';
import { WindowFunctions, type WindowFunctionType } from '../utils/WindowFunctions';
import { SimpleFilter, type FilterType } from '../utils/Filters';
import { useAudioInput } from '../hooks/useAudioInput';

export const InteractiveSignalLab: React.FC = () => {
    // State
    const [waveformType, setWaveformType] = useState<WaveformType>('sine');
    const [frequency, setFrequency] = useState(5); // Hz
    const [amplitude, setAmplitude] = useState(1);
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // New State for Improvements
    const [windowType, setWindowType] = useState<WindowFunctionType>('rectangular');
    const [filterType, setFilterType] = useState<FilterType>('none');
    const [filterCutoff, setFilterCutoff] = useState(20); // Hz
    const [filterResonance, setFilterResonance] = useState(0.707); // Q
    const [sampleRate, setSampleRate] = useState(100); // Hz
    const [useMic, setUseMic] = useState(false);

    // Hooks
    const audioInput = useAudioInput(useMic);

    // Logic Classes
    const filterRef = useRef(new SimpleFilter());

    // Constants
    const DURATION = 1; // Seconds per frame
    const SPECTROGRAM_HISTORY_SIZE = 50;

    // Refs for animation
    const requestRef = useRef<number | null>(null);
    const spectrogramHistoryRef = useRef<number[][]>([]);

    const [currentSignal, setCurrentSignal] = useState<number[]>([]);
    const [currentSpectrum, setCurrentSpectrum] = useState<number[]>([]);
    const [spectrogramHistory, setSpectrogramHistory] = useState<number[][]>([]);


    useEffect(() => {
        const animate = () => {
            if (!isPlaying) return;

            let displaySignal: number[] = [];

            if (useMic && audioInput.isReady) {
                displaySignal = audioInput.getTimeDomainData();
                // If mic data is too large/small, resample or slice? 
                // For now, let's just take the first N samples matching our visual sample rate logic or just use what we get.
                // The audio hook returns typically 2048 samples. 
                // Our viz expects sampleRate * DURATION samples (currently 100 * 1 = 100).
                // We should probably downsample for visualization if we want to match the "100Hz" simulation look, 
                // OR better: adapt the visualization to the data size.
                // Let's just slice for simplicity to keep viz consistent, or downsample.
                // Slicing 2048 to 100 is losing a lot. 
                // Let's just use it as is, but our DFT computation might be slow if N=2048 every frame in JS.
                // 2048^2 is 4 million ops. Might be choppy. 
                // Let's slice to 256 for performance in this demo.
                const processSize = 256;
                if (displaySignal.length > processSize) {
                    displaySignal = displaySignal.slice(0, processSize);
                }
            } else {
                displaySignal = SignalGenerator.generate(
                    waveformType,
                    frequency,
                    sampleRate,
                    DURATION,
                    amplitude,
                    audioInput.isReady ? 0 : performance.now() / 1000 * frequency * 2 * Math.PI, // Continuous phase if desired, but Generator is static...
                    noiseLevel
                );

                // Update Filter Coefficients
                filterRef.current.updateCoefficients(filterType, filterCutoff, sampleRate, filterResonance);

                // Apply Filter
                if (filterType !== 'none') {
                    displaySignal = filterRef.current.processArray(displaySignal);
                }
            }

            // Apply Windowing
            const windowedSignal = WindowFunctions.apply(displaySignal, windowType);

            // Compute DFT
            const spectrum = DFT.computeMagnitude(windowedSignal);

            // Update Spectrogram History
            const history = spectrogramHistoryRef.current;
            history.push(spectrum);
            if (history.length > SPECTROGRAM_HISTORY_SIZE) {
                history.shift();
            }
            spectrogramHistoryRef.current = [...history];

            setCurrentSignal(displaySignal); // Show original (filtered) signal in time domain
            setCurrentSpectrum(spectrum); // Show spectrum of windowed signal
            setSpectrogramHistory([...spectrogramHistoryRef.current]);

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [waveformType, frequency, amplitude, noiseLevel, isPlaying, windowType, filterType, filterCutoff, filterResonance, sampleRate, useMic, audioInput]);


    return (
        <div className="flex flex-col gap-6 p-6 bg-slate-900/80 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Interactive Signal Lab</h2>
                    <p className="text-gray-400 text-sm">Explore Time, Frequency, and Digital Filters.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setUseMic(!useMic)}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${useMic ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        {useMic ? '🎤 Mic On' : '🎤 Mic Off'}
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${isPlaying ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                    >
                        {isPlaying ? 'Pause' : 'Resume'}
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-black/20 p-4 rounded-lg">

                {/* Source Controls */}
                <div className="space-y-2 relative">
                    {useMic && <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center rounded text-xs font-mono text-gray-400">Controls Disabled in Mic Mode</div>}
                    <label className="text-xs font-mono text-gray-500">Waveform Type</label>
                    <div className="flex gap-2">
                        {(['sine', 'square', 'sawtooth', 'triangle', 'noise'] as WaveformType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setWaveformType(type)}
                                className={`p-2 rounded text-xs transition-all ${waveformType === type ? 'bg-cyan-500 text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                title={type}
                            >
                                {type === 'sine' ? '∿' : type === 'square' ? '⎍' : type === 'sawtooth' ? 'ⵁ' : type === 'triangle' ? '⏃' : '≋'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 relative">
                    {useMic && <div className="absolute inset-0 bg-black/60 z-10 rounded"></div>}
                    <label className="text-xs font-mono text-gray-500 flex justify-between">
                        <span>Signal Freq</span>
                        <span className="text-cyan-400">{frequency} Hz</span>
                    </label>
                    <input
                        type="range" min="1" max="50" step="1"
                        value={frequency}
                        onChange={(e) => setFrequency(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500"
                    />
                </div>

                <div className="space-y-2 relative">
                    {useMic && <div className="absolute inset-0 bg-black/60 z-10 rounded"></div>}
                    <label className="text-xs font-mono text-gray-500 flex justify-between">
                        <span>Amplitude</span>
                        <span className="text-purple-400">{amplitude.toFixed(1)}</span>
                    </label>
                    <input
                        type="range" min="0" max="2" step="0.1"
                        value={amplitude}
                        onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                        className="w-full accent-purple-500"
                    />
                </div>

                <div className="space-y-2 relative">
                    {useMic && <div className="absolute inset-0 bg-black/60 z-10 rounded"></div>}
                    <label className="text-xs font-mono text-gray-500 flex justify-between">
                        <span>Noise Level</span>
                        <span className="text-red-400">{noiseLevel.toFixed(1)}</span>
                    </label>
                    <input
                        type="range" min="0" max="1" step="0.1"
                        value={noiseLevel}
                        onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                        className="w-full accent-red-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-500 flex justify-between">
                        <span title="Simulated Sample Rate">Sample Rate (Aliasing)</span>
                        <span className="text-yellow-400">{sampleRate} Hz</span>
                    </label>
                    <input
                        type="range" min="20" max="200" step="10"
                        value={sampleRate}
                        onChange={(e) => setSampleRate(parseFloat(e.target.value))}
                        className="w-full accent-yellow-500"
                    />
                </div>
            </div>

            {/* Advanced DSP Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-purple-900/10 p-4 rounded-lg border border-purple-500/20">
                <div className="space-y-2">
                    <label className="text-xs font-mono text-purple-300">Window Function</label>
                    <div className="flex flex-wrap gap-2">
                        {(['rectangular', 'hamming', 'hanning', 'blackman'] as WindowFunctionType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setWindowType(type)}
                                className={`px-3 py-1 rounded text-xs transition-all ${windowType === type ? 'bg-purple-500 text-white font-bold' : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'}`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500">Apply windowing to reduce spectral leakage in DFT.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-purple-300">Digital Filter</label>
                    <div className="flex gap-2 mb-2">
                        {(['none', 'lowpass', 'highpass'] as FilterType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1 rounded text-xs transition-all ${filterType === type ? 'bg-blue-500 text-white font-bold' : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'}`}
                            >
                                {type === 'none' ? 'Off' : type === 'lowpass' ? 'LPF' : 'HPF'}
                            </button>
                        ))}
                    </div>
                    {filterType !== 'none' && (
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-400">Cutoff: {filterCutoff} Hz</label>
                                <input
                                    type="range" min="1" max={sampleRate / 2} step="1"
                                    value={filterCutoff}
                                    onChange={e => setFilterCutoff(parseFloat(e.target.value))}
                                    className="w-full h-1 accent-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-400">Resonance (Q): {filterResonance}</label>
                                <input
                                    type="range" min="0.1" max="5" step="0.1"
                                    value={filterResonance}
                                    onChange={e => setFilterResonance(parseFloat(e.target.value))}
                                    className="w-full h-1 accent-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Time Domain */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <h3 className="text-sm font-bold text-cyan-400">Time Domain</h3>
                        <span className="text-xs text-gray-600 font-mono">Amplitude vs Time</span>
                    </div>
                    <WaveformViz data={currentSignal} color="#22d3ee" height={180} />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <h3 className="text-sm font-bold text-purple-400">Frequency Domain</h3>
                        <span className="text-xs text-gray-600 font-mono">Magnitude vs Frequency</span>
                    </div>
                    <SpectrumViz magnitudes={currentSpectrum} color="#a78bfa" height={180} />
                </div>
            </div>

            {/* Phasor & Math Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-1 bg-black/30 p-4 rounded-lg border border-white/5">
                    <h3 className="text-sm font-bold text-yellow-500 mb-2">Phasor Representation</h3>
                    <div className="flex justify-center">
                        <ComplexPlaneViz
                            width={220}
                            height={220}
                            animatePhasor={isPlaying}
                            frequency={frequency * 0.1} // Slow down for visualization
                            phasorColor="#facc15"
                            points={[{ re: 0, im: 0, type: 'point' }]}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Rotating vector representing <MathEquation formula={`e^{i 2\\pi (${frequency}) t}`} />
                    </p>
                </div>

                <div className="lg:col-span-2 bg-black/30 p-4 rounded-lg border border-white/5 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-gray-300 mb-2">The Mathematics of DFT</h3>
                    <div className="text-sm text-gray-400 space-y-4">
                        <p>
                            The Discrete Fourier Transform (DFT) decomposes a signal into its constituent frequencies used complex exponentials:
                        </p>
                        <MathEquation
                            formula="X[k] = \sum_{n=0}^{N-1} x[n] \cdot e^{-i 2\pi \frac{k n}{N}}"
                            block
                            className="text-lg text-cyan-300"
                        />
                        <p>
                            Where:
                            <br />• <MathEquation formula="x[n]" /> is the input signal amplitude at time <MathEquation formula="n" />.
                            <br />• <MathEquation formula="X[k]" /> is the spectrum magnitude at frequency <MathEquation formula="k" />.
                            <br />• <MathEquation formula="e^{-i \theta} = \cos(\theta) - i \sin(\theta)" /> (Euler's Formula) rotates around the unit circle.
                        </p>
                    </div>
                </div>
            </div>

            {/* Spectrogram */}
            <div className="space-y-2 mt-2">
                <div className="flex justify-between items-end">
                    <h3 className="text-sm font-bold text-orange-400">Spectrogram (Time-Frequency)</h3>
                    <span className="text-xs text-gray-600 font-mono">Frequency vs Time</span>
                </div>
                <div className="relative">
                    <SpectrogramViz history={spectrogramHistory} colorTheme="fire" height={200} />
                    <div className="absolute top-2 left-2 text-[10px] text-white/50 bg-black/50 px-2 py-1 rounded">
                        Time →
                    </div>
                    <div className="absolute bottom-2 right-2 text-[10px] text-white/50 bg-black/50 px-2 py-1 rounded">
                        ↑ Freq
                    </div>
                </div>
            </div>

        </div>
    );
};
