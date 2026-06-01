import React from 'react';
import { KMeansViz } from '../components/KMeansViz';
import { MathEquation } from '../../../../components/MathEquation';

export const Unsupervised: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-8">5. Unsupervised Learning</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300">
                    When we have no labels $Y$, we look for structure within $X$ itself.
                    Common tasks include Clustering (finding groups) and Dimensionality Reduction (simplifying data).
                </p>

                <h3 className="text-pink-400 mt-12">5.1 K-Means Clustering</h3>
                <p>
                    K-Means iterates between two steps:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                        <strong className="text-pink-400">1. Assignment</strong>
                        <MathEquation block formula="\min_{j} ||x_i - \mu_j||^2" />
                        <p className="text-sm text-slate-400 mt-2">Assign point to nearest centroid.</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                        <strong className="text-pink-400">2. Update</strong>
                        <MathEquation block formula="\mu_j = \frac{1}{|C_j|} \sum_{i \in C_j} x_i" />
                        <p className="text-sm text-slate-400 mt-2">Move centroid to mean of points.</p>
                    </div>
                </div>

                <h3 className="text-pink-400 mt-12">5.2 Principal Component Analysis (PCA)</h3>
                <p>
                    PCA finds the directions of maximum variance in the data and projects it onto a lower-dimensional subspace.
                    It preserves the most "information" possible.
                </p>
            </div>

            {/* KMeans Viz */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h4 className="font-bold text-white">Visualizing K-Means</h4>
                    <p className="text-sm text-slate-400">Click "Step" to watch the algorithm converge.</p>
                </div>
                <div className="p-6">
                    <KMeansViz />
                </div>
            </div>
        </section>
    );
};
