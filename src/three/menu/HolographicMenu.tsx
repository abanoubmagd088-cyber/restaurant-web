import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Each dish is a stylized 3D holographic sculpture representing the course.
// They float, rotate, and can be spun by dragging.

type DishProps = {
  color: string;
  variant: number;
  autoRotate?: boolean;
};

function DishModel({ color, variant, autoRotate = true }: DishProps) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && autoRotate) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={ref}>
      {/* Holographic base disc */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.03, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Glow ring under base */}
      <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.85, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {variant === 0 && (
        // Caviar pearls in consommé — sphere with small spheres
        <>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
            <meshStandardMaterial
              color="#7f1d1d"
              metalness={0.3}
              roughness={0.4}
              transparent
              opacity={0.7}
            />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const r = 0.3 + Math.random() * 0.15;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * r, -0.3, Math.sin(angle) * r]}
              >
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.9}
                  roughness={0.1}
                  emissive={color}
                  emissiveIntensity={0.3}
                />
              </mesh>
            );
          })}
        </>
      )}

      {variant === 1 && (
        // Scallop — flattened disc with golden accent
        <>
          <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 0.15, 16]} />
            <meshStandardMaterial
              color="#fef3c7"
              metalness={0.5}
              roughness={0.3}
              emissive={color}
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.9}
              roughness={0.15}
              emissive="#fbbf24"
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      )}

      {variant === 2 && (
        // Wagyu — stacked layers
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} position={[0, -0.4 + i * 0.08, 0]}>
              <boxGeometry args={[0.6 - i * 0.05, 0.06, 0.5 - i * 0.04]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#7c2d12' : '#fbbf24'}
                metalness={0.4}
                roughness={0.5}
                emissive={i % 2 === 0 ? '#7c2d12' : '#fbbf24'}
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive={color}
              emissiveIntensity={1}
            />
          </mesh>
        </>
      )}

      {variant === 3 && (
        // Soufflé — rounded dome with glow
        <>
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
            <meshStandardMaterial
              color="#fef9c3"
              metalness={0.3}
              roughness={0.4}
              emissive={color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#f9a8d4"
              emissive="#f9a8d4"
              emissiveIntensity={2}
            />
          </mesh>
        </>
      )}

      {/* Holographic scan lines */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </group>
  );
}

// The interactive holographic menu scene — one dish at a time, draggable to rotate
export default function HolographicMenu({
  dishIndex,
  autoRotate,
}: {
  dishIndex: number;
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [drag, setDrag] = useState({ active: false, x: 0, rotY: 0 });
  const colors = useMemo(
    () => ['#22d3ee', '#fbbf24', '#e879f9', '#5eead4'],
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current && !drag.active) {
      groupRef.current.rotation.y += delta * (autoRotate ? 0.5 : 0);
    }
  });

  return (
    <group
      ref={groupRef}
      rotation={[0, drag.rotY, 0]}
      onPointerDown={(e) => {
        setDrag({ active: true, x: e.clientX, rotY: drag.rotY });
      }}
      onPointerMove={(e) => {
        if (drag.active) {
          const dx = e.clientX - drag.x;
          setDrag({ active: true, x: e.clientX, rotY: drag.rotY + dx * 0.01 });
        }
      }}
      onPointerUp={() => setDrag({ ...drag, active: false })}
      onPointerOut={() => setDrag({ ...drag, active: false })}
    >
      <DishModel color={colors[dishIndex]} variant={dishIndex} autoRotate={false} />
      <pointLight color={colors[dishIndex]} intensity={3} distance={6} />
      <ambientLight intensity={0.3} />
    </group>
  );
}
