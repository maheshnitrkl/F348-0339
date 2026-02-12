import React from 'react';

export const MatrixGradients: React.FC = () => {
    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6">
            <h3 className="text-xl font-bold text-white mb-2">Matrix Dimension Analysis</h3>
            <p className="text-gray-400 text-sm mb-6">
                In Deep Learning, we operate on Tensors (matrices). The rule of thumb:
                <span className="text-cyan-400 font-bold ml-1">The gradient of a tensor has the same shape as the tensor.</span>
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 font-mono text-sm">

                {/* Matrix W */}
                <div className="flex flex-col items-center group cursor-pointer">
                    <div className="text-cyan-400 font-bold mb-2">Weights (W)</div>
                    <div className="grid grid-cols-3 gap-1 bg-cyan-900/20 p-2 rounded border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 rounded hover:bg-cyan-500/30">w</div>)}
                    </div>
                    <div className="mt-2 text-gray-500">Shape: (2, 3)</div>
                </div>

                {/* Operator */}
                <div className="text-2xl text-gray-600">&times;</div>

                {/* Vector x */}
                <div className="flex flex-col items-center group cursor-pointer">
                    <div className="text-purple-400 font-bold mb-2">Input (x)</div>
                    <div className="grid grid-cols-1 gap-1 bg-purple-900/20 p-2 rounded border border-purple-500/30 group-hover:border-purple-400 transition-colors">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 flex items-center justify-center bg-purple-500/10 rounded hover:bg-purple-500/30">x</div>)}
                    </div>
                    <div className="mt-2 text-gray-500">Shape: (3, 1)</div>
                </div>

                {/* Operator */}
                <div className="text-2xl text-gray-600">=</div>

                {/* Output h */}
                <div className="flex flex-col items-center group cursor-pointer">
                    <div className="text-green-400 font-bold mb-2">Output (h)</div>
                    <div className="grid grid-cols-1 gap-1 bg-green-900/20 p-2 rounded border border-green-500/30 group-hover:border-green-400 transition-colors">
                        {[1, 2].map(i => <div key={i} className="w-8 h-8 flex items-center justify-center bg-green-500/10 rounded hover:bg-green-500/30">h</div>)}
                    </div>
                    <div className="mt-2 text-gray-500">Shape: (2, 1)</div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-300">
                    If we compute the gradient <span className="font-mono text-pink-400">&#x2202;L/&#x2202;W</span>, it <strong>MUST</strong> also be a (2, 3) matrix.
                </p>
                <div className="inline-block mt-4 p-3 bg-black/50 rounded-lg border border-pink-500/30 text-pink-400 font-mono text-lg">
                    &#x2202;L/&#x2202;W = &#x3B4; &middot; x&#x1D40;
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    (2,1) &times; (1,3) = (2,3) &mdash; Dimensions match!
                </p>
            </div>
        </div>
    );
};
