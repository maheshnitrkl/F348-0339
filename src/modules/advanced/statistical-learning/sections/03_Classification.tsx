import React from 'react';
import { SVMDecisionViz } from '../components/SVMDecisionViz';
import { ROCCurveBuilder } from '../components/ROCCurveBuilder';

export const Classification: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-8">3. Classification</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300">
                    When the output $Y$ is categorical (e.g., "Spam" vs. "Ham"), we enter the realm of classification.
                </p>

                <h3 className="text-violet-400 mt-12">3.1 Support Vector Machines (SVM)</h3>
                <p>
                    SVMs find the "Optimal Separating Hyperplane" that maximizes the margin between classes.
                    Using the Kernel Trick, they can find linear boundaries in high-dimensional feature spaces.
                </p>
            </div>

            {/* Existing SVM Viz reused here */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h4 className="font-bold text-white">Interactive SVM Playground</h4>
                </div>
                <div className="p-6">
                    <SVMDecisionViz />
                </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none mt-12">
                <h3 className="text-violet-400">3.2 Model Evaluation: ROC Curves</h3>
                <p>
                    Accuracy is not enough, especially with imbalanced classes.
                    The **Receiver Operating Characteristic (ROC)** curve plots the True Positive Rate vs. False Positive Rate as we vary the decision threshold.
                    The Area Under the Curve (AUC) summarizes performance.
                </p>
            </div>

            {/* ROC Curve Builder */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h4 className="font-bold text-white">ROC Curve Builder</h4>
                    <p className="text-sm text-slate-400">Drag the threshold slider to generate the ROC curve point-by-point.</p>
                </div>
                <div className="p-6">
                    <ROCCurveBuilder />
                </div>
            </div>

        </section>
    );
};
