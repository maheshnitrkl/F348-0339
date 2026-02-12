import React, { useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, Maximize2, Move, Zap, RefreshCw } from 'lucide-react';

// Matrix type
interface Matrix2x2 {
    a: number; b: number;
    c: number; d: number;
}

const Grid3D = ({ matrix }: { matrix: Matrix2x2 }) => {
    // Generate grid lines
    const lines = useMemo(() => {
        const size = 10;
        const step = 1;
        const result: { start: [number, number, number], end: [number, number, number], color: string }[] = [];

        // Helper to apply matrix transform
        const transform = (x: number, y: number): [number, number, number] => {
            const tx = matrix.a * x + matrix.b * y;
            const ty = matrix.c * x + matrix.d * y;
            return [tx, ty, 0];
        };

        for (let i = -size; i <= size; i += step) {
            // Vertical lines (constant x, varying y)
            const vStart = transform(i, -size);
            const vEnd = transform(i, size);
            result.push({ start: vStart, end: vEnd, color: i === 0 ? '#4ADE80' : 'rgba(255,255,255,0.1)' });

            // Horizontal lines (constant y, varying x)
            const hStart = transform(-size, i);
            const hEnd = transform(size, i);
            result.push({ start: hStart, end: hEnd, color: i === 0 ? '#F472B6' : 'rgba(255,255,255,0.1)' });
        }
        return result;
    }, [matrix]);

    return (
        <group>
            {lines.map((line, i) => (
                <Line
                    key={i}
                    points={[line.start, line.end]}
                    color={line.color}
                    lineWidth={line.color.includes('rgba') ? 0.5 : 2}
                    transparent
                    opacity={0.5}
                />
            ))}
        </group>
    );
};

const BasisVectors = ({ matrix }: { matrix: Matrix2x2 }) => {
    // i-hat (1, 0) -> (a, c)
    const iHat = new THREE.Vector3(matrix.a, matrix.c, 0);
    // j-hat (0, 1) -> (b, d)
    const jHat = new THREE.Vector3(matrix.b, matrix.d, 0);

    return (
        <group>
            {/* i-hat (Green/Yellow) */}
            <arrowHelper args={[iHat.clone().normalize(), new THREE.Vector3(0, 0, 0), iHat.length(), 0xFACC15]} />
            <Text position={[iHat.x * 1.1, iHat.y * 1.1, 0]} fontSize={0.3} color="#FACC15">{'i'}</Text>

            {/* j-hat (Pink/Red) */}
            <arrowHelper args={[jHat.clone().normalize(), new THREE.Vector3(0, 0, 0), jHat.length(), 0xF472B6]} />
            <Text position={[jHat.x * 1.1, jHat.y * 1.1, 0]} fontSize={0.3} color="#F472B6">{'j'}</Text>
        </group>
    );
};

// Unit Square that gets transformed
const TransformedSquare = ({ matrix }: { matrix: Matrix2x2 }) => {
    const vertices = useMemo(() => {
        // Points: (0,0), (1,0), (1,1), (0,1)
        const p0 = { x: 0, y: 0 };
        const p1 = { x: 1 * matrix.a + 0 * matrix.b, y: 1 * matrix.c + 0 * matrix.d };
        const p2 = { x: 1 * matrix.a + 1 * matrix.b, y: 1 * matrix.c + 1 * matrix.d };
        const p3 = { x: 0 * matrix.a + 1 * matrix.b, y: 0 * matrix.c + 1 * matrix.d };

        return [
            new THREE.Vector3(p0.x, p0.y, 0),
            new THREE.Vector3(p1.x, p1.y, 0),
            new THREE.Vector3(p2.x, p2.y, 0),
            new THREE.Vector3(p3.x, p3.y, 0),
            new THREE.Vector3(p0.x, p0.y, 0), // Close loop
        ];
    }, [matrix]);

    return (
        <group>
            <Line points={vertices} color="#00D9FF" lineWidth={3} />
            {/* Fill using a shape geometry if needed, but lines are cleaner for wireframe aesthetic */}
        </group>
    )
}

const OriginalGrid = () => {
    return (
        <gridHelper args={[20, 20, 0x444444, 0x222222]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.05]} />
    )
}

// Lerp helper for smooth transitions
const AnimatedScene = ({ targetMatrix }: { targetMatrix: Matrix2x2 }) => {
    const [currentMatrix, setCurrentMatrix] = useState(targetMatrix);

    useFrame((_, delta) => {
        // Simple lerp for smooth animation
        const speed = 5 * delta;
        setCurrentMatrix({
            a: THREE.MathUtils.lerp(currentMatrix.a, targetMatrix.a, speed),
            b: THREE.MathUtils.lerp(currentMatrix.b, targetMatrix.b, speed),
            c: THREE.MathUtils.lerp(currentMatrix.c, targetMatrix.c, speed),
            d: THREE.MathUtils.lerp(currentMatrix.d, targetMatrix.d, speed),
        });
    });

    return (
        <>
            <OriginalGrid />
            <Grid3D matrix={currentMatrix} />
            <BasisVectors matrix={currentMatrix} />
            <TransformedSquare matrix={currentMatrix} />
        </>
    );
};


export const MatrixTransformVisualizer: React.FC = () => {
    const [matrix, setMatrix] = useState<Matrix2x2>({ a: 1, b: 0, c: 0, d: 1 });
    const [determinant, setDeterminant] = useState(1);

    useEffect(() => {
        setDeterminant(matrix.a * matrix.d - matrix.b * matrix.c);
    }, [matrix]);



    return (
        <div className="flex flex-col gap-4 p-4 bg-[#0a0a0f] rounded-xl border border-white/10 h-[calc(100vh-160px)]">
            {/* Header & Controls - Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Matrix Transformer
                    </h2>
                    <p className="text-xs text-gray-400">
                        Visualize linear transformations.
                    </p>
                </div>

                {/* Matrix Input */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded border border-white/10">
                        <span className="text-xs text-gray-500 font-mono">M =</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xl font-light text-gray-600">[</span>
                            <div className="grid grid-cols-2 gap-1">
                                <input type="number" step="0.1" value={matrix.a} onChange={e => setMatrix({ ...matrix, a: parseFloat(e.target.value) })} className="w-10 bg-black/40 border border-white/20 rounded px-1 text-right text-yellow-400 font-mono text-xs" />
                                <input type="number" step="0.1" value={matrix.b} onChange={e => setMatrix({ ...matrix, b: parseFloat(e.target.value) })} className="w-10 bg-black/40 border border-white/20 rounded px-1 text-right text-pink-400 font-mono text-xs" />
                                <input type="number" step="0.1" value={matrix.c} onChange={e => setMatrix({ ...matrix, c: parseFloat(e.target.value) })} className="w-10 bg-black/40 border border-white/20 rounded px-1 text-right text-yellow-400 font-mono text-xs" />
                                <input type="number" step="0.1" value={matrix.d} onChange={e => setMatrix({ ...matrix, d: parseFloat(e.target.value) })} className="w-10 bg-black/40 border border-white/20 rounded px-1 text-right text-pink-400 font-mono text-xs" />
                            </div>
                            <span className="text-xl font-light text-gray-600">]</span>
                        </div>
                    </div>
                    <div className={`font-mono text-xs ${Math.abs(determinant) < 0.01 ? 'text-red-400' : 'text-gray-400'}`}>
                        det: {determinant.toFixed(2)}
                    </div>
                </div>

                {/* Presets - Compact */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setMatrix({ a: 1, b: 0, c: 0, d: 1 })} title="Identity" className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-300 border border-white/10">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={() => setMatrix({ a: Math.cos(Math.PI / 4), b: -Math.sin(Math.PI / 4), c: Math.sin(Math.PI / 4), d: Math.cos(Math.PI / 4) })} title="Rotate 45°" className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-300 border border-white/10">
                        <RotateCw size={14} />
                    </button>
                    <button onClick={() => setMatrix({ a: 1, b: 1, c: 0, d: 1 })} title="Shear X" className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-300 border border-white/10">
                        <Move size={14} />
                    </button>
                    <button onClick={() => setMatrix({ a: 2, b: 0, c: 0, d: 2 })} title="Scale 2x" className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-300 border border-white/10">
                        <Maximize2 size={14} />
                    </button>
                    <button onClick={() => setMatrix({ a: 0, b: 0, c: 0, d: 0 })} title="Collapse" className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-300 border border-red-500/20">
                        <Zap size={14} />
                    </button>
                </div>
            </div>

            {/* 3D Canvas — fills remaining space */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-[#050505]">
                    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ width: '100%', height: '100%' }}>
                        <color attach="background" args={['#050505']} />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />

                        <AnimatedScene targetMatrix={matrix} />

                        <OrbitControls makeDefault enableZoom={true} enablePan={true} />
                    </Canvas>
                </div>
                <div className="absolute bottom-4 right-4 text-xs text-gray-500 pointer-events-none select-none z-10">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-0.5 bg-gray-600"></span> Original Grid
                        <span className="w-3 h-0.5 bg-green-400/50"></span> Transformed Grid
                    </div>
                    Drag to rotate view • Scroll to zoom
                </div>
            </div>
        </div>
    );
};
