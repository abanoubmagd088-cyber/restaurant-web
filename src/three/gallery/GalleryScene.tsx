import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StarField from '../shared/StarField';
import Planet from '../shared/Planet';

// Gallery — a cinematic 3D corridor of luxury dining moments and space
// adventure experiences, displayed as floating glowing frames.
export default function GalleryScene({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
    const mx = mouseRef.current.x * 2;
    const my = 2 + mouseRef.current.y * 1;
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      mx,
      0.04
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      my,
      0.04
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      14,
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });

  const frames = [
    { angle: 0, color: '#22d3ee', title: 'Aurora Tasting' },
    { angle: Math.PI / 3, color: '#e879f9', title: 'VIP Capsule' },
    { angle: (2 * Math.PI) / 3, color: '#fbbf24', title: 'Galaxy Lounge' },
    { angle: Math.PI, color: '#5eead4', title: 'Chef at Work' },
    { angle: (4 * Math.PI) / 3, color: '#f9a8d4', title: 'Orbital Toast' },
    { angle: (5 * Math.PI) / 3, color: '#60a5fa', title: 'Starlight Dance' },
  ];

  return (
    <>
      <ambientLight intensity={0.3} color="#5eead4" />
      <pointLight position={[0, 6, 0]} intensity={3} color="#22d3ee" />
      <pointLight position={[0, -3, 0]} intensity={2} color="#e879f9" />

      <group ref={groupRef}>
        {frames.map((f, i) => {
          const x = Math.cos(f.angle) * 6;
          const z = Math.sin(f.angle) * 6;
          return (
            <group key={i} position={[x, 0, z]} rotation={[0, -f.angle + Math.PI / 2, 0]}>
              {/* Frame */}
              <mesh>
                <boxGeometry args={[2.4, 1.6, 0.08]} />
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.9}
                  roughness={0.15}
                />
              </mesh>
              {/* Glow border */}
              <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[2.3, 1.5, 0.02]} />
                <meshStandardMaterial
                  color={f.color}
                  emissive={f.color}
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.5}
                />
              </mesh>
              {/* Holographic image plane */}
              <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[2.2, 1.4]} />
                <meshStandardMaterial
                  color={f.color}
                  emissive={f.color}
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.25}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Floating particles around frame */}
              {Array.from({ length: 5 }).map((_, j) => {
                const a = (j / 5) * Math.PI * 2;
                return (
                  <mesh
                    key={j}
                    position={[Math.cos(a) * 1.4, Math.sin(a) * 1, 0.1]}
                  >
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial
                      color={f.color}
                      emissive={f.color}
                      emissiveIntensity={3}
                    />
                  </mesh>
                );
              })}
              <pointLight color={f.color} intensity={1} distance={5} />
            </group>
          );
        })}

        {/* Central pedestal */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 1, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <icosahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.5}
            wireframe
          />
        </mesh>
      </group>

      <StarField count={2000} radius={200} size={0.7} />
      <Planet position={[-40, 10, -70]} radius={8} baseColor="#7c3aed" accentColor="#e879f9" rotationSpeed={0.02} />
      <Planet position={[45, -5, -90]} radius={6} baseColor="#0f766e" accentColor="#5eead4" hasRing rotationSpeed={0.03} />

      <fog attach="fog" args={['#05060d', 25, 120]} />
    </>
  );
}
