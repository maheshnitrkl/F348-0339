import React from 'react';
import { MathEquation } from './components/common/MathEquation';
import { Waves, Activity, Radio, Cpu, Mic, Layers, Zap, Music, Brain, Filter, Sigma, Move, Grid, Code, ArrowRight } from 'lucide-react';

export const SignalProcessingTheory: React.FC = () => {
    return (
        <div className="space-y-24 text-gray-300 leading-relaxed pb-32">
            {/* Intro Header */}
            <div className="border-b border-white/10 pb-12">
                <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    Signal Processing for AI
                </h1>
                <p className="text-2xl text-cyan-300 font-light mb-8">
                    "To teach a machine to listen, we must first teach it the language of waves."
                </p>
                <div className="bg-blue-900/10 border-l-4 border-cyan-500 p-8 rounded-r-xl max-w-4xl backdrop-blur-sm">
                    <p className="text-lg">
                        This curriculum bridges the gap between classic DSP (Digital Signal Processing) and modern Deep Learning.
                        We move beyond simple "black box" models to understand the <strong>Mathematical First Principles</strong> that drive everything from
                        Spotify's recommendation engine to OpenAI's Voice Mode.
                    </p>
                </div>
            </div>

            {/* Module 1: The Physics of Sampling */}
            <section className="space-y-12">
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <Waves size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-1">Module 1</div>
                        <h2 className="text-4xl font-bold text-white">The Physics of Digital Signals</h2>
                        <p className="text-blue-300 text-lg mt-2">Sampling, Quantization, and the Limits of Reality.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Derivation of Sampling Theorem */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Activity className="text-blue-400" /> The Sampling Theorem Derivation
                        </h3>
                        <p>
                            In the real world, time is continuous (<MathEquation formula={String.raw`t`} />). In computers, time is discrete (<MathEquation formula={String.raw`n`} />).
                            To bridge this gap, we multiply our continuous signal <MathEquation formula={String.raw`x(t)`} /> by a "Comb Function" <MathEquation formula={String.raw`s(t)`} /> (a train of Dirac deltas).
                        </p>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <MathEquation formula={String.raw`x_{sampled}(t) = x(t) \cdot \sum_{n=-\infty}^{\infty} \delta(t - nT_s)`} block className="text-lg" />
                        </div>
                        <p>
                            <strong>The Magic of the Frequency Domain:</strong> Multiplication in Time is Convolution in Frequency.
                            The spectrum of a sampled signal is the original spectrum <strong>repeated</strong> every <MathEquation formula={String.raw`f_s`} /> Hz.
                        </p>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-sm text-center">
                            If these repeated spectral copies overlap, we get <strong>Aliasing</strong>.<br />
                            To prevent overlap, the gap between copies must be wide enough:
                            <MathEquation formula={String.raw`f_s \ge 2 \cdot f_{max}`} block className="text-xl my-4 text-blue-300" />
                            This is the <strong>Nyquist Condition</strong>.
                        </div>
                    </div>

                    {/* Interactive Aliasing */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Move className="text-blue-400" /> Visualizing Aliasing
                        </h3>
                        <p>
                            When <MathEquation formula={String.raw`f_s < 2f_{max}`} />, high frequencies mimic low frequencies.
                            A 1900 Hz tone sampled at 2000 Hz doesn't sound like 1900 Hz. It "folds" down to:
                        </p>
                        <MathEquation formula={String.raw`|1900 - 2000| = 100 \text{ Hz}`} block />

                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Code className="text-blue-500" /></div>
                            <h4 className="font-bold text-blue-300 mb-2">Python Perspective</h4>
                            <pre className="text-xs text-blue-200 font-mono bg-black/50 p-4 rounded-lg overflow-x-auto">
                                {`# Create a 40Hz signal
t = np.linspace(0, 1, fs)
y = np.sin(2 * np.pi * 40 * t)

# If fs=50Hz (Too low!), we perceive 10Hz
# 40Hz becomes indistinguishable from 10Hz`}
                            </pre>
                        </div>

                        <div className="flex items-center gap-4 bg-blue-600/20 p-4 rounded-lg border border-blue-500/30 cursor-pointer hover:bg-blue-600/30 transition-colors">
                            <div className="bg-blue-500 p-2 rounded-full text-white"><ArrowRight size={20} /></div>
                            <div className="text-sm font-bold text-blue-200">Go to Simulation: Try the "Wagon Wheel" Experiment</div>
                        </div>
                    </div>
                </div>

                {/* Quantization */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Grid size={24} className="text-blue-400" /> Quantization Error & SQNR
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="mb-4">
                                While Sampling slices Time, Quantization slices Amplitude. We map infinite voltages to <MathEquation formula={String.raw`2^N`} /> integers.
                                The "rounding error" creates a noise floor called <strong>Quantization Noise</strong>.
                            </p>
                            <p className="text-sm text-gray-400">
                                In 16-bit audio (CD), we have 65,536 levels. In 8-bit audio (Old consoles), we only have 256 levels, leading to a gritty sound.
                            </p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                            <p className="text-gray-400 text-xs uppercase font-bold mb-2">Signal-to-Quantization-Noise Ratio</p>
                            <MathEquation formula={String.raw`SQNR_{dB} \approx 6.02 \cdot N + 1.76`} block className="text-xl" />
                            <p className="text-xs text-center mt-2 text-gray-500">Every 1 bit adds ~6dB of clean dynamic range.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Module 2: The Frequency Domain */}
            <section className="space-y-12">
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-purple-500/20 rounded-2xl text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                        <Radio size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-1">Module 2</div>
                        <h2 className="text-4xl font-bold text-white">The Frequency Domain</h2>
                        <p className="text-purple-300 text-lg mt-2">Inner Products, Orthogonality, and the "Soul" of Signals.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* DFT Intuition */}
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">The DFT: A Correlation Machine</h3>
                            <p className="mb-4">
                                The Discrete Fourier Transform isn't magic. It's a simple <strong>Dot Product</strong>.
                                Similarly to how <MathEquation formula={String.raw`\vec{a} \cdot \vec{b}`} /> measures how aligned two vectors are, the DFT measures how aligned your signal is with a "Probe Frequency".
                            </p>
                            <MathEquation
                                formula={String.raw`X[k] = \sum_{n=0}^{N-1} x[n] \cdot e^{-j 2\pi \frac{kn}{N}}`}
                                block
                                className="text-2xl my-6"
                            />
                            <p className="text-sm text-gray-400">
                                The term <MathEquation formula={String.raw`e^{-j...}`} /> is just Euler's way of writing a rotating vector (Cos + jSin).
                                We spin this vector at speed <MathEquation formula={String.raw`k`} />. If the signal matches speed <MathEquation formula={String.raw`k`} />, a large resonance occurs.
                            </p>
                        </div>

                        {/* Phase vs Magnitude */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <h4 className="font-bold text-purple-300 mb-2">Magnitude <MathEquation formula={String.raw`|X[k]|`} /></h4>
                                <p className="text-sm">"How much" energy is at this frequency. Determines the Pitch and Timbre.</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <h4 className="font-bold text-purple-300 mb-2">Phase <MathEquation formula={String.raw`\angle X[k]`} /></h4>
                                <p className="text-sm">"Where" the wave is in its cycle. Determines the shape of transients and edges. Crucial for realism.</p>
                            </div>
                        </div>
                    </div>

                    {/* STFT Sidebar */}
                    <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Layers size={20} /> The STFT Tradeoff</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                The <strong>Heisenberg-Gabor Limit</strong> states you cannot have perfect resolution in both Time and Frequency.
                            </p>
                            <ul className="space-y-4 text-sm">
                                <li className="bg-black/30 p-3 rounded border border-white/5">
                                    <strong className="text-purple-300 block mb-1">Wide Window (e.g. 1024 samples)</strong>
                                    Good Frequency resolution (sees distinct notes).<br />
                                    Bad Time resolution (smears drums).
                                </li>
                                <li className="bg-black/30 p-3 rounded border border-white/5">
                                    <strong className="text-purple-300 block mb-1">Narrow Window (e.g. 64 samples)</strong>
                                    Good Time resolution (sharp drums).<br />
                                    Bad Frequency resolution (blurry notes).
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Module 3: Feature Architecture */}
            <section className="space-y-12">
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-green-500/20 rounded-2xl text-green-400 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                        <Brain size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-green-500 uppercase tracking-wider mb-1">Module 3</div>
                        <h2 className="text-4xl font-bold text-white">Feature Engineering</h2>
                        <p className="text-green-300 text-lg mt-2">Why raw waveforms are terrible inputs for Neural Networks.</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 relative">
                    <h3 className="text-2xl font-bold text-white mb-6">The MFCC Pipeline (Mel-Frequency Cepstral Coefficients)</h3>
                    <div className="absolute top-8 right-8 text-green-500/20"><Mic size={120} /></div>

                    <p className="mb-8 max-w-3xl text-gray-300">
                        Human hearing is not linear. We hear pitch logarithmically (Mel Scale) and loudness logarithmically (Decibels).
                        MFCCs are designed to mimic the human cochlea, extracting only what humans (and usually models) find relevant.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { step: "1", name: "Pre-emphasis", desc: "Boost High Freqs" },
                            { step: "2", name: "Framing", desc: "25ms Overlapping Windows" },
                            { step: "3", name: "Windowing", desc: "Apply Hamming Window" },
                            { step: "4", name: "FFT", desc: "Power Spectrum" },
                            { step: "5", name: "Mel Filterbank", desc: "Sum into 40-80 Mel Bands" },
                            { step: "6", name: "DCT", desc: "Decorrelate & Compress" }
                        ].map((item, i) => (
                            <div key={i} className="bg-black/40 p-4 rounded-xl border border-green-500/20 flex flex-col items-center text-center relative hover:scale-105 transition-transform group">
                                <div className="absolute -top-3 bg-green-900 border border-green-500 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-green-400">{item.step}</div>
                                <h4 className="font-bold text-green-300 text-sm mt-2">{item.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white text-xl mb-3 flex items-center gap-2"><Music className="text-green-400" /> Constant-Q Transform (CQT)</h3>
                        <p className="text-sm text-gray-300">
                            For music, linear frequency bins (FFT) are useless. Notes are exponential (<MathEquation formula={String.raw`f`} />, <MathEquation formula={String.raw`2f`} />, <MathEquation formula={String.raw`4f`} />).
                            CQT uses geometrically spaced center frequencies, so each bin corresponds to a musical semitone.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white text-xl mb-3 flex items-center gap-2"><Activity className="text-green-400" /> Wavelets</h3>
                        <p className="text-sm text-gray-300">
                            Wavelets solve the STFT resolution issue by using "Multi-resolution Analysis".
                            They use short windows for high frequencies (transients) and long windows for low frequencies (bass).
                        </p>
                    </div>
                </div>
            </section>

            {/* Module 4: Filters & Enhancement */}
            <section className="space-y-12">
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-orange-500/20 rounded-2xl text-orange-400 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                        <Filter size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">Module 4</div>
                        <h2 className="text-4xl font-bold text-white">Filters & Neural Enhancement</h2>
                        <p className="text-orange-300 text-lg mt-2">From Analog Circuits to U-Nets.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Classical Filters */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">The Convolution Theorem</h3>
                        <p className="text-gray-300">
                            Filtering a signal in the Time Domain is equivalent to multiplying it in the Frequency Domain.
                        </p>
                        <div className="bg-white/5 p-4 rounded-lg text-center border border-white/10">
                            <MathEquation formula={String.raw`y[n] = x[n] * h[n] \iff Y[k] = X[k] \cdot H[k]`} block className="text-xl" />
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-orange-300 mt-6">FIR vs IIR Filters</h4>
                            <div className="flex gap-4">
                                <div className="flex-1 bg-black/30 p-4 rounded-lg border border-orange-500/10">
                                    <div className="font-bold text-white mb-1">FIR</div>
                                    <div className="text-xs text-gray-400">Finite Impulse Response. Dependent only on input. Guaranteed Stable. Linear Phase.</div>
                                </div>
                                <div className="flex-1 bg-black/30 p-4 rounded-lg border border-orange-500/10">
                                    <div className="font-bold text-white mb-1">IIR</div>
                                    <div className="text-xs text-gray-400">Infinite Impulse Response. Recursively uses output. Analog-like. Can be Unstable.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Neural U-Nets */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Neural Source Separation (U-Net)</h3>
                        <p className="text-sm text-gray-300 mb-6">
                            Modern denoising doesn't use simple frequency cuts. It uses Deep Learning to estimate a "Mask".
                        </p>

                        {/* ASCII Diagram for U-Net */}
                        <div className="font-mono text-xs leading-none text-center bg-black/40 p-6 rounded-xl text-orange-200 border border-white/5 overflow-hidden">
                            {`
Input Spec      Encoder         Bottleneck        Decoder        Output Mask
  [=====]  ->   [===]    ->       [=]      ->      [===]    ->    [=====]
  (H x W)      (H/2 x W/2)    (Latent Rep)     (H/2 x W/2)        (H x W)
                  |                                   ^
                  |___________________________________|
                            Skip Connections
`}
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            The skip connections preserve high-frequency details (phase info) lost during compression.
                        </p>
                    </div>
                </div>
            </section>

            {/* Module 5: Generative Audio */}
            <section className="space-y-12">
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="p-5 bg-pink-500/20 rounded-2xl text-pink-400 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                        <Zap size={48} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-pink-500 uppercase tracking-wider mb-1">Module 5</div>
                        <h2 className="text-4xl font-bold text-white">Generative Audio & Diffusion</h2>
                        <p className="text-pink-300 text-lg mt-2">Dreaming in Waveforms.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">The Phase Reconstruction Problem</h3>
                        <p className="mb-4 text-gray-300">
                            Most Generative Models (like TTS) generate Mel-Spectrograms because they are easier to model than raw waves.
                            But Spectrograms throw away Phase. Converting back to audio with random phase sounds robotic and metallic (Griffin-Lim artifact).
                        </p>
                        <div className="bg-pink-900/10 border border-pink-500/20 p-6 rounded-xl">
                            <h4 className="font-bold text-pink-300 mb-2 flex items-center gap-2"><Sigma /> Neural Vocoders</h4>
                            <p className="text-sm">
                                Models like <strong>WaveNet</strong> and <strong>HiFi-GAN</strong> are trained to take a Mel-Spectrogram and "hallucinate" the missing phase information, generating high-fidelity raw audio samples.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Latent Diffusion for Audio</h3>
                        <p className="text-gray-300 mb-4">
                            How do we generate 3 minutes of music? Pixel-space diffusion is too expensive (44k samples/sec).
                        </p>
                        <ol className="list-decimal list-inside space-y-4 text-sm text-gray-300 bg-white/5 p-6 rounded-xl border border-white/10">
                            <li className="pl-2">
                                <strong className="text-white">Compression (VAE):</strong> An encoder compresses raw audio into a low-dimensional "Latent Vector".
                            </li>
                            <li className="pl-2">
                                <strong className="text-white">Diffusion (U-Net):</strong> A U-Net learns to remove noise from these latent vectors, conditioned on text prompts (CLIP).
                            </li>
                            <li className="pl-2">
                                <strong className="text-white">Reconstruction (VAE):</strong> The decoder expands the clean latent vector back into raw audio.
                            </li>
                        </ol>
                    </div>
                </div>
            </section>
        </div>
    );
};
