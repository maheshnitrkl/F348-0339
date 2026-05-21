import React, { useState, useEffect } from 'react';

export const ActivationPlayground: React.FC = () => {
    const [func, setFunc] = useState<'sigmoid' | 'relu' | 'tanh'>('sigmoid');

    // Generate data points
    const generateData = (fn: string) => {
        const data = [];
        for (let x = -5; x <= 5; x += 0.1) {
            let y = 0;
            let deriv = 0;

            if (fn === 'sigmoid') {
                const s = 1 / (1 + Math.exp(-x));
                y = s;
                deriv = s * (1 - s);
            } else if (fn === 'relu') {
                y = Math.max(0, x);
                deriv = x > 0 ? 1 : 0;
            } else if (fn === 'tanh') {
                y = Math.tanh(x);
                deriv = 1 - Math.pow(y, 2);
            }

            data.push({ x, y, deriv });
        }
        return data;
    };

    const data = generateData(func);

    // SVG scaling
    const width = 600;
    const height = 300;
    const padding = 20;

    const scaleX = (x: number) => ((x + 5) / 10) * (width - 2 * padding) + padding;
    const scaleY = (y: number) => {
        // Map y from [-1, 2] to pixel space for better view
        return height - ((y + 1) / 3) * (height - 2 * padding) - padding;
    };

    // Create SVG paths
    const createPath = (points: { x: number, y: number, deriv: number }[], key: 'y' | 'deriv') => {
        if (points.length === 0) return '';
        const d = points.map((p, i) => {
            const sx = scaleX(p.x);
            const sy = scaleY(key === 'y' ? p.y : p.deriv);
            return `${i === 0 ? 'M' : 'L'} ${sx},${sy}`;
        }).join(' ');
        return d;
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg">Activation Function Viz</h3>
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                    {(['sigmoid', 'relu', 'tanh'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFunc(f)}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${func === f
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative border border-slate-800 bg-slate-950/50 rounded-lg overflow-hidden h-[300px]">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    {/* Grid Lines */}
                    <line x1={0} y1={scaleY(0)} x2={width} y2={scaleY(0)} stroke="#334155" strokeWidth="1" />
                    <line x1={scaleX(0)} y1={0} x2={scaleX(0)} y2={height} stroke="#334155" strokeWidth="1" />

                    {/* Paths */}
                    <path d={createPath(data, 'y')} fill="none" stroke="#818cf8" strokeWidth="3" />
                    <path d={createPath(data, 'deriv')} fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="5,5" />

                    {/* Legend */}
                    <g transform="translate(450, 20)">
                        <rect width="120" height="60" fill="#0f172a" opacity="0.8" rx="4" />
                        <line x1="10" y1="20" x2="40" y2="20" stroke="#818cf8" strokeWidth="3" />
                        <text x="50" y="24" fill="#cbd5e1" fontSize="12">Function f(x)</text>
                        <line x1="10" y1="40" x2="40" y2="40" stroke="#34d399" strokeWidth="2" strokeDasharray="5,5" />
                        <text x="50" y="44" fill="#cbd5e1" fontSize="12">Derivative f'(x)</text>
                    </g>
                </svg>
            </div>
        </div>
    );
};
