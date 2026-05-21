import { useRef } from 'react';
import { Layers, Zap, Image as ImageIcon, Box, Move, Activity, ScanEye, Eye } from 'lucide-react';
import { MathEquation } from '../math/signal-processing/components/common/MathEquation';
import { InteractiveFilters } from './components/interactive/InteractiveFilters';
import { MedicalRoadmap } from './components/MedicalRoadmap';
import { RadonTransformViz } from './components/interactive/RadonTransformViz';
import { MRISimulator } from './components/interactive/MRISimulator';
import { InteractiveFFT } from './components/interactive/InteractiveFFT';
import { VolumeRenderer } from './components/interactive/VolumeRenderer';

interface ComputerVisionTheoryProps {
    onNavigate?: (view: 'theory' | 'code' | 'visualization') => void;
}

export const MedicalImagingTheory: React.FC<ComputerVisionTheoryProps> = ({ onNavigate }) => {
    const pixelRef = useRef<HTMLDivElement>(null); // Acquisition + Preprocessing
    const physicsRef = useRef<HTMLDivElement>(null); // Physics
    const cnnRef = useRef<HTMLDivElement>(null); // Segmentation
    const genRef = useRef<HTMLDivElement>(null); // GenAI
    const vizRef = useRef<HTMLDivElement>(null); // Visualization

    const handleRoadmapClick = (id: string) => {
        if (id === 'acquisition') pixelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (id === 'physics') physicsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (id === 'segmentation') cnnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (id === 'generation') genRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (id === 'visualization') vizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="space-y-24 text-gray-300 leading-relaxed pb-32 relative">
            {/* Intro Header */}
            <div className="border-b border-white/10 pb-12">
                <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600">
                    Medical Image Processing
                </h1>
                <p className="text-2xl text-blue-300 font-light mb-8">
                    "From invisible rays to life-saving diagnosis."
                </p>
                <div className="bg-purple-900/10 border-l-4 border-blue-500 p-8 rounded-r-xl max-w-4xl backdrop-blur-sm">
                    <p className="text-lg">
                        We explore how AI interprets X-Rays, CTs, and MRIs, moving from raw DICOM data to automated segmentation and diagnosis.
                    </p>
                </div>
            </div>

            {/* Roadmap */}
            <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
                <MedicalRoadmap onStepClick={handleRoadmapClick} />
            </div>

            {/* Modules (Placeholder Skeleton) */}


            {/* Phase I: Image Space Fundamentals */}
            <section className="space-y-12" ref={pixelRef}>
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <Eye size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-1">Phase I</div>
                        <h2 className="text-4xl font-bold text-white">Image Space Fundamentals</h2>
                        <p className="text-blue-300 text-lg mt-2">Pixels, Voxels, and Windowing.</p>
                    </div>
                </div>

                {/* DICOM & Windowing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">DICOM & Hounsfield Units</h3>
                        <p className="text-gray-300">
                            Medical images aren't just JPEGs. They are **DICOM** files containing 16-bit depth data, often measured in **Hounsfield Units (HU)**.
                            <br /><br />
                            Water is 0 HU. Bone is +1000 HU. Air is -1000 HU.
                        </p>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <MathEquation
                                formula={String.raw`Display = \text{clamp}\left(\frac{Pixel - (Level - \frac{Width}{2})}{Width} \right) \times 255`}
                                block
                                className="text-lg"
                            />
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Windowing Equation: Mapping high dynamic range medical data to 8-bit screens.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <InteractiveFilters />
                        <p className="text-xs text-center text-gray-500">
                            *This demo simulates windowing by adjusting contrast/threshold on a standard image.*
                        </p>
                    </div>
                </div>

                {/* Preprocessing (Moved Here) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-xl">
                        <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2"><Box size={18} /> Registration</h4>
                        <p className="text-sm text-gray-300">
                            Aligning multiple scans (e.g., MRI over time) to the same coordinate system. Crucial for tracking tumor growth.
                        </p>
                    </div>
                    <div className="bg-pink-900/10 border border-pink-500/20 p-6 rounded-xl">
                        <h4 className="font-bold text-pink-300 mb-2 flex items-center gap-2"><Move size={18} /> Normalization</h4>
                        <p className="text-sm text-gray-300">
                            Resampling voxels to isotropic spacing (e.g., 1mm x 1mm x 1mm) and clipping intensity values using body-part specific ranges.
                        </p>
                    </div>
                </div>
            </section>

            {/* Phase II: The Physics of Acquisition */}
            <section className="space-y-12" ref={physicsRef}>
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-cyan-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                        <Activity size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-cyan-500 uppercase tracking-wider mb-1">Phase II</div>
                        <h2 className="text-4xl font-bold text-white">The Physics of Acquisition</h2>
                        <p className="text-cyan-300 text-lg mt-2">From K-Space to Reconstruction.</p>
                    </div>
                </div>

                {/* MRI Physics (Bloch Equations) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-2xl font-bold text-white mb-6">Magnetic Resonance Imaging (MRI)</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                                <h4 className="font-bold text-blue-300 mb-2">1. Alignment (B0)</h4>
                                <p className="text-sm text-gray-300">
                                    Protons (spins) align with the strong static magnetic field.
                                </p>
                            </div>
                            <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                                <h4 className="font-bold text-emerald-300 mb-2">2. Excitation (RF Pulse)</h4>
                                <p className="text-sm text-gray-300">
                                    A Radio Frequency pulse tips spins into the transverse plane.
                                </p>
                            </div>
                            <div className="bg-pink-900/20 p-4 rounded-xl border border-pink-500/30">
                                <h4 className="font-bold text-pink-300 mb-2">3. Relaxation (T1 & T2)</h4>
                                <p className="text-sm text-gray-300">
                                    Spins return to equilibrium. deeply connected to tissue properties.
                                </p>
                            </div>
                            <MathEquation formula={String.raw`\frac{d\vec{M}}{dt} = \gamma \vec{M} \times \vec{B} - \frac{M_x \hat{i} + M_y \hat{j}}{T_2} - \frac{(M_z - M_0)\hat{k}}{T_1}`} block />
                            <p className="text-xs text-center text-gray-500">The Bloch Equation governing spin dynamics</p>
                        </div>
                        <div>
                            <MRISimulator />
                        </div>
                    </div>
                </div>

                {/* Frequency Domain (Interactive K-Space) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-2xl font-bold text-white mb-4">The Frequency Domain (K-Space)</h3>
                    <p className="mb-6 text-gray-300">
                        In MRI, we don't capture the image directly. We capture **K-Space** (spatial frequencies).
                        The center of K-Space contains contrast (low frequencies), while the edges contain detail (high frequencies).
                        <br /><br />
                        Try filtering K-Space below to see how it affects the reconstructed image.
                    </p>
                    <InteractiveFFT />
                </div>

                {/* Radon Transform (CT) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-2xl font-bold text-white mb-6">Image Reconstruction (The Radon Transform)</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <p className="text-gray-300 mb-6">
                                How do CT scanners work? They take 1D X-Ray projections from many angles around the body.
                                This collection of projections is called a **Sinogram** (Radon Transform).
                            </p>
                            <p className="text-gray-300 mb-6">
                                To get the 2D image back, we smear these projections back across the image plane.
                                Mathematically, this is **Filtered Backprojection**.
                            </p>
                            <MathEquation formula={String.raw`R f(\theta, \rho) = \int_{-\infty}^{\infty} f(x, y) ds`} block />
                            <p className="text-xs text-center text-gray-500 mt-2">Line Integral along the X-Ray beam</p>
                        </div>
                        <div>
                            <RadonTransformViz />
                        </div>
                    </div>
                </div>
            </section>

            {/* Phase III: Deep Segmentation */}
            <section className="space-y-12" ref={cnnRef}>
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-purple-500/20 rounded-2xl text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                        <Layers size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-1">Phase III</div>
                        <h2 className="text-4xl font-bold text-white">Deep Segmentation</h2>
                        <p className="text-purple-300 text-lg mt-2">The Gold Standard: U-Net architecture.</p>
                    </div>
                </div>

                {/* U-Net Architecture */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">U-Net: The Workhorse of Medical AI</h3>
                    <div className="relative border-l border-white/20 pl-8 space-y-8">
                        <div className="relative">
                            <span className="absolute -left-[37px] top-1 w-4 h-4 bg-purple-500 rounded-full border-4 border-[#0a0a0a]"></span>
                            <h4 className="font-bold text-white">Encoder (Contracting Path)</h4>
                            <p className="text-sm text-gray-400">Captures context (What is present?). Reducing spatial dimensions, increasing channels.</p>
                        </div>
                        <div className="relative">
                            <span className="absolute -left-[37px] top-1 w-4 h-4 bg-purple-500 rounded-full border-4 border-[#0a0a0a]"></span>
                            <h4 className="font-bold text-white">Bottleneck</h4>
                            <p className="text-sm text-gray-400">The deepest latent representation of the medical image.</p>
                        </div>
                        <div className="relative">
                            <span className="absolute -left-[37px] top-1 w-4 h-4 bg-cyan-500 rounded-full border-4 border-[#0a0a0a]"></span>
                            <h4 className="font-bold text-white">Decoder (Expanding Path)</h4>
                            <p className="text-sm text-gray-400">Precise localization (Where is it?). Upsampling and concatenating with skip connections.</p>
                        </div>
                    </div>
                    <div className="mt-8 bg-black/30 p-4 rounded-xl text-center">
                        <p className="text-sm text-gray-400 mb-2">Skip Connections allow the model to recover fine spatial details lost during pooling.</p>
                        <MathEquation formula={String.raw`y = \text{Decoder}( \text{Encoder}(x) \oplus \text{SkipMaps} )`} block />
                    </div>
                </div>

                {/* 3D and Transformers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl">
                        <h4 className="text-xl font-bold text-white mb-2">V-Net (3D U-Net)</h4>
                        <p className="text-sm text-gray-300 mb-4">
                            Processing entire 3D volumes (CT Scans) at once, using 3D convolutions ($k \times k \times k$).
                        </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl">
                        <h4 className="text-xl font-bold text-white mb-2">Medical Transformers (Swin-UNet)</h4>
                        <p className="text-sm text-gray-300 mb-4">
                            Replacing CNN backbones with Transformers to capture long-range dependencies in large scans.
                        </p>
                    </div>
                </div>
            </section>

            {/* Phase IV: Generative Medical AI */}
            <section className="space-y-12" ref={genRef}>
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-pink-500/20 rounded-2xl text-pink-400 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                        <Zap size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-pink-500 uppercase tracking-wider mb-1">Phase IV</div>
                        <h2 className="text-4xl font-bold text-white">Generative Medical AI</h2>
                        <p className="text-pink-300 text-lg mt-2">Synthetic Data & Reconstruction.</p>
                    </div>
                </div>

                {/* Diffusion for Data Augmentation */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Synthetic Data Generation</h3>
                    <p className="text-gray-300 mb-6">
                        Rare diseases have little data. We can use <strong>Stable Diffusion</strong> to generate synthetic MRI/CT scans of rare pathologies to train robust models.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-black/40 rounded-lg">
                            <div className="text-gray-500 text-sm mb-2">Latent Space</div>
                            <div className="w-12 h-12 mx-auto bg-noise bg-gray-700 rounded-full opacity-50"></div>
                        </div>
                        <div className="flex items-center justify-center text-gray-500">
                            <Move className="animate-pulse" />
                            <span className="mx-2 text-xs">Denoise (guided by condition)</span>
                            <Move className="animate-pulse" />
                        </div>
                        <div className="p-4 bg-black/40 rounded-lg">
                            <div className="text-gray-500 text-sm mb-2">Synthetic MRI</div>
                            <ImageIcon className="mx-auto text-white opacity-100" size={48} />
                        </div>
                    </div>
                </div>

                {/* Reconstruction */}
                <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-8 rounded-2xl border border-orange-500/30">
                    <div className="flex items-center gap-4 mb-4">
                        <Box className="text-orange-400" size={32} />
                        <h3 className="text-2xl font-bold text-white">Sparse Reconstruction (NeRF/Gaussian Splatting)</h3>
                    </div>
                    <p className="text-gray-300 mb-6">
                        Reconstruct high-resolution 3D anatomy from fewer X-Ray projections (reducing radiation dose) using Neural Fields.
                    </p>
                    <MathEquation formula={String.raw`\min_\theta || \mathcal{P}(f_\theta) - \text{Projections} ||^2 + \lambda \mathcal{R}(f_\theta)`} block />
                    <p className="text-xs text-gray-500 mt-2 text-center">Reconstruction Loss with Regularization</p>
                </div>
            </section>

            {/* Phase V: Immersive Visualization */}
            <section className="space-y-12 pb-12" ref={vizRef}>
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-cyan-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                        <ScanEye size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-cyan-500 uppercase tracking-wider mb-1">Phase V</div>
                        <h2 className="text-4xl font-bold text-white">Immersive Visualization</h2>
                        <p className="text-cyan-300 text-lg mt-2">Beyond 2D Slices: Direct Volume Rendering.</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <div className="max-w-3xl mb-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Cinematic Volume Rendering</h3>
                        <p className="text-gray-300">
                            Traditional 3D meshes (triangles) cannot represent semi-transparent tissue density.
                            Instead, we use **Raymarching**. We cast rays through a 3D texture, accumulating color and opacity based on tissue density.
                            <br /><br />
                            <span className="text-cyan-400">Interactive Demo:</span> Adjust the <strong>Threshold</strong> below to digitally "peel" the skin and reveal the skull/brain inside the volume.
                        </p>
                    </div>

                    <VolumeRenderer />

                    {/* Mathematical Deep Dive */}
                    <div className="mt-12 bg-black/40 border border-white/10 rounded-xl p-8">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Activity className="text-cyan-400" />
                            Mathematical Deep Dive: Raymarching & MRI Physics
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h5 className="font-bold text-cyan-300 mb-4">1. The Raymarching Integral</h5>
                                <p className="text-gray-400 mb-4 text-sm">
                                    Unlike surface rendering (triangles), we visualize the volume by integrating density along a ray R(t) fired from the camera.
                                </p>
                                <MathEquation
                                    formula={String.raw`C_{final} = \int_{0}^{T} \alpha(t) \cdot C(t) \cdot e^{-\int_{0}^{t} \alpha(s) ds} dt`}
                                    block
                                    className="text-sm"
                                />
                                <p className="text-xs text-center text-gray-500 mt-2">
                                    The Volume Rendering Equation (Beer-Lambert Law)
                                </p>
                            </div>

                            <div>
                                <h5 className="font-bold text-cyan-300 mb-4">2. Relation to MRI</h5>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li className="flex gap-3">
                                        <div className="min-w-1 h-full bg-cyan-500/50"></div>
                                        <span>
                                            <strong className="text-white">Texture = Voxel Grid:</strong> The 3D data serves as a lookup table for tissue density rho(x,y,z).
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="min-w-1 h-full bg-cyan-500/50"></div>
                                        <span>
                                            <strong className="text-white">Threshold = Window Level:</strong> Setting T_cutoff hides noise (air/skin) just like a radiologist sets the window level.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="min-w-1 h-full bg-cyan-500/50"></div>
                                        <span>
                                            <strong className="text-white">Loop = MIP:</strong> The ray accumulation loop simulates X-ray attenuation through the body.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
