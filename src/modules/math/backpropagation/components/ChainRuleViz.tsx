import React, { useState } from 'react';

export const ChainRuleViz: React.FC = () => {
    // Scenario: output y = g(f(x))
    // Let f(x) = 2x
    // Let g(u) = u^2
    // So y = (2x)^2 = 4x^2

    const [x, setX] = useState(2);

    // Forward
    const u = 2 * x;
    const y = u ** 2;

    // Backward
    const dy_du = 2 * u; // derivative of u^2 is 2u
    const du_dx = 2;     // derivative of 2x is 2
    const dy_dx = dy_du * du_dx; // Chain Rule

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6">
            <h3 className="text-xl font-bold text-white mb-2">The Chain Rule: Unpacked</h3>
            <p className="text-gray-400 text-sm mb-6">
                How do changes in <span className="text-blue-400">x</span> affect <span className="text-pink-400">y</span>?
                Through the intermediate variable <span className="text-purple-400">u</span>.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                {/* Node x */}
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-400 font-bold text-xl bg-blue-500/10 mb-2">
                        x
                    </div>
                    <input
                        type="range" min="0" max="5" step="0.1"
                        value={x} onChange={e => setX(parseFloat(e.target.value))}
                        className="w-24 accent-blue-500"
                    />
                    <span className="text-blue-400 font-mono mt-1">{x.toFixed(1)}</span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center">
                    <div className="text-gray-500 text-xs mb-1">f(x) = 2x</div>
                    <div className="h-0.5 w-16 bg-gray-600 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-8 border-transparent border-l-gray-600"></div>
                    </div>
                    <div className="text-green-400 text-xs mt-1 font-mono">du/dx = 2</div>
                </div>

                {/* Node u */}
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-purple-500 flex items-center justify-center text-purple-400 font-bold text-xl bg-purple-500/10 mb-2">
                        u
                    </div>
                    <span className="text-purple-400 font-mono mt-1">{u.toFixed(1)}</span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center">
                    <div className="text-gray-500 text-xs mb-1">g(u) = u²</div>
                    <div className="h-0.5 w-16 bg-gray-600 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-8 border-transparent border-l-gray-600"></div>
                    </div>
                    <div className="text-green-400 text-xs mt-1 font-mono">dy/du = 2u</div>
                </div>

                {/* Node y */}
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-pink-500 flex items-center justify-center text-pink-400 font-bold text-xl bg-pink-500/10 mb-2">
                        y
                    </div>
                    <span className="text-pink-400 font-mono mt-1">{y.toFixed(1)}</span>
                </div>
            </div>

            {/* Math Breakdown */}
            <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                <div className="text-center text-lg font-mono text-gray-300">
                    <span className="text-green-400">dy/dx</span> = <span className="text-green-400">dy/du</span> · <span className="text-green-400">du/dx</span>
                </div>
                <div className="text-center text-sm font-mono text-gray-400 mt-2">
                    {dy_dx.toFixed(2)} = {dy_du.toFixed(2)} · {du_dx}
                </div>
                <p className="text-center text-xs text-gray-500 mt-4 max-w-md mx-auto">
                    The total sensitivity of y to x is the product of the local sensitivities along the path.
                    If u changes 2x faster than x, and y changes {dy_du.toFixed(1)}x faster than u, then y changes {dy_dx.toFixed(1)}x faster than x!
                </p>
            </div>
        </div>
    );
};
