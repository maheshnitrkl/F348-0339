/* eslint-disable */
import React, { useRef, useState, useEffect } from 'react';
import { Layers, MousePointer2 } from 'lucide-react';

// Hounsfield Units (HU)
const HU_AIR = -1000;
const HU_LUNG = -500;
const HU_FAT = -100;
const HU_WATER = 0;
const HU_SOFT_TISSUE = 40;
const HU_BONE = 1000;

// Presets
const PRESETS = [
    { name: 'Lung', width: 1500, level: -600 },
    { name: 'Soft Tissue', width: 400, level: 50 },
    { name: 'Bone', width: 2000, level: 400 },
    { name: 'Brain', width: 80, level: 40 },
];

export const InteractiveFilters: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [windowWidth, setWindowWidth] = useState(400);
    const [windowLevel, setWindowLevel] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Phantom Data (256x256)
    // We generate valid HU values: -1000 to +3000
    const size = 256;
    const [phantomData, setPhantomData] = useState<Float32Array | null>(() => {
        // Generate Shepp-Logan-ish Phantom
        const data = new Float32Array(size * size);
        const cx = size / 2;
        const cy = size / 2;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Background: Air
                let hu = HU_AIR;

                // Normalize coords -1 to 1
                const nx = (x - cx) / cx;
                const ny = (y - cy) / cy;

                // 1. Skull (Bone) - Ellipse
                if (nx * nx + ny * ny < 0.9) {
                    hu = HU_BONE;
                }

                // 2. Brain (Soft Tissue) - Smaller Ellipse
                if (nx * nx / 0.7 + ny * ny / 0.8 < 0.8) {
                    hu = HU_SOFT_TISSUE;
                }

                // 3. Ventricles (Water/CSF) 
                if ((nx - 0.2) * (nx - 0.2) / 0.05 + (ny - 0.2) * (ny - 0.2) / 0.1 < 0.1) {
                    hu = HU_WATER; // CSF is near water
                }
                if ((nx + 0.2) * (nx + 0.2) / 0.05 + (ny - 0.2) * (ny - 0.2) / 0.1 < 0.1) {
                    hu = HU_WATER;
                }

                // 4. Tumor (Dense Tissue)
                if ((nx - 0.3) * (nx - 0.3) / 0.02 + (ny + 0.3) * (ny + 0.3) / 0.02 < 0.1) {
                    hu = 100; // Slightly denser
                }

                // 5. Sinus (Air)
                if (nx * nx / 0.1 + (ny + 0.7) * (ny + 0.7) / 0.1 < 0.1) {
                    hu = HU_AIR;
                }

                // 6. Lungs (Simple approximation for demo)
                // Left Lung
                if ((nx - 0.5) * (nx - 0.5) / 0.04 + (ny + 0.3) * (ny + 0.3) / 0.15 < 0.5) {
                    hu = HU_LUNG;
                }
                // Right Lung
                if ((nx + 0.5) * (nx + 0.5) / 0.04 + (ny + 0.3) * (ny + 0.3) / 0.15 < 0.5) {
                    hu = HU_LUNG;
                }

                // 7. Subcutaneous Fat
                if (nx * nx + ny * ny > 0.85 && nx * nx + ny * ny < 0.9) {
                    hu = HU_FAT;
                }

                data[y * size + x] = hu;
            }
        }
        return data;
    });

    // Render Loop
    useEffect(() => {
        if (!phantomData) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.createImageData(size, size);
        const pixels = imageData.data;

        for (let i = 0; i < phantomData.length; i++) {
            const hu = phantomData[i];

            // DICOM Windowing Logic
            // val = ((val - (level - width/2)) / width) * 255
            const min = windowLevel - windowWidth / 2;
            const max = windowLevel + windowWidth / 2;

            let val = (hu - min) / (max - min);
            val = Math.max(0, Math.min(1, val)); // Clamp 0..1

            const intensity = Math.floor(val * 255);

            pixels[i * 4] = intensity;     // R
            pixels[i * 4 + 1] = intensity; // G
            pixels[i * 4 + 2] = intensity; // B
            pixels[i * 4 + 3] = 255;       // Alpha
        }

        ctx.putImageData(imageData, 0, 0);

    }, [phantomData, windowWidth, windowLevel]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;

        // PACS Convention:
        // Horizontal Drag -> Change Width (Contrast)
        // Vertical Drag -> Change Level (Brightness)
        setWindowWidth(prev => Math.max(1, prev + dx * 2));
        setWindowLevel(prev => prev - dy * 2); // Drag up increases level usually, but let's stick to standard intuitive

        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="bg-black/30 border border-white/10 rounded-xl p-6 select-none">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Controls */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Layers className="text-blue-400" /> DICOM Windowing</h3>
                        <p className="text-sm text-gray-400">
                            Simulating 12-bit medical data.
                            <br />
                            <span className="text-blue-400">Drag image</span> to adjust Window/Level.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 font-mono text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Width (Contrast)</span>
                                <span className="text-white">{Math.round(windowWidth)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Level (Brightness)</span>
                                <span className="text-white">{Math.round(windowLevel)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {PRESETS.map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => { setWindowWidth(p.width); setWindowLevel(p.level); }}
                                    className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 text-sm transition-colors text-left"
                                >
                                    <div className="font-bold">{p.name}</div>
                                    <div className="text-[10px] opacity-70">W:{p.width} L:{p.level}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="w-full md:w-2/3 flex flex-col items-center">
                    <div
                        className="relative cursor-crosshair group overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <canvas
                            ref={canvasRef}
                            width={size}
                            height={size}
                            className="w-full h-auto bg-black"
                            style={{ imageRendering: 'pixelated' }}
                        />

                        {/* Overlay Hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black/20">
                            <div className="bg-black/60 px-3 py-1 rounded text-white text-xs backdrop-blur-md flex items-center gap-2">
                                <MousePointer2 size={12} />
                                Drag to Window/Level
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-8 text-xs text-gray-500 mt-4 font-mono">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-white rounded-full"></span> Bone (+1000 HU)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-500 rounded-full"></span> Soft Tissue (40 HU)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-black border border-gray-700 rounded-full"></span> Air (-1000 HU)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

