import React, { useEffect, useRef } from 'react';

interface SpectrogramVizProps {
    history: number[][]; // Array of magnitude arrays (history[0] is oldest)
    colorTheme?: 'fire' | 'ocean';
    height?: number;
}

export const SpectrogramViz: React.FC<SpectrogramVizProps> = ({
    history,
    colorTheme = 'fire',
    height = 200
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

        // Need at least one history entry
        if (history.length === 0) return;

        const numTimeSteps = history.length;
        const numFreqBins = history[0].length;

        const cellWidth = rect.width / numTimeSteps;
        const cellHeight = height / numFreqBins;

        // Find global max for normalization (or local? global usually better for stability)
        // For rolling spectrogram, maybe fix a reasonable max
        const maxVal = 1.0; // Assuming normalized input or reasonable scale

        history.forEach((spectrum, tIndex) => {
            spectrum.forEach((mag, fIndex) => {
                // Invert frequency axis so low freq is at bottom
                const y = height - (fIndex + 1) * cellHeight;
                const x = tIndex * cellWidth;

                const intensity = Math.min(mag / maxVal, 1);

                // Color mapping
                let fillStyle = '';
                if (colorTheme === 'fire') {
                    // Black -> Red -> Yellow -> White
                    fillStyle = `hsl(${intensity * 60}, 100%, ${intensity * 50}%)`;
                } else {
                    // Black -> Blue -> Cyan -> White
                    fillStyle = `hsl(${180 + intensity * 60}, 100%, ${intensity * 50}%)`;
                }

                ctx.fillStyle = fillStyle;
                // Draw slightly larger to avoid gaps
                ctx.fillRect(x, y, cellWidth + 0.5, cellHeight + 0.5);
            });
        });

    }, [history, colorTheme, height]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full bg-black/90 rounded-lg border border-white/5"
            style={{ height }}
        />
    );
};
