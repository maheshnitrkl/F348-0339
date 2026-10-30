import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

/**
 * Implementation tab for the Medical Imaging module.
 * The Theory tab shows the interactive FFT / Radon / MRI demos; here is the
 * numeric pipeline behind them: windowing (HU), the Fourier slice theorem, a
 * mini Radon/back-projection, and the 3D U-Net heatmap head used for landmarks.
 */
export const MedicalImagingCode: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-24 text-slate-300">
            <header className="border-b border-white/5 pb-6 mb-8">
                <h2 className="text-3xl font-bold text-white">Medical Imaging in Code</h2>
                <p className="text-slate-400 mt-2">
                    The demos in the Simulation tab (FFT, filters, Radon transform, volume renderer) are
                    built on a small numeric core. These snippets reproduce each demo computationally.
                </p>
            </header>

            <h3 className="text-xl font-bold text-white mb-2">1. DICOM windowing: Hounsfield units → image</h3>
            <p className="mb-3">
                A CT volume is stored in Hounsfield units (HU): air ≈ −1000, water 0, bone ≈ +1000.
                A <strong>window level/width</strong> maps a chosen HU range onto [0, 255] — the reason
                you can &ldquo;peel&rdquo; skin and show bone in the volume renderer.
            </p>
            <CodeBlock
                language="python"
                title="windowing.py"
                code={`import numpy as np
import pydicom

ds = pydicom.dcmread("slice.dcm")
vol = ds.pixel_array.astype(np.float32) * ds.RescaleSlope + ds.RescaleIntercept

def window(volume, center, width):
    lo, hi = center - width / 2, center + width / 2
    clipped = np.clip(volume, lo, hi)
    return ((clipped - lo) / (hi - lo) * 255).astype(np.uint8)

soft_tissue = window(vol, center=50,  width=350)   # brain / organs
bone        = window(vol, center=500, width=2000)   # skull detail
print(soft_tissue.shape, bone.dtype)`}
            />

            <h3 className="text-xl font-bold text-white mb-2">2. The Fourier slice theorem (why CT works)</h3>
            <p className="mb-3">
                A 1D Fourier transform of a projection gives you <em>one radial slice</em> through the
                2D Fourier transform of the body. Rotate the detector, collect slices from every
                angle, fill in the 2D spectrum, and inverse-FFT — that is CT reconstruction.
            </p>
            <CodeBlock
                language="python"
                title="slice_theorem.py"
                code={`import numpy as np

from skimage.transform import rotate

def fourier_slice(img_2d, angle_deg):
    """The slice theorem: FFT of a projection == radial line in 2D spectrum."""
    # 1. Project: sum intensities along one axis after rotation -> 1D signal
    rotated = rotate(img_2d, angle_deg, resize=False, mode='constant', cval=0.0)
    projection = rotated.sum(axis=0)

    # 2. The 1D FFT of that projection IS a radial cut of F(x, y)
    radial = np.fft.fft(projection)
    return radial

# DeMoivre-free sanity check: image with one bright disk
img = np.zeros((128, 128))
yy, xx = np.mgrid[-64:64, -64:64]
img[np.hypot(yy, xx) < 20] = 1.0

F = np.fft.fft2(img)
slice_0deg = fourier_slice(img, angle_deg=0)
print(np.isclose(np.abs(F[0, :]), np.abs(slice_0deg), atol=1e-6).all())
# -> True: one projection = one line through frequency space`}
            />

            <h3 className="text-xl font-bold text-white mb-2">3. Radon transform & back-projection</h3>
            <p className="mb-3">
                Collect projections at every angle (the <em>Radon transform</em>) and the simplest
                reconstruction is back-projection: smear each projection across the image and average.
                Real CT adds a ramp filter — &ldquo;filtered back-projection&rdquo; — to undo blurring.
            </p>
            <CodeBlock
                language="python"
                title="radon.py"
                code={`import numpy as np
from skimage.transform import radon, iradon

phantom = np.zeros((128, 128)); yy, __ = np.mgrid[-64:64, -64:64]
phantom[np.hypot(yy, __) < 40] = 0.6
phantom[np.hypot(yy, __ - 20) < 12] = 1.0

angles = np.linspace(0, 180, 180, endpoint=False)
sinogram = radon(phantom, theta=angles, circle=False)      # (128, 180)

# Simple back-projection (blurred):
naive  = iradon(sinogram, theta=angles, circle=False, filter_name=None)
# Ramp-filtered back-projection (what scanners do):
fda    = iradon(sinogram, theta=angles, circle=False, filter_name='ramp')

print("sinogram columns = angles, rows = detector bins:", sinogram.shape)`}
            />

            <h3 className="text-xl font-bold text-white mb-2">4. 3D landmark heatmaps: the U-Net head</h3>
            <p className="mb-3">
                Cephalometric landmark detection regresses 3D coordinates through heatmaps: a 3D U-Net
                predicts, per landmark, a Gaussian-centered probability blob whose peak is the landmark.
                MSE on heatmaps + coordinates trains the head; the CephalometryViewer tab renders the
                predicted peaks.
            </p>
            <CodeBlock
                language="python"
                title="unet3d_head.py"
                code={`import torch
import torch.nn as nn

class HeatmapHead(nn.Module):
    """Per-landmark Gaussian heatmap regression on CBCT volumes (simplified)."""
    def __init__(self, in_ch=1, n_landmarks=16):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv3d(in_ch, 32, 3, padding=1), nn.ReLU(), nn.MaxPool3d(2),
            nn.Conv3d(32, 64, 3, padding=1),    nn.ReLU(), nn.MaxPool3d(2),
        )
        self.bottleneck = nn.Conv3d(64, 128, 3, padding=1)
        self.decoder    = nn.ConvTranspose3d(128, 64, 2, stride=2)
        self.refine     = nn.Conv3d(64, 32, 3, padding=1)
        self.head       = nn.Conv3d(32, n_landmarks, 1)  # one heatmap per landmark

    def forward(self, volume):                      # (B, 1, D, H, W)
        enc = self.encoder(volume)
        dec = self.decoder(self.bottleneck(enc))
        return self.head(torch.relu(self.refine(dec)))

# Coordinate recovery: (softmax over the voxel grid, then expectation)
class SoftArgMax3D(nn.Module):
    def forward(self, heatmap):
        B, L, D, H, W = heatmap.shape
        weights = torch.softmax(heatmap.view(B, L, -1), dim=-1).view(B, L, D, H, W)
        grid_d, grid_h, grid_w = torch.meshgrid(
            torch.arange(D), torch.arange(H), torch.arange(W), indexing='ij')
        coords = [(weights * g).sum(dim=(2, 3, 4)) for g in (grid_d, grid_h, grid_w)]
        return torch.stack(coords, dim=-1)          # (B, L, 3): xyz per landmark

vol = torch.randn(2, 1, 64, 64, 64)
heatmaps = HeatmapHead()(vol)
print('predicted landmark xyz:', SoftArgMax3D()(heatmaps).shape)  # (2, 16, 3)`}
            />
            <p className="text-sm text-slate-500 mt-2">
                Open the Simulation tab to watch these quantities visually: the FFT of a brain slice,
                the rotating Radon sinogram, and live landmark coordinates on the 3D volume.
            </p>
        </div>
    );
};
