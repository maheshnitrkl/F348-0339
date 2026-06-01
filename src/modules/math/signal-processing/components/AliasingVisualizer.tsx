/* eslint-disable */

import React, { useRef, useEffect, useState } from 'react';
import { MathEquation } from '../../../../components/MathEquation';

export const AliasingVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [signalFreq, setSignalFreq] = useState(38); // Hertz
    const [sampleRate, setSampleRate] = useState(50); // Hertz
    const [isPlaying, setIsPlaying] = useState(true);

    // Animation state
    const phaseRef = useRef(0);
    const animationRef = useRef<number | null>(null);

    // Calculate the perceived (aliased) frequency
    // f_aliased = |f - N * fs| where N is integer that minimizes result
    const getAliasedFreq = (f: number, fs: number) => {
        const n = Math.round(f / fs);
        return Math.abs(f - n * fs);
    };

    const perceivedFreq = getAliasedFreq(signalFreq, sampleRate);
    const isAliasing = perceivedFreq !== signalFreq && signalFreq > sampleRate / 2;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            if (!ctx || !canvas) return;

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width;
            const h = canvas.height;
            const centerY = h / 2;
            const amp = h * 0.35;

            // Time window to show
            const duration = 0.1; // seconds
            // Map x pixel to time
            const xToTime = (x: number) => (x / w) * duration;
            // Map time to x pixel
            const timeToX = (t: number) => (t / duration) * w;

            // Update phase for animation (flowing time)
            if (isPlaying) {
                phaseRef.current += 0.005; // speed
            }
            const timeOffset = phaseRef.current;

            // 1. Draw "Real" Analog Signal (High Resolution)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            for (let x = 0; x < w; x++) {
                const t = xToTime(x) + timeOffset;
                const y = centerY - amp * Math.sin(2 * Math.PI * signalFreq * t);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]); // Reset

            // 2. Draw Samples (Dots)
            ctx.fillStyle = '#ef4444'; // Red-500
            const samplePeriod = 1 / sampleRate;
            // Align first sample with timeOffset
            const startSampleIndex = Math.ceil(timeOffset / samplePeriod);

            // We want to draw samples that fall within [timeOffset, timeOffset + duration]
            // t_sample = n * Ts
            // x_sample = timeToX(t_sample - timeOffset)

            for (let t = Math.ceil(timeOffset / samplePeriod) * samplePeriod; t < timeOffset + duration + samplePeriod; t += samplePeriod) {
                const x = timeToX(t - timeOffset);
                if (x >= -5 && x <= w + 5) {
                    const y = centerY - amp * Math.sin(2 * Math.PI * signalFreq * t);
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 3. Draw Perceived (Reconstructed) Signal
            // This is the signal that passes through the dots with lowest frequency < fs/2
            ctx.beginPath();
            ctx.strokeStyle = isAliasing ? '#f59e0b' : '#22c55e'; // Amber (warning) or Green (good)
            ctx.lineWidth = 3;
            for (let x = 0; x < w; x++) {
                const t = xToTime(x) + timeOffset;
                // Important: Phase alignment relies on the sampling instants.
                // The reconstructed signal must match the sample points.
                // y = sin(2*pi*f*t) sampled at t = n/fs
                // y[n] = sin(2*pi*f*n/fs)
                //      = sin(2*pi*(f_alias + k*fs)*n/fs)
                //      = sin(2*pi*f_alias*n/fs + 2*pi*k*n)
                //      = sin(2*pi*f_alias*n/fs)
                // So magnitude is correct. Phase might be flipped if we are in a negative zone (folding).
                // Actually, if we round(f/fs), the alias is (f - n*fs). 
                // Using that signed frequency preserves phase!

                const n_fold = Math.round(signalFreq / sampleRate);
                const signedAliasFreq = signalFreq - n_fold * sampleRate;

                const y = centerY - amp * Math.sin(2 * Math.PI * signedAliasFreq * t);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [signalFreq, sampleRate, isPlaying, isAliasing]);

    return (
        <div className="bg-black/30 p-6 rounded-xl border border-white/10 my-8">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-white text-lg">Aliasing Simulator</h4>
                    <p className="text-sm text-gray-400">See how sampling rate affects perception.</p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-mono font-bold ${isAliasing ? 'text-amber-500' : 'text-green-500'}`}>
                        {perceivedFreq.toFixed(1)} Hz
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Perceived Output</div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 bg-black/50 rounded-lg border border-white/5 mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Input Frequency</span>
                        <span className="text-cyan-400 font-mono">{signalFreq} Hz</span>
                    </div>
                    <input
                        type="range" min="1" max="100"
                        value={signalFreq}
                        onChange={e => setSignalFreq(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Sample Rate <MethodEquation formula="f_s" /></span>
                        <span className="text-red-400 font-mono">{sampleRate} Hz</span>
                    </div>
                    <input
                        type="range" min="1" max="100"
                        value={sampleRate}
                        onChange={e => setSampleRate(Number(e.target.value))}
                        className="w-full accent-red-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Nyquist Limit: {(sampleRate / 2).toFixed(1)} Hz</span>
                    </div>
                </div>
            </div>

            {isAliasing && (
                <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded text-amber-200 text-sm flex items-center gap-2">
                    <span>⚠️ <strong>Aliasing Detected!</strong> The input signal is faster than the Nyquist limit ({sampleRate / 2} Hz), so it "folds" back to {perceivedFreq.toFixed(1)} Hz.</span>
                </div>
            )}
        </div>
    );
};

// Helper for equation rendering if the main component is not imported
const MethodEquation = ({ formula }: { formula: string }) => <span className="font-serif italic opacity-80" dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }} />
