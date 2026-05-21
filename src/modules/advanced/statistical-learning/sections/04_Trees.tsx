import React from 'react';
import { InteractiveTreeViz } from '../components/InteractiveTreeViz';

export const Trees: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-8">4. Trees & Ensembles</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300">
                    Decision Trees partition the feature space into rectangles.
                    They are interpretable but prone to high variance.
                </p>

                <h3 className="text-amber-400 mt-12">4.1 Random Forests (Bagging)</h3>
                <p>
                    <strong>Bagging</strong> (Bootstrap Aggregating) reduces variance by averaging many noisy trees.
                    Random Forests add an extra trick: de-correlating trees by randomly selecting features at each split.
                </p>

                <h3 className="text-amber-400 mt-12">4.2 Boosting (Gradient Boosting)</h3>
                <p>
                    <strong>Boosting</strong> reduces bias by training trees sequentially.
                    Each new tree tries to correct the residual errors of the previous ensemble.
                </p>
            </div>

            {/* Interactive Tree Viz */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h4 className="font-bold text-white">Interactive Decision Tree</h4>
                    <p className="text-sm text-slate-400">Click to split the space. See how deep trees can overfit (create tiny complex regions).</p>
                </div>
                <div className="p-6">
                    <InteractiveTreeViz />
                </div>
            </div>

        </section>
    );
};
