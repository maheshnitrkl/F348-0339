import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   The Oscillating History of AI
   Spec'd in src/data/learning_content.json: a sine wave whose peaks are the
   field's hype cycles and whose troughs are the "AI winters" when funding
   and interest collapsed. Hover/tap an era for a one-line summary.
   ═══════════════════════════════════════════════════════════════════════ */

interface Era {
    year: string;
    label: string;
    hype: 1 | -1;          // 1 = peak (hype), -1 = trough (winter)
    blurb: string;
    onCurve?: boolean;
}

const W = 860;             // svg viewBox width
const H = 260;
const PAD_X = 30;
const BASE_Y = H / 2;
const AMP = 78;

const ERAS: Era[] = [
    { year: '375 BCE', label: "Plato's Cave", hype: -1, blurb: 'Perception vs. reality — is seeing a shadow of the truth?' },
    { year: '1950', label: 'Turing Test', hype: -1, blurb: "Can machines think? Turing replaces metaphysics with a behavioral test.", onCurve: true },
    { year: '1956', label: 'Dartmouth Workshop', hype: 1, blurb: "The field self-names — 'Artificial Intelligence' is coined, and optimism explodes.", onCurve: true },
    { year: '1969', label: 'Perceptrons Critique', hype: -1, blurb: "Minsky & Papert prove single-layer perceptrons can't learn XOR — funding freezes.", onCurve: true },
    { year: '1986', label: 'Backprop Rediscovered', hype: 1, blurb: "Rumelhart, Hinton & Williams revive gradient learning through hidden layers.", onCurve: true },
    { year: '1987', label: 'Second AI Winter', hype: -1, blurb: "Expert systems over-promise and under-deliver; LISP-machine market crashes.", onCurve: true },
    { year: '1997', label: 'Deep Blue', hype: 1, blurb: "A machine beats the reigning world chess champion — symbolic AI's last hurrah.", onCurve: true },
    { year: '2012', label: 'ImageNet Breakthrough', hype: 1, blurb: "AlexNet nearly halves error using GPUs + backprop. Deep learning goes mainstream.", onCurve: true },
    { year: '2017', label: 'Transformer', hype: 1, blurb: "'Attention is All You Need' reshapes NLP; the scaling era begins.", onCurve: true },
    { year: '2026', label: 'LLM Everywhere', hype: 1, blurb: "GPT-class models penetrate daily life. Is a winter overdue, or is scaling different?", onCurve: true },
];

// map era position on the x axis (evenly spaced for on-curve eras)
const CURVED = ERAS.filter(e => e.onCurve);
const xOf = (era: Era) => {
    const idx = CURVED.indexOf(era);
    return PAD_X + (idx / (CURVED.length - 1)) * (W - 2 * PAD_X);
};
const yOf = (era: Era) => BASE_Y - era.hype * AMP;

/** Smooth-ish polyline through the hype points (quadratic midpoint smoothing). */
function wavePath(): string {
    const pts = CURVED.map(p => ({ x: xOf(p), y: yOf(p) }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return d;
}

export const AiOscillationTimeline: React.FC = () => {
    const [active, setActive] = useState<number>(CURVED.findIndex(e => e.year === '2012'));
    const [pulse, setPulse] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setPulse(p => (p + 1) % 100), 60);
        return () => clearInterval(id);
    }, []);

    const activeEra = CURVED[active] ?? CURVED[0];

    return (
        <div className="bg-black/40 border border-white/5 rounded-xl p-6 space-y-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--color-electric-cyan)]" />
                The Oscillating History of AI
            </h3>
            <p className="text-gray-400 text-sm">
                The field advances on hype and retreats in winters. Peaks carry overpromising — and each trough
                has taught researchers exactly which claims were premature. Where are we on this curve now?
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {/* hype zones */}
                <rect x={0} y={BASE_Y - AMP - 8} width={W} height={AMP + 8} fill="rgba(0,243,255,0.05)" />
                <rect x={0} y={BASE_Y} width={W} height={AMP + 8} fill="rgba(244,63,94,0.06)" />
                <text x={PAD_X} y={BASE_Y - AMP - 14} fill="#00f3ff" fontSize={11} fontFamily="monospace">HYPE PEAKS</text>
                <text x={PAD_X} y={BASE_Y + AMP + 20} fill="#f43f5e" fontSize={11} fontFamily="monospace">AI WINTERS</text>

                {/* wave */}
                <path d={wavePath()} fill="none" stroke="#a78bfa" strokeWidth={2.5} />
                <path d={wavePath()} fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth={6}
                    strokeDasharray={`${pulse % 100} 24`} style={{ transition: 'stroke-dasharray 60ms linear' }} />

                {/* points */}
                {CURVED.map((era, i) => {
                    const x = xOf(era), y = yOf(era);
                    const isActive = i === active;
                    return (
                        <g key={era.year} onClick={() => setActive(i)} style={{ cursor: 'pointer' }}>
                            <circle cx={x} cy={y} r={isActive ? 7 : 4.5}
                                fill={era.hype === 1 ? '#00f3ff' : '#f43f5e'}
                                stroke={isActive ? '#fff' : 'transparent'} strokeWidth={2} />
                            <text x={x} y={era.hype === 1 ? y - 13 : y + 19} textAnchor="middle"
                                fill={isActive ? '#fff' : '#64748b'} fontSize={10} fontFamily="monospace" fontStyle="italic">
                                {era.year}
                            </text>
                            <text x={x} y={era.hype === 1 ? y - 13 + 15 : y + 19 + 15} textAnchor="middle" fill={isActive ? '#e2e8f0' : '#475569'} fontSize={9} fontFamily="sans-serif">
                                {era.label.length > 18 ? era.label.slice(0, 17) + '…' : era.label}
                            </text>
                            {/* generous click target */}
                            <circle cx={x} cy={y} r={22} fill="transparent" onClick={() => setActive(i)} />
                        </g>
                    );
                })}
            </svg>

            {/* Detail card */}
            <div className="bg-slate-950/60 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${activeEra.hype === 1 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        {activeEra.hype === 1 ? 'HYPE' : 'WINTER'}
                    </span>
                    <span className="font-mono text-sm text-white font-bold">{activeEra.year}</span>
                    <span className="text-sm text-slate-300 font-semibold">{activeEra.label}</span>
                </div>
                <p className="text-gray-300 mt-2 text-sm">{activeEra.blurb}</p>
            </div>

            <p className="text-[11px] text-gray-500">
                Click any point on the wave to jump between eras.
            </p>
        </div>
    );
};
