import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Layers, ScanEye } from 'lucide-react';

// --- GLSL SHADER (The Core of Volume Rendering) ---
const vertexShader = `
varying vec3 vOrigin;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vOrigin = position + 0.5; // Map -0.5..0.5 to 0..1
}
`;

const fragmentShader = `
precision highp float;
precision highp sampler3D;

varying vec3 vOrigin;
uniform sampler3D map;
uniform float threshold;
uniform float opacity;
uniform vec3 color;
uniform float steps;
uniform vec3 cameraPosLocal;

// Pseudo-random for dithering
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec3 rayDir = normalize(vOrigin - cameraPosLocal);
    vec3 rayStep = rayDir * (1.732 / steps); // sqrt(3) max diag / steps
    
    vec3 pos = vOrigin;
    vec4 result = vec4(0.0);
    
    // Dithering to reduce banding
    pos += rayStep * rand(gl_FragCoord.xy);

    for(float i = 0.0; i < 100.0; i++) { // Max 100 steps hardcoded for loop unroll
        if (i > steps) break;

        // Sample 3D texture
        float density = texture(map, pos).r;

        // Apply Transfer Function (Thresholding)
        if (density > threshold) {
            float alpha = (density - threshold) * opacity;
            
            // Accumulate (Front-to-back blending)
            result.rgb += (1.0 - result.a) * alpha * color * density;
            result.a += (1.0 - result.a) * alpha;
        }

        // Advance Ray
        pos += rayStep;

        // Break if outside cube or opaque
        if (pos.x < 0.0 || pos.x > 1.0 || 
            pos.y < 0.0 || pos.y > 1.0 || 
            pos.z < 0.0 || pos.z > 1.0 || 
            result.a > 0.95) break; 
    }

    gl_FragColor = result;
}
`;

// --- VOLUME GENERATOR ---
const generateVolumeData = (size: number) => {
    const data = new Float32Array(size * size * size);
    const center = size / 2;

    for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dx = (x - center) / center;
                const dy = (y - center) / center;
                const dz = (z - center) / center;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                let val = 0;

                // 1. Skull (High Density Shell)
                if (dist > 0.7 && dist < 0.85) {
                    val = 0.9 + (Math.random() * 0.1); // Bone + Noise
                }

                // 2. Brain (Medium Density Inner)
                if (dist < 0.65) {
                    val = 0.4 + (Math.sin(x * 0.2) * Math.cos(y * 0.2) * Math.sin(z * 0.2)) * 0.2; // Gyri
                }

                // 3. Eyes (Spheres)
                if (dz > 0.4 && Math.abs(dx) > 0.2 && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.2) {
                    // This is rough, let's keep it abstract
                    // val = 0.6;
                }

                data[z * size * size + y * size + x] = Math.max(0, val);
            }
        }
    }
    return data;
};

const VolumetricCube = ({ threshold, opacity, mainColor }: { threshold: number, opacity: number, mainColor: string }) => {
    const size = 64; // Low res for performance, linear interpolation smooths it

    // Generate texture once
    const texture = useMemo(() => {
        const data = generateVolumeData(size);
        const tex = new THREE.Data3DTexture(data, size, size, size);
        tex.format = THREE.RedFormat;
        tex.type = THREE.FloatType;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.unpackAlignment = 1;
        tex.needsUpdate = true;
        return tex;
    }, []);

    const shaderRef = useRef<THREE.ShaderMaterial>(null);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (shaderRef.current && meshRef.current) {
            // Transform camera position to Local Space (0..1 box space)
            // 1. World -> Local (relative to mesh center which is usually 0,0,0)
            const camLocal = meshRef.current.worldToLocal(state.camera.position.clone());
            // 2. Adjust for the fact that vertex shader maps -0.5..0.5 to 0..1
            // So we need to shift the camera local pos similarly to match the coordinate system
            camLocal.addScalar(0.5);

            shaderRef.current.uniforms.cameraPosLocal.value.copy(camLocal);
        }
    });

    // Stable uniforms object - created once
    const uniforms = useMemo(() => ({
        map: { value: texture },
        threshold: { value: threshold },
        opacity: { value: opacity },
        color: { value: new THREE.Color(mainColor) },
        steps: { value: 64.0 },
        cameraPosLocal: { value: new THREE.Vector3() }
    }), [texture]);

    // Update uniforms on every frame to ensure they match state
    useFrame((state) => {
        if (shaderRef.current && meshRef.current) {
            // 1. Update Camera (Existing logic)
            const camLocal = meshRef.current.worldToLocal(state.camera.position.clone());
            camLocal.addScalar(0.5);
            shaderRef.current.uniforms.cameraPosLocal.value.copy(camLocal);

            // 2. Update Interactive Uniforms (Fix for controls)
            shaderRef.current.uniforms.threshold.value = threshold;
            shaderRef.current.uniforms.opacity.value = opacity;
            shaderRef.current.uniforms.color.value.set(mainColor);
        }
    });

    // Removed useEffect as useFrame handles updates now

    return (
        <mesh ref={meshRef} scale={[3, 3, 3]}>
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                ref={shaderRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                side={THREE.FrontSide} // Render front faces to start raymarch at entry point
                depthWrite={false} // Don't occlude other objects
            />
        </mesh>
    );
};

export const VolumeRenderer: React.FC = () => {
    const [threshold, setThreshold] = useState(0.2);
    const [opacity, setOpacity] = useState(0.8);
    const [color, setColor] = useState('#ffffff');
    const [active, setActive] = useState(false);

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden h-[500px] flex flex-col md:flex-row">
            {/* 3D Viewport */}
            <div className="flex-1 relative cursor-move bg-black">
                {active ? (
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <color attach="background" args={['#050505']} />
                        <OrbitControls autoRotate autoRotateSpeed={1} />
                        <ambientLight intensity={0.5} />
                        <VolumetricCube threshold={threshold} opacity={opacity} mainColor={color} />
                        <gridHelper args={[10, 10, 0x444444, 0x222222]} position={[0, -2, 0]} />
                    </Canvas>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-gradient-to-br from-gray-900 to-black">
                        <ScanEye size={48} className="text-cyan-500 animate-pulse" />
                        <button
                            onClick={() => setActive(true)}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-cyan-500/25"
                        >
                            Start Volume Simulation
                        </button>
                        <p className="text-xs text-gray-500">Click to initialize WebGL context</p>
                    </div>
                )}

                {active && (
                    <div className="absolute bottom-4 left-4 text-xs text-white/50 pointer-events-none">
                        <ScanEye className="inline mr-1" size={14} />
                        Drag to Rotate • Scroll to Zoom
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="w-full md:w-64 bg-black/60 backdrop-blur-md p-6 border-l border-white/10 flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                        <Layers size={18} className="text-cyan-400" /> Volume Settings
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Direct Volume Rendering (DVR)</p>
                </div>

                <div className="space-y-4">
                    {/* Threshold Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Threshold (Cutoff)</span>
                            <span>{threshold.toFixed(2)}</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.01"
                            value={threshold}
                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                            Use this to "peel away" low density tissue (Skin vs Bone).
                        </p>
                    </div>

                    {/* Opacity Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Opacity</span>
                            <span>{opacity.toFixed(1)}</span>
                        </div>
                        <input
                            type="range" min="0.1" max="2" step="0.1"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>

                    {/* Color Presets */}
                    <div>
                        <div className="text-xs text-gray-300 mb-2">Color Mapping</div>
                        <div className="flex gap-2">
                            <button onClick={() => setColor('#ffffff')} className={`w-8 h-8 rounded-full border-2 ${color === '#ffffff' ? 'border-white' : 'border-transparent'} bg-white`} title="CT (Grayscale)" />
                            <button onClick={() => setColor('#ffddaa')} className={`w-8 h-8 rounded-full border-2 ${color === '#ffddaa' ? 'border-white' : 'border-transparent'} bg-[#ffddaa]`} title="Bone" />
                            <button onClick={() => setColor('#ff8888')} className={`w-8 h-8 rounded-full border-2 ${color === '#ff8888' ? 'border-white' : 'border-transparent'} bg-red-400`} title="Angio" />
                            <button onClick={() => setColor('#88ffaa')} className={`w-8 h-8 rounded-full border-2 ${color === '#88ffaa' ? 'border-white' : 'border-transparent'} bg-emerald-400`} title="Contrast" />
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="p-3 bg-cyan-900/20 border border-cyan-500/20 rounded-lg">
                        <p className="text-[10px] text-cyan-200">
                            <strong>SOTA Tech:</strong> This uses a GLSL Raymarching shader to calculate light transport through a 3D texture in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
