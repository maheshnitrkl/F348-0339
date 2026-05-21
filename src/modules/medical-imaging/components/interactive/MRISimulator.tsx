import React, { useRef, useState, useEffect } from 'react';
import { Activity, Magnet, RefreshCw, Zap } from 'lucide-react';

// Spin Physics Constants
const GRID_SIZE = 10; // 10x10 spins
const LARMOR_FREQ = 0.1; // Base precession speed
const T1_CONST = 0.02; // Longitudinal relaxation rate
const T2_CONST = 0.05; // Transverse decay rate

interface Spin {
    x: number;
    y: number; // Grid position
    mz: number; // Longitudinal magnetization (0 to 1)
    mxy: number; // Transverse magnetization (0 to 1)
    phase: number; // Phase angle in XY plane
    omegaOffset: number; // Small frequency offset for T2 dephasing
}

export const MRISimulator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [spins, setSpins] = useState<Spin[]>([]);
    const [b0Field, setB0Field] = useState(true);
    const [time, setTime] = useState(0);
    const [historyMz, setHistoryMz] = useState<number[]>([]);
    const [historyMxy, setHistoryMxy] = useState<number[]>([]);

    // Initialize Spins
    useEffect(() => {
        const newSpins: Spin[] = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                newSpins.push({
                    x: i,
                    y: j,
                    mz: 1, // Start fully aligned with B0
                    mxy: 0,
                    phase: Math.random() * Math.PI * 2,
                    omegaOffset: (Math.random() - 0.5) * 0.05 // Inhomogeneities
                });
            }
        }
        setSpins(newSpins);
    }, []);

    // Physics Loop
    useEffect(() => {
        let animationFrame: number;

        const updatePhysics = () => {
            setSpins(prevSpins => {
                let netMz = 0;
                let netMxyX = 0;
                let netMxyY = 0;

                const updated = prevSpins.map(spin => {
                    let newMz = spin.mz;
                    let newMxy = spin.mxy;
                    let newPhase = spin.phase;

                    // 1. Precession (Larmor)
                    if (b0Field) {
                        newPhase += LARMOR_FREQ + spin.omegaOffset;
                    }

                    // 2. Relaxation (Bloch Equations approximation)
                    if (b0Field) {
                        // T1 Recovery: Mz grows back to 1
                        newMz += (1 - newMz) * T1_CONST;
                        // T2 Decay: Mxy shrinks to 0
                        newMxy *= (1 - T2_CONST);
                    } else {
                        // Without B0, thermal randomization
                        newMz *= 0.98;
                        newMxy *= 0.95;
                    }

                    // Accumulate Net Vector
                    netMz += newMz;
                    netMxyX += newMxy * Math.cos(newPhase);
                    netMxyY += newMxy * Math.sin(newPhase);

                    return { ...spin, mz: newMz, mxy: newMxy, phase: newPhase };
                });

                // Update Graphs
                const totalSpins = GRID_SIZE * GRID_SIZE;
                const totalMxy = Math.sqrt(netMxyX ** 2 + netMxyY ** 2) / totalSpins;
                const totalMz = netMz / totalSpins;

                setHistoryMz(h => [...h.slice(-100), totalMz]);
                setHistoryMxy(h => [...h.slice(-100), totalMxy]);

                return updated;
            });

            setTime(t => t + 1);
            animationFrame = requestAnimationFrame(updatePhysics);
        };

        animationFrame = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(animationFrame);
    }, [b0Field]);

    // Apply RF Pulse
    const applyRF = (angle: number) => {
        setSpins(prev => prev.map(spin => {
            // Simple rotation matrix concept
            // 90 deg pulse: Mz -> Mxy
            // 180 deg pulse: Mz -> -Mz
            if (angle === 90) {
                return { ...spin, mz: 0, mxy: 1, phase: 0 }; // Coherent phase start
            } else if (angle === 180) {
                return { ...spin, mz: -spin.mz, mxy: spin.mxy }; // Invert
            }
            return spin;
        }));
    };

    // Render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Visual Config
        const width = canvas.width;
        const height = canvas.height;
        const pad = 20;
        const gridW = width * 0.6;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // 1. Draw Spins (3D-ish perspective)
        const spacing = (gridW - pad * 2) / GRID_SIZE;

        spins.forEach(spin => {
            const bx = pad + spin.x * spacing + spacing / 2;
            const by = pad + spin.y * spacing + spacing / 2;

            const vecLen = 15;

            // Draw Arrow
            ctx.beginPath();
            ctx.moveTo(bx, by);

            // Calculate tip based on Mz and Mxy
            // Z is up/down (y-axis on screen), XY is rotating circle (x-axis + depth)
            const tipY = by - spin.mz * vecLen;
            const tipX = bx + spin.mxy * Math.cos(spin.phase) * vecLen;

            // Color based on state
            // Red = High Energy (tipped), Blue = Low Energy (Aligned)
            const energy = 1 - Math.abs(spin.mz);
            ctx.strokeStyle = `rgb(${energy * 255}, 50, ${(1 - energy) * 255})`;
            ctx.lineWidth = 2;

            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Arrowhead
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // 2. Draw Graphs
        const graphX = width * 0.65;
        const graphW = width * 0.3;
        const graphH = 100;

        const drawGraph = (data: number[], x: number, y: number, w: number, h: number, color: string, label: string) => {
            // Bg
            ctx.fillStyle = '#111';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(x, y, w, h);

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.fillText(label, x, y - 5);

            if (data.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            const step = w / 100;
            data.forEach((val, i) => {
                const px = x + i * step;
                // Map 0..1 to h..0
                const py = y + h - (val * h);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();
        };

        // Mz Graph (Longitudinal)
        drawGraph(historyMz, graphX, 50, graphW, graphH, '#3b82f6', 'Longitudinal (Mz) - T1');
        // Mxy Graph (Transverse)
        drawGraph(historyMxy, graphX, 180, graphW, graphH, '#ec4899', 'Transverse (Mxy) - T2');

    }, [spins, historyMz, historyMxy]);

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">MRI Spin Physics</h3>
                        <p className="text-sm text-gray-400">Bloch Equations Simulator</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setB0Field(!b0Field)}
                        className={`p-2 rounded-lg border ${b0Field ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}
                        title="Toggle Main Magnetic Field"
                    >
                        <Magnet size={20} /> B0 Field
                    </button>
                    <button
                        onClick={() => applyRF(90)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2"
                    >
                        <Zap size={16} /> 90° Pulse
                    </button>
                    <button
                        onClick={() => applyRF(180)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> 180° Pulse
                    </button>
                </div>
            </div>

            <div className="bg-black rounded-xl overflow-hidden border border-white/5 relative">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={350}
                    className="w-full h-auto"
                />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-8 text-center text-xs text-gray-500 font-mono">
                <div>
                    <strong className="text-blue-400 block mb-1">T1 Recovery (Spin-Lattice)</strong>
                    Spins realign with B0 (Z-axis). Determines tissue contrast.
                </div>
                <div>
                    <strong className="text-pink-400 block mb-1">T2 Decay (Spin-Spin)</strong>
                    Spins dephase in XY plane due to interactions.
                </div>
            </div>
        </div>
    );
};
