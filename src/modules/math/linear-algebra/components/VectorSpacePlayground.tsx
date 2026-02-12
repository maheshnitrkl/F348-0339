import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, RefreshCw, Grid, ArrowRight } from 'lucide-react';

interface Vector {
    id: string;
    x: number;
    y: number;
    color: string;
    label: string;
}

const COLORS = ['#00D9FF', '#B794F6', '#FFD700', '#FF6B9D', '#4ADE80'];
const GRID_SIZE = 20; // mathematical units (-10 to 10)
const VIEWBOX_SIZE = 600;
const UNIT_PX = VIEWBOX_SIZE / GRID_SIZE;
const CENTER = VIEWBOX_SIZE / 2;

export const VectorSpacePlayground: React.FC = () => {
    const [vectors, setVectors] = useState<Vector[]>([
        { id: 'v1', x: 2, y: 1, color: COLORS[0], label: 'v₁' },
        { id: 'v2', x: 1, y: 3, color: COLORS[1], label: 'v₂' },
    ]);
    const [showSum, setShowSum] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);

    // Convert Math coordinates to SVG coordinates
    const toSVG = (x: number, y: number) => ({
        x: CENTER + x * UNIT_PX,
        y: CENTER - y * UNIT_PX,
    });

    // Convert SVG coordinates to Math coordinates
    const toMath = (svgX: number, svgY: number) => ({
        x: (svgX - CENTER) / UNIT_PX,
        y: -(svgY - CENTER) / UNIT_PX,
    });


    const addVector = () => {
        if (vectors.length >= 5) return;
        const id = `v${vectors.length + 1}`;
        setVectors([...vectors, {
            id,
            x: Math.round(Math.random() * 4 - 2),
            y: Math.round(Math.random() * 4 - 2),
            color: COLORS[vectors.length % COLORS.length],
            label: `v${vectors.length + 1}` // Subscript logic could be added
        }]);
    };

    const removeVector = (id: string) => {
        setVectors(vectors.filter(v => v.id !== id));
    };

    // Calculate sum vector
    const sumVector = vectors.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 });

    return (
        <div className="flex flex-col gap-4 p-4 bg-[#0a0a0f] rounded-xl border border-white/10 min-h-[700px]" ref={containerRef}>
            {/* Header & Controls - Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Vector Playground
                    </h2>
                    <p className="text-xs text-gray-400">
                        Drag heads to edit.
                    </p>
                </div>

                {/* Toggles */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showGrid ? 'bg-white/10 text-white' : 'bg-transparent text-gray-500 border border-white/10'}`}
                    >
                        <Grid size={14} /> Grid
                    </button>
                    <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${snapToGrid ? 'bg-white/10 text-white' : 'bg-transparent text-gray-500 border border-white/10'}`}
                    >
                        <RefreshCw size={14} /> Snap
                    </button>
                    <button
                        onClick={() => setShowSum(!showSum)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showSum ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-transparent text-gray-500 border border-white/10'}`}
                    >
                        <Plus size={14} /> Show Sum
                    </button>
                </div>

                {/* Vector Controls */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {vectors.map((v) => (
                        <div key={v.id} className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded border border-white/10 shrink-0">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                            <span className="font-mono text-xs font-bold text-white">{v.label}</span>
                            <span className="font-mono text-[10px] text-gray-400">({v.x},{v.y})</span>
                            {vectors.length > 1 && (
                                <button onClick={() => removeVector(v.id)} className="text-gray-500 hover:text-red-400">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                    {vectors.length < 5 && (
                        <button onClick={addVector} className="px-2 py-1 border border-dashed border-white/20 text-gray-400 rounded hover:text-white text-xs">
                            + Add
                        </button>
                    )}
                </div>
            </div>

            {/* Info Bar */}
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded text-xs text-blue-200">
                <ArrowRight size={14} />
                <span className="font-bold">Resultant:</span>
                <span className="font-mono opacity-80">
                    {showSum ? `∑v = (${sumVector.x.toFixed(1)}, ${sumVector.y.toFixed(1)})` : "Enable 'Show Sum' to see result"}
                </span>
            </div>

            {/* SVG Canvas - flexible size */}
            <div className="flex-1 border border-white/10 rounded-xl overflow-hidden relative min-h-[600px]">
                <div className="absolute top-2 right-2 text-[10px] text-gray-500 font-mono z-30">v3.0 - Resizable</div>
                <div className="absolute inset-0 bg-black/60">
                    <svg
                        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="w-full h-full"
                        style={{ cursor: 'crosshair' }}
                    >
                        <defs>
                            <pattern id="grid" width={UNIT_PX} height={UNIT_PX} patternUnits="userSpaceOnUse">
                                <path d={`M ${UNIT_PX} 0 L 0 0 0 ${UNIT_PX}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            </pattern>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#fff" fillOpacity="0.5" />
                            </marker>
                            {vectors.map(v => (
                                <marker key={`head-${v.id}`} id={`head-${v.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill={v.color} />
                                </marker>
                            ))}
                        </defs>

                        {/* Grid */}
                        {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}

                        {/* Axes */}
                        <line x1={0} y1={CENTER} x2={VIEWBOX_SIZE} y2={CENTER} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                        <line x1={CENTER} y1={0} x2={CENTER} y2={VIEWBOX_SIZE} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                        {/* Resultant Vector (Tip-to-Tail logic visualization) */}
                        {showSum && vectors.length > 0 && (
                            <>
                                {/* Path logic: start at origin, add v1, then add v2 to that point, etc. */}
                                {vectors.map((v, i) => {
                                    // Calculate cumulative start point
                                    let startX = 0;
                                    let startY = 0;
                                    for (let j = 0; j < i; j++) {
                                        startX += vectors[j].x;
                                        startY += vectors[j].y;
                                    }
                                    const endX = startX + v.x;
                                    const endY = startY + v.y;

                                    const p1 = toSVG(startX, startY);
                                    const p2 = toSVG(endX, endY);

                                    return (
                                        <line
                                            key={`shadow-${i}`}
                                            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                            stroke={v.color} strokeWidth="1" strokeDasharray="4,4" opacity="0.5"
                                        />
                                    );
                                })}

                                {/* Actual Sum Vector */}
                                <line
                                    x1={CENTER} y1={CENTER}
                                    x2={toSVG(sumVector.x, sumVector.y).x}
                                    y2={toSVG(sumVector.x, sumVector.y).y}
                                    stroke="#4ADE80" strokeWidth="4"
                                    markerEnd="url(#head-v1)" // Hacky reuse or need specific green marker
                                    opacity="0.8"
                                />
                                <text
                                    x={toSVG(sumVector.x, sumVector.y).x + 10}
                                    y={toSVG(sumVector.x, sumVector.y).y - 10}
                                    fill="#4ADE80" fontSize="14" fontWeight="bold"
                                >
                                    ∑v
                                </text>
                            </>
                        )}

                        {/* Interactive Vectors */}
                        {vectors.map((v) => {
                            const start = toSVG(0, 0);
                            const end = toSVG(v.x, v.y);

                            return (
                                <g key={v.id}>
                                    {/* Interaction Area (Invisible thick line) */}
                                    <motion.line
                                        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                        stroke="transparent" strokeWidth="20"
                                        style={{ cursor: 'pointer' }}
                                    />

                                    {/* Visible Vector Body */}
                                    <line
                                        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                                        stroke={v.color} strokeWidth="3"
                                        markerEnd={`url(#head-${v.id})`}
                                    />

                                    {/* Draggable Head Handle */}
                                    <motion.circle
                                        cx={end.x} cy={end.y} r="12"
                                        fill={v.color} fillOpacity="0.2"
                                        stroke={v.color} strokeWidth="2"
                                        // This circle is just visual now, overlay handles dragging
                                        style={{ cursor: 'grab' }}
                                    />

                                    <text
                                        x={end.x + 10} y={end.y - 10}
                                        fill={v.color} fontSize="14" fontWeight="bold"
                                    >
                                        {v.label}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Invisible overlay for drag handling - cleaner than framer motion on individual balls for coord mapping */}
                        <rect
                            width="100%" height="100%" fill="transparent"
                        />
                    </svg>

                    <DraggableOverlay
                        vectors={vectors}
                        setVectors={setVectors}
                        toMath={toMath}
                        toSVG={toSVG}
                        snap={snapToGrid}
                        viewSize={VIEWBOX_SIZE}
                    />
                </div>
            </div>
        </div>
    );
};

interface DraggableOverlayProps {
    vectors: Vector[];
    setVectors: React.Dispatch<React.SetStateAction<Vector[]>>;
    toMath: (x: number, y: number) => { x: number, y: number };
    toSVG: (x: number, y: number) => { x: number, y: number };
    snap: boolean;
    viewSize: number;
}

// Helper component to handle dragging logic cleanly
const DraggableOverlay: React.FC<DraggableOverlayProps> = ({ vectors, setVectors, toMath, toSVG, snap, viewSize }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const getSVGCoordinates = (e: React.PointerEvent, rect: DOMRect) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return {
            x: x * (viewSize / rect.width),
            y: y * (viewSize / rect.height)
        };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;

        const svgPos = getSVGCoordinates(e, rect);
        const m = toMath(svgPos.x, svgPos.y);

        // Find clicked vector head
        const clicked = vectors.find((v) => {
            const dist = Math.sqrt(Math.pow(v.x - m.x, 2) + Math.pow(v.y - m.y, 2));
            return dist < 0.8;
        });

        if (clicked) {
            setActiveId(clicked.id);
            (e.target as Element).setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!activeId) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;

        const svgPos = getSVGCoordinates(e, rect);
        const m = toMath(svgPos.x, svgPos.y);

        if (snap) {
            m.x = Math.round(m.x * 2) / 2; // Snap to 0.5
            m.y = Math.round(m.y * 2) / 2;
        }

        // Clamp to grid
        m.x = Math.max(-10, Math.min(10, m.x));
        m.y = Math.max(-10, Math.min(10, m.y));

        setVectors((prev) => prev.map(v => v.id === activeId ? { ...v, ...m } : v));
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (activeId) {
            (e.target as Element).releasePointerCapture(e.pointerId);
            setActiveId(null);
        }
    };

    return (
        <div
            ref={ref}
            className="absolute inset-0 z-20"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {vectors.map((v) => {
                const pos = toSVG(v.x, v.y);
                return (
                    <div
                        key={v.id}
                        className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center cursor-move transition-transform ${activeId === v.id ? 'scale-125 bg-white/10' : 'hover:scale-110'}`}
                        style={{ left: ((pos.x / viewSize) * 100) + '%', top: ((pos.y / viewSize) * 100) + '%' }}
                    >
                        <div className="w-3 h-3 rounded-full border-2 bg-[#0a0a0f]" style={{ borderColor: v.color }}></div>
                    </div>
                );
            })}
        </div>
    )
}
