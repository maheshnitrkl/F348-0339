import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Play, RotateCcw, Pause, Info, ChevronDown } from 'lucide-react';

type SurfaceType = 'ravine' | 'saddle' | 'bowl';

interface SurfaceConfig {
    id: SurfaceType;
    name: string;
    desc: string;
    f: (x: number, z: number) => number;
    dx: (x: number, z: number) => number;
    dz: (x: number, z: number) => number;
    initialPos: THREE.Vector3;
    targetPos?: THREE.Vector3;
    scaleY: number;
}

const SURFACES: Record<SurfaceType, SurfaceConfig> = {
    ravine: {
        id: 'ravine',
        name: 'The Ravine',
        desc: 'Steep on the Z-axis, very flat on the X-axis. Shows why momentum and adaptive scaling (Adam) are needed to avoid oscillating wildly.',
        f: (x, z) => (x * x) / 10 + (z * z),
        dx: (x, z) => (x) / 5,
        dz: (x, z) => 2 * z,
        initialPos: new THREE.Vector3(-6, 0, 5),
        targetPos: new THREE.Vector3(0, 0, 0),
        scaleY: 0.15
    },
    bowl: {
        id: 'bowl',
        name: 'Simple Bowl',
        desc: 'A perfectly symmetric convex bowl. All optimizers will eventually find the center, but some take a more direct path.',
        f: (x, z) => (x * x) / 5 + (z * z) / 5,
        dx: (x, z) => (2 * x) / 5,
        dz: (x, z) => (2 * z) / 5,
        initialPos: new THREE.Vector3(-6, 0, -6),
        targetPos: new THREE.Vector3(0, 0, 0),
        scaleY: 0.2
    },
    saddle: {
        id: 'saddle',
        name: 'Saddle Point',
        desc: 'A critical point that is a minimum along X but a maximum along Z. Optimizers must escape it rather than converge to it.',
        f: (x, z) => (x * x) / 5 - (z * z) / 5,
        dx: (x, z) => (2 * x) / 5,
        dz: (x, z) => -(2 * z) / 5,
        initialPos: new THREE.Vector3(0.1, 0, 0.1), // Start very close to the saddle (0,0)
        scaleY: 0.2
    }
};

interface OptimizerConfig {
    name: string;
    color: string;
    lr: number;
    beta1?: number;
    beta2?: number;
    type: 'sgd' | 'momentum' | 'adagrad' | 'rmsprop' | 'adam' | 'lion' | 'nag';
    explanation: string;
}

const OPTIMIZERS: OptimizerConfig[] = [
    { 
        name: 'SGD', type: 'sgd', lr: 0.15, color: '#3b82f6',
        explanation: 'Follows the raw gradient blindly. Bounces across ravines and gets stuck on flat plateaus.' 
    },
    { 
        name: 'Momentum', type: 'momentum', lr: 0.15, beta1: 0.9, color: '#eab308',
        explanation: 'Builds up velocity in consistent directions, powering through flat spots and dampening side-to-side bounces.' 
    },
    { 
        name: 'AdaGrad', type: 'adagrad', lr: 1.0, color: '#22c55e',
        explanation: 'Scales down the learning rate for steep directions and keeps it high for flat ones. Good for sparse data.' 
    },
    { 
        name: 'RMSProp', type: 'rmsprop', lr: 0.2, beta1: 0.9, color: '#f97316',
        explanation: 'Fixes AdaGrad by using a moving average, preventing the learning rate from dropping to zero too early.' 
    },
    { 
        name: 'Adam', type: 'adam', lr: 0.5, beta1: 0.9, beta2: 0.999, color: '#a855f7',
        explanation: 'The best of both worlds: uses momentum for direction and RMSProp for adaptive step sizes. Typically wins the race.' 
    },
    { 
        name: 'NAG', type: 'nag', lr: 0.15, beta1: 0.9, color: '#ec4899',
        explanation: 'Nesterov Accelerated Gradient. Looks ahead before calculating the gradient, allowing it to brake earlier than standard momentum.' 
    },
    { 
        name: 'Lion', type: 'lion', lr: 0.1, beta1: 0.9, beta2: 0.99, color: '#00f3ff',
        explanation: 'EvoLved Sign Momentum. Uses only the sign of the momentum, discarding variance. Takes rigid, zigzagging steps but converges fast.' 
    },
];

function SurfaceMesh({ surface }: { surface: SurfaceConfig }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(16, 16, 64, 64);
        const count = geo.attributes.position.count;
        for (let i = 0; i < count; i++) {
            const x = geo.attributes.position.getX(i);
            const z = geo.attributes.position.getY(i);
            const y = surface.f(x, z) * surface.scaleY; 
            geo.attributes.position.setZ(i, y);
        }
        geo.computeVertexNormals();
        return geo;
    }, [surface]);

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
                <meshStandardMaterial
                    color="#1e293b"
                    metalness={0.7}
                    roughness={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh geometry={geometry} position={[0, 0, 0.01]}>
                <meshBasicMaterial
                    color="#475569"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </group>
    );
}

interface OptimizerBallProps {
    config: OptimizerConfig;
    surface: SurfaceConfig;
    isRunning: boolean;
    resetKey: number;
}

function OptimizerBall({ config, surface, isRunning, resetKey }: OptimizerBallProps) {
    const ballRef = useRef<THREE.Mesh>(null);
    
    const getInitialY = () => surface.f(surface.initialPos.x, surface.initialPos.z) * surface.scaleY + 0.3;
    const startPos = new THREE.Vector3(surface.initialPos.x, getInitialY(), surface.initialPos.z);
    
    const position = useRef(startPos.clone());
    
    // Optimizer States
    const velocity = useRef({ x: 0, z: 0 }); // Momentum
    const gAccum = useRef({ x: 0, z: 0 }); // AdaGrad / RMSProp / Adam v
    const m = useRef({ x: 0, z: 0 }); // Adam m
    const t = useRef(0); // Timestep
    const accumulator = useRef(0);

    const [trail, setTrail] = useState<THREE.Vector3[]>([startPos.clone()]);

    useMemo(() => {
        position.current.copy(startPos);
        velocity.current = { x: 0, z: 0 };
        gAccum.current = { x: 0, z: 0 };
        m.current = { x: 0, z: 0 };
        t.current = 0;
        accumulator.current = 0;
        setTrail([startPos.clone()]);
    }, [resetKey, surface]);

    useFrame((_, delta) => {
        if (!ballRef.current) return;

        if (isRunning) {
            accumulator.current += delta;
            const dt = 0.05; // fixed timestep
            let didUpdate = false;
            let steps = 0;

            while (accumulator.current >= dt && steps < 5) {
                const x = position.current.x;
                const z = position.current.z;

                // Stop conditions
                if (surface.targetPos && Math.abs(x - surface.targetPos.x) < 0.1 && Math.abs(z - surface.targetPos.z) < 0.1) break;
                if (Math.abs(x) > 20 || Math.abs(z) > 20) break; // Out of bounds (especially for saddle)

                const gx = surface.dx(x, z);
                const gz = surface.dz(x, z);
                const eps = 1e-8;

                if (config.type === 'sgd') {
                    position.current.x -= config.lr * gx;
                    position.current.z -= config.lr * gz;
                } 
                else if (config.type === 'momentum') {
                    const beta = config.beta1 || 0.9;
                    velocity.current.x = beta * velocity.current.x + (1 - beta) * gx;
                    velocity.current.z = beta * velocity.current.z + (1 - beta) * gz;
                    position.current.x -= config.lr * velocity.current.x;
                    position.current.z -= config.lr * velocity.current.z;
                }
                else if (config.type === 'adagrad') {
                    gAccum.current.x += gx * gx;
                    gAccum.current.z += gz * gz;
                    position.current.x -= (config.lr / (Math.sqrt(gAccum.current.x) + eps)) * gx;
                    position.current.z -= (config.lr / (Math.sqrt(gAccum.current.z) + eps)) * gz;
                }
                else if (config.type === 'rmsprop') {
                    const beta = config.beta1 || 0.9;
                    gAccum.current.x = beta * gAccum.current.x + (1 - beta) * (gx * gx);
                    gAccum.current.z = beta * gAccum.current.z + (1 - beta) * (gz * gz);
                    position.current.x -= (config.lr / (Math.sqrt(gAccum.current.x) + eps)) * gx;
                    position.current.z -= (config.lr / (Math.sqrt(gAccum.current.z) + eps)) * gz;
                }
                else if (config.type === 'adam') {
                    t.current += 1;
                    const b1 = config.beta1 || 0.9;
                    const b2 = config.beta2 || 0.999;

                    m.current.x = b1 * m.current.x + (1 - b1) * gx;
                    m.current.z = b1 * m.current.z + (1 - b1) * gz;

                    gAccum.current.x = b2 * gAccum.current.x + (1 - b2) * (gx * gx);
                    gAccum.current.z = b2 * gAccum.current.z + (1 - b2) * (gz * gz);

                    const mHatX = m.current.x / (1 - Math.pow(b1, t.current));
                    const mHatZ = m.current.z / (1 - Math.pow(b1, t.current));
                    const vHatX = gAccum.current.x / (1 - Math.pow(b2, t.current));
                    const vHatZ = gAccum.current.z / (1 - Math.pow(b2, t.current));

                    position.current.x -= config.lr * mHatX / (Math.sqrt(vHatX) + eps);
                    position.current.z -= config.lr * mHatZ / (Math.sqrt(vHatZ) + eps);
                }
                else if (config.type === 'nag') {
                    const beta = config.beta1 || 0.9;
                    velocity.current.x = beta * velocity.current.x + (1 - beta) * gx;
                    velocity.current.z = beta * velocity.current.z + (1 - beta) * gz;
                    
                    position.current.x -= config.lr * (beta * velocity.current.x + (1 - beta) * gx);
                    position.current.z -= config.lr * (beta * velocity.current.z + (1 - beta) * gz);
                }
                else if (config.type === 'lion') {
                    const b1 = config.beta1 || 0.9;
                    const b2 = config.beta2 || 0.99;
                    
                    const cX = b1 * m.current.x + (1 - b1) * gx;
                    const cZ = b1 * m.current.z + (1 - b1) * gz;
                    
                    position.current.x -= config.lr * Math.sign(cX);
                    position.current.z -= config.lr * Math.sign(cZ);
                    
                    m.current.x = b2 * m.current.x + (1 - b2) * gx;
                    m.current.z = b2 * m.current.z + (1 - b2) * gz;
                }

                // Update Y coordinate based on surface
                const y = surface.f(position.current.x, position.current.z) * surface.scaleY;
                position.current.y = y + 0.3;

                didUpdate = true;
                accumulator.current -= dt;
                steps++;
            }

            if (didUpdate) {
                setTrail(prev => {
                    const newPoint = position.current.clone();
                    if (prev.length > 800) return [...prev.slice(1), newPoint];
                    return [...prev, newPoint];
                });
            }
        }

        ballRef.current.position.copy(position.current);
    });

    return (
        <group>
            <mesh ref={ballRef} castShadow>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.6} />
                <pointLight distance={2} intensity={2} color={config.color} />
            </mesh>
            <Line
                points={trail}
                color={config.color}
                lineWidth={3}
                transparent
                opacity={0.9}
            />
        </group>
    );
}

export function OptimizerRace3D() {
    const [isRunning, setIsRunning] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [surfaceId, setSurfaceId] = useState<SurfaceType>('ravine');
    const [showExplanations, setShowExplanations] = useState(false);

    const activeSurface = SURFACES[surfaceId];

    const toggleRun = () => setIsRunning(!isRunning);
    const reset = () => {
        setIsRunning(false);
        setResetKey(k => k + 1);
    };

    const handleSurfaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSurfaceId(e.target.value as SurfaceType);
        reset();
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header / UI Controls */}
            <div className="p-5 bg-slate-900/80 border-b border-slate-800 backdrop-blur z-10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex-1">
                    <h4 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                        Optimization Simulator
                        <button 
                            onClick={() => setShowExplanations(!showExplanations)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors ml-2"
                            title="Toggle Explanations"
                        >
                            <Info size={16} />
                        </button>
                    </h4>
                    
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-slate-400 font-medium">Loss Surface:</span>
                        <div className="relative">
                            <select 
                                value={surfaceId}
                                onChange={handleSurfaceChange}
                                className="appearance-none bg-slate-800 text-cyan-400 text-sm font-bold border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                            >
                                {Object.values(SURFACES).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 max-w-xl leading-relaxed">{activeSurface.desc}</p>
                </div>
                
                <div className="flex gap-3 mt-4 md:mt-0">
                    <button
                        onClick={toggleRun}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                            isRunning 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                                : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:scale-105'
                        }`}
                    >
                        {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Race</>}
                    </button>
                    <button
                        onClick={reset}
                        className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>
            </div>

            {/* Collapsible Explanations */}
            {showExplanations && (
                <div className="bg-slate-800/50 border-b border-slate-800 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {OPTIMIZERS.map(opt => (
                        <div key={opt.name} className="flex gap-3 text-sm">
                            <div className="w-1.5 h-full rounded-full shrink-0" style={{ backgroundColor: opt.color }}></div>
                            <div>
                                <strong className="text-white block mb-1">{opt.name}</strong>
                                <span className="text-slate-400 text-xs leading-relaxed">{opt.explanation}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3D Canvas container with overlay legend */}
            <div className="w-full h-[550px] bg-gradient-to-b from-slate-950 to-black relative">
                
                {/* Floating Legend */}
                <div className="absolute top-4 right-4 z-10 bg-black/60 border border-white/10 p-3 rounded-xl backdrop-blur-md flex flex-col gap-2 shadow-2xl">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Competitors</div>
                    {OPTIMIZERS.map(opt => (
                        <div key={opt.name} className="flex items-center gap-3 px-2 py-1 bg-white/5 rounded-lg">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color, boxShadow: `0 0 10px ${opt.color}` }}></div>
                            <span className="text-sm font-semibold" style={{ color: opt.color }}>{opt.name}</span>
                        </div>
                    ))}
                </div>

                <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
                    <PerspectiveCamera makeDefault position={[-14, 12, -14]} fov={45} />
                    <OrbitControls 
                        enableZoom={true} 
                        minPolarAngle={0} 
                        maxPolarAngle={Math.PI / 2.1} 
                        target={[0, 0, 0]} 
                    />

                    <ambientLight intensity={0.4} />
                    <spotLight position={[10, 20, 10]} angle={0.4} penumbra={1} intensity={1.5} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />

                    <SurfaceMesh surface={activeSurface} />

                    {OPTIMIZERS.map(opt => (
                        <OptimizerBall 
                            key={opt.name} 
                            config={opt}
                            surface={activeSurface}
                            isRunning={isRunning} 
                            resetKey={resetKey} 
                        />
                    ))}
                    
                    {/* Minimum/Saddle target marker */}
                    {activeSurface.targetPos && (
                        <mesh position={[activeSurface.targetPos.x, activeSurface.f(activeSurface.targetPos.x, activeSurface.targetPos.z) * activeSurface.scaleY + 0.1, activeSurface.targetPos.z]}>
                            <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
                            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.5} />
                        </mesh>
                    )}
                </Canvas>
                
                <div className="absolute bottom-4 left-4 text-xs text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur shadow-lg">
                    🖱️ Left-click to rotate • Scroll to zoom
                </div>
            </div>
        </div>
    );
}
