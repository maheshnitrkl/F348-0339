import React from 'react';
import { NeuralNet3DViz } from '../components/NeuralNet3DViz';
import { SelfAttentionViz } from '../components/SelfAttentionViz';
import { OptimizerLandscape3D } from '../components/OptimizerLandscape3D';
import { QuantizationViz } from '../components/QuantizationViz';

export const StateOfTheArt: React.FC = () => {
    return (
        <section className="space-y-16 pb-32">
            
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-sm">
                    <span>17</span>
                    <div className="h-px bg-rose-500/50 w-8" />
                    <span>State of the Art (SOTA)</span>
                </div>
                <h2 className="text-4xl font-bold text-white">Modern Architectures in 3D</h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                    Welcome to the frontier. While classic Multi-Layer Perceptrons laid the foundation, modern State of the Art (SOTA) networks are massive, complex, and highly structured. Here we transition from 2D diagrams to 3D WebGL representations.
                </p>
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Interactive 3D Tensor Flow</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    Instead of drawing networks on a flat plane, we can visualize the layers in 3D space. Press Play below to watch the forward pass propagate through the network in real-time, simulating how modern GPU architectures process batches of data.
                </p>
                <NeuralNet3DViz />
            </div>

            <div className="space-y-6 mt-16 pt-16 border-t border-white/5">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-sm">
                    <span>18</span>
                    <div className="h-px bg-rose-500/50 w-8" />
                    <span>Attention</span>
                </div>
                <h3 className="text-3xl font-bold text-white">The Transformer Revolution</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    "Attention Is All You Need" (2017) changed everything. Instead of processing data sequentially (like RNNs) or locally (like CNNs), Transformers compute a global "Attention" score between every pair of elements. Explore the math behind Self-Attention below.
                </p>
                <SelfAttentionViz />
            </div>

            <div className="space-y-6 mt-16 pt-16 border-t border-white/5">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-sm">
                    <span>19</span>
                    <div className="h-px bg-rose-500/50 w-8" />
                    <span>Advanced Optimization</span>
                </div>
                <h3 className="text-3xl font-bold text-white">3D Loss Landscapes</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    Training massive networks requires sophisticated optimization. Standard SGD can easily get stuck in local minima or saddle points. See how modern optimizers like Momentum and Adam navigate a highly non-convex 3D landscape (the Rastrigin function).
                </p>
                <OptimizerLandscape3D />
            </div>

            <div className="space-y-6 mt-16 pt-16 border-t border-white/5">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-sm">
                    <span>20</span>
                    <div className="h-px bg-rose-500/50 w-8" />
                    <span>Hardware & Production</span>
                </div>
                <h3 className="text-3xl font-bold text-white">Quantization Simulator</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    To deploy massive AI models on consumer hardware (like phones or laptops), engineers use Quantization. By reducing the precision of the weights from 32-bit floats to 8-bit or even 4-bit integers, they can drastically reduce memory usage with minimal loss in accuracy.
                </p>
                <QuantizationViz />
            </div>

        </section>
    );
};

