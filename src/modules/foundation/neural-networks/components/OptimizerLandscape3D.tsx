import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, RefreshCw, Activity } from 'lucide-react';

// Rastrigin function for loss landscape
const rastrigin = (x: number, y: number): number => {
    const A = 10;
    return A * 2 + (x * x - A * Math.cos(2 * Math.PI * x)) + (y * y - A * Math.cos(2 * Math.PI * y));
};

// Map rastrigin output (approx 0 to 50 in our domain) to a reasonable height
const heightMap = (x: number, y: number) => rastrigin(x, y) * 0.05;

const LandscapeSurface = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const wireframeRef = useRef<THREE.Mesh>(null);
    
    // Generate geometry with displaced vertices
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(10, 10, 64, 64);
        const pos = geo.attributes.position;
        const colors = [];
        const color = new THREE.Color();
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            // Map coordinates from [-5, 5] to [-3, 3] for Rastrigin
            const rx = (x / 5) * 3;
            const ry = (y / 5) * 3;
            const z = heightMap(rx, ry);
            
            pos.setZ(i, z);
            
            // Color based on height (z)
            // Low = blue, High = red
            color.setHSL(0.6 - z * 0.15, 0.8, 0.4);
            colors.push(color.r, color.g, color.b);
        }
        
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <group position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Solid surface */}
            <mesh ref={meshRef} geometry={geometry} receiveShadow>
                <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Wireframe overlay */}
            <mesh ref={wireframeRef} geometry={geometry}>
                <meshStandardMaterial vertexColors wireframe={true} transparent opacity={0.2} depthTest={true} />
            </mesh>
        </group>
    );
};

// Optimizer configs
type OptimizerState = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    mx: number;
    my: number;
    vxSq: number;
    vySq: number;
};

const INITIAL_POS = { x: -2.5, y: -2.5 };

const OptimizersList = [
    { name: 'SGD', color: '#f43f5e', lr: 0.005 },
    { name: 'Momentum', color: '#3b82f6', lr: 0.005, beta: 0.95 },
    { name: 'Adam', color: '#10b981', lr: 0.05, beta1: 0.9, beta2: 0.999 },
];

const OptimizerParticles = ({ isPlaying }: { isPlaying: boolean }) => {
    const particleRefs = useRef<(THREE.Group | null)[]>([]);

    const statesRef = useRef<OptimizerState[]>(OptimizersList.map(() => ({
        x: INITIAL_POS.x, y: INITIAL_POS.y,
        vx: 0, vy: 0,
        mx: 0, my: 0,
        vxSq: 0, vySq: 0
    })));

    // Compute gradients numerically
    const computeGrad = (x: number, y: number) => {
        const eps = 0.01;
        const dx = (heightMap(x + eps, y) - heightMap(x - eps, y)) / (2 * eps);
        const dy = (heightMap(x, y + eps) - heightMap(x, y - eps)) / (2 * eps);
        return { dx, dy };
    };

    useFrame(() => {
        if (!isPlaying) return;

        statesRef.current.forEach((state, i) => {
            const opt = OptimizersList[i];
            const { dx, dy } = computeGrad(state.x, state.y);
            
            let nx = state.x;
            let ny = state.y;
            let nvx = state.vx;
            let nvy = state.vy;
            let nmx = state.mx;
            let nmy = state.my;
            let nvxSq = state.vxSq;
            let nvySq = state.vySq;

            if (opt.name === 'SGD') {
                nx -= opt.lr * dx;
                ny -= opt.lr * dy;
            } else if (opt.name === 'Momentum') {
                nvx = opt.beta! * nvx + dx;
                nvy = opt.beta! * nvy + dy;
                nx -= opt.lr * nvx;
                ny -= opt.lr * nvy;
            } else if (opt.name === 'Adam') {
                nmx = opt.beta1! * nmx + (1 - opt.beta1!) * dx;
                nmy = opt.beta1! * nmy + (1 - opt.beta1!) * dy;
                nvxSq = opt.beta2! * nvxSq + (1 - opt.beta2!) * dx * dx;
                nvySq = opt.beta2! * nvySq + (1 - opt.beta2!) * dy * dy;

                // Bias correction omitted for simplicity as it runs for many steps
                nx -= opt.lr * nmx / (Math.sqrt(nvxSq) + 1e-8);
                ny -= opt.lr * nmy / (Math.sqrt(nvySq) + 1e-8);
            }

            // Bound them so they don't fly off
            nx = Math.max(-3, Math.min(3, nx));
            ny = Math.max(-3, Math.min(3, ny));

            // Update state refs
            state.x = nx;
            state.y = ny;
            state.vx = nvx;
            state.vy = nvy;
            state.mx = nmx;
            state.my = nmy;
            state.vxSq = nvxSq;
            state.vySq = nvySq;

            // Direct object position update
            const mesh = particleRefs.current[i];
            if (mesh) {
                const worldX = (nx / 3) * 5;
                const worldY = (ny / 3) * 5;
                const worldZ = heightMap(nx, ny);
                mesh.position.set(worldX, worldZ + 0.2, -worldY);
            }
        });
    });

    return (
        <group position={[0, -2, 0]}>
            {OptimizersList.map((opt, i) => {
                const state = statesRef.current[i];
                const worldX = (state.x / 3) * 5;
                const worldY = (state.y / 3) * 5;
                const worldZ = heightMap(state.x, state.y);

                return (
                    <group 
                        key={i} 
                        ref={el => { particleRefs.current[i] = el; }}
                        position={[worldX, worldZ + 0.2, -worldY]}
                    >
                        <mesh>
                            <sphereGeometry args={[0.2, 16, 16]} />
                            <meshStandardMaterial color={opt.color} emissive={opt.color} emissiveIntensity={0.8} />
                            <pointLight color={opt.color} intensity={1} distance={2} />
                        </mesh>
                        <Text position={[0, 0.4, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" renderOrder={1}>
                            {opt.name}
                        </Text>
                    </group>
                );
            })}
        </group>
    );
};

export const OptimizerLandscape3D: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    return (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-emerald-400" /> Optimization Landscape
                    </h3>
                    <p className="text-slate-400 text-sm">Racing SGD vs Momentum vs Adam on a non-convex surface (Rastrigin)</p>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                            isPlaying 
                            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        {isPlaying ? 'Pause' : 'Start Race'}
                    </button>
                    <button
                        onClick={() => { setIsPlaying(false); setResetKey(k => k + 1); }}
                        className="px-4 py-2 rounded-lg font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                        <RefreshCw size={18} /> Reset
                    </button>
                </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl h-[500px] relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-xl pointer-events-none">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Competitors</h4>
                    <div className="space-y-2">
                        {OptimizersList.map(opt => (
                            <div key={opt.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: opt.color, boxShadow: `0 0 10px ${opt.color}`}} />
                                <span className="text-sm font-semibold text-white">{opt.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-[10px] text-white/50 uppercase tracking-widest pointer-events-none bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">
                    Drag to Rotate • Scroll to Zoom
                </div>

                <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
                    <color attach="background" args={['#020617']} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
                    <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#3b82f6" />
                    
                    <LandscapeSurface />
                    <OptimizerParticles key={resetKey} isPlaying={isPlaying} />
                    
                    <OrbitControls 
                        enableDamping 
                        dampingFactor={0.05}
                        maxPolarAngle={Math.PI / 2 - 0.1} // don't go under ground
                        autoRotate={!isPlaying}
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            </div>
        </div>
    );
};
