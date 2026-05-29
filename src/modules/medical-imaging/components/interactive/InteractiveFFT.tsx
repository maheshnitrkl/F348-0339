/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Activity, Zap, Layers, RefreshCw, Sliders, Eye } from 'lucide-react';
import { FFT } from '../../utils/fft';

const applyFilter = (real: Float32Array, imag: Float32Array, size: number, type: string, rad: number, intent: number) => {
    const cx = size / 2;
    const cy = size / 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            // FFT buffer is unshifted (DC at 0,0). 
            // To filter radially, we need to consider wrapping.
            // Distance from DC (0,0) handling wrap-around
            const dx = x > cx ? x - size : x;
            const dy = y > cy ? y - size : y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const idx = y * size + x;

            if (type === 'lowpass') {
                // Blur: Keep only low frequencies (center)
                if (dist > rad) {
                    real[idx] = 0; imag[idx] = 0;
                }
            } else if (type === 'highpass') {
                // Edges: Keep only high freq
                if (dist < rad) {
                    real[idx] = 0; imag[idx] = 0;
                }
            } else if (type === 'spike') {
                // Artifact: Add a bright spike in K-Space
                // Add at specific frequency
                if (Math.abs(x - 40) < 2 && Math.abs(y - 40) < 2) {
                    real[idx] = intent; imag[idx] = intent;
                }
            }
        }
    }
};

const drawBuffer = (canvas: HTMLCanvasElement | null, data: Float32Array, size: number, normalize: boolean) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(size, size);

    let max = 0;
    if (normalize) {
        for (let i = 0; i < data.length; i++) max = Math.max(max, data[i]);
    }

    for (let i = 0; i < data.length; i++) {
        let val = data[i];
        if (normalize && max > 0) val = val / max;

        const c = Math.min(255, Math.max(0, val * 255));
        img.data[i * 4] = c;
        img.data[i * 4 + 1] = c;
        img.data[i * 4 + 2] = c;
        img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
};

const drawKSpace = (canvas: HTMLCanvasElement | null, real: Float32Array, imag: Float32Array, size: number) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(size, size);

    const cx = size / 2;
    const cy = size / 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const srcIdx = y * size + x;
            const dx = (x + cx) % size;
            const dy = (y + cy) % size;
            const dstIdx = dy * size + dx;

            const mag = Math.sqrt(real[srcIdx] ** 2 + imag[srcIdx] ** 2);
            const logMag = Math.log(mag + 1);
            const c = Math.min(255, logMag * 15); // Scale factor

            // Apply a colormap (Blue -> Cyan -> White)
            img.data[dstIdx * 4] = c * 0.2;     // R
            img.data[dstIdx * 4 + 1] = c * 0.8; // G
            img.data[dstIdx * 4 + 2] = c;       // B
            img.data[dstIdx * 4 + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
}

export const InteractiveFFT: React.FC = () => {
    const size = 128; // Power of 2
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const kSpaceCanvasRef = useRef<HTMLCanvasElement>(null);
    const reconCanvasRef = useRef<HTMLCanvasElement>(null);

    const [filterType, setFilterType] = useState<'none' | 'lowpass' | 'highpass' | 'spike'>('none');
    const [radius, setRadius] = useState<number>(20); // Filter radius
    const [intensity, setIntensity] = useState<number>(1000); // Spike intensity

    // Data State
    const [originalReal, setOriginalReal] = useState<Float32Array | null>(null);
    const [kSpaceReal, setKSpaceReal] = useState<Float32Array | null>(null);
    const [kSpaceImag, setKSpaceImag] = useState<Float32Array | null>(null);

    // 1. Generate Phantom
    useEffect(() => {
        const real = new Float32Array(size * size);
        const imag = new Float32Array(size * size);
        const cx = size / 2;
        const cy = size / 2;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let val = 0;
                const nx = (x - cx) / cx;
                const ny = (y - cy) / cy;

                // Simple Phantom
                // Skull
                if (nx * nx + ny * ny < 0.8) val = 1.0;
                // Brain
                if (nx * nx + ny * ny < 0.7) val = 0.5;
                // Ventricles
                if ((nx - 0.2) * (nx - 0.2) / 0.05 + (ny - 0.2) * (ny - 0.2) / 0.1 < 0.1) val = 0.8;

                real[y * size + x] = val;
                imag[y * size + x] = 0;
            }
        }
        setOriginalReal(real);

        // Compute FFT
        const kReal = new Float32Array(real);
        const kImag = new Float32Array(imag);
        FFT.fft2D(kReal, kImag, size, size);

        // Shift K-Space to center
        // Note: For visualization we usually shift. For math, we unshift before IFFT.
        // We will store unshifted for math, and shift only for display.
        setKSpaceReal(kReal);
        setKSpaceImag(kImag);

    }, []);

    // 2. Render Loop
    useEffect(() => {
        if (!originalReal || !kSpaceReal || !kSpaceImag) return;

        // A. Draw Original
        drawBuffer(canvasRef.current, originalReal, size, false);

        // B. Process K-Space (Copy first)
        const procKReal = new Float32Array(kSpaceReal);
        const procKImag = new Float32Array(kSpaceImag);

        // Apply Filter (in Frequency Domain)
        applyFilter(procKReal, procKImag, size, filterType, radius, intensity);

        // C. Draw K-Space (Log Magnitude)
        drawKSpace(kSpaceCanvasRef.current, procKReal, procKImag, size);

        // D. Reconstruct (Inverse FFT)
        FFT.ifft2D(procKReal, procKImag, size, size);

        // Magnitude of complex result (should be real, but artifacts cause phase)
        const reconMag = new Float32Array(size * size);
        for (let i = 0; i < size * size; i++) {
            reconMag[i] = Math.sqrt(procKReal[i] ** 2 + procKImag[i] ** 2);
        }

        drawBuffer(reconCanvasRef.current, reconMag, size, true);

    }, [originalReal, kSpaceReal, kSpaceImag, filterType, radius, intensity]);


    return (
        <div className="bg-gradient-to-br from-gray-900/90 to-black border border-white/10 rounded-2xl p-8 backdrop-blur-md select-none shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Activity className="text-emerald-400" size={24} />
                </div>
                Interactive K-Space Explorer
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start text-center">
                {/* 1. Spatial Domain */}
                <div className="relative group perspective-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-black border border-white/10 rounded-xl p-4 shadow-2xl transform transition-transform group-hover:scale-[1.02]">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Spatial Domain</span>
                            <Eye size={14} className="text-gray-500" />
                        </div>
                        <canvas ref={canvasRef} width={size} height={size} className="w-full aspect-square bg-[#050505] rounded-lg border border-white/5" />
                        <div className="mt-3 text-xs text-gray-500">Original Phantom</div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex flex-col items-center justify-center h-full text-emerald-500/30 pt-20">
                    <div className="text-xs font-mono mb-2">FFT</div>
                    <div className="w-full h-px bg-emerald-500/30 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-emerald-500/50 rotate-45"></div>
                    </div>
                </div>

                {/* 2. Frequency Domain */}
                <div className="relative group perspective-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-900 to-cyan-900 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative bg-black border border-emerald-500/20 rounded-xl p-4 shadow-2xl transform transition-transform group-hover:scale-[1.02]">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest">K-Space</span>
                            <Activity size={14} className="text-emerald-500" />
                        </div>
                        <canvas ref={kSpaceCanvasRef} width={size} height={size} className="w-full aspect-square bg-[#050505] rounded-lg border border-emerald-500/10" />
                        <div className="mt-3 flex justify-between text-[10px] text-emerald-500/50 font-mono">
                            <span>Low Freq</span>
                            <span>High Freq</span>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex flex-col items-center justify-center h-full text-blue-500/30 pt-20">
                    <div className="text-xs font-mono mb-2">IFFT</div>
                    <div className="w-full h-px bg-blue-500/30 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-blue-500/50 rotate-45"></div>
                    </div>
                </div>

                {/* 3. Controls & Recon */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

                    {/* Control Panel */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Sliders size={16} className="text-gray-400" />
                            Filter Controls
                        </h4>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-lg">
                            {(['none', 'lowpass', 'highpass', 'spike'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${filterType === type
                                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    {type === 'none' ? 'Raw' : type}
                                </button>
                            ))}
                        </div>

                        {/* Sliders based on type */}
                        {filterType === 'lowpass' && (
                            <div className="space-y-2 animate-fadeIn">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Cutoff Radius</span>
                                    <span>{radius}px</span>
                                </div>
                                <input
                                    type="range" min="1" max="60" value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <p className="text-xs text-blue-400/70 mt-2">
                                    Retains center frequencies. Smooths the image (blur).
                                </p>
                            </div>
                        )}

                        {filterType === 'highpass' && (
                            <div className="space-y-2 animate-fadeIn">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Cutoff Radius</span>
                                    <span>{radius}px</span>
                                </div>
                                <input
                                    type="range" min="1" max="60" value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <p className="text-xs text-purple-400/70 mt-2">
                                    Retains edge frequencies. Highlights boundaries.
                                </p>
                            </div>
                        )}

                        {filterType === 'spike' && (
                            <div className="space-y-2 animate-fadeIn">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Spike Intensity</span>
                                    <span>{intensity}</span>
                                </div>
                                <input
                                    type="range" min="100" max="5000" step="100" value={intensity}
                                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <p className="text-xs text-red-400/70 mt-2">
                                    Simulates RF interference (herringbone artifact).
                                </p>
                            </div>
                        )}

                        {filterType === 'none' && (
                            <p className="text-xs text-gray-500">
                                Viewing raw K-Space data. No filtering applied.
                            </p>
                        )}
                    </div>

                    {/* Reconstructed Image */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-black border border-blue-500/20 rounded-xl p-4 shadow-2xl flex gap-6 items-center">
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-mono text-xs text-blue-400 uppercase tracking-widest">Reconstruction</span>
                                    <RefreshCw size={14} className="text-blue-500" />
                                </div>
                                <div className="text-xs text-gray-400 leading-relaxed">
                                    The inverse FFT transforms manipulated frequency data back into spatial domain.
                                    <br /><br />
                                    Observe how removing high frequencies blurs the image, while removing low frequencies leaves only edges.
                                </div>
                            </div>
                            <canvas ref={reconCanvasRef} width={size} height={size} className="w-32 h-32 bg-[#050505] rounded-lg border border-blue-500/10 flex-shrink-0" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
