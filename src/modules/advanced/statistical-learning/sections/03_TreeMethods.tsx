import React from 'react';
import { DecisionTreeViz } from '../components/DecisionTreeViz';
import { RandomForestViz } from '../components/RandomForestViz';
import { MathEquation } from '../../../../components/MathEquation';

export const TreeMethods: React.FC = () => {
    return (
        <section className="space-y-12 pb-24">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-bold text-white mb-4">3. Tree-Based Methods</h2>
                <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
                    Tree-based methods partition the feature space into a set of rectangles, and then fit a simple model (like a constant) in each one.
                    They are conceptually simple yet powerful, especially when combined into ensembles.
                </p>
            </div>

            {/* 3.1 Decision Trees */}
            <div className="prose prose-invert prose-lg max-w-none">
                <h3 className="text-emerald-400 text-2xl font-bold">3.1 Decision Trees</h3>
                <p>
                    A decision tree splits the data into two subsets based on a feature <MathEquation formula="j" /> and a threshold <MathEquation formula="s" />.
                    This process is repeated recursively (Recursive Binary Splitting) until a stopping criterion is met (e.g., maximum depth).
                </p>
                <p>
                    For a classification tree, we predict the most occurring class <MathEquation formula="k" /> in the region <MathEquation formula="R_m" />.
                    The impurity of a node is measured using <strong>Gini Index</strong> or <strong>Cross-Entropy</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Gini Impurity</h4>
                        <MathEquation block formula="G = \sum_{k=1}^K \hat{p}_{mk}(1 - \hat{p}_{mk})" />
                        <p className="text-sm text-slate-500 mt-2">
                            Measures variance across classes. Smaller is purer.
                        </p>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Cross-Entropy</h4>
                        <MathEquation block formula="D = - \sum_{k=1}^K \hat{p}_{mk} \log \hat{p}_{mk}" />
                        <p className="text-sm text-slate-500 mt-2">
                            Information-theoretic measure of disorder.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-emerald-900/10 my-8">
                    <div className="p-4 border-b border-slate-800 bg-emerald-900/20 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-emerald-100">Interactive Decision Boundary</h4>
                            <p className="text-xs text-emerald-300/70">Click to add points. Adjust depth to see overfitting.</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <DecisionTreeViz />
                    </div>
                </div>
            </div>

            {/* 3.2 Random Forests */}
            <div className="prose prose-invert prose-lg max-w-none pt-12 border-t border-slate-800">
                <h3 className="text-emerald-400 text-2xl font-bold">3.2 Random Forests</h3>
                <p>
                    Single decision trees suffer from <strong>high variance</strong>: a small change in data can lead to a completely different tree.
                    <strong>Bagging</strong> (Bootstrap Aggregating) averages many trees to reduce variance.
                </p>

                <div className="my-6 pl-6 border-l-4 border-emerald-500/50 italic text-slate-400">
                    "Random Forests improve over Bagging by <strong>decorrelating</strong> the trees."
                </div>

                <p>
                    When building each tree, each time a split in a node is considered, a <strong>random sample of <MathEquation formula="m" /> predictors</strong> is chosen as split candidates from the full set of <MathEquation formula="p" /> predictors.
                    Typically, <MathEquation formula="m \approx \sqrt{p}" />. This prevents strong predictors from dominating every tree, ensuring diverse perspectives.
                </p>

                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 my-6">
                    <MathEquation block formula="\hat{f}_{RF}^{B}(x) = \frac{1}{B} \sum_{b=1}^{B} \hat{f}^{*b}(x)" />
                    <p className="text-center text-sm text-slate-500 mt-4">Averaging <MathEquation formula="B" /> trees trained on bootstrapped data subsets.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/10 my-8">
                    <div className="p-4 border-b border-slate-800 bg-blue-900/20">
                        <h4 className="font-bold text-blue-100">Visualizing the Ensemble Effect</h4>
                        <p className="text-xs text-blue-300/70">Observe how adding trees smooths the decision boundary.</p>
                    </div>
                    <div className="p-6">
                        <RandomForestViz />
                    </div>
                </div>
            </div>
        </section>
    );
};
