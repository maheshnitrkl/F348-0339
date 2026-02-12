import React from 'react';
import { motion } from 'framer-motion';

interface EquationCardProps {
    title: string;
    formula: React.ReactNode;
    desc: string;
}

const EquationCard: React.FC<EquationCardProps> = ({ title, formula, desc }) => (
    <motion.div
        whileHover={{ scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.4)' }}
        className="bg-black/40 border border-white/5 p-6 rounded-lg transition-colors cursor-default group"
    >
        <h4 className="font-bold text-cyan-400 mb-4 group-hover:text-cyan-300">{title}</h4>

        <div className="bg-slate-950 p-4 rounded border border-white/10 flex justify-center items-center mb-4 min-h-[80px]">
            <span className="font-serif text-xl italic text-white tracking-wider">
                {formula}
            </span>
        </div>

        <p className="text-gray-500 leading-relaxed">
            {desc}
        </p>
    </motion.div>
);

export const MathDerivation: React.FC = () => {
    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-8 my-6 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6">The 4 Fundamental Equations</h3>
            <p className="text-gray-400 mb-8 max-w-3xl">
                Rigorous backpropagation relies on four key equations that relate the error (&delta;)
                to the weights (w) and biases (b).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base">

                <EquationCard
                    title="1. Error at Output Layer"
                    formula={<>&delta;<sup>L</sup> = &nabla;<sub>a</sub>C &odot; &sigma;&apos;(z<sup>L</sup>)</>}
                    desc="The error at the very end is the gradient of the Cost function multiplied (element-wise) by the derivative of the activation function."
                />

                <EquationCard
                    title="2. Error at Hidden Layer"
                    formula={<>&delta;<sup>l</sup> = ((w<sup>l+1</sup>)<sup>T</sup> &delta;<sup>l+1</sup>) &odot; &sigma;&apos;(z<sup>l</sup>)</>}
                    desc="We pull the error back from the next layer (l+1), multiply by weights transpose, and scale by the activation derivative."
                />

                <EquationCard
                    title="3. Rate of Change wrt Bias"
                    formula={<>&#x2202;C / &#x2202;b<sup>l</sup><sub>j</sub> = &delta;<sup>l</sup><sub>j</sub></>}
                    desc="The gradient for the bias is simply the error term itself! This makes sense: biases shift the activation directly."
                />

                <EquationCard
                    title="4. Rate of Change wrt Weight"
                    formula={<>&#x2202;C / &#x2202;w<sup>l</sup><sub>jk</sub> = a<sup>l-1</sup><sub>k</sub> &delta;<sup>l</sup><sub>j</sub></>}
                    desc="The gradient for a weight is the error at the target neuron (j) multiplied by the activation input from source neuron (k)."
                />
            </div>

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                <strong>Why Notation Matters: </strong>
                <span className="font-mono">&delta;<sup>l</sup><sub>j</sub></span> represents the
                &ldquo;error&rdquo; of neuron j in layer l. It tells us how much changing
                z<sup>l</sup><sub>j</sub> (the weighted input) would change the final cost C.
            </div>
        </div>
    );
};
