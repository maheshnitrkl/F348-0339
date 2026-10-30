import React from 'react';
import { CodeBlock } from '../../../components/CodeBlock';

/**
 * Implementation tab for the Training Optimization module (id: adv-5).
 * The theory tab visualizes GPU memory and optimizer behaviour; here is the
 * PyTorch behind it: gradient checkpointing, mixed precision with loss scaling,
 * and a cosine LR schedule with warmup.
 */
export const DLEfficiencyPython: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-24 text-slate-300">
            <header className="border-b border-white/5 pb-6 mb-8">
                <h2 className="text-3xl font-bold text-white">Efficient Training in Code</h2>
                <p className="text-slate-400 mt-2">
                    The theory tab showed VRAM bars and optimizer races. This tab is what you would
                    actually write: activation checkpointing, mixed-precision autocast with gradient
                    scaling, and a production-style learning-rate schedule.
                </p>
            </header>

            <h3 className="text-xl font-bold text-white mb-2">1. Gradient checkpointing (trade compute for memory)</h3>
            <p className="mb-3">
                Ditch the stored activations of the forward pass and recompute them during the backward
                pass. Memory drops from <span className="font-mono text-white">O(N)</span> toward
                <span className="font-mono text-white"> O(√N)</span> segments at ~30% extra compute.
            </p>
            <CodeBlock
                language="python"
                title="checkpointing.py"
                code={`import torch
import torch.nn as nn
from torch.utils.checkpoint import checkpoint

class CheckpointedBlock(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.block = nn.Sequential(
            nn.Linear(dim, 4 * dim), nn.GELU(), nn.Linear(4 * dim, dim),
        )

    def forward(self, x):
        # use_reentrant=False lets autograd track recompute + grad correctly
        return checkpoint(self.block, x, use_reentrant=False)

model = nn.Sequential(*[CheckpointedBlock(512) for _ in range(8)])
x = torch.randn(8, 1024, 512, requires_grad=True)
out = model(x)
loss = out.square().mean()
loss.backward()        # hidden activations are recomputed here, not stored`}
            />

            <h3 className="text-xl font-bold text-white mb-2">2. Mixed precision: FP16 compute, FP32 master weights</h3>
            <p className="mb-3">
                Matrix multiplies run in half precision (2× throughput, half memory), while optimizer
                state and gradients that need the dynamic range stay FP32. Loss scaling prevents the
                half-precision gradients from underflowing to zero.
            </p>
            <CodeBlock
                language="python"
                title="amp.py"
                code={`import torch

model, optimizer = build_model(), build_optimizer()
scaler = torch.amp.GradScaler()          # dynamic loss scaling

for X, y in epochs(loader):
    optimizer.zero_grad(set_to_none=True)

    # 1. Autocast picks fp16 for matmul/convs, fp32 where it matters
    with torch.autocast(device_type='cuda', dtype=torch.float16):
        loss = loss_fn(model(X), y)

    # 2. scale loss, backward, unscale — then step
    scaler.scale(loss).backward()
    scaler.step(optimizer)               # skips step if grads had infs/nans
    scaler.update()                       # adapts the scale factor`}
            />

            <h3 className="text-xl font-bold text-white mb-2">3. Modern optimizer setup: AdamW + cosine warmup</h3>
            <p className="mb-3">
                The config every transformer training run uses: decoupled weight decay in AdamW,
                a linear warmup so early large gradients do not destabilize training, then a cosine
                decay to zero. Match this against the schedules plotted by <strong>LRSchedulerGraph</strong>.
            </p>
            <CodeBlock
                language="python"
                title="schedule.py"
                code={`import math
import torch

def lr_lambda(step):
    warmup = 2000
    total = 100_000
    if step < warmup:                       # linear warmup
        return step / max(1, warmup)
    # cosine decay from 1.0 -> 0.0 after warmup
    progress = (step - warmup) / max(1, total - warmup)
    return 0.5 * (1 + math.cos(math.pi * min(progress, 1.0)))

scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)

for step, batch in enumerate(loader):
    ...
    optimizer.step()
    scheduler.step()                        # called once per step, not epoch`}
            />

            <h3 className="text-xl font-bold text-white mb-2">4. Gradient accumulation — big batches on small GPUs</h3>
            <p className="mb-3">
                When the desired batch size does not fit in memory, accumulate several micro-batches
                before stepping: the effective batch grows without the memory of it.
            </p>
            <CodeBlock
                language="python"
                title="accumulation.py"
                code={`accum_steps = 8                      # effective batch = 8 * micro_batch

for step, (X, y) in enumerate(loader):
    with torch.autocast('cuda', dtype=torch.bfloat16):   # bf16: no scaler needed
        loss = loss_fn(model(X), y) / accum_steps        # normalize per micro-batch
    scaler.scale(loss).backward()

    if (step + 1) % accum_steps == 0:
        scaler.step(optimizer)
        scaler.update()
        optimizer.zero_grad(set_to_none=True)
        scheduler.step()`}
            />
            <p className="text-sm text-slate-500 mt-2">
                Open the Simulation tab to race SGD, Adam and AdamW side-by-side on the 3D loss surface.
            </p>
        </div>
    );
};
