import React, { useEffect, useRef } from 'react';

interface SpectrumVizProps {
    magnitudes: number[];
    labels?: number[]; // Frequencies
    color?: string;
    height?: number;
    maxFreq?: number;
}

export const SpectrumViz: React.FC<SpectrumVizProps> = ({
    magnitudes,
    color = '#a78bfa', // violet-400
    height = 150,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = height * dpr;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, height);

        // Draw bars
        const barWidth = rect.width / magnitudes.length;
        const maxMag = Math.max(...magnitudes, 0.001); // Avoid div by zero

        magnitudes.forEach((mag, i) => {
            const barHeight = (mag / maxMag) * (height * 0.9);
            const x = i * barWidth;
            const y = height - barHeight;

            // Gradient fill
            const gradient = ctx.createLinearGradient(0, height, 0, y);
            gradient.addColorStop(0, `${color}20`); // Transparent at bottom
            gradient.addColorStop(1, color);

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });

    }, [magnitudes, color, height]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full bg-black/40 rounded-lg border border-white/5"
            style={{ height }}
        />
    );
};
