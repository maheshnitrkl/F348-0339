import React from 'react';
import { BiasVarianceViz } from '../components/BiasVarianceViz';
import { RegularizationGeometryViz } from '../components/RegularizationGeometryViz';
import { MathEquation } from '../../../../components/MathEquation';

export const Regularization: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-8">2. Linear Methods & Regularization</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300">
                    Linear regression is the workhorse of statistics. But often, the simple least squares estimate is not enough.
                    We need <strong>Regularization</strong> to control variance and perform feature selection.
                </p>

                <h3 className="text-emerald-400 mt-12">2.1 The Bias-Variance Tradeoff (Revisited)</h3>
                <p>
                    As we saw earlier, increasing model complexity reduces bias but increases variance.
                    Regularization is a technique to explicitly constrain the model complexity, pushing us towards the "Goldilocks zone."
                </p>
            </div>

            {/* Existing Bias-Variance Viz reused here */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h4 className="font-bold text-white">Polynomial Regression Complexity</h4>
                </div>
                <div className="p-6">
                    <BiasVarianceViz />
                </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none mt-12">
                <h3 className="text-emerald-400">2.2 Ridge (L2) vs. Lasso (L1)</h3>
                <p>
                    We modify the loss function by adding a penalty term on the size of coefficients $\beta$:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                    <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/20">
                        <h4 className="text-blue-400 font-bold mb-2">Ridge Regression (L2)</h4>
                        <MathEquation block formula="\text{RSS} + \lambda \sum_{j=1}^{p} \beta_j^2" />
                        <p className="text-slate-400 text-sm mt-4">
                            Shrinks coefficients towards zero but rarely sets them exactly to zero. Good for handling correlated features.
                        </p>
                    </div>
                    <div className="bg-emerald-900/20 p-6 rounded-xl border border-emerald-500/20">
                        <h4 className="text-emerald-400 font-bold mb-2">Lasso Regression (L1)</h4>
                        <MathEquation block formula="\text{RSS} + \lambda \sum_{j=1}^{p} |\beta_j|" />
                        <p className="text-slate-400 text-sm mt-4">
                            Can set coefficients exactly to zero, performing <strong>Feature Selection</strong>. It yields "sparse" models.
                        </p>
                    </div>
                </div>

                <h4 className="text-white mt-8">Geometric Interpretation</h4>
                <p>
                    The difference comes from the shape of the constraint regions.
                    L2 is a circle (sphere), while L1 is a diamond (polytope) with sharp corners.
                    The solution is where the RSS contours first touch the constraint region.
                </p>
            </div>

            {/* Geometry Viz */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h4 className="font-bold text-white">The Geometry of Sparsity</h4>
                    <p className="text-sm text-slate-400">Drag the constraint slider to see how L1 (Diamond) hits the axis (Coefficient = 0) while L2 (Circle) does not.</p>
                </div>
                <div className="p-6">
                    <RegularizationGeometryViz />
                </div>
            </div>
        </section>
    );
};
