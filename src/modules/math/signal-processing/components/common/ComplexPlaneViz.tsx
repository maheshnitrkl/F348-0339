
import React, { useEffect, useRef } from 'react';

interface ComplexPoint {
    re: number;
    im: number;
    label?: string;
    color?: string;
    type?: 'pole' | 'zero' | 'point';
}

interface ComplexPlaneVizProps {
    width?: number;
    height?: number;
    points?: ComplexPoint[];
    showUnitCircle?: boolean;
    animatePhasor?: boolean; // If true, draws a rotating phasor
    frequency?: number; // Hz, for phasor animation
    phasorColor?: string;
}

export const ComplexPlaneViz: React.FC<ComplexPlaneVizProps> = ({
    width = 300,
    height = 300,
    points = [],
    showUnitCircle = true,
    animatePhasor = false,
    frequency = 1,
    phasorColor = '#22d3ee', // cyan-400
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    /* -------------------------------------------------------------------------- */
    /*                               Draw Function                                */
    /* -------------------------------------------------------------------------- */
    const draw = (time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and set background
        ctx.clearRect(0, 0, width, height);

        // Coordinate System Setup
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) / 3; // Unit circle radius is 1/3 of view

        // Helper to transform math coords to canvas coords
        const toCanvas = (re: number, im: number) => ({
            x: centerX + re * scale,
            y: centerY - im * scale // Canvas Y is inverted
        });

        /* ------------------------------ Grid & Axes ----------------------------- */
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 1;

        // X-Axis (Real)
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Y-Axis (Imaginary)
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.font = '10px monospace';
        ctx.fillText('Re', width - 20, centerY + 15);
        ctx.fillText('Im', centerX + 10, 15);

        /* ------------------------------ Unit Circle ----------------------------- */
        if (showUnitCircle) {
            ctx.strokeStyle = '#475569'; // slate-600 dashed
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, scale, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }

        /* -------------------------------- Points -------------------------------- */
        points.forEach(p => {
            const { x, y } = toCanvas(p.re, p.im);
            ctx.lineWidth = 2;

            if (p.type === 'pole') {
                // Draw X
                ctx.strokeStyle = p.color || '#ef4444'; // red-500
                const size = 6;
                ctx.beginPath();
                ctx.moveTo(x - size, y - size);
                ctx.lineTo(x + size, y + size);
                ctx.moveTo(x + size, y - size);
                ctx.lineTo(x - size, y + size);
                ctx.stroke();
            } else if (p.type === 'zero') {
                // Draw O
                ctx.strokeStyle = p.color || '#3b82f6'; // blue-500
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.stroke();
            } else {
                // Dot
                ctx.fillStyle = p.color || '#fbbf24'; // amber-400
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }

            if (p.label) {
                ctx.fillStyle = '#e2e8f0';
                ctx.fillText(p.label, x + 8, y - 8);
            }
        });

        /* -------------------------- Phasor Animation ------------------------- */
        if (animatePhasor) {
            // Angle theta = 2 * pi * f * t
            // t is in seconds
            const theta = 2 * Math.PI * frequency * time;

            // Phasor tip on unit circle (for this demo, assume magnitude 1)
            const tipRe = Math.cos(theta);
            const tipIm = Math.sin(theta);
            const tip = toCanvas(tipRe, tipIm);

            // Draw Vector
            ctx.strokeStyle = phasorColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(tip.x, tip.y);
            ctx.stroke();

            // Draw Tip Dot
            ctx.fillStyle = phasorColor;
            ctx.beginPath();
            ctx.arc(tip.x, tip.y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Draw Projection to Real Axis (Cos)
            ctx.strokeStyle = `${phasorColor}50`; // Transparent
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(tip.x, tip.y);
            ctx.lineTo(tip.x, centerY);
            ctx.stroke();

            // Highlight Cosine Value on Real Axis
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(tip.x, centerY, 3, 0, 2 * Math.PI);
            ctx.fill();

            ctx.setLineDash([]);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                               Animation Loop                               */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Handle scaling
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        let animationFrameId: number;
        let startTime = performance.now();

        const animate = (now: number) => {
            const dt = (now - startTime) / 1000; // Time in seconds
            // If just animating phasor, we use accumulated time or just raw time?
            // Raw time is better for consistency

            draw(dt);

            if (animatePhasor) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                // Draw once if not animating
                draw(0);
            }
        };

        if (animatePhasor) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            draw(0);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [width, height, points, showUnitCircle, animatePhasor, frequency, phasorColor]);

    return (
        <canvas
            ref={canvasRef}
            className="bg-black/40 rounded-lg border border-white/5"
            style={{ width, height }}
        />
    );
};
