import React from 'react';
import { Target, Maximize, Crosshair } from 'lucide-react';
import { YOLOGridViz } from '../components/YOLOGridViz';

export const ObjectDetection: React.FC = () => {
    return (
        <div className="space-y-12">
            <div className="prose prose-invert max-w-none">
                <p className="text-xl text-slate-400 leading-relaxed">
                    Image classification answers <strong className="text-white">"What is in this image?"</strong>. Object Detection answers <strong className="text-white">"What is in this image, and exactly where is it?"</strong> This requires outputting both class probabilities and precise Bounding Box coordinates $(x, y, width, height)$ for multiple objects simultaneously.
                </p>
            </div>

            {/* Core Concepts */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Crosshair className="text-rose-400" /> Two-Stage Detectors
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Architectures like <strong className="text-white">Faster R-CNN</strong> split the problem into two distinct steps:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
                        <li><strong>Region Proposal Network (RPN):</strong> Scans the image and guesses hundreds of "regions of interest" where objects <em>might</em> exist.</li>
                        <li><strong>Classification & Refinement:</strong> A heavy CNN processes every single proposed region to classify the object and tighten the bounding box.</li>
                    </ol>
                    <p className="text-slate-400 text-sm mt-4">
                        <strong className="text-rose-400">Result:</strong> Highly accurate, but computationally expensive and slow (not ideal for real-time video).
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="text-cyan-400" /> One-Stage Detectors
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Architectures like <strong className="text-white">YOLO (You Only Look Once)</strong> and SSD eliminate the region proposal step entirely.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
                        <li>The entire image passes through a single neural network <strong className="text-cyan-400">one time</strong>.</li>
                        <li>The network outputs a massive tensor containing bounding box predictions and class probabilities for a fixed grid across the image.</li>
                    </ul>
                    <p className="text-slate-400 text-sm mt-4">
                        <strong className="text-cyan-400">Result:</strong> Incredibly fast (enabling real-time 60fps tracking), though historically slightly less accurate on tiny clustered objects than two-stage methods.
                    </p>
                </div>
            </div>

            {/* YOLO Visualizer */}
            <div className="py-8">
                <YOLOGridViz />
            </div>

            {/* Core Mechanics */}
            <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-6">Crucial Detection Concepts</h3>
                
                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Maximize size={18} className="text-violet-400" /> Intersection over Union (IoU)
                        </h4>
                        <p className="text-slate-400 text-sm">
                            How do we measure if a predicted bounding box is accurate? We calculate the Area of Intersection between the Predicted Box and the Ground Truth Box, divided by the Area of their Union. An IoU &gt; 0.5 is typically considered a "True Positive".
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Target size={18} className="text-emerald-400" /> Anchor Boxes (Priors)
                        </h4>
                        <p className="text-slate-400 text-sm">
                            Instead of predicting arbitrary box dimensions from scratch, networks define "Anchor Boxes" of various aspect ratios (e.g., tall/skinny for pedestrians, wide/short for cars). The network then learns to predict small <strong className="text-white">offsets</strong> and <strong className="text-white">scale factors</strong> relative to these anchors, making training much more stable.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Crosshair size={18} className="text-rose-400" /> Non-Maximum Suppression (NMS)
                        </h4>
                        <p className="text-slate-400 text-sm">
                            One-stage detectors often predict dozens of slightly overlapping bounding boxes around a single prominent object. NMS is a post-processing algorithm that looks at all overlapping boxes (high IoU) predicting the same class, and throws away all but the single box with the highest confidence score.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
