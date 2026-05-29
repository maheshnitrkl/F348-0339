/* eslint-disable */
import React from 'react';
import { Network, Copy, Layers, Target, Scissors, BookOpen } from 'lucide-react';
import { TransferLearningViz, type TransferModelType } from '../components/TransferLearningViz';

interface ModelSectionProps {
    type: TransferModelType;
    title: string;
    description: React.ReactNode;
}

const ModelSection: React.FC<ModelSectionProps> = ({ type, title, description }) => (
    <div className="border-t border-white/10 pt-12 mt-12 first:border-0 first:pt-0 first:mt-0">
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <div className="text-slate-300 leading-relaxed mb-8">
            {description}
        </div>
        <TransferLearningViz modelType={type} />
    </div>
);

export const TransferLearning: React.FC = () => {
    return (
        <div className="space-y-12 pb-16">
            <header>
                <div className="flex items-center gap-3 text-violet-400 mb-4">
                    <Copy size={24} />
                    <h2 className="text-3xl font-bold text-white">Transfer Learning Toolkit</h2>
                </div>
                <p className="text-xl text-slate-300 leading-relaxed">
                    Why train from scratch when you can stand on the shoulders of giants? Transfer learning allows you to take a model trained on a massive dataset and repurpose its learned features for your own specific task.
                </p>
            </header>

            {/* Why Transfer Learning */}
            <section className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="text-violet-400" size={20} />
                    The Problem with Training from Scratch
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5">
                        <h4 className="text-rose-400 font-bold mb-2">Training From Scratch</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-0.5">•</span>
                                Requires massive datasets (millions of images).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-0.5">•</span>
                                Requires immense compute power (weeks on multiple GPUs).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-500 mt-0.5">•</span>
                                Highly prone to overfitting on small datasets.
                            </li>
                        </ul>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5">
                        <h4 className="text-emerald-400 font-bold mb-2">Transfer Learning</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                Works with very small datasets (hundreds of images).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                Extremely fast training (minutes on a single GPU).
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                Leverages generalized features (edges, textures) already learned.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Paradigms */}
            <section className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scissors className="text-violet-400" size={20} />
                    Two Paradigms
                </h3>
                <div className="space-y-4 text-slate-300 leading-relaxed">
                    <div>
                        <h4 className="font-bold text-white mb-1 text-md">1. Feature Extraction (Freezing)</h4>
                        <p className="text-slate-400 text-sm">
                            You treat the pre-trained network as a fixed feature extractor. You freeze all the weights in the backbone network so gradients are not computed. You only train the newly added, initialized classification head.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-1 text-md">2. Fine-Tuning (Unfreezing)</h4>
                        <p className="text-slate-400 text-sm">
                            You unfreeze some (or all) of the top layers of the pre-trained model and jointly train both the newly added classifier and these top layers. This adjusts the complex, high-level features to better suit your specific dataset.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Models Reference */}
            <section className="pt-8">
                <div className="flex items-center gap-3 mb-8">
                    <BookOpen className="text-violet-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">The Architecture Reference</h2>
                </div>
                <p className="text-slate-400 mb-12">
                    Below is a comprehensive guide to 7 of the most important architectures in deep learning history. Interact with each model to see exactly how to load it, freeze its layers, and swap its classification head using PyTorch.
                </p>

                <div className="space-y-16">
                    <ModelSection 
                        type="vgg"
                        title="1. VGG-16: The Classic Approach"
                        description={
                            <div className="space-y-4">
                                <p>VGG (2014) proved that stacking multiple small 3x3 convolutions is mathematically equivalent to a single large 5x5 or 7x7 convolution, but with significantly fewer parameters and more non-linearities (ReLUs).</p>
                                <p><strong>The Architecture:</strong> VGG is a purely sequential network. It takes a <code className="text-cyan-400">[224, 224, 3]</code> image. Every time it hits a <strong>MaxPool2d</strong> layer, the spatial dimensions halve (e.g., to 112x112), while the subsequent <strong>Conv2d</strong> layers double the channel depth (from 64 → 128 → 256). By the end of the feature extractor, the tensor is squeezed into a tiny but incredibly deep <code className="text-cyan-400">[7, 7, 512]</code> block.</p>
                                <p className="text-sm border-l-2 border-slate-700 pl-4 text-slate-400"><em>Transfer Learning Note:</em> Because it is entirely sequential, freezing early layers in VGG is as simple as indexing an array (`model.features[:10]`). It is very heavy (138M parameters), so it's mostly used for educational purposes today.</p>
                            </div>
                        }
                    />

                    <ModelSection 
                        type="inception"
                        title="2. Inception v3: Parallel Pathways"
                        description={
                            <div className="space-y-4">
                                <p>Inception (2014) moved away from strict sequential processing. Instead of choosing whether to use a 3x3 or 5x5 convolution at a given layer, the <strong>Inception Module</strong> uses both in parallel, concatenating their outputs.</p>
                                <p><strong>The Architecture:</strong> The network uses <strong>1x1 Convolutions</strong> extensively before expensive 3x3 or 5x5 operations. A 1x1 convolution acts as a "channel reducer"—it shrinks the depth of the tensor (e.g., from 256 channels to 64) with very few parameters, drastically reducing the computational cost of the subsequent 3x3 convolution.</p>
                                <p className="text-sm border-l-2 border-slate-700 pl-4 text-slate-400"><em>Transfer Learning Note:</em> Freezing requires targeting specific module names (e.g., `Mixed_5b`) rather than sequential indices.</p>
                            </div>
                        }
                    />

                    <ModelSection 
                        type="resnet"
                        title="3. ResNet-50: The Residual Revolution"
                        description={
                            <div className="space-y-4">
                                <p>As networks grew deeper than 20 layers, they suffered from the <strong>Vanishing Gradient</strong> problem—the error signal from the loss function dissipated before reaching the early layers. ResNet (2015) solved this using Skip Connections.</p>
                                <p><strong>The Architecture:</strong> The core unit is the <strong>Bottleneck Block</strong>. Instead of learning a direct mapping $H(x)$, it learns a residual mapping $F(x)$, and the output becomes $F(x) + x$. The skip connection ($+ x$) provides a direct gradient highway straight to the early layers. The "Bottleneck" refers to using a 1x1 conv to squeeze channels, a 3x3 conv to process them, and a 1x1 conv to expand them back out (e.g., 256 → 64 → 256).</p>
                                <p className="text-sm border-l-2 border-slate-700 pl-4 text-slate-400"><em>Transfer Learning Note:</em> ResNet-50 remains the absolute industry standard baseline for computer vision transfer learning.</p>
                            </div>
                        }
                    />

                    <ModelSection 
                        type="xception"
                        title="4. Xception: Extreme Inception"
                        description={
                            <div className="space-y-4">
                                <p>Xception (2016) takes the principles of Inception to the extreme by replacing standard convolutions entirely with <strong>Depthwise Separable Convolutions</strong>.</p>
                                <p><strong>The Architecture:</strong> A standard 3x3 convolution mixes both spatial data (the 3x3 grid) and cross-channel data (e.g., RGB) simultaneously. Xception separates this into two steps: a <em>Depthwise</em> convolution applies a single 3x3 filter to each channel independently, and a <em>Pointwise</em> (1x1) convolution mixes the resulting channels together. This mathematical decoupling requires far fewer parameters and performs better.</p>
                            </div>
                        }
                    />

                    <ModelSection 
                        type="mobilenet"
                        title="5. MobileNetV3: The Edge Champion"
                        description={
                            <div className="space-y-4">
                                <p>MobileNet (2019) is explicitly designed for mobile phones and edge devices with limited compute, building heavily on Xception's depthwise separable convolutions.</p>
                                <p><strong>The Architecture:</strong> It introduces the <strong>Inverted Residual Block</strong>. Unlike ResNet which squeezes channels, processes them, and expands them, MobileNet <em>expands</em> them (e.g., 16 → 96), applies cheap depthwise convolutions, and then <em>squeezes</em> them back down (96 → 24) before adding the skip connection. This requires less memory at the bottlenecks.</p>
                            </div>
                        }
                    />

                    <ModelSection 
                        type="vit"
                        title="6. Vision Transformer (ViT)"
                        description={
                            <div className="space-y-4">
                                <p>ViT (2020) proved that convolutions aren't strictly necessary for vision if you have enough data. It treats an image exactly like a sentence of text.</p>
                                <p><strong>The Architecture:</strong> A 224x224 image is sliced into a 14x14 grid of 16x16 pixel patches. Each patch is flattened into a 1D vector and passed through a linear projection (`conv_proj`). A special <strong>[CLS] token</strong> is prepended to the sequence. The entire sequence is then fed into standard <strong>Self-Attention Encoder Blocks</strong>. The final classification prediction is read exclusively from the output state of the [CLS] token.</p>
                                <p className="text-sm border-l-2 border-slate-700 pl-4 text-slate-400"><em>Transfer Learning Note:</em> ViTs require massive datasets for initial pre-training, but they fine-tune exceptionally well, currently holding state-of-the-art records.</p>
                            </div>
                        }
                    />

                    <ModelSection 
                        type="bert"
                        title="7. BERT: The NLP Standard"
                        description={
                            <div className="space-y-4">
                                <p>BERT (2018) revolutionized NLP. Unlike prior models (RNNs/LSTMs) that read text left-to-right, BERT's self-attention mechanism reads the entire sequence bidirectionally all at once.</p>
                                <p><strong>The Architecture:</strong> Text is tokenized into WordPieces. The <strong>Embeddings</strong> layer combines Token Embeddings (the word itself), Position Embeddings (where it is in the sentence), and Segment Embeddings. This dense vector passes through 12 stacked <strong>BertLayers</strong> (Self-Attention + Feed Forward). Just like ViT, a special [CLS] token is pooled at the very end to make the final classification.</p>
                                <p className="text-sm border-l-2 border-slate-700 pl-4 text-slate-400"><em>Transfer Learning Note:</em> NLP transfer learning almost exclusively relies on the HuggingFace `transformers` library rather than `torchvision`.</p>
                            </div>
                        }
                    />
                </div>
            </section>
        </div>
    );
};
