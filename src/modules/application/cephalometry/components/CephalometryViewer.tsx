import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, Eye, EyeOff, Play, Pause } from 'lucide-react';

/**
 * Interactive 3D cephalometric landmark viewer.
 *
 * Renders a wireframe skull in patient coordinate space (X = left-right,
 * Y = anterior-posterior, Z = superior-inferior) and lets the learner rotate it,
 * pick a landmark, and inject a prediction error to watch the landmark
 * localisation loss change. Everything is a software-projected 2D canvas, so it
 * stays smooth without a WebGL context.
 */

type Vec3 = { x: number; y: number; z: number };

interface Landmark {
    id: string;
    name: string;
    region: string;
    position: Vec3;
    /** Direction the model's prediction is displaced along, when error > 0. */
    errorDir: Vec3;
}

const LANDMARKS: Landmark[] = [
    { id: 'S', name: 'Sella', region: 'Mid-cranial base', position: { x: 0, y: -18, z: 26 }, errorDir: { x: 0.4, y: -0.6, z: 0.7 } },
    { id: 'N', name: 'Nasion', region: 'Frontonasal suture', position: { x: 0, y: 82, z: 22 }, errorDir: { x: 0.1, y: 0.9, z: 0.4 } },
    { id: 'A', name: 'A-Point', region: 'Maxillary deepest point', position: { x: 0, y: 74, z: -6 }, errorDir: { x: -0.8, y: 0.5, z: 0.3 } },
    { id: 'B', name: 'B-Point', region: 'Mandibular deepest point', position: { x: 0, y: 70, z: -38 }, errorDir: { x: 0.7, y: 0.6, z: -0.4 } },
    { id: 'Pg', name: 'Pogonion', region: 'Chin prominence', position: { x: 0, y: 68, z: -78 }, errorDir: { x: 0.2, y: 0.7, z: -0.7 } },
    { id: 'GoR', name: 'Gonion R', region: 'Right mandibular angle', position: { x: 52, y: 6, z: -62 }, errorDir: { x: 0.9, y: 0.2, z: -0.3 } },
    { id: 'GoL', name: 'Gonion L', region: 'Left mandibular angle', position: { x: -52, y: 6, z: -62 }, errorDir: { x: -0.9, y: 0.2, z: -0.3 } },
    { id: 'PoR', name: 'Porion R', region: 'Right external auditory meatus', position: { x: 60, y: -14, z: 4 }, errorDir: { x: 0.7, y: -0.7, z: 0.2 } },
];

const CANVAS_W = 640;
const CANVAS_H = 540;
const DEFAULT_YAW = -0.6;
const DEFAULT_PITCH = 0.18;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Rotate a patient-space point into camera space (yaw about Z, then pitch about X). */
function rotate(p: Vec3, yaw: number, pitch: number): Vec3 {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const x1 = p.x * cy - p.y * sy;
    const y1 = p.x * sy + p.y * cy;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    return {
        x: x1,
        y: y1 * cp - p.z * sp,
        z: y1 * sp + p.z * cp,
    };
}

function ellipsoidPoint(phi: number, theta: number, r: Vec3, center: Vec3): Vec3 {
    return {
        x: center.x + r.x * Math.sin(phi) * Math.cos(theta),
        y: center.y + r.y * Math.sin(phi) * Math.sin(theta),
        z: center.z + r.z * Math.cos(phi),
    };
}

const CRANIUM = { r: { x: 72, y: 92, z: 100 }, c: { x: 0, y: 0, z: 0 } };
const FACE = { r: { x: 48, y: 55, z: 52 }, c: { x: 0, y: 44, z: -42 } };

export const CephalometryViewer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [yaw, setYaw] = useState(DEFAULT_YAW);
    const [pitch, setPitch] = useState(DEFAULT_PITCH);
    const [zoom, setZoom] = useState(2.05);
    const [selectedId, setSelectedId] = useState('N');
    const [errorMm, setErrorMm] = useState(0);
    const [showAxes, setShowAxes] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [autoRotate, setAutoRotate] = useState(false);

    const dragRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

    const selected = LANDMARKS.find((l) => l.id === selectedId) ?? LANDMARKS[0];

    /** Predicted point = ground truth + error along the landmark's error direction. */
    const predictedFor = useCallback(
        (landmark: Landmark): Vec3 => {
            const d = landmark.errorDir;
            const len = Math.hypot(d.x, d.y, d.z) || 1;
            return {
                x: landmark.position.x + (d.x / len) * errorMm,
                y: landmark.position.y + (d.y / len) * errorMm,
                z: landmark.position.z + (d.z / len) * errorMm,
            };
        },
        [errorMm]
    );

    // Metrics: per-axis component error and 3D RMSE (the quantity the model's
    // coordinate loss actually penalises).
    const metrics = (() => {
        const n = LANDMARKS.length;
        let sumSq = 0;
        let sumSqX = 0, sumSqY = 0, sumSqZ = 0;
        for (const lm of LANDMARKS) {
            const p = predictedFor(lm);
            const dx = p.x - lm.position.x;
            const dy = p.y - lm.position.y;
            const dz = p.z - lm.position.z;
            sumSq += dx * dx + dy * dy + dz * dz;
            sumSqX += dx * dx;
            sumSqY += dy * dy;
            sumSqZ += dz * dz;
        }
        return {
            mse: sumSq / n,
            rmse: Math.sqrt(sumSq / n),
            rmseX: Math.sqrt(sumSqX / n),
            rmseY: Math.sqrt(sumSqY / n),
            rmseZ: Math.sqrt(sumSqZ / n),
        };
    })();

    // ── Rendering ────────────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== CANVAS_W * dpr || canvas.height !== CANVAS_H * dpr) {
            canvas.width = CANVAS_W * dpr;
            canvas.height = CANVAS_H * dpr;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        const cx = CANVAS_W / 2;
        const cy = CANVAS_H / 2 + 26;
        const scale = zoom;

        const project = (p: Vec3) => {
            const r = rotate(p, yaw, pitch);
            return { sx: cx + r.x * scale, sy: cy - r.z * scale, depth: r.y };
        };

        // Vignette backdrop
        const bg = ctx.createRadialGradient(cx, cy, 40, cx, cy, CANVAS_H * 0.72);
        bg.addColorStop(0, 'rgba(30, 41, 59, 0.55)');
        bg.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // ── Wireframe skull ──────────────────────────────────────────────────
        const drawWire = (mesh: typeof CRANIUM, latitudes: number, longitudes: number, stroke: string, width: number) => {
            ctx.lineWidth = width;
            ctx.strokeStyle = stroke;

            for (let i = 1; i < latitudes; i++) {
                const phi = (i / latitudes) * Math.PI;
                ctx.beginPath();
                for (let j = 0; j <= longitudes; j++) {
                    const theta = (j / longitudes) * Math.PI * 2;
                    const { sx, sy } = project(ellipsoidPoint(phi, theta, mesh.r, mesh.c));
                    if (j === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.stroke();
            }

            for (let j = 0; j < longitudes; j++) {
                const theta = (j / longitudes) * Math.PI * 2;
                // Fade the back half so the front reads as "closer to the viewer".
                ctx.beginPath();
                for (let i = 0; i <= latitudes * 2; i++) {
                    const phi = (i / (latitudes * 2)) * Math.PI;
                    const { sx, sy } = project(ellipsoidPoint(phi, theta, mesh.r, mesh.c));
                    if (i === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.stroke();
            }
        };

        drawWire(CRANIUM, 10, 16, 'rgba(148, 163, 184, 0.28)', 1);
        drawWire(FACE, 7, 12, 'rgba(56, 189, 248, 0.30)', 1);

        // ── Coordinate axes ──────────────────────────────────────────────────
        if (showAxes) {
            const AXIS_LEN = 108;
            const axes: Array<{ dir: Vec3; color: string; label: string }> = [
                { dir: { x: 1, y: 0, z: 0 }, color: 'rgba(248, 113, 113, 0.85)', label: 'X' },
                { dir: { x: 0, y: 1, z: 0 }, color: 'rgba(74, 222, 128, 0.85)', label: 'Y' },
                { dir: { x: 0, y: 0, z: 1 }, color: 'rgba(96, 165, 250, 0.85)', label: 'Z' },
            ];
            const origin = project({ x: 0, y: 0, z: 0 });
            for (const axis of axes) {
                const tip = project({
                    x: axis.dir.x * AXIS_LEN,
                    y: axis.dir.y * AXIS_LEN,
                    z: axis.dir.z * AXIS_LEN,
                });
                ctx.beginPath();
                ctx.strokeStyle = axis.color;
                ctx.lineWidth = 1.4;
                ctx.setLineDash([5, 4]);
                ctx.moveTo(origin.sx, origin.sy);
                ctx.lineTo(tip.sx, tip.sy);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = axis.color;
                ctx.font = 'bold 12px ui-monospace, monospace';
                ctx.fillText(axis.label, tip.sx + 5, tip.sy - 5);
            }
        }

        // ── Landmarks (painter's order: far ones first) ──────────────────────
        const ordered = [...LANDMARKS].sort(
            (a, b) => rotate(b.position, yaw, pitch).y - rotate(a.position, yaw, pitch).y
        );

        for (const lm of ordered) {
            const gt = project(lm.position);
            const pred = project(predictedFor(lm));
            const isSelected = lm.id === selected.id;
            const depthT = (gt.depth + 110) / 220; // 0 far → 1 near
            const alpha = 0.35 + depthT * 0.65;

            // Heatmap blob around the prediction
            if (showHeatmap && errorMm > 0.05) {
                const radius = 20 + errorMm * 3.2;
                const blob = ctx.createRadialGradient(pred.sx, pred.sy, 0, pred.sx, pred.sy, radius);
                blob.addColorStop(0, `rgba(251, 146, 60, ${0.55 * alpha})`);
                blob.addColorStop(0.55, `rgba(251, 146, 60, ${0.14 * alpha})`);
                blob.addColorStop(1, 'rgba(251, 146, 60, 0)');
                ctx.fillStyle = blob;
                ctx.beginPath();
                ctx.arc(pred.sx, pred.sy, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Error vector
            if (errorMm > 0.05) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(251, 146, 60, ${0.8 * alpha})`;
                ctx.lineWidth = 1.2;
                ctx.setLineDash([3, 3]);
                ctx.moveTo(gt.sx, gt.sy);
                ctx.lineTo(pred.sx, pred.sy);
                ctx.stroke();
                ctx.setLineDash([]);

                // Predicted landmark as a cross hair
                ctx.beginPath();
                ctx.strokeStyle = `rgba(251, 146, 60, ${alpha})`;
                ctx.lineWidth = 1.6;
                ctx.moveTo(pred.sx - 5, pred.sy);
                ctx.lineTo(pred.sx + 5, pred.sy);
                ctx.moveTo(pred.sx, pred.sy - 5);
                ctx.lineTo(pred.sx, pred.sy + 5);
                ctx.stroke();
            }

            // Ground-truth landmark
            ctx.beginPath();
            ctx.fillStyle = isSelected
                ? `rgba(34, 211, 238, 1)`
                : `rgba(34, 211, 238, ${alpha})`;
            ctx.arc(gt.sx, gt.sy, isSelected ? 5.5 : 3.6, 0, Math.PI * 2);
            ctx.fill();

            if (isSelected) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
                ctx.lineWidth = 1.4;
                ctx.arc(gt.sx, gt.sy, 11, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = 'rgba(226, 232, 240, 0.95)';
                ctx.font = 'bold 12px ui-monospace, monospace';
                ctx.fillText(lm.name, gt.sx + 14, gt.sy - 10);
            }
        }

        // ── Orientation legend ───────────────────────────────────────────────
        ctx.fillStyle = 'rgba(100, 116, 139, 0.9)';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(`yaw ${(yaw * 180 / Math.PI).toFixed(0)}°  pitch ${(pitch * 180 / Math.PI).toFixed(0)}°`, 16, CANVAS_H - 16);
        ctx.fillText('drag to orbit · scroll to zoom', 16, CANVAS_H - 34);
    }, [yaw, pitch, zoom, errorMm, showAxes, showHeatmap, selected, predictedFor]);

    useEffect(() => {
        draw();
    }, [draw]);

    // Auto-rotate
    useEffect(() => {
        if (!autoRotate) return;
        let frame = 0;
        let raf = 0;
        const tick = () => {
            frame += 1;
            if (frame % 2 === 0) setYaw((y) => y + 0.006);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [autoRotate]);

    // ── Pointer interaction ──────────────────────────────────────────────────
    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { x: e.clientX, y: e.clientY, yaw, pitch };
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        setYaw(drag.yaw + dx * 0.01);
        setPitch(Math.max(-1.4, Math.min(1.4, drag.pitch + dy * 0.006)));
    };

    const endDrag = () => {
        dragRef.current = null;
    };

    // React registers wheel listeners as passive, so this must not call
    // preventDefault() — it would only warn and do nothing.
    const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        setZoom((z) => Math.max(1.1, Math.min(3.6, z - e.deltaY * 0.0015)));
    };

    const resetView = () => {
        setYaw(DEFAULT_YAW);
        setPitch(DEFAULT_PITCH);
        setZoom(2.05);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Viewer ─────────────────────────────────────────────── */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
                        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                            Patient space · anterior is +Y
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setAutoRotate(!autoRotate)}
                                title={autoRotate ? 'Stop rotation' : 'Start rotation'}
                                aria-pressed={autoRotate}
                                className={`p-1.5 rounded-lg transition-colors ${autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {autoRotate ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button
                                onClick={() => setShowAxes(!showAxes)}
                                title={showAxes ? 'Hide coordinate axes' : 'Show coordinate axes'}
                                aria-pressed={showAxes}
                                className={`p-1.5 rounded-lg transition-colors ${showAxes ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {showAxes ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                                onClick={resetView}
                                title="Reset view"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>

                    <canvas
                        ref={canvasRef}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        onWheel={onWheel}
                        style={{ width: '100%', height: 'auto', touchAction: 'none' }}
                        className="block cursor-grab active:cursor-grabbing"
                        aria-label="Wireframe skull with cephalometric landmarks. Drag to rotate."
                        role="img"
                    />
                </div>

                {/* ── Side panel ─────────────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
                            Localisation loss
                        </h4>
                        <div className="space-y-2 text-xs">
                            <Metric label="3D RMSE (mean error)" value={`${metrics.rmse.toFixed(2)} mm`} highlight />
                            <Metric label="MSE  L = 1/K Σ‖p̂ − p‖²" value={metrics.mse.toFixed(1)} />
                            <div className="h-px bg-slate-800 my-2" />
                            <Metric label="X (left-right)" value={`${metrics.rmseX.toFixed(2)} mm`} />
                            <Metric label="Y (anterior-posterior)" value={`${metrics.rmseY.toFixed(2)} mm`} />
                            <Metric label="Z (superior-inferior)" value={`${metrics.rmseZ.toFixed(2)} mm`} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                <span className="font-semibold text-white">Injected error</span>
                                <span className="font-mono text-cyan-400">{errorMm.toFixed(1)} mm</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={8}
                                step={0.5}
                                value={errorMm}
                                onChange={(e) => setErrorMm(Number(e.target.value))}
                                className="w-full accent-cyan-400"
                                aria-label="Injected prediction error in millimetres"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showHeatmap}
                                onChange={(e) => setShowHeatmap(e.target.checked)}
                                className="accent-cyan-400"
                            />
                            Show predicted heatmaps
                        </label>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
                            Selected landmark
                        </h4>
                        <div className="text-sm font-bold text-white">{selected.name}</div>
                        <div className="text-[11px] text-slate-500 mb-2">{selected.region}</div>
                        <div className="font-mono text-[11px] text-cyan-300 bg-slate-950/60 rounded-lg p-2 space-y-0.5">
                            <div>X = {round1(selected.position.x)} mm</div>
                            <div>Y = {round1(selected.position.y)} mm</div>
                            <div>Z = {round1(selected.position.z)} mm</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Landmark picker ─────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {LANDMARKS.map((lm) => (
                    <button
                        key={lm.id}
                        onClick={() => setSelectedId(lm.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            lm.id === selected.id
                                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {lm.name}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold">Try it:</span> push the injected error to 8 mm and watch
                RMSE track it exactly — the loss is a pure function of the per-landmark coordinate error, so the
                mean squared error grows quadratically while the reported millimetre error grows linearly. The
                vertical (Z) and depth (Y) axes usually dominate clinically, which is why landmark models are
                evaluated per axis rather than as a single number.
            </div>
        </div>
    );
};

const Metric: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-slate-500">{label}</span>
        <span className={`font-mono ${highlight ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>{value}</span>
    </div>
);
