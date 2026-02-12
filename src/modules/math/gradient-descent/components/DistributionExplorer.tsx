import React, { useState, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════
   Interactive Probability Distribution Explorer
   Select distribution, tweak parameters, see live PDF/CDF
   ═══════════════════════════════════════════════════════════ */

type DistType = 'gaussian' | 'binomial' | 'poisson' | 'exponential' | 'uniform';

const DIST_COLORS: Record<DistType, string> = {
    gaussian: '#A855F7',
    binomial: '#00D9FF',
    poisson: '#FACC15',
    exponential: '#F472B6',
    uniform: '#4ADE80',
};

// ─── Math helpers ───
const factorial = (n: number): number => {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
};

const comb = (n: number, k: number) => factorial(n) / (factorial(k) * factorial(n - k));

const gaussianPDF = (x: number, mu: number, sigma: number) =>
    (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);

const binomialPMF = (k: number, n: number, p: number) =>
    k < 0 || k > n ? 0 : comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);

const poissonPMF = (k: number, lambda: number) =>
    k < 0 ? 0 : (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);

const exponentialPDF = (x: number, lambda: number) =>
    x < 0 ? 0 : lambda * Math.exp(-lambda * x);

const uniformPDF = (x: number, a: number, b: number) =>
    x >= a && x <= b ? 1 / (b - a) : 0;

// ─── Configuration per distribution ───
interface DistConfig {
    name: string;
    discrete: boolean;
    params: { label: string; key: string; min: number; max: number; step: number; default: number }[];
    compute: (params: Record<string, number>) => { x: number; y: number }[];
    stats: (params: Record<string, number>) => { mean: string; variance: string; description: string };
}

const DISTRIBUTIONS: Record<DistType, DistConfig> = {
    gaussian: {
        name: 'Gaussian (Normal)',
        discrete: false,
        params: [
            { label: 'μ (mean)', key: 'mu', min: -5, max: 5, step: 0.1, default: 0 },
            { label: 'σ (std dev)', key: 'sigma', min: 0.3, max: 3, step: 0.1, default: 1 },
        ],
        compute: (p) => {
            const pts: { x: number; y: number }[] = [];
            for (let x = -8; x <= 8; x += 0.1) pts.push({ x, y: gaussianPDF(x, p.mu, p.sigma) });
            return pts;
        },
        stats: (p) => ({
            mean: p.mu.toFixed(2),
            variance: (p.sigma ** 2).toFixed(2),
            description: `Bell-shaped, symmetric about μ=${p.mu.toFixed(1)}. 68% of data within ±${p.sigma.toFixed(1)}.`,
        }),
    },
    binomial: {
        name: 'Binomial',
        discrete: true,
        params: [
            { label: 'n (trials)', key: 'n', min: 1, max: 30, step: 1, default: 10 },
            { label: 'p (success prob)', key: 'p', min: 0.01, max: 0.99, step: 0.01, default: 0.5 },
        ],
        compute: (p) => {
            const pts: { x: number; y: number }[] = [];
            for (let k = 0; k <= p.n; k++) pts.push({ x: k, y: binomialPMF(k, p.n, p.p) });
            return pts;
        },
        stats: (p) => ({
            mean: (p.n * p.p).toFixed(2),
            variance: (p.n * p.p * (1 - p.p)).toFixed(2),
            description: `Number of successes in ${p.n} trials with P(success)=${p.p.toFixed(2)}.`,
        }),
    },
    poisson: {
        name: 'Poisson',
        discrete: true,
        params: [
            { label: 'λ (rate)', key: 'lambda', min: 0.5, max: 15, step: 0.5, default: 4 },
        ],
        compute: (p) => {
            const pts: { x: number; y: number }[] = [];
            const maxK = Math.min(Math.ceil(p.lambda * 3 + 5), 30);
            for (let k = 0; k <= maxK; k++) pts.push({ x: k, y: poissonPMF(k, p.lambda) });
            return pts;
        },
        stats: (p) => ({
            mean: p.lambda.toFixed(2),
            variance: p.lambda.toFixed(2),
            description: `Events per interval with rate λ=${p.lambda.toFixed(1)}. Mean = Variance.`,
        }),
    },
    exponential: {
        name: 'Exponential',
        discrete: false,
        params: [
            { label: 'λ (rate)', key: 'lambda', min: 0.2, max: 5, step: 0.1, default: 1 },
        ],
        compute: (p) => {
            const pts: { x: number; y: number }[] = [];
            for (let x = 0; x <= 8; x += 0.05) pts.push({ x, y: exponentialPDF(x, p.lambda) });
            return pts;
        },
        stats: (p) => ({
            mean: (1 / p.lambda).toFixed(2),
            variance: (1 / p.lambda ** 2).toFixed(2),
            description: `Time between events. Memoryless property. λ=${p.lambda.toFixed(1)}.`,
        }),
    },
    uniform: {
        name: 'Uniform',
        discrete: false,
        params: [
            { label: 'a (min)', key: 'a', min: -5, max: 2, step: 0.5, default: -2 },
            { label: 'b (max)', key: 'b', min: 0, max: 8, step: 0.5, default: 3 },
        ],
        compute: (p) => {
            const pts: { x: number; y: number }[] = [];
            const margin = 1;
            for (let x = p.a - margin; x <= p.b + margin; x += 0.05) pts.push({ x, y: uniformPDF(x, p.a, p.b) });
            return pts;
        },
        stats: (p) => ({
            mean: ((p.a + p.b) / 2).toFixed(2),
            variance: (((p.b - p.a) ** 2) / 12).toFixed(2),
            description: `Equal probability on [${p.a}, ${p.b}]. Maximum entropy for bounded support.`,
        }),
    },
};

export const DistributionExplorer: React.FC = () => {
    const [distType, setDistType] = useState<DistType>('gaussian');
    const dist = DISTRIBUTIONS[distType];

    // Param state
    const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
        const init: Record<string, number> = {};
        dist.params.forEach(p => (init[p.key] = p.default));
        return init;
    });

    // Reset params when switching distributions
    const handleDistChange = (d: DistType) => {
        setDistType(d);
        const init: Record<string, number> = {};
        DISTRIBUTIONS[d].params.forEach(p => (init[p.key] = p.default));
        setParamValues(init);
    };

    const data = useMemo(() => dist.compute(paramValues), [dist, paramValues]);
    const stats = useMemo(() => dist.stats(paramValues), [dist, paramValues]);
    const color = DIST_COLORS[distType];

    // ─── SVG Drawing ───
    const W = 600, H = 350, pad = 50;

    const xMin = Math.min(...data.map(d => d.x));
    const xMax = Math.max(...data.map(d => d.x));
    const yMax = Math.max(...data.map(d => d.y)) * 1.15;

    const toSvg = (x: number, y: number) => ({
        x: pad + ((x - xMin) / (xMax - xMin || 1)) * (W - 2 * pad),
        y: H - pad - (y / (yMax || 1)) * (H - 2 * pad),
    });

    return (
        <div className="flex flex-col gap-4 p-4 bg-[#0a0a0f] rounded-xl border border-white/10 h-[calc(100vh-160px)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Distribution Explorer
                    </h2>
                    <p className="text-xs text-gray-400">Adjust parameters and visualize probability distributions</p>
                </div>

                {/* Distribution Selector */}
                <div className="flex gap-2 flex-wrap">
                    {(Object.keys(DISTRIBUTIONS) as DistType[]).map(d => (
                        <button
                            key={d}
                            onClick={() => handleDistChange(d)}
                            className={`text-xs px-3 py-1.5 rounded border transition-all ${distType === d
                                ? 'border-white/30 bg-white/10 text-white'
                                : 'border-white/10 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {DISTRIBUTIONS[d].name}
                        </button>
                    ))}
                </div>

                {/* Parameter sliders */}
                <div className="flex gap-4 flex-wrap">
                    {dist.params.map(p => (
                        <div key={p.key} className="flex items-center gap-2">
                            <label className="text-xs text-gray-400 whitespace-nowrap">{p.label}</label>
                            <input
                                type="range" min={p.min} max={p.max} step={p.step}
                                value={paramValues[p.key] ?? p.default}
                                onChange={e => setParamValues(v => ({ ...v, [p.key]: parseFloat(e.target.value) }))}
                                className="w-20 accent-cyan-400"
                            />
                            <span className="text-xs font-mono text-cyan-400 w-10 text-right">
                                {(paramValues[p.key] ?? p.default).toFixed(p.step < 1 ? 1 : 0)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-[#050505]">
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                        {/* Grid */}
                        {[0.25, 0.5, 0.75, 1].map(frac => {
                            const y = H - pad - frac * (H - 2 * pad) / (yMax || 1) * yMax;
                            return (
                                <g key={frac}>
                                    <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="#1a1a1a" />
                                    <text x={pad - 5} y={y + 3} fill="#444" fontSize={9} textAnchor="end" fontFamily="monospace">
                                        {(frac * yMax).toFixed(2)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Axes */}
                        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#444" strokeWidth={1} />
                        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#444" strokeWidth={1} />

                        {/* X axis labels */}
                        {Array.from({ length: 7 }).map((_, i) => {
                            const val = xMin + (i / 6) * (xMax - xMin);
                            const p = toSvg(val, 0);
                            return (
                                <text key={i} x={p.x} y={H - pad + 16} fill="#555" fontSize={9} textAnchor="middle" fontFamily="monospace">
                                    {val.toFixed(1)}
                                </text>
                            );
                        })}

                        {/* Distribution */}
                        {dist.discrete ? (
                            // Bars for discrete
                            data.map((d, i) => {
                                const p = toSvg(d.x, d.y);
                                const base = toSvg(d.x, 0);
                                const barW = Math.max(4, (W - 2 * pad) / data.length * 0.6);
                                return (
                                    <g key={i}>
                                        <rect
                                            x={p.x - barW / 2}
                                            y={p.y}
                                            width={barW}
                                            height={base.y - p.y}
                                            fill={color}
                                            opacity={0.6}
                                            rx={1}
                                        />
                                        <circle cx={p.x} cy={p.y} r={3} fill={color} />
                                    </g>
                                );
                            })
                        ) : (
                            // Smooth curve for continuous
                            <>
                                {/* Filled area */}
                                <polygon
                                    points={[
                                        `${toSvg(data[0].x, 0).x},${toSvg(data[0].x, 0).y}`,
                                        ...data.map(d => `${toSvg(d.x, d.y).x},${toSvg(d.x, d.y).y}`),
                                        `${toSvg(data[data.length - 1].x, 0).x},${toSvg(data[data.length - 1].x, 0).y}`,
                                    ].join(' ')}
                                    fill={color}
                                    opacity={0.12}
                                />
                                {/* Line */}
                                <polyline
                                    points={data.map(d => `${toSvg(d.x, d.y).x},${toSvg(d.x, d.y).y}`).join(' ')}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={2.5}
                                />
                            </>
                        )}

                        {/* Labels */}
                        <text x={W / 2} y={H - 5} fill="#555" fontSize={10} textAnchor="middle">x</text>
                        <text x={15} y={H / 2} fill="#555" fontSize={10} textAnchor="middle" transform={`rotate(-90, 15, ${H / 2})`}>
                            {dist.discrete ? 'P(X = x)' : 'f(x)'}
                        </text>

                        {/* Distribution name */}
                        <text x={W - pad} y={pad + 15} fill={color} fontSize={13} textAnchor="end" fontWeight="bold">
                            {dist.name}
                        </text>
                    </svg>
                </div>
            </div>

            {/* Stats Footer */}
            <div className="flex flex-wrap gap-4 text-xs shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                    <span className="text-gray-500">Mean: </span>
                    <span className="font-mono text-cyan-400">{stats.mean}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                    <span className="text-gray-500">Variance: </span>
                    <span className="font-mono text-purple-400">{stats.variance}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex-1">
                    <span className="text-gray-400">{stats.description}</span>
                </div>
            </div>
        </div>
    );
};
