import React from 'react';

export const CephalometryTheory: React.FC = () => {
    return (
        <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
                In medical imaging, identifying precise anatomical points (landmarks) in <span className="text-[var(--color-electric-cyan)] font-bold">3D space</span> is crucial for diagnosis.
            </p>
            <p>
                Unlike 2D detection, <span className="text-[var(--color-soft-violet)] font-bold">3D Cephalometry</span> works with Voxel grids (3D pixels). The challenge is regression in a volumetric coordinate system (X, Y, Z).
            </p>

            <div className="bg-black/40 border border-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-bold text-[var(--color-electric-cyan)] mb-3 uppercase tracking-wider">Architecture & Approach</h3>
                <p className="text-gray-400 mb-4">
                    We use specialized architectures like <span className="text-white font-semibold">3D U-Nets</span> to predict heatmaps (probability distributions) for each landmark location.
                </p>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="bg-black/40 rounded p-3">
                        <div className="text-[var(--color-electric-cyan)] font-bold mb-1">X</div>
                        <div className="text-xs text-gray-500">Left-Right</div>
                    </div>
                    <div className="bg-black/40 rounded p-3">
                        <div className="text-[var(--color-soft-violet)] font-bold mb-1">Y</div>
                        <div className="text-xs text-gray-500">Anterior-Posterior</div>
                    </div>
                    <div className="bg-black/40 rounded p-3">
                        <div className="text-yellow-400 font-bold mb-1">Z</div>
                        <div className="text-xs text-gray-500">Superior-Inferior</div>
                    </div>
                </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-6 relative group">
                <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Loss Function</h3>
                <div className="text-lg font-mono text-center py-4">
                    <div>L<sub>total</sub> = α Σ ||P<sub>pred</sub> - P<sub>gt</sub>||² + β L<sub>heatmap</sub></div>
                </div>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-sm">
                    <ul className="space-y-2">
                        <li className="flex gap-2"><span className="text-[var(--color-electric-cyan)] font-bold">MSE term:</span> Coordinate precision loss</li>
                        <li className="flex gap-2"><span className="text-[var(--color-soft-violet)] font-bold">Heatmap term:</span> Spatial diversity to ensure distinct landmarks</li>
                    </ul>
                </div>
            </div>

            <p className="mt-4">
                The loss function combines <span className="text-[var(--color-electric-cyan)] font-bold">Mean Squared Error (MSE)</span> for coordinate precision with a <span className="text-[var(--color-soft-violet)] font-bold">Spatial Diversity Loss</span> to ensure landmarks are distinct.
            </p>

            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mt-6">
                <p className="text-sm text-gray-400 italic">
                    <span className="text-indigo-400 font-bold">Visualization Note:</span> A rotating 3D skull model (transparent/wireframe) would show bright glowing dots at specific anatomical points (e.g., Sella, Nasion). A coordinate grid (X, Y, Z) would surround the skull, updating landmark coordinates as the model rotates.
                </p>
            </div>
        </div>
    );
};
