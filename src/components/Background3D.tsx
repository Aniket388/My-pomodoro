import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 64, 64]} position={[-3, 1, -5]}>
          <MeshDistortMaterial
            color="#4f46e5"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.1}
            transmission={0.8}
            thickness={0.5}
          />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <Sphere args={[1.5, 64, 64]} position={[3, -2, -6]}>
          <MeshDistortMaterial
            color="#ec4899"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.2}
            metalness={0.1}
            transmission={0.8}
            thickness={0.5}
          />
        </Sphere>
      </Float>

      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[0.8, 64, 64]} position={[0, 3, -4]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.5}
            speed={3}
            roughness={0.1}
            metalness={0.2}
            transmission={0.9}
            thickness={0.5}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Environment preset="city" />
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
