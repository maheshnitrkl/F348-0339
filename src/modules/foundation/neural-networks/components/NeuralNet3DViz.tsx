import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause } from 'lucide-react';

const LAYERS = [3, 5, 5, 2];
const SPACING_X = 4;
const SPACING_Y = 2;

// --- Data Structures ---
interface NodeData {
    layerIdx: number;
    nodeIdx: number;
    pos: THREE.Vector3;
}

interface EdgeData {
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    weight: number;
    fromLayer: number;
}

const generateNetwork = () => {
    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];

    // Create Nodes
    LAYERS.forEach((numNodes, layerIdx) => {
        const x = (layerIdx - (LAYERS.length - 1) / 2) * SPACING_X;
        for (let i = 0; i < numNodes; i++) {
            const y = (i - (numNodes - 1) / 2) * SPACING_Y;
            const z = 0; // Curve them later if we want a 3D arc, but flat is clear
            nodes.push({ layerIdx, nodeIdx: i, pos: new THREE.Vector3(x, y, z) });
        }
    });

    // Create Edges
    for (let l = 0; l < LAYERS.length - 1; l++) {
        const currentLayerNodes = nodes.filter(n => n.layerIdx === l);
        const nextLayerNodes = nodes.filter(n => n.layerIdx === l + 1);

        currentLayerNodes.forEach(fromNode => {
            nextLayerNodes.forEach(toNode => {
                edges.push({
                    fromPos: fromNode.pos,
                    toPos: toNode.pos,
                    weight: (Math.random() * 2) - 1, // -1 to 1
                    fromLayer: l
                });
            });
        });
    }

    return { nodes, edges };
};

// --- Subcomponents ---

const AnimatedEdges = ({ edges, activeLayer }: { edges: EdgeData[], activeLayer: number }) => {
    return (
        <group>
            {edges.map((edge, idx) => {
                const isActive = edge.fromLayer === activeLayer;
                // Base color based on weight sign
                const color = edge.weight > 0 ? '#3b82f6' : '#f97316';
                const opacity = isActive ? 0.8 : Math.max(0.1, Math.abs(edge.weight) * 0.3);
                
                return (
                    <Line
                        key={idx}
                        points={[edge.fromPos, edge.toPos]}
                        color={isActive ? '#ffffff' : color}
                        lineWidth={isActive ? 3 : Math.max(0.5, Math.abs(edge.weight) * 2)}
                        transparent
                        opacity={opacity}
                    />
                );
            })}
        </group>
    );
};

const NodeSphere = ({ node, isActive }: { node: NodeData, isActive: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    
    // Animation logic
    useFrame(({ clock }) => {
        if (!meshRef.current || !materialRef.current) return;
        
        if (isActive) {
            // Pulse effect when active
            const pulse = (Math.sin(clock.elapsedTime * 10) + 1) / 2;
            const scale = 1 + pulse * 0.2;
            meshRef.current.scale.set(scale, scale, scale);
            materialRef.current.emissiveIntensity = 2 + pulse * 2;
            materialRef.current.color.set('#38bdf8');
            materialRef.current.emissive.set('#38bdf8');
        } else {
            // Idle state
            meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            materialRef.current.emissiveIntensity = 0.5;
            
            // Color based on layer
            if (node.layerIdx === 0) {
                materialRef.current.color.set('#94a3b8'); // Input
                materialRef.current.emissive.set('#475569');
            } else if (node.layerIdx === LAYERS.length - 1) {
                materialRef.current.color.set('#f97316'); // Output
                materialRef.current.emissive.set('#ea580c');
            } else {
                materialRef.current.color.set('#0ea5e9'); // Hidden
                materialRef.current.emissive.set('#0369a1');
            }
        }
    });

    return (
        <Sphere ref={meshRef} position={node.pos} args={[0.4, 32, 32]}>
            <meshStandardMaterial 
                ref={materialRef}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
};

const DataParticles = ({ edges, activeLayer }: { edges: EdgeData[], activeLayer: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTimeRef = useRef(0);

    // Reset progress when layer changes to ensure sync
    useEffect(() => {
        startTimeRef.current = performance.now() / 1000;
    }, [activeLayer]);
    
    useFrame(() => {
        if (!groupRef.current) return;
        
        const elapsed = (performance.now() / 1000) - startTimeRef.current;
        const progress = Math.min(1, Math.max(0, elapsed)); // 0 to 1 progress within 1 second

        groupRef.current.children.forEach((child, i) => {
            const edge = edges[i];
            if (edge.fromLayer === activeLayer) {
                child.visible = true;
                // Move particle from A to B
                const pos = edge.fromPos.clone().lerp(edge.toPos, progress);
                child.position.copy(pos);
                // Scale based on progress (swell in middle)
                const scale = Math.sin(progress * Math.PI) * 1.5;
                child.scale.setScalar(scale);
            } else {
                child.visible = false;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {edges.map((edge, i) => (
                <mesh key={i}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            ))}
        </group>
    );
};

// --- Main Container ---

export const NeuralNet3DViz: React.FC = () => {
    const { nodes, edges } = useMemo(() => generateNetwork(), []);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeLayer, setActiveLayer] = useState(-1);

    // Orchestrate Forward Pass Simulation using useEffect
    useEffect(() => {
        if (!isPlaying) {
            setActiveLayer(-1);
            return;
        }

        setActiveLayer(0);
        const interval = setInterval(() => {
            setActiveLayer((prev) => {
                if (prev >= LAYERS.length - 1) return -1; // Reset
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden h-[500px] flex flex-col relative group">
            
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-3 pointer-events-auto flex items-center gap-4">
                    <button 
                        onClick={togglePlay}
                        className={`p-3 rounded-full flex items-center justify-center transition-all ${
                            isPlaying ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40'
                        }`}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div>
                        <h3 className="font-bold text-white text-sm">3D Forward Pass</h3>
                        <p className="text-xs text-slate-400">Watch data flow through tensors</p>
                    </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-3 pointer-events-auto flex items-center gap-4">
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Tensor</span>
                        <span className="text-sm font-mono text-cyan-400">
                            {activeLayer >= 0 ? `Layer ${activeLayer} \u2192 ${activeLayer + 1}` : 'Idle'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-[10px] text-white/50 uppercase tracking-widest pointer-events-none bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">
                Drag to Rotate • Scroll to Zoom
            </div>

            {/* WebGL Canvas */}
            <div className="flex-1 cursor-move bg-gradient-to-b from-[#0a0a0a] to-[#111827]">
                <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
                    
                    <OrbitControls 
                        enableDamping 
                        dampingFactor={0.05}
                        autoRotate={!isPlaying} 
                        autoRotateSpeed={0.5}
                    />

                    {/* Nodes */}
                    <group>
                        {nodes.map((node, i) => (
                            <NodeSphere 
                                key={i} 
                                node={node} 
                                isActive={node.layerIdx === activeLayer || node.layerIdx === activeLayer + 1} 
                            />
                        ))}
                    </group>

                    {/* Edges */}
                    <AnimatedEdges edges={edges} activeLayer={activeLayer} />

                    {/* Flowing Data */}
                    {isPlaying && <DataParticles edges={edges} activeLayer={activeLayer} />}

                </Canvas>
            </div>
        </div>
    );
};
