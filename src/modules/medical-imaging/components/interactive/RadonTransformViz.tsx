import React, { useRef, useState, useEffect } from 'react';
import { Activity, Play, RefreshCw, Settings } from 'lucide-react';

export const RadonTransformViz: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [angle, setAngle] = useState(0); // 0 to 180 degrees

    const drawPhantom = (ctx: CanvasRenderingContext2D, size: number) => {
        // ... (Same phantom drawing code)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.ellipse(size / 2, size / 2, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(size / 2, size * 0.7, size * 0.1, size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.ellipse(size * 0.35, size * 0.4, size * 0.08, size * 0.12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.ellipse(size * 0.65, size * 0.4, size * 0.08, size * 0.12, 0.2, 0, Math.PI * 2);
        ctx.fill();
    };

    useEffect(() => {
        let animationFrame: number;
        if (isAnimating) {
            const animate = () => {
                setAngle(prev => {
                    const next = prev + 1;
                    if (next >= 180) {
                        setIsAnimating(false);
                        return 180;
                    }
                    return next;
                });
                animationFrame = requestAnimationFrame(animate);
            };
            animationFrame = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(animationFrame);
    }, [isAnimating]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const size = 200;
        const centerX = 150;
        const centerY = 150;

        // 1. CT Gantry View
        ctx.save();
        ctx.translate(centerX - size / 2, centerY - size / 2);

        // Draw Phantom
        drawPhantom(ctx, size);

        // Draw Gantry (Source & Detector)
        const rad = (angle * Math.PI) / 180;
        const r = 130;
        const cx = size / 2;
        const cy = size / 2;

        // Source
        const sx = cx - r * Math.cos(rad);
        const sy = cy - r * Math.sin(rad);
        // Detector
        const dx = cx + r * Math.cos(rad);
        const dy = cy + r * Math.sin(rad);

        // Beam
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(dx, dy);
        ctx.stroke();

        // Source Icon
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();

        // Detector Array
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(dx, dy, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText("CT Gantry Rotation", 50, 30);


        // 2. Sinogram Building
        const sinoX = 350;
        const sinoY = 50;
        const sinoW = 180;
        const sinoH = 200;

        ctx.save();
        ctx.translate(sinoX, sinoY);
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, sinoW, sinoH);

        // Draw Sinogram up to current angle
        for (let a = 0; a < angle; a++) {
            // Fake sinogram data based on phantom features
            const y = a; // angle maps to y-axis of sinogram
            // Simple synthetic projection: sum of sine waves
            const radA = (a * Math.PI) / 180;
            const center = sinoW / 2;

            // Main mass sine wave
            const offset1 = Math.sin(radA) * 20;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(center + offset1 - 20, y, 40, 1);

            // Details
            const offset2 = Math.sin(radA + 1) * 40;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.fillRect(center + offset2, y, 5, 1);
        }

        // Current Scan Line on Sinogram
        ctx.strokeStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(0, angle);
        ctx.lineTo(sinoW, angle);
        ctx.stroke();

        ctx.strokeStyle = '#8b5cf6';
        ctx.strokeRect(0, 0, sinoW, sinoH);
        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.fillText("Sinogram (Radon Space)", sinoX, 30);


        // 3. Backprojection (Reconstruction)
        const reconX = 600;
        const reconY = 50;

        ctx.save();
        ctx.translate(reconX, reconY);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);

        // Accumulate backprojections
        // Visualize "smearing" back
        if (angle > 0) {
            // Draw phantom with opacity proportional to completion
            ctx.globalAlpha = angle / 180;
            drawPhantom(ctx, size);

            // Draw current backprojection line
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
            ctx.lineWidth = 150; // Wide smear

            // Inverse rotation
            ctx.translate(size / 2, size / 2);
            ctx.rotate(rad);
            ctx.beginPath();
            ctx.moveTo(-size, 0);
            ctx.lineTo(size, 0);
            ctx.stroke();
        }

        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.fillText("Filtered Backprojection", reconX, 30);

    }, [angle, isAnimating]);

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">CT Scan Simulator</h3>
                        <p className="text-sm text-gray-400">Gantry Rotation & Sinogram Formation</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Angle</div>
                        <div className="font-mono text-blue-400">{angle}°</div>
                    </div>
                    <button
                        onClick={() => { setAngle(0); setIsAnimating(true); }}
                        disabled={isAnimating}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${isAnimating
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25'
                            }`}
                    >
                        {isAnimating ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                        {isAnimating ? 'Scanning...' : 'Start Scan'}
                    </button>
                </div>
            </div>

            <div className="bg-black rounded-xl overflow-hidden border border-white/5 relative">
                <canvas
                    ref={canvasRef}
                    width={850}
                    height={300}
                    className="w-full h-auto"
                />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-8 text-center text-xs text-gray-500 font-mono">
                <div>
                    <strong className="text-yellow-500 block mb-1">X-Ray Source</strong>
                    Rotates 180° around patient.
                </div>
                <div>
                    <strong className="text-blue-400 block mb-1">Sinogram (Row = Angle)</strong>
                    Stacking 1D projections creates 2D Radon space.
                </div>
                <div>
                    <strong className="text-pink-400 block mb-1">FBP Reconstruction</strong>
                    Smearing projections back to recover image.
                </div>
            </div>
        </div>
    );
};
