import React from 'react';
import { CodeBlock } from '../../../components/CodeBlock';

/**
 * Implementation tab for the Signal Processing module (id: math-4).
 * The theory tab shows the live spectrogram/waveform labs; here we build the
 * numeric pipeline (FFT, STFT, filtering) from scratch in NumPy.
 */
export const SignalProcessingCode: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-24 text-slate-300">
            <header className="border-b border-white/5 pb-6 mb-8">
                <h2 className="text-3xl font-bold text-white">Signal Processing in Code</h2>
                <p className="text-slate-400 mt-2">
                    The visualizations showed frequency, time-frequency and filtering as pictures. This tab
                    builds them as numbers: a DFT with the FFT algorithm, a windowed STFT (the spectrogram),
                    and classical FIR filtering.
                </p>
            </header>

            <h3 className="text-xl font-bold text-white mb-2">1. FFT: from raw samples to a spectrum</h3>
            <p className="mb-3">
                The Fourier transform decomposes a signal into its constituent frequencies. The output
                is complex-valued; plotting its magnitude reveals which frequencies dominate. This is
                exactly what <strong>SpectrumViz</strong> renders for you.
            </p>
            <CodeBlock
                language="python"
                title="fft_demo.py"
                code={`import numpy as np

fs = 500                       # sampling rate (Hz)
t = np.arange(0, 2.0, 1 / fs)  # 2 seconds of samples

# A signal: 50 Hz + 120 Hz hum + noise (classic biomedical artifact pattern)
x = np.sin(2 * np.pi * 50 * t) + 0.7 * np.sin(2 * np.pi * 120 * t) \\
    + 0.5 * np.random.default_rng(0).standard_normal(len(t))

def compute_spectrum(x, fs):
    N = len(x)
    X = np.fft.rfft(x)                       # real-input FFT
    freqs = np.fft.rfftfreq(N, d=1 / fs)     # frequency axis in Hz
    magnitude = np.abs(X) / N * 2            # normalize to amplitude
    return freqs, magnitude

freqs, mag = compute_spectrum(x, fs)
# Peaks land exactly at 50 and 120 Hz:
for f, m in zip(freqs, mag):
    if m > 0.4:
        print(f"strong component at ~{f:.1f} Hz")`}
            />

            <h3 className="text-xl font-bold text-white mb-2">2. STFT → spectrogram, cell by cell</h3>
            <p className="mb-3">
                The FFT loses <em>when</em> each frequency occurred. The short-time Fourier transform
                runs the FFT over sliding windows, stacking spectra vertically — the heatmap the
                <strong> SpectrogramViz</strong> draws in the Simulation tab.
            </p>
            <CodeBlock
                language="python"
                title="stft.py"
                code={`import numpy as np

def stft(x, fs, window_sec=0.032, hop_frac=0.25):
    n_win = int(window_sec * fs)             # window length
    win = np.hanning(n_win)                  # window function (Hann)
    hop = int(n_win * hop_frac)              # step between frames

    frames = []
    for start in range(0, len(x) - n_win, hop):
        frame = x[start:start + n_win] * win
        frames.append(np.abs(np.fft.rfft(frame)))

    spec = np.array(frames).T                # (freq bins, time frames)
    freqs = np.fft.rfftfreq(n_win, 1 / fs)
    times = np.arange(spec.shape[1]) * hop / fs
    return freqs, times, 20 * np.log10(spec + 1e-12)   # in dB

# Chirp: frequency sweeping upward — the spectrogram shows a rising ridge
t = np.arange(0, 4, 1 / 500)
chirp = np.sin(2 * np.pi * (50 * t + 20 * t**2))
f, tt, spectrogram_db = stft(chirp, fs=500)
print(spectrogram_db.shape)   # e.g. (257, 99): a time-frequency image`}
            />

            <h3 className="text-xl font-bold text-white mb-2">3. FIR filtering — time domain ↔ frequency domain</h3>
            <p className="mb-3">
                The convolution theorem from Module 7: filtering in time = multiplying the spectrum.
                A moving-average filter is the simplest FIR low-pass; its frequency response is a
                <span className="font-mono text-white"> sinc</span> function.
            </p>
            <CodeBlock
                language="python"
                title="fir_filter.py"
                code={`import numpy as np

def moving_average_fir(x, k):
    """k-tap FIR low-pass via convolution theorem (implemented directly)."""
    kernel = np.ones(k) / k
    # np.convolve with 'same' keeps the output the same length as x
    return np.convolve(x, kernel, mode='same')

def bandpass_mask(fs, n, low_hz, high_hz):
    """Zero the FFT bins outside [low, high]; then inverse-FFT back to time."""
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(n, 1 / fs)
    mask = (freqs >= low_hz) & (freqs <= high_hz)
    return np.fft.irfft(X * mask, n)

# Denoise the 50/120 Hz signal by keeping only the 1-40 Hz band:
fs, n = 500, len(x)
filtered = bandpass_mask(fs, n, low_hz=1, high_hz=40)
# The 120 Hz hum vanished; the 50 Hz line remains (it is inside the band).`}
            />

            <h3 className="text-xl font-bold text-white mb-2">4. What all of this buys a neural network</h3>
            <p className="mb-3">
                The pipeline above is precisely how 1D biomedical data is prepared for CNNs and
                Transformers: a time series becomes an image (a spectrogram), which an off-the-shelf
                vision model can process.
            </p>
            <CodeBlock
                language="python"
                title="signal_to_image.py"
                code={`import numpy as np
import torch

# 1. Signal -> spectrogram "image" (from section 2)
f, tt, S_db = stft(ecg_signal, fs=250)          # (freqs, times)
image = torch.tensor(S_db, dtype=torch.float32)[None]   # (1, F, T)
#    ^ single-channel like a grayscale CNN input

# 2. A vanilla 1D-CNN on the spectral view of an ECG
model = torch.nn.Sequential(
    torch.nn.Conv1d(1, 32, kernel_size=15, padding='same'),
    torch.nn.ReLU(),
    torch.nn.MaxPool1d(4),
    torch.nn.Conv1d(32, 64, kernel_size=7, padding='same'),
    torch.nn.AdaptiveAvgPool1d(1),
    torch.nn.Flatten(),
    torch.nn.Linear(64, 2),     # classify: normal vs arrhythmia
)
logits = model(image)
print(logits.shape)             # torch.Size([1, 2])`}
            />
            <p className="text-sm text-slate-500 mt-2">
                Continue to the Medical Image Processing module, where the same 2D idea is lifted to
                volumes with the Radon transform and 3D U-Nets.
            </p>
        </div>
    );
};
