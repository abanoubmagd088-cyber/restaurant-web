import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makePlanetTexture } from './palette';

// A procedurally-textured planet with optional ring. Used in the cosmic journey
// and visible through restaurant windows.
export default function Planet({
  position = [0, 0, 0] as [number, number, number],
  radius = 8,
  baseColor = '#1e3a8a',
  accentColor = '#0ea5e9',
  hasRing = false,
  rotationSpeed = 0.05,
}: {
  position?: [number, number, number];
  radius?: number;
  baseColor?: string;
  accentColor?: string;
  hasRing?: boolean;
  rotationSpeed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = makePlanetTexture(baseColor, accentColor);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0.1}
          emissive={baseColor}
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {hasRing && (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[radius * 1.4, radius * 2.1, 128]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}
