import React from 'react';
import { Layers, Map, Scissors } from 'lucide-react';
import { UNetArchitectureViz } from '../components/UNetArchitectureViz';

export const Segmentation: React.FC = () => {
    return (
        <div className="space-y-12">
            <div className="prose prose-invert max-w-none">
                <p className="text-xl text-slate-400 leading-relaxed">
                    While Object Detection outputs bounding boxes, Image Segmentation goes a step further by answering <strong className="text-white">"Which exact pixels belong to which object?"</strong> This creates a pixel-perfect mask, critical for applications like self-driving cars navigating complex road boundaries or doctors isolating tumors in medical scans.
                </p>
            </div>

            {/* Types of Segmentation */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Map className="text-emerald-400" /> Semantic Segmentation
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Classifies every pixel into a category, but <strong className="text-emerald-400">does not differentiate between separate instances</strong> of the same class. If three sheep are standing together, the network outputs one giant "sheep" blob covering all of them.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Scissors className="text-violet-400" /> Instance Segmentation
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Classifies every pixel, but <strong className="text-violet-400">identifies individual objects separately</strong>. If three sheep are standing together, the network outputs "Sheep 1", "Sheep 2", and "Sheep 3", masking them with distinct colors. (e.g., Mask R-CNN).
                    </p>
                </div>
            </div>

            {/* U-Net Visualizer */}
            <div className="py-8">
                <UNetArchitectureViz />
            </div>

            {/* How it works */}
            <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-6">The Anatomy of a Segmentation Network</h3>
                
                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Layers size={18} className="text-blue-400" /> Fully Convolutional Networks (FCNs)
                        </h4>
                        <p className="text-slate-400 text-sm">
                            Unlike classification networks that end in dense linear layers (which flatten the image and destroy 2D spatial arrangement), segmentation networks consist <strong className="text-white">entirely of convolutional layers</strong>. This allows the network to output a 2D spatial map (a mask) rather than a 1D probability vector.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Layers size={18} className="text-emerald-400" /> Transposed Convolutions (Up-Sampling)
                        </h4>
                        <p className="text-slate-400 text-sm">
                            Standard pooling operations reduce the image size to extract deep semantic features. To generate a mask the same size as the original image, the network must "learn to scale up". <strong className="text-white">Transposed Convolutions</strong> (sometimes confusingly called Deconvolutions) are trainable layers that perform spatial expansion, mathematically broadcasting single pixels into larger patches.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
