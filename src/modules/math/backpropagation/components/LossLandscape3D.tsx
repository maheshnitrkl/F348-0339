import React, { useState, useEffect, useRef, useCallback } from 'react';

// Loss function: f(w1, w2) = w1² + w2² - 2*w1*w2*cos(0.5) + sin(w1)*sin(w2)
// This creates an interesting landscape with a global minimum and ridges
function lossFunction(w1: number, w2: number): number {
    return w1 * w1 + w2 * w2 - 1.5 * w1 * w2 + 0.5 * Math.sin(3 * w1) * Math.sin(3 * w2);
}

function gradient(w1: number, w2: number): [number, number] {
    const dw1 = 2 * w1 - 1.5 * w2 + 1.5 * Math.cos(3 * w1) * Math.sin(3 * w2);
    const dw2 = 2 * w2 - 1.5 * w1 + 1.5 * Math.sin(3 * w1) * Math.cos(3 * w2);
    return [dw1, dw2];
}

// Isometric projection helpers
const ISO_ANGLE = Math.PI / 6;
const SCALE = 28;
const CX = 350;
const CY = 280;

function isoProject(x: number, y: number, z: number): [number, number] {
    const px = CX + (x - y) * Math.cos(ISO_ANGLE) * SCALE;
    const py = CY - z * SCALE * 0.6 + (x + y) * Math.sin(ISO_ANGLE) * SCALE * 0.5;
    return [px, py];
}

interface TrajectoryPoint {
    w1: number;
    w2: number;
    loss: number;
}

export const LossLandscape3D: React.FC = () => {
    const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [lr, setLr] = useState(0.05);
    const [startPos, setStartPos] = useState({ w1: 3.5, w2: 3.0 });
    const animRef = useRef<number | null>(null);

    const startDescent = useCallback(() => {
        setTrajectory([{ ...startPos, loss: lossFunction(startPos.w1, startPos.w2) }]);
        setIsRunning(true);
    }, [startPos]);

    useEffect(() => {
        if (!isRunning || trajectory.length === 0) return;

        animRef.current = window.setTimeout(() => {
            setTrajectory(prev => {
                const last = prev[prev.length - 1];
                const [gw1, gw2] = gradient(last.w1, last.w2);
                const newW1 = last.w1 - lr * gw1;
                const newW2 = last.w2 - lr * gw2;
                const newLoss = lossFunction(newW1, newW2);

                if (prev.length > 200 || (Math.abs(gw1) < 0.001 && Math.abs(gw2) < 0.001)) {
                    setIsRunning(false);
                    return [...prev, { w1: newW1, w2: newW2, loss: newLoss }];
                }
                return [...prev, { w1: newW1, w2: newW2, loss: newLoss }];
            });
        }, 50);

        return () => { if (animRef.current) clearTimeout(animRef.current); };
    }, [isRunning, trajectory, lr]);

    // Generate surface mesh
    const RANGE = 4;
    const STEP = 0.4;
    const surfaceLines: string[] = [];

    // Draw grid lines in X direction
    for (let y = -RANGE; y <= RANGE; y += STEP) {
        let path = '';
        for (let x = -RANGE; x <= RANGE; x += STEP * 0.5) {
            const z = lossFunction(x, y);
            const clampedZ = Math.min(z, 12);
            const [px, py] = isoProject(x, y, clampedZ);
            path += path === '' ? `M ${px} ${py}` : ` L ${px} ${py}`;
        }
        surfaceLines.push(path);
    }

    // Draw grid lines in Y direction
    for (let x = -RANGE; x <= RANGE; x += STEP) {
        let path = '';
        for (let y = -RANGE; y <= RANGE; y += STEP * 0.5) {
            const z = lossFunction(x, y);
            const clampedZ = Math.min(z, 12);
            const [px, py] = isoProject(x, y, clampedZ);
            path += path === '' ? `M ${px} ${py}` : ` L ${px} ${py}`;
        }
        surfaceLines.push(path);
    }

    // Trajectory path
    const trajectoryPoints = trajectory.map(p => {
        const clampedZ = Math.min(p.loss, 12);
        return isoProject(p.w1, p.w2, clampedZ);
    });

    const current = trajectory.length > 0 ? trajectory[trajectory.length - 1] : null;

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Loss Landscape</h3>
                    <p className="text-xs text-gray-500 mt-1">Watch gradient descent navigate a complex loss surface</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-xs text-gray-400 flex items-center gap-2">
                        LR:
                        <input type="range" min="0.01" max="0.15" step="0.01" value={lr}
                            onChange={e => setLr(parseFloat(e.target.value))}
                            className="w-20 accent-cyan-500"
                        />
                        <span className="text-cyan-400 font-mono w-10">{lr.toFixed(2)}</span>
                    </label>
                    <button onClick={isRunning ? () => setIsRunning(false) : startDescent}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isRunning ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'}`}
                    >{isRunning ? 'Stop' : 'Start Descent'}</button>
                    <button onClick={() => { setTrajectory([]); setIsRunning(false); setStartPos({ w1: (Math.random() - 0.5) * 6, w2: (Math.random() - 0.5) * 6 }); }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10"
                    >Randomize</button>
                </div>
            </div>

            <div className="bg-black/40 rounded-lg border border-white/5 overflow-hidden relative">
                <svg viewBox="0 0 700 450" className="w-full">
                    {/* Surface mesh */}
                    {surfaceLines.map((d, i) => (
                        <path key={i} d={d} fill="none"
                            stroke={i < surfaceLines.length / 2 ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)'}
                            strokeWidth="0.8"
                        />
                    ))}

                    {/* Trajectory line */}
                    {trajectoryPoints.length > 1 && (
                        <path
                            d={trajectoryPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')}
                            fill="none" stroke="#22d3ee" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            filter="url(#glow)"
                        />
                    )}

                    {/* Trajectory dots */}
                    {trajectoryPoints.map((p, i) => (
                        i % 3 === 0 && (
                            <circle key={i} cx={p[0]} cy={p[1]} r={i === trajectoryPoints.length - 1 ? 5 : 2}
                                fill={i === trajectoryPoints.length - 1 ? '#22d3ee' : 'rgba(34,211,238,0.5)'}
                            />
                        )
                    ))}

                    {/* Current position glow */}
                    {current && trajectoryPoints.length > 0 && (
                        <circle
                            cx={trajectoryPoints[trajectoryPoints.length - 1][0]}
                            cy={trajectoryPoints[trajectoryPoints.length - 1][1]}
                            r={8} fill="none" stroke="#22d3ee" strokeWidth="2" opacity={0.5}
                        >
                            <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                    )}

                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                </svg>
            </div>

            {/* Stats */}
            {current && (
                <div className="mt-3 flex gap-6 font-mono text-xs">
                    <span className="text-gray-500">Step: <span className="text-white">{trajectory.length - 1}</span></span>
                    <span className="text-gray-500">w₁: <span className="text-cyan-400">{current.w1.toFixed(4)}</span></span>
                    <span className="text-gray-500">w₂: <span className="text-cyan-400">{current.w2.toFixed(4)}</span></span>
                    <span className="text-gray-500">Loss: <span className={`${current.loss < 1 ? 'text-green-400' : 'text-orange-400'}`}>{current.loss.toFixed(4)}</span></span>
                </div>
            )}
        </div>
    );
};
