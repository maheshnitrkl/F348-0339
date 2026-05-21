import React from 'react';
import { DistributionExplorer } from '../components/DistributionExplorer';
import { LikelihoodViz } from '../components/LikelihoodViz';
import { MathEquation } from '../components/MathEquation';

export const Foundations: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-8">1. Statistical Foundations</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300">
                    Machine learning is built upon the bedrock of probability theory and statistics.
                    Before we can build models, we must understand the data generation process itself.
                </p>

                <h3 className="text-blue-400 mt-12">1.1 Probability Theory & Random Variables</h3>
                <p>
                    A random variable $X$ maps outcomes of a random process to numbers.
                    Its behavior is fully described by its Cumulative Distribution Function (CDF), $F(x) = P(X \leq x)$.
                    For continuous variables, we are often more interested in the <strong>Probability Density Function (PDF)</strong>, $p(x)$, where:
                </p>

                <div className="my-4">
                    <MathEquation block formula="P(a \leq X \leq b) = \int_{a}^{b} p(x) dx" />
                </div>

                <h4 className="text-white mt-6">Expectation and Variance</h4>
                <p>
                    The <strong>Expected Value</strong> (or mean) is the center of mass of the distribution:
                </p>
                <MathEquation block formula="\mathbb{E}[X] = \int_{-\infty}^{\infty} x p(x) dx" />

                <p>
                    The <strong>Variance</strong> measures the spread or dispersion around the mean:
                </p>
                <MathEquation block formula="\text{Var}(X) = \mathbb{E}[(X - \mathbb{E}[X])^2] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2" />

                <h4 className="text-white mt-6">The Gaussian Distribution</h4>
                <p>
                    The most ubiquitous distribution in nature (due to the Central Limit Theorem) is the Gaussian (Normal) distribution, parameterized by mean $\mu$ and variance $\sigma^2$:
                </p>
                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 my-6">
                    <MathEquation block formula="p(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}" />
                </div>
            </div>

            {/* Interactive Distribution Explorer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/10">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-white">Interactive Distribution Explorer</h4>
                        <p className="text-xs text-slate-400">Viz 1.1: Parameters of the Normal Distribution</p>
                    </div>
                </div>
                <div className="p-6">
                    <DistributionExplorer />
                </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none mt-12">
                <h3 className="text-blue-400">1.2 Maximum Likelihood Estimation (MLE)</h3>
                <p>
                    How do we learn? If we assume a specific parametric form for our data (e.g., Gaussian), "learning" becomes finding the parameters $\theta = (\mu, \sigma)$ that best fit the data.
                    The <strong>Maximum Likelihood Principle</strong> states we should pick $\theta$ that maximizes the probability of the observed data.
                </p>

                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 my-6">
                    <MathEquation block formula="\hat{\theta}_{MLE} = \arg\max_{\theta} \mathcal{L}(\theta; X)" />
                </div>

                <p className="flex flex-wrap items-baseline gap-2">
                    Assuming independent and identically distributed (i.i.d.) data <MathEquation formula="X = \{x_1, ..., x_N\}" />, the likelihood is the product of individual densities:
                </p>
                <MathEquation block formula="\mathcal{L}(\theta) = \prod_{i=1}^{N} p(x_i | \theta)" />

                <p>
                    Maximizing a product is numerically unstable (it vanishes to zero). Instead, we maximize the <strong>Log-Likelihood</strong>, which turns the product into a sum:
                </p>
                <MathEquation block formula="\ell(\theta) = \sum_{i=1}^{N} \log p(x_i | \theta)" />
            </div>

            {/* Interactive Likelihood Viz */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-emerald-900/10">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h4 className="font-bold text-white">Visualizing Maximum Likelihood</h4>
                    <p className="text-sm text-slate-400">Viz 1.2: finding the optimal $\mu$ that maximizes joint probability.</p>
                </div>
                <div className="p-6">
                    <LikelihoodViz />
                </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none mt-12">
                <h3 className="text-blue-400">1.3 Bias-Variance Decomposition (Formal)</h3>
                <p>
                    Let our training set <MathEquation formula="\mathcal{D}" /> consist of pairs <MathEquation formula="(x_i, y_i)" /> where <MathEquation formula="y_i = f(x_i) + \epsilon" />, with <MathEquation formula="\mathbb{E}[\epsilon] = 0" /> and <MathEquation formula="\text{Var}(\epsilon) = \sigma_\epsilon^2" />.
                    We train a model <MathEquation formula="\hat{f}(x; \mathcal{D})" />. The expected test error at a new point <MathEquation formula="x_0" /> is:
                </p>

                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 my-6">
                    <MathEquation block formula="\mathbb{E}_{\mathcal{D}} [ (y_0 - \hat{f}(x_0))^2 ] = \text{Bias}^2(\hat{f}(x_0)) + \text{Var}(\hat{f}(x_0)) + \sigma_\epsilon^2" />
                </div>

                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                    <li>
                        <strong>Bias</strong>: <MathEquation formula="\mathbb{E}[\hat{f}(x_0)] - f(x_0)" />. The error from erroneous assumptions (e.g., using linear regression for curved data).
                    </li>
                    <li>
                        <strong>Variance</strong>: <MathEquation formula="\mathbb{E}[ (\hat{f}(x_0) - \mathbb{E}[\hat{f}(x_0)])^2 ]" />. How much the prediction fluctuates across different training sets.
                    </li>
                    <li>
                        <strong>Irreducible Error</strong>: <MathEquation formula="\sigma_\epsilon^2" />. The noise variance inherent in the problem.
                    </li>
                </ul>
            </div>
        </section>
    );
};
