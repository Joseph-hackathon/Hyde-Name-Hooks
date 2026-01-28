import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Octahedron, Torus, Dodecahedron } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShapes() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Central Shape */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Dodecahedron args={[1.5, 0]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#5298FF" roughness={0.1} metalness={0.1} />
                </Dodecahedron>
            </Float>

            {/* Orbiting Shapes */}
            <Float speed={4} rotationIntensity={1} floatIntensity={1}>
                <Torus args={[0.8, 0.2, 16, 32]} position={[3, 1, -2]} rotation={[1, 1, 0]}>
                    <meshStandardMaterial color="#8B5CF6" roughness={0.1} />
                </Torus>
            </Float>

            <Float speed={3} rotationIntensity={2} floatIntensity={1}>
                <Octahedron args={[0.6]} position={[-3, -1, 1]}>
                    <meshStandardMaterial color="#58C3F5" roughness={0.1} />
                </Octahedron>
            </Float>
        </group>
    );
}

export default function HeroScene() {
    return (
        <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -5, 10]} intensity={0.5} color="#5298FF" />

            <FloatingShapes />

            {/* Soft Environment Reflection */}
            <Environment preset="studio" />
        </Canvas>
    );
}
