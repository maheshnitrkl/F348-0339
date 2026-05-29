/* eslint-disable */
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';

function LossSurface() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Generate surface geometry: z = x^2 + y^2 (simple bowl)
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(10, 10, 64, 64);
        const count = geo.attributes.position.count;
        for (let i = 0; i < count; i++) {
            const x = geo.attributes.position.getX(i);
            const y = geo.attributes.position.getY(i);
            const z = (x * x + y * y) * 0.15; // Paraboloid
            geo.attributes.position.setZ(i, z);
        }
        geo.computeVertexNormals();
        return geo;
    }, []);

    // Material with wireframe/grid look
    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            {/* Main Surface */}
            <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
                <meshStandardMaterial
                    color="#2d2d2d"
                    metalness={0.8}
                    roughness={0.2}
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Grid Overlay */}
            <mesh geometry={geometry} position={[0, 0, 0.01]}>
                <meshBasicMaterial
                    color="#00f3ff"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </mesh>
        </group>
    );
}

interface DescentBallProps {
    learningRate: number;
    isRunning: boolean;
    resetKey: number; // Increment to reset
}

function DescentBall({ learningRate, isRunning, resetKey }: DescentBallProps) {
    const ballRef = useRef<THREE.Mesh>(null);
    const position = useRef(new THREE.Vector3(4, 0, 4));
    const accumulator = useRef(0);

    // Trail state
    const [trail, setTrail] = useState<THREE.Vector3[]>([]);

    // Reset when key changes
    useMemo(() => {
        const startY = (4 ** 2 + 4 ** 2) * 0.15 + 0.3;
        const startPos = new THREE.Vector3(4, startY, 4);
        position.current.copy(startPos);
        accumulator.current = 0;
        setTrail([startPos.clone()]);
    }, [resetKey]);

    useFrame((_, delta) => {
        if (!ballRef.current) return;

        // Gradient Descent Step
        if (isRunning) {
            accumulator.current += delta;
            const dt = 0.05; // 20 steps per second

            let steps = 0;
            let didUpdate = false;

            while (accumulator.current >= dt && steps < 10) {
                const x = position.current.x;
                const z = position.current.z;

                // Safety check to prevent infinite coordinates crashing the line renderer
                if (Math.abs(x) < 100 && Math.abs(z) < 100) {
                    const gradX = 0.3 * x;
                    const gradZ = 0.3 * z;

                    // Scale LR
                    const effectiveLR = learningRate * 80;

                    position.current.x -= effectiveLR * gradX;
                    position.current.z -= effectiveLR * gradZ;

                    // Update Height
                    const y = (position.current.x ** 2 + position.current.z ** 2) * 0.15;
                    position.current.y = y + 0.3; // + radius

                    didUpdate = true;
                }

                accumulator.current -= dt;
                steps++;
            }

            if (didUpdate) {
                setTrail(prev => {
                    // Performance: limit trail to last 1000 points
                    const newPoint = position.current.clone();
                    if (prev.length > 1000) {
                        return [...prev.slice(1), newPoint];
                    }
                    return [...prev, newPoint];
                });
            }
        } else {
            // Ensure mesh is synced with position (e.g. after reset)
            // In useFrame to avoid render lag after state update
            ballRef.current.position.copy(position.current);
        }

        // Sync mesh position while running
        if (isRunning && ballRef.current) {
            ballRef.current.position.copy(position.current);
        }
    });

    return (
        <group>
            <mesh ref={ballRef} castShadow>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.5} />
                <pointLight distance={3} intensity={5} color="#c084fc" />
            </mesh>

            <Line
                points={trail}
                color="white"
                lineWidth={2}
                transparent
                opacity={0.6}
            />
        </group>
    );
}

export function GradientDescentPlot(props: DescentBallProps) {
    return (
        <div className="w-full h-full min-h-[400px]">
            <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
                <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={45} />
                <OrbitControls enableZoom={true} minPolarAngle={0} maxPolarAngle={Math.PI / 2} target={[0, 2, 0]} />

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.1, 0]} />

                <LossSurface />
                <DescentBall {...props} />
            </Canvas>
        </div>
    );
}
