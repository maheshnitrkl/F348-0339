import React, { useRef, useEffect } from 'react';
import { type DataPoint, NeuralNet } from '../PlaygroundEngine';

interface DecisionBoundaryVizProps {
    data: DataPoint[];
    network: NeuralNet | null;
    gridResolution?: number; // e.g. 50x50 grid
}

export const DecisionBoundaryViz: React.FC<DecisionBoundaryVizProps> = ({ data, network, gridResolution = 40 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Render decision boundary if network exists
        if (network) {
            const stepX = w / gridResolution;
            const stepY = h / gridResolution;

            for (let i = 0; i < gridResolution; i++) {
                for (let j = 0; j < gridResolution; j++) {
                    const cx = i * stepX + stepX / 2;
                    const cy = j * stepY + stepY / 2;

                    // Map pixel to coordinate space [-1.2, 1.2]
                    const x = (cx / w) * 2.4 - 1.2;
                    const y = -((cy / h) * 2.4 - 1.2); // y inverted for canvas

                    const { activations } = network.forward([x, y]);
                    const pred = activations[activations.length - 1][0];

                    // Map prediction 0..1 to color
                    // 0 -> Orange (#fb923c), 1 -> Blue (#3b82f6)
                    const r = Math.round(251 * (1 - pred) + 59 * pred);
                    const g = Math.round(146 * (1 - pred) + 130 * pred);
                    const b = Math.round(60 * (1 - pred) + 246 * pred);
                    const a = Math.abs(pred - 0.5) * 1.5; // less opaque near boundary

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(a, 0.7)})`;
                    ctx.fillRect(i * stepX, j * stepY, stepX + 1, stepY + 1);
                }
            }
        }

        // Render Data Points
        for (const point of data) {
            // Map coordinate space to pixel
            const px = ((point.x[0] + 1.2) / 2.4) * w;
            const py = ((-point.x[1] + 1.2) / 2.4) * h;

            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fillStyle = point.y === 1 ? '#3b82f6' : '#fb923c';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

    }, [data, network, gridResolution, network?.t]); // Re-render when network training step (t) changes

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden aspect-square w-full max-w-md mx-auto relative shadow-2xl">
            <canvas 
                ref={canvasRef} 
                width={300} 
                height={300} 
                className="w-full h-full object-cover"
            />
            {(!network) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <p className="text-slate-400 font-mono text-sm">Building Network...</p>
                </div>
            )}
        </div>
    );
};
