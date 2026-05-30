import React, { useState, useEffect } from 'react';
import { Layers, Activity, FastForward } from 'lucide-react';

export function UNetArchitectureViz() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    return p + 1;
                });
            }, 50); // 5 seconds total (100 * 50ms)
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handlePlay = () => {
        setProgress(0);
        setIsPlaying(true);
    };

    // U-Net structure constants
    const levels = 4;
    const blockWidth = 40;
    const baseHeight = 120;
    const horizontalSpacing = 60;
    const verticalSpacing = 50;

    // Center coordinates for drawing
    const centerX = 400;
    const startY = 50;

    const renderBlocks = () => {
        const blocks = [];
        const skipConnections = [];

        // Exact coordinates to create a beautiful, spacious, non-overlapping "U" shape
        const h = [140, 100, 70, 50, 30];
        const w = [40, 50, 60, 70, 80];
        const decW = [80, 100, 120, 140]; // Decoders are wider
        const y = [50, 130, 210, 290, 370];
        
        const ex = [50, 115, 190, 275];
        const botX = 370;
        const dx = [910, 785, 640, 475]; // Indexed 0 to 3

        // 1. Draw Encoder Blocks (0 to 3)
        for (let i = 0; i < 4; i++) {
            blocks.push(
                <g key={`enc-${i}`} className="transition-all duration-300">
                    <rect x={ex[i]} y={y[i]} width={w[i]} height={h[i]} rx={4} fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={2} />
                    <text x={ex[i] + w[i]/2} y={y[i] - 10} fill="#94a3b8" fontSize="12" textAnchor="middle" fontWeight="bold">{i === 0 ? 'Input' : `Enc ${i}`}</text>
                    
                    {progress > (i * 10) && progress < ((i + 1) * 10) && (
                        <rect x={ex[i]} y={y[i]} width={w[i]} height={h[i]} rx={4} fill="#60a5fa" className="animate-pulse" opacity={0.6} />
                    )}
                </g>
            );

            // Down Arrow to next block (or bottleneck)
            const nextX = i === 3 ? botX + w[4]/2 : ex[i+1] + w[i+1]/2;
            const nextY = y[i+1];
            blocks.push(
                <g key={`down-${i}`}>
                    <path d={`M ${ex[i] + w[i]/2} ${y[i] + h[i]} L ${nextX} ${nextY}`} stroke="#3b82f6" strokeWidth={2} fill="none" opacity={0.5} />
                    <polygon points={`${nextX - 4},${nextY - 6} ${nextX + 4},${nextY - 6} ${nextX},${nextY}`} fill="#3b82f6" opacity={0.5} />
                </g>
            );
        }

        // 2. Draw Bottleneck Block (4)
        blocks.push(
            <g key={`bot`} className="transition-all duration-300">
                <rect x={botX} y={y[4]} width={w[4]} height={h[4]} rx={4} fill="#a855f7" fillOpacity={0.2} stroke="#a855f7" strokeWidth={2} />
                <text x={botX + w[4]/2} y={y[4] + h[4] + 20} fill="#a855f7" fontSize="12" textAnchor="middle" fontWeight="bold">Bottleneck</text>
                
                {progress > 40 && progress < 50 && (
                    <rect x={botX} y={y[4]} width={w[4]} height={h[4]} rx={4} fill="#c084fc" className="animate-pulse" opacity={0.6} />
                )}
            </g>
        );

        // Up Arrow from Bottleneck to Decoder 3
        const dec3Center = dx[3] + decW[3]/2;
        blocks.push(
            <g key={`up-bot`}>
                <path d={`M ${botX + w[4]/2} ${y[4]} L ${dec3Center} ${y[3] + h[3]}`} stroke="#10b981" strokeWidth={2} fill="none" opacity={0.5} />
                <polygon points={`${dec3Center - 4},${y[3] + h[3] + 6} ${dec3Center + 4},${y[3] + h[3] + 6} ${dec3Center},${y[3] + h[3]}`} fill="#10b981" opacity={0.5} />
            </g>
        );

        // 3. Draw Decoder Blocks (3 down to 0)
        for (let i = 3; i >= 0; i--) {
            blocks.push(
                <g key={`dec-${i}`} className="transition-all duration-300">
                    <rect x={dx[i]} y={y[i]} width={decW[i]} height={h[i]} rx={4} fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth={2} />
                    <text x={dx[i] + decW[i]/2} y={y[i] - 10} fill="#94a3b8" fontSize="12" textAnchor="middle" fontWeight="bold">{i === 0 ? 'Output Mask' : `Dec ${i}`}</text>
                    
                    {progress > (100 - (i * 10)) && progress < (100 - ((i - 1) * 10)) && (
                        <rect x={dx[i]} y={y[i]} width={decW[i]} height={h[i]} rx={4} fill="#34d399" className="animate-pulse" opacity={0.6} />
                    )}
                </g>
            );

            // Up Arrow to previous block (if not output)
            if (i > 0) {
                const prevCenter = dx[i-1] + decW[i-1]/2;
                blocks.push(
                    <g key={`up-${i}`}>
                        <path d={`M ${dx[i] + decW[i]/2} ${y[i]} L ${prevCenter} ${y[i-1] + h[i-1]}`} stroke="#10b981" strokeWidth={2} fill="none" opacity={0.5} />
                        <polygon points={`${prevCenter - 4},${y[i-1] + h[i-1] + 6} ${prevCenter + 4},${y[i-1] + h[i-1] + 6} ${prevCenter},${y[i-1] + h[i-1]}`} fill="#10b981" opacity={0.5} />
                    </g>
                );
            }

            // Skip Connection from Encoder i to Decoder i
            const exRight = ex[i] + w[i];
            const activeSkip = progress > (100 - (i * 10) - 5) && progress < (100 - ((i - 1) * 10));
            skipConnections.push(
                <g key={`skip-${i}`}>
                    <path 
                        d={`M ${exRight} ${y[i] + h[i]/2} L ${dx[i]} ${y[i] + h[i]/2}`} 
                        stroke={activeSkip ? "#f43f5e" : "#475569"} 
                        strokeWidth={activeSkip ? 4 : 2} 
                        strokeDasharray="6 6" 
                        fill="none" 
                        className={activeSkip ? "animate-pulse" : ""}
                    />
                    <polygon 
                        points={`${dx[i] - 8},${y[i] + h[i]/2 - 5} ${dx[i] + 2},${y[i] + h[i]/2} ${dx[i] - 8},${y[i] + h[i]/2 + 5}`} 
                        fill={activeSkip ? "#f43f5e" : "#475569"} 
                    />
                </g>
            );
        }

        return { blocks, skipConnections };
    };

    const { blocks, skipConnections } = renderBlocks();

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mt-6">
            <div className="bg-slate-900/80 border-b border-slate-800 p-4 backdrop-blur flex justify-between items-center">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Layers className="text-emerald-400" size={20} />
                    U-Net Semantic Segmentation
                </h4>
                <button 
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg transition-all disabled:opacity-50"
                >
                    <FastForward size={16} />
                    {isPlaying ? 'Forward Pass...' : 'Simulate Forward Pass'}
                </button>
            </div>

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    
                    {/* Info Panel */}
                    <div className="w-full lg:w-72 space-y-4">
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            <h5 className="text-blue-400 font-bold mb-1 flex items-center gap-2"><Activity size={16}/> The Encoder</h5>
                            <p className="text-sm text-slate-400">
                                Extracts semantic features. Spatial resolution drops (boxes get shorter), but channel depth increases (boxes get wider). We learn "What" is in the image, but lose "Where" it is.
                            </p>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            <h5 className="text-emerald-400 font-bold mb-1 flex items-center gap-2"><Activity size={16}/> The Decoder</h5>
                            <p className="text-sm text-slate-400">
                                Upsamples the tiny feature maps back to the original image size using Transposed Convolutions to create a pixel-by-pixel mask.
                            </p>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-rose-500"></div>
                            <h5 className="text-rose-400 font-bold mb-1">Skip Connections</h5>
                            <p className="text-sm text-slate-400">
                                The genius of U-Net! High-resolution spatial features from the encoder are directly copied and concatenated to the decoder. This restores the "Where" information for perfect pixel masks.
                            </p>
                        </div>
                    </div>

                    {/* SVG Visualizer */}
                    <div className="flex-1 w-full bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                        <svg viewBox="0 0 1000 500" className="w-full h-auto">
                            {/* Grid/Background could go here */}
                            
                            {/* Skip Connections (drawn behind blocks) */}
                            {skipConnections}

                            {/* Blocks and vertical arrows */}
                            {blocks}

                            {/* Legend/Labels */}
                            <text x="150" y="30" fill="#3b82f6" fontSize="14" fontWeight="bold">Contracting Path (Encoder)</text>
                            <text x="500" y="30" fill="#10b981" fontSize="14" fontWeight="bold">Expanding Path (Decoder)</text>
                            <text x="330" y="480" fill="#f43f5e" fontSize="12" fontWeight="bold">→ Skip Connections (Copy & Crop)</text>
                        </svg>
                    </div>

                </div>
            </div>
        </div>
    );
}
