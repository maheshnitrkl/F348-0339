import React, { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// 1. VECTOR ADDITION VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const VectorAdditionViz: React.FC = () => {
    const [v1] = useState({ x: 3, y: 1 });
    const [v2] = useState({ x: 1, y: 3 });
    const sum = { x: v1.x + v2.x, y: v1.y + v2.y };
    const scale = 40;
    const cx = 160, cy = 180;

    const toSVG = (v: { x: number; y: number }) => ({
        x: cx + v.x * scale,
        y: cy - v.y * scale,
    });

    const p1 = toSVG(v1);
    const p2 = toSVG(v2);
    const ps = toSVG(sum);
    const origin = toSVG({ x: 0, y: 0 });

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <svg viewBox="0 0 320 240" className="w-full max-w-md mx-auto">
                {/* Grid */}
                {Array.from({ length: 9 }, (_, i) => (
                    <React.Fragment key={`g${i}`}>
                        <line x1={cx + (i - 4) * scale} y1={0} x2={cx + (i - 4) * scale} y2={240}
                            stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                        <line x1={0} y1={cy + (i - 4) * scale} x2={320} y2={cy + (i - 4) * scale}
                            stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                    </React.Fragment>
                ))}
                {/* Axes */}
                <line x1={0} y1={cy} x2={320} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                <line x1={cx} y1={0} x2={cx} y2={240} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

                {/* Parallelogram (dashed) */}
                <polygon
                    points={`${origin.x},${origin.y} ${p1.x},${p1.y} ${ps.x},${ps.y} ${p2.x},${p2.y}`}
                    fill="rgba(0,255,255,0.05)" stroke="rgba(0,255,255,0.2)" strokeDasharray="4,4" strokeWidth={1}
                />

                {/* v1 arrow */}
                <line x1={origin.x} y1={origin.y} x2={p1.x} y2={p1.y}
                    stroke="#00e5ff" strokeWidth={2.5} markerEnd="url(#arrowCyan)" />
                {/* v2 arrow */}
                <line x1={origin.x} y1={origin.y} x2={p2.x} y2={p2.y}
                    stroke="#e040fb" strokeWidth={2.5} markerEnd="url(#arrowPink)" />
                {/* v1+v2 arrow */}
                <line x1={origin.x} y1={origin.y} x2={ps.x} y2={ps.y}
                    stroke="#76ff03" strokeWidth={2.5} markerEnd="url(#arrowGreen)" />

                {/* Labels */}
                <text x={p1.x + 5} y={p1.y - 5} fill="#00e5ff" fontSize="11" fontWeight="bold">v₁ (3,1)</text>
                <text x={p2.x - 40} y={p2.y - 5} fill="#e040fb" fontSize="11" fontWeight="bold">v₂ (1,3)</text>
                <text x={ps.x + 5} y={ps.y - 5} fill="#76ff03" fontSize="11" fontWeight="bold">v₁+v₂ (4,4)</text>

                {/* Arrow markers */}
                <defs>
                    <marker id="arrowCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#00e5ff" />
                    </marker>
                    <marker id="arrowPink" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#e040fb" />
                    </marker>
                    <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#76ff03" />
                    </marker>
                </defs>
            </svg>
            <p className="text-center text-xs text-gray-500 mt-1">Parallelogram rule: v₁ + v₂ = diagonal</p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 2. NORM BALLS VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const NormBallsViz: React.FC = () => {
    const [norm, setNorm] = useState<'L1' | 'L2' | 'Linf'>('L2');
    const cx = 150, cy = 150, r = 80;

    const getPath = () => {
        if (norm === 'L1') {
            return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
        }
        if (norm === 'Linf') {
            return `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z`;
        }
        // L2 circle
        const pts = Array.from({ length: 64 }, (_, i) => {
            const angle = (i / 64) * Math.PI * 2;
            return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
        });
        return `M ${pts.join(' L ')} Z`;
    };

    const colors = { L1: '#ff9800', L2: '#00e5ff', Linf: '#e040fb' };
    const labels = {
        L1: '|x₁| + |x₂| ≤ 1 (Diamond)',
        L2: 'x₁² + x₂² ≤ 1 (Circle)',
        Linf: 'max(|x₁|, |x₂|) ≤ 1 (Square)',
    };

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <div className="flex gap-2 justify-center mb-3">
                {(['L1', 'L2', 'Linf'] as const).map((n) => (
                    <button key={n} onClick={() => setNorm(n)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${norm === n ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:text-gray-300'
                            }`}>
                        {n === 'Linf' ? 'L∞' : n}
                    </button>
                ))}
            </div>
            <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
                {/* Axes */}
                <line x1={cx} y1={20} x2={cx} y2={280} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                <line x1={20} y1={cy} x2={280} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                <text x={275} y={cy - 8} fill="rgba(255,255,255,0.4)" fontSize="10">x₁</text>
                <text x={cx + 5} y={28} fill="rgba(255,255,255,0.4)" fontSize="10">x₂</text>

                {/* Unit ball */}
                <path d={getPath()} fill={`${colors[norm]}15`} stroke={colors[norm]}
                    strokeWidth={2.5} style={{ transition: 'all 0.5s ease' }} />

                {/* Origin */}
                <circle cx={cx} cy={cy} r={3} fill="white" />
            </svg>
            <p className="text-center text-xs mt-1" style={{ color: colors[norm] }}>
                {labels[norm]}
            </p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 3. DETERMINANT AREA VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const DeterminantAreaViz: React.FC = () => {
    const [shear, setShear] = useState(0.5);
    const scale = 60;
    const cx = 160, cy = 180;

    const a = 1, b = shear, c = 0, d = 1;
    const det = a * d - b * c;

    const corners = [
        { x: 0, y: 0 },
        { x: a, y: c },
        { x: a + b, y: c + d },
        { x: b, y: d },
    ];

    const toSVG = (v: { x: number; y: number }) => ({
        x: cx + v.x * scale,
        y: cy - v.y * scale,
    });

    const svgCorners = corners.map(toSVG);
    const polyPoints = svgCorners.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <svg viewBox="0 0 320 240" className="w-full max-w-md mx-auto">
                {/* Grid */}
                {Array.from({ length: 9 }, (_, i) => (
                    <React.Fragment key={`dg${i}`}>
                        <line x1={cx + (i - 4) * scale} y1={0} x2={cx + (i - 4) * scale} y2={240}
                            stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                        <line x1={0} y1={cy + (i - 4) * scale} x2={320} y2={cy + (i - 4) * scale}
                            stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                    </React.Fragment>
                ))}
                <line x1={0} y1={cy} x2={320} y2={cy} stroke="rgba(255,255,255,0.15)" />
                <line x1={cx} y1={0} x2={cx} y2={240} stroke="rgba(255,255,255,0.15)" />

                {/* Unit square (ghost) */}
                <rect x={cx} y={cy - scale} width={scale} height={scale}
                    fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
                <text x={cx + scale / 2 - 15} y={cy - scale / 2 + 4} fill="rgba(255,255,255,0.2)" fontSize="9">
                    unit sq
                </text>

                {/* Transformed parallelogram */}
                <polygon points={polyPoints}
                    fill={det > 0 ? 'rgba(0,230,118,0.15)' : 'rgba(255,82,82,0.15)'}
                    stroke={det > 0 ? '#00e676' : '#ff5252'}
                    strokeWidth={2} style={{ transition: 'all 0.3s ease' }} />

                {/* det label */}
                <text x={cx + (a + b) * scale / 2 - 20} y={cy - (c + d) * scale / 2}
                    fill="white" fontSize="12" fontWeight="bold">
                    Area = {Math.abs(det).toFixed(2)}
                </text>
            </svg>

            <div className="flex items-center gap-3 justify-center mt-2">
                <label className="text-xs text-gray-400">Shear:</label>
                <input type="range" min="-2" max="2" step="0.1"
                    value={shear} onChange={e => setShear(parseFloat(e.target.value))}
                    className="w-40 accent-cyan-400" />
                <span className="text-xs font-mono text-white">det = {det.toFixed(2)}</span>
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">
                Drag slider to see how shearing changes the parallelogram area
            </p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 4. LINEAR INDEPENDENCE VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const LinearIndependenceViz: React.FC = () => {
    const [independent, setIndependent] = useState(true);
    const scale = 40;
    const cx = 160, cy = 120;

    const v1 = { x: 3, y: 1 };
    const v2dep = { x: 6, y: 2 }; // 2*v1 = dependent
    const v2ind = { x: 1, y: 3 }; // independent

    const v2 = independent ? v2ind : v2dep;

    const toSVG = (v: { x: number; y: number }) => ({
        x: cx + v.x * scale,
        y: cy - v.y * scale,
    });

    const origin = toSVG({ x: 0, y: 0 });
    const p1 = toSVG(v1);
    const p2 = toSVG(v2);

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <div className="flex gap-2 justify-center mb-3">
                <button onClick={() => setIndependent(true)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${independent ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-white/5 text-gray-500'
                        }`}>Independent</button>
                <button onClick={() => setIndependent(false)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${!independent ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/5 text-gray-500'
                        }`}>Dependent</button>
            </div>
            <svg viewBox="0 0 320 240" className="w-full max-w-md mx-auto">
                {/* Axes */}
                <line x1={0} y1={cy} x2={320} y2={cy} stroke="rgba(255,255,255,0.15)" />
                <line x1={cx} y1={0} x2={cx} y2={240} stroke="rgba(255,255,255,0.15)" />

                {/* Span area for independent */}
                {independent && (
                    <rect x={20} y={10} width={280} height={220}
                        fill="rgba(0,255,255,0.03)" stroke="rgba(0,255,255,0.1)"
                        strokeDasharray="4,4" rx={8} />
                )}

                {/* Span line for dependent */}
                {!independent && (
                    <line x1={cx - 180} y1={cy + 60} x2={cx + 280} y2={cy - 93}
                        stroke="rgba(255,82,82,0.3)" strokeWidth={12} strokeLinecap="round" />
                )}

                {/* Vectors */}
                <line x1={origin.x} y1={origin.y} x2={p1.x} y2={p1.y}
                    stroke="#00e5ff" strokeWidth={2.5} markerEnd="url(#arrowCyan)"
                    style={{ transition: 'all 0.5s ease' }} />
                <line x1={origin.x} y1={origin.y} x2={p2.x} y2={p2.y}
                    stroke="#e040fb" strokeWidth={2.5} markerEnd="url(#arrowPink)"
                    style={{ transition: 'all 0.5s ease' }} />

                <text x={p1.x + 5} y={p1.y - 8} fill="#00e5ff" fontSize="11" fontWeight="bold">v₁</text>
                <text x={p2.x + 5} y={p2.y - 8} fill="#e040fb" fontSize="11" fontWeight="bold">v₂</text>

                {/* Status label */}
                <text x={160} y={230} fill={independent ? '#00e676' : '#ff5252'}
                    fontSize="12" fontWeight="bold" textAnchor="middle">
                    {independent ? 'Span = entire 2D plane ✓' : 'Span = just a line (v₂ = 2·v₁) ✗'}
                </text>

                <defs>
                    <marker id="arrowCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#00e5ff" />
                    </marker>
                    <marker id="arrowPink" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#e040fb" />
                    </marker>
                </defs>
            </svg>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 5. EIGENVALUE VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const EigenViz: React.FC = () => {
    const [animated, setAnimated] = useState(false);
    const scale = 35;
    const cx = 160, cy = 130;

    // Matrix A = [[2, 1], [0, 3]], eigenvalues: 2 and 3
    // Eigenvectors: [1,0] for λ=2, [1,1] for λ=3
    const eigenV1 = { x: 1, y: 0 }; // λ=2
    const eigenV2Dir = { x: 1 / Math.sqrt(2), y: 1 / Math.sqrt(2) }; // λ=3
    const regularV = { x: 0, y: 1 }; // regular vector

    const applyA = (v: { x: number; y: number }) => ({
        x: 2 * v.x + 1 * v.y,
        y: 0 * v.x + 3 * v.y,
    });

    const toSVG = (v: { x: number; y: number }, s: number = 1) => ({
        x: cx + v.x * scale * s,
        y: cy - v.y * scale * s,
    });

    const origin = toSVG({ x: 0, y: 0 });

    const e1before = toSVG(eigenV1, 2);
    const e1after = toSVG(applyA({ x: eigenV1.x * 2, y: eigenV1.y * 2 }));
    const e2before = toSVG(eigenV2Dir, 2);
    const e2after = toSVG(applyA({ x: eigenV2Dir.x * 2, y: eigenV2Dir.y * 2 }));
    const rbefore = toSVG(regularV, 2);
    const rafter = toSVG(applyA({ x: regularV.x * 2, y: regularV.y * 2 }));

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <div className="flex gap-2 justify-center mb-3">
                <button onClick={() => setAnimated(false)}
                    className={`px-3 py-1 rounded text-xs font-bold ${!animated ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>
                    Before A
                </button>
                <button onClick={() => setAnimated(true)}
                    className={`px-3 py-1 rounded text-xs font-bold ${animated ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>
                    After A
                </button>
            </div>
            <svg viewBox="0 0 320 260" className="w-full max-w-md mx-auto">
                <line x1={0} y1={cy} x2={320} y2={cy} stroke="rgba(255,255,255,0.1)" />
                <line x1={cx} y1={0} x2={cx} y2={260} stroke="rgba(255,255,255,0.1)" />

                {/* Eigenvector 1 - stays on x-axis */}
                <line x1={origin.x} y1={origin.y}
                    x2={animated ? e1after.x : e1before.x}
                    y2={animated ? e1after.y : e1before.y}
                    stroke="#00e5ff" strokeWidth={2.5}
                    style={{ transition: 'all 0.8s ease' }} />
                <circle cx={animated ? e1after.x : e1before.x}
                    cy={animated ? e1after.y : e1before.y}
                    r={4} fill="#00e5ff" style={{ transition: 'all 0.8s ease' }} />
                <text x={(animated ? e1after.x : e1before.x) + 5}
                    y={(animated ? e1after.y : e1before.y) - 8}
                    fill="#00e5ff" fontSize="10" fontWeight="bold"
                    style={{ transition: 'all 0.8s ease' }}>
                    eigen (λ=2)
                </text>

                {/* Eigenvector 2 - stays on diagonal */}
                <line x1={origin.x} y1={origin.y}
                    x2={animated ? e2after.x : e2before.x}
                    y2={animated ? e2after.y : e2before.y}
                    stroke="#76ff03" strokeWidth={2.5}
                    style={{ transition: 'all 0.8s ease' }} />
                <circle cx={animated ? e2after.x : e2before.x}
                    cy={animated ? e2after.y : e2before.y}
                    r={4} fill="#76ff03" style={{ transition: 'all 0.8s ease' }} />
                <text x={(animated ? e2after.x : e2before.x) + 5}
                    y={(animated ? e2after.y : e2before.y) - 8}
                    fill="#76ff03" fontSize="10" fontWeight="bold"
                    style={{ transition: 'all 0.8s ease' }}>
                    eigen (λ=3)
                </text>

                {/* Regular vector - changes direction */}
                <line x1={origin.x} y1={origin.y}
                    x2={animated ? rafter.x : rbefore.x}
                    y2={animated ? rafter.y : rbefore.y}
                    stroke="#ff5252" strokeWidth={2.5} strokeDasharray={animated ? '0' : '0'}
                    style={{ transition: 'all 0.8s ease' }} />
                <circle cx={animated ? rafter.x : rbefore.x}
                    cy={animated ? rafter.y : rbefore.y}
                    r={4} fill="#ff5252" style={{ transition: 'all 0.8s ease' }} />
                <text x={(animated ? rafter.x : rbefore.x) + 5}
                    y={(animated ? rafter.y : rbefore.y) - 8}
                    fill="#ff5252" fontSize="10" fontWeight="bold"
                    style={{ transition: 'all 0.8s ease' }}>
                    regular (rotates!)
                </text>

                {/* Direction guide lines */}
                <line x1={cx - 120} y1={cy} x2={cx + 200} y2={cy}
                    stroke="rgba(0,229,255,0.15)" strokeDasharray="3,3" />
                <line x1={cx - 100} y1={cy + 100} x2={cx + 100} y2={cy - 100}
                    stroke="rgba(118,255,3,0.15)" strokeDasharray="3,3" />

                <text x={160} y={252} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">
                    Eigenvectors only stretch. Regular vectors rotate AND stretch.
                </text>
            </svg>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 6. SVD STEPS VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const SVDStepsViz: React.FC = () => {
    const [step, setStep] = useState(0);
    const cx = 100, cy = 100;
    const r = 40;

    const steps = [
        { label: 'Unit Circle', color: '#e0e0e0' },
        { label: '1. Rotate (Vᵀ)', color: '#ffab00' },
        { label: '2. Stretch (Σ)', color: '#ff5252' },
        { label: '3. Rotate (U)', color: '#00e5ff' },
    ];

    // Generate circle points
    const N = 48;
    const getPoints = () => {
        return Array.from({ length: N }, (_, i) => {
            const angle = (i / N) * Math.PI * 2;
            let x = Math.cos(angle);
            let y = Math.sin(angle);

            if (step >= 1) { // Rotate by 30°
                const cos30 = Math.cos(Math.PI / 6);
                const sin30 = Math.sin(Math.PI / 6);
                const nx = cos30 * x - sin30 * y;
                const ny = sin30 * x + cos30 * y;
                x = nx; y = ny;
            }
            if (step >= 2) { // Stretch ϒ1=2.5, ϒ2=1
                x *= 2.2;
                y *= 0.8;
            }
            if (step >= 3) { // Rotate by -45°
                const cos45 = Math.cos(-Math.PI / 4);
                const sin45 = Math.sin(-Math.PI / 4);
                const nx = cos45 * x - sin45 * y;
                const ny = sin45 * x + cos45 * y;
                x = nx; y = ny;
            }

            return { x: cx + x * r, y: cy - y * r };
        });
    };

    const pts = getPoints();
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <div className="flex gap-1 justify-center mb-3 flex-wrap">
                {steps.map((s, i) => (
                    <button key={i} onClick={() => setStep(i)}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${step === i ? `text-white border` : 'bg-white/5 text-gray-500'
                            }`}
                        style={step === i ? { borderColor: s.color, backgroundColor: `${s.color}20` } : {}}>
                        {s.label}
                    </button>
                ))}
            </div>
            <svg viewBox="0 0 200 200" className="w-full max-w-xs mx-auto">
                <line x1={0} y1={cy} x2={200} y2={cy} stroke="rgba(255,255,255,0.1)" />
                <line x1={cx} y1={0} x2={cx} y2={200} stroke="rgba(255,255,255,0.1)" />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)"
                    strokeDasharray="3,3" />
                <path d={pathD} fill={`${steps[step].color}15`} stroke={steps[step].color}
                    strokeWidth={2} style={{ transition: 'all 0.6s ease' }} />
                <circle cx={cx} cy={cy} r={2} fill="white" />
            </svg>
            <p className="text-center text-xs mt-1" style={{ color: steps[step].color }}>
                A = UΣVᵀ → Circle transforms into an ellipse via three steps
            </p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 7. POSITIVE DEFINITE CONTOUR VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const PositiveDefiniteViz: React.FC = () => {
    const [type, setType] = useState<'pd' | 'indef'>('pd');
    const cx = 120, cy = 120;
    const size = 240;

    // Generate contour ellipses for PD (bowl) or hyperbolas for indefinite (saddle)
    const getContours = () => {
        const contours: string[] = [];
        const levels = [20, 40, 60, 80];

        for (const r of levels) {
            if (type === 'pd') {
                // Elliptical contours (bowl shape x² + 2y²)
                const pts = Array.from({ length: 48 }, (_, i) => {
                    const angle = (i / 48) * Math.PI * 2;
                    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r * 0.6}`;
                });
                contours.push(`M ${pts.join(' L ')} Z`);
            } else {
                // Hyperbolic contours (saddle shape x² - y²)
                const pts1: string[] = [];
                const pts2: string[] = [];
                for (let t = -1.5; t <= 1.5; t += 0.1) {
                    const x1 = Math.cosh(t) * r * 0.5;
                    const y1 = Math.sinh(t) * r * 0.5;
                    pts1.push(`${cx + x1},${cy + y1}`);
                    pts2.push(`${cx - x1},${cy - y1}`);
                }
                contours.push(`M ${pts1.join(' L ')}`);
                contours.push(`M ${pts2.join(' L ')}`);
            }
        }
        return contours;
    };

    const colors = type === 'pd'
        ? ['rgba(0,230,118,0.15)', 'rgba(0,230,118,0.25)', 'rgba(0,230,118,0.35)', 'rgba(0,230,118,0.5)']
        : ['rgba(255,82,82,0.15)', 'rgba(255,82,82,0.25)', 'rgba(255,82,82,0.35)', 'rgba(255,82,82,0.5)'];

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <div className="flex gap-2 justify-center mb-3">
                <button onClick={() => setType('pd')}
                    className={`px-3 py-1 rounded text-xs font-bold ${type === 'pd' ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-white/5 text-gray-500'
                        }`}>✓ Positive Definite (Bowl)</button>
                <button onClick={() => setType('indef')}
                    className={`px-3 py-1 rounded text-xs font-bold ${type === 'indef' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/5 text-gray-500'
                        }`}>✗ Indefinite (Saddle)</button>
            </div>
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto">
                <line x1={0} y1={cy} x2={size} y2={cy} stroke="rgba(255,255,255,0.1)" />
                <line x1={cx} y1={0} x2={cx} y2={size} stroke="rgba(255,255,255,0.1)" />

                {getContours().map((d, i) => (
                    <path key={`${type}-${i}`} d={d} fill="none" stroke={colors[Math.min(i, colors.length - 1)]}
                        strokeWidth={1.5} style={{ transition: 'all 0.5s ease' }} />
                ))}

                {/* Minimum point for PD */}
                {type === 'pd' && (
                    <>
                        <circle cx={cx} cy={cy} r={4} fill="#00e676" />
                        <text x={cx + 8} y={cy + 4} fill="#00e676" fontSize="10" fontWeight="bold">min ✓</text>
                    </>
                )}
                {type === 'indef' && (
                    <>
                        <circle cx={cx} cy={cy} r={4} fill="#ff5252" />
                        <text x={cx + 8} y={cy + 4} fill="#ff5252" fontSize="10" fontWeight="bold">saddle ✗</text>
                    </>
                )}
            </svg>
            <p className="text-center text-xs text-gray-500 mt-1">
                {type === 'pd'
                    ? 'Concentric ellipses → unique minimum → gradient descent converges!'
                    : 'Hyperbolas → saddle point → gradient descent gets stuck!'}
            </p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 8. PROJECTION VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const ProjectionViz: React.FC = () => {
    const scale = 40;
    const cx = 120, cy = 160;

    const v = { x: 1, y: 3 };
    const u = { x: 4, y: 1 };
    // proj_u(v) = (v·u / u·u) * u
    const dot_vu = v.x * u.x + v.y * u.y;
    const dot_uu = u.x * u.x + u.y * u.y;
    const scalar = dot_vu / dot_uu;
    const proj = { x: scalar * u.x, y: scalar * u.y };

    const toSVG = (vv: { x: number; y: number }) => ({
        x: cx + vv.x * scale,
        y: cy - vv.y * scale,
    });

    const origin = toSVG({ x: 0, y: 0 });
    const pv = toSVG(v);
    const pu = toSVG(u);
    const pp = toSVG(proj);

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto">
                <line x1={0} y1={cy} x2={300} y2={cy} stroke="rgba(255,255,255,0.1)" />
                <line x1={cx} y1={0} x2={cx} y2={220} stroke="rgba(255,255,255,0.1)" />

                {/* Direction line for u */}
                <line x1={cx - 40} y1={cy + 10} x2={cx + 200} y2={cy - 50}
                    stroke="rgba(255,171,0,0.15)" strokeWidth={2} />

                {/* Vector u */}
                <line x1={origin.x} y1={origin.y} x2={pu.x} y2={pu.y}
                    stroke="#ffab00" strokeWidth={2} />
                <text x={pu.x + 5} y={pu.y - 5} fill="#ffab00" fontSize="11" fontWeight="bold">u</text>

                {/* Vector v */}
                <line x1={origin.x} y1={origin.y} x2={pv.x} y2={pv.y}
                    stroke="#e040fb" strokeWidth={2.5} />
                <text x={pv.x + 5} y={pv.y - 5} fill="#e040fb" fontSize="11" fontWeight="bold">v</text>

                {/* Projection */}
                <line x1={origin.x} y1={origin.y} x2={pp.x} y2={pp.y}
                    stroke="#00e5ff" strokeWidth={3} />
                <text x={pp.x + 5} y={pp.y + 15} fill="#00e5ff" fontSize="10" fontWeight="bold">
                    proj<tspan fontSize="8" dy="-2">u</tspan>(v)
                </text>

                {/* Right angle marker */}
                <line x1={pp.x} y1={pp.y} x2={pv.x} y2={pv.y}
                    stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="4,4" />

                {/* Right angle square */}
                <rect x={pp.x - 1} y={pp.y - 8} width={7} height={7}
                    fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1}
                    transform={`rotate(-14, ${pp.x}, ${pp.y})`} />

                <circle cx={origin.x} cy={origin.y} r={3} fill="white" />

                <text x={150} y={210} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">
                    Projection = "shadow" of v onto u direction (→ connection)
                </text>
            </svg>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 9. GRADIENT DESCENT 3D SURFACE VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const GradientDescentViz: React.FC = () => {
    const [lr, setLr] = useState(0.08);
    const [trailWorld, setTrailWorld] = useState<{ x: number; y: number }[]>([]);
    const [running, setRunning] = useState(false);
    const [step, setStep] = useState(0);
    const [converged, setConverged] = useState(false);
    const [diverged, setDiverged] = useState(false);
    const animRef = useRef<number>(0);
    const posRef = useRef({ x: 2.2, y: -1.8 });

    // Loss function: f(x,y) = 3x² + 0.8y²
    const lossFn = (x: number, y: number) => 3 * x * x + 0.8 * y * y;
    const maxZ = 20;

    // Isometric projection: 3D (x, y, z) → 2D screen
    const svgW = 400, svgH = 340;
    const isoScale = 28;
    const centerX = svgW / 2;
    const centerY = svgH * 0.72;

    const project3D = (x: number, y: number, z: number) => {
        // Isometric angles
        const angle = Math.PI / 6; // 30°
        const sx = (x - y) * Math.cos(angle) * isoScale;
        const sy = -(x + y) * Math.sin(angle) * isoScale + z * isoScale * 0.7;
        return { x: centerX + sx, y: centerY + sy };
    };

    // Project a world point onto the 3D surface
    const projectOnSurface = (wx: number, wy: number) => {
        const z = lossFn(wx, wy);
        const clampedZ = Math.min(z, maxZ);
        return project3D(wx, wy, -clampedZ * 0.3);
    };

    // Generate wireframe grid
    const gridRange = 3.0;
    const gridSteps = 20;
    const step3d = (gridRange * 2) / gridSteps;

    const wireframeLines: { x1: number; y1: number; x2: number; y2: number; z: number; color: string }[] = [];

    // Lines along X
    for (let iy = 0; iy <= gridSteps; iy++) {
        const y = -gridRange + iy * step3d;
        for (let ix = 0; ix < gridSteps; ix++) {
            const x1 = -gridRange + ix * step3d;
            const x2 = x1 + step3d;
            const z1 = lossFn(x1, y);
            const z2 = lossFn(x2, y);
            if (z1 > maxZ && z2 > maxZ) continue;
            const p1 = project3D(x1, y, -Math.min(z1, maxZ) * 0.3);
            const p2 = project3D(x2, y, -Math.min(z2, maxZ) * 0.3);
            const avgZ = (z1 + z2) / 2;
            const t = Math.min(avgZ / maxZ, 1);
            const r = Math.floor(0 + t * 60);
            const g = Math.floor(229 - t * 180);
            const b = Math.floor(255 - t * 200);
            wireframeLines.push({
                x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
                z: avgZ,
                color: `rgba(${r},${g},${b},${0.15 + t * 0.2})`,
            });
        }
    }

    // Lines along Y
    for (let ix = 0; ix <= gridSteps; ix++) {
        const x = -gridRange + ix * step3d;
        for (let iy = 0; iy < gridSteps; iy++) {
            const y1 = -gridRange + iy * step3d;
            const y2 = y1 + step3d;
            const z1 = lossFn(x, y1);
            const z2 = lossFn(x, y2);
            if (z1 > maxZ && z2 > maxZ) continue;
            const p1 = project3D(x, y1, -Math.min(z1, maxZ) * 0.3);
            const p2 = project3D(x, y2, -Math.min(z2, maxZ) * 0.3);
            const avgZ = (z1 + z2) / 2;
            const t = Math.min(avgZ / maxZ, 1);
            const r = Math.floor(0 + t * 60);
            const g = Math.floor(229 - t * 180);
            const b = Math.floor(255 - t * 200);
            wireframeLines.push({
                x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
                z: avgZ,
                color: `rgba(${r},${g},${b},${0.15 + t * 0.2})`,
            });
        }
    }

    // Sort by depth for proper rendering
    wireframeLines.sort((a, b) => b.z - a.z);

    // Animation
    useEffect(() => {
        if (!running) return;
        const startPos = { ...posRef.current };
        const newTrail = [{ x: startPos.x, y: startPos.y }];
        let pos = { ...startPos };
        let s = 0;

        const animate = () => {
            const gx = 6 * pos.x;
            const gy = 1.6 * pos.y;
            pos = {
                x: pos.x - lr * gx,
                y: pos.y - lr * gy,
            };

            // Allow divergence
            if (Math.abs(pos.x) > 4.5 || Math.abs(pos.y) > 4.5) {
                setDiverged(true);
                setRunning(false);
                return;
            }

            s++;
            posRef.current = pos;
            newTrail.push({ x: pos.x, y: pos.y });
            setTrailWorld([...newTrail]);
            setStep(s);

            const dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
            if (dist < 0.06) {
                setConverged(true);
                setRunning(false);
                return;
            }
            if (Math.abs(pos.x) > 2.9 || Math.abs(pos.y) > 2.9) {
                setRunning(false);
                return;
            }
            if (s < 250) {
                animRef.current = window.setTimeout(animate, 60) as unknown as number;
            }
        };
        animRef.current = window.setTimeout(animate, 60) as unknown as number;
        return () => clearTimeout(animRef.current);
    }, [running, lr]);

    const reset = () => {
        setRunning(false);
        setConverged(false);
        setDiverged(false);
        setStep(0);
        setTrailWorld([]);
        posRef.current = { x: 2.2, y: -1.8 };
        clearTimeout(animRef.current);
    };

    const p = posRef.current;
    const lossVal = lossFn(p.x, p.y);
    const currentSVG = projectOnSurface(p.x, p.y);
    const minSVG = projectOnSurface(0, 0);

    // Trail projected onto surface
    const trailSVG = trailWorld.map(t => projectOnSurface(t.x, t.y));

    // Divergence for 3x^2 occurs when |1 - 2*lr*3| > 1 => 6lr > 2 => lr > 1/3
    const isDiverging = lr > 0.33;
    const lrLabel = lr < 0.04 ? 'Too slow 🐢' : isDiverging ? 'Diverging! 💥' : lr > 0.1 ? 'Zig-zagging ⚡' : 'Good rate ✓';
    const lrColor = lr < 0.04 ? '#ffab00' : isDiverging ? '#ff5252' : lr > 0.1 ? '#e040fb' : '#00e676';

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4 relative overflow-hidden">
            {diverged && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 backdrop-blur-sm">
                    <div className="bg-red-500/20 text-red-200 border border-red-500/50 p-6 rounded-xl text-center shadow-2xl">
                        <div className="text-4xl mb-2">💥</div>
                        <h3 className="text-xl font-bold mb-1">Gradient Exploded!</h3>
                        <p className="text-sm opacity-90">Learning rate was too high.</p>
                        <button onClick={reset} className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded font-bold transition-colors">
                            Reset
                        </button>
                    </div>
                </div>
            )}
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg mx-auto">
                <defs>
                    <radialGradient id="surfaceGlow3d" cx="50%" cy="70%" r="40%">
                        <stop offset="0%" stopColor="rgba(0,230,118,0.12)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                </defs>

                {/* Subtle glow at base */}
                <ellipse cx={centerX} cy={centerY} rx={100} ry={50} fill="url(#surfaceGlow3d)" />

                {/* Wireframe surface */}
                {wireframeLines.map((line, i) => (
                    <line key={i}
                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                        stroke={line.color} strokeWidth={0.6} />
                ))}

                {/* Trail path on surface */}
                {trailSVG.length > 1 && (
                    <polyline
                        points={trailSVG.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none" stroke="rgba(255,82,82,0.7)" strokeWidth={2}
                        strokeLinejoin="round" strokeLinecap="round" />
                )}

                {/* Trail dots */}
                {trailSVG.map((pt, i) => {
                    if (i === trailSVG.length - 1) return null;
                    const opacity = Math.max(0.15, (i / trailSVG.length));
                    return (
                        <circle key={`td${i}`} cx={pt.x} cy={pt.y}
                            r={Math.max(1, 2.5 * opacity)}
                            fill={`rgba(255,82,82,${opacity})`} />
                    );
                })}

                {/* Minimum marker at bottom of bowl */}
                <circle cx={minSVG.x} cy={minSVG.y} r={5}
                    fill="#00e676" stroke="rgba(0,230,118,0.4)" strokeWidth={4} />
                <text x={minSVG.x + 10} y={minSVG.y + 4}
                    fill="#00e676" fontSize="10" fontWeight="bold">
                    minimum (loss=0)
                </text>

                {/* Current ball on surface */}
                {!diverged && (
                    <>
                        {/* Shadow */}
                        <ellipse cx={currentSVG.x + 2} cy={currentSVG.y + 3} rx={6} ry={3}
                            fill="rgba(0,0,0,0.3)" />
                        {/* Ball */}
                        <circle cx={currentSVG.x} cy={currentSVG.y} r={7}
                            fill="#ff5252" stroke="white" strokeWidth={2} />
                    </>
                )}
                <text x={currentSVG.x + 12} y={currentSVG.y - 6}
                    fill="#ff5252" fontSize="10" fontWeight="bold">
                    θ (loss={lossVal.toFixed(1)})
                </text>

                {/* Axis labels */}
                {(() => {
                    const xEnd = project3D(gridRange + 0.5, 0, 0);
                    const yEnd = project3D(0, gridRange + 0.5, 0);
                    return (
                        <>
                            <text x={xEnd.x} y={xEnd.y + 15} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">x₁ (param 1)</text>
                            <text x={yEnd.x} y={yEnd.y + 15} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">x₂ (param 2)</text>
                            <text x={20} y={svgH * 0.25} fill="rgba(255,255,255,0.35)" fontSize="9"
                                transform={`rotate(-90, 20, ${svgH * 0.25})`}>↑ Loss f(x₁,x₂)</text>
                        </>
                    );
                })()}

                {/* Converged celebration */}
                {converged && (
                    <>
                        <circle cx={minSVG.x} cy={minSVG.y} r={14} fill="none"
                            stroke="#00e676" strokeWidth={1.5} strokeDasharray="3,3">
                            <animate attributeName="r" values="14;25;14" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <text x={minSVG.x} y={minSVG.y - 25} fill="#00e676"
                            fontSize="12" fontWeight="bold" textAnchor="middle">
                            ✓ Reached the bottom!
                        </text>
                    </>
                )}
            </svg>

            {/* Controls */}
            <div className="space-y-2 mt-3">
                <div className="flex items-center gap-3 justify-center flex-wrap">
                    <label className="text-xs text-gray-400">Learning Rate:</label>
                    <input type="range" min="0.01" max="0.50" step="0.01"
                        value={lr} onChange={e => { setLr(parseFloat(e.target.value)); reset(); }}
                        className="w-32 accent-cyan-400" disabled={running} />
                    <span className="text-xs font-mono text-white">{lr.toFixed(2)}</span>
                    <span className="text-xs font-bold" style={{ color: lrColor }}>{lrLabel}</span>
                </div>

                <div className="flex items-center gap-4 justify-center text-xs">
                    <span className="text-gray-400">Step: <span className="text-white font-mono">{step}</span></span>
                    <span className="text-gray-400">Loss: <span className="text-white font-mono">{lossVal.toFixed(2)}</span></span>
                </div>

                <div className="flex gap-2 justify-center">
                    <button onClick={() => { if (!running && !converged && !diverged) setRunning(true); }}
                        className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${running ? 'bg-gray-500/20 text-gray-500' :
                            converged ? 'bg-green-500/20 text-green-300' :
                                diverged ? 'bg-red-500/20 text-red-300' :
                                    'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            }`}
                        disabled={running || converged || diverged}>
                        {converged ? '✓ At minimum!' : diverged ? '💥 Diverged!' : running ? '⏳ Descending...' : '▶ Run Gradient Descent'}
                    </button>
                    <button onClick={reset}
                        className="px-4 py-1.5 rounded text-xs font-bold bg-white/5 text-gray-400 hover:text-white">
                        ↺ Reset
                    </button>
                </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-2">
                3D view: height = loss value. The ball rolls <strong className="text-gray-300">downhill</strong> following −∇f.
                In real NNs, this surface has <em>millions</em> of dimensions!
            </p>
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// 10. TENSOR SHAPE VISUALIZATION
// ═══════════════════════════════════════════════════════════════
export const TensorShapeViz: React.FC = () => {
    const [dim, setDim] = useState<0 | 1 | 2 | 3>(2);

    return (
        <div className="bg-black/40 rounded-xl p-4 my-4">
            <div className="flex gap-1 justify-center mb-3">
                {[0, 1, 2, 3].map(d => (
                    <button key={d} onClick={() => setDim(d as 0 | 1 | 2 | 3)}
                        className={`px-3 py-1 rounded text-xs font-bold ${dim === d ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'
                            }`}>
                        {['Scalar', 'Vector', 'Matrix', 'Tensor'][d]}
                    </button>
                ))}
            </div>
            <svg viewBox="0 0 260 180" className="w-full max-w-sm mx-auto">
                {dim === 0 && (
                    <>
                        <circle cx={130} cy={90} r={20} fill="rgba(0,229,255,0.2)" stroke="#00e5ff" strokeWidth={2} />
                        <text x={130} y={95} fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">42</text>
                        <text x={130} y={140} fill="#00e5ff" fontSize="11" textAnchor="middle">0D → Just a number</text>
                    </>
                )}
                {dim === 1 && (
                    <>
                        {[0, 1, 2, 3, 4].map(i => (
                            <React.Fragment key={i}>
                                <rect x={50 + i * 35} y={70} width={30} height={30} rx={4}
                                    fill="rgba(224,64,251,0.15)" stroke="#e040fb" strokeWidth={1.5} />
                                <text x={65 + i * 35} y={90} fill="white" fontSize="11" textAnchor="middle">
                                    {[3, 1, 4, 1, 5][i]}
                                </text>
                            </React.Fragment>
                        ))}
                        <text x={130} y={140} fill="#e040fb" fontSize="11" textAnchor="middle">
                            1D → shape: (5,)
                        </text>
                    </>
                )}
                {dim === 2 && (
                    <>
                        {Array.from({ length: 3 }, (_, r) =>
                            Array.from({ length: 4 }, (_, c) => (
                                <rect key={`${r}${c}`} x={55 + c * 35} y={40 + r * 35} width={30} height={30} rx={4}
                                    fill={`rgba(0,229,255,${0.1 + r * 0.05})`} stroke="#00e5ff" strokeWidth={1} />
                            ))
                        )}
                        <text x={130} y={165} fill="#00e5ff" fontSize="11" textAnchor="middle">
                            2D → shape: (3, 4)
                        </text>
                    </>
                )}
                {dim === 3 && (
                    <>
                        {/* 3D cube effect - stack of matrices */}
                        {[2, 1, 0].map(layer => (
                            <g key={layer} transform={`translate(${layer * 12}, ${-layer * 12})`} opacity={0.5 + layer * 0.2}>
                                {Array.from({ length: 3 }, (_, r) =>
                                    Array.from({ length: 3 }, (_, c) => (
                                        <rect key={`${layer}${r}${c}`}
                                            x={60 + c * 30} y={50 + r * 30}
                                            width={26} height={26} rx={3}
                                            fill={`rgba(255,171,0,${0.08 + layer * 0.06})`}
                                            stroke="#ffab00" strokeWidth={0.8} />
                                    ))
                                )}
                            </g>
                        ))}
                        <text x={130} y={170} fill="#ffab00" fontSize="11" textAnchor="middle">
                            3D → shape: (batch, 3, 3)
                        </text>
                    </>
                )}
            </svg>
        </div>
    );
};
