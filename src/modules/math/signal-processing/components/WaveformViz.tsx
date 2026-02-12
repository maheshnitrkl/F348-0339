import React, { useEffect, useRef } from 'react';

interface WaveformVizProps {
    data: number[];
    color?: string;
    height?: number;
}

export const WaveformViz: React.FC<WaveformVizProps> = ({
    data,
    color = '#22d3ee', // cyan-400
    height = 150
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = height * dpr;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, height);

        // Styling
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        const step = rect.width / data.length;
        const mid = height / 2;
        const scale = height / 2.5; // Leave some margin

        // Draw waveform
        for (let i = 0; i < data.length; i++) {
            const x = i * step;
            const y = mid - (data[i] * scale);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;

    }, [data, color, height]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full bg-black/40 rounded-lg border border-white/5"
            style={{ height }}
        />
    );
};
