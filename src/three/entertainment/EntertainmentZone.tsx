import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StarField from '../shared/StarField';

// Entertainment area — futuristic space games, galaxy rooms, and interactive
// attractions rendered as glowing holographic installations.
export default function EntertainmentZone({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const carouselRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (carouselRef.current) {
      carouselRef.current.rotation.y += delta * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
      ringRef.current.rotation.x += delta * 0.2;
    }
    // Camera slow orbit with mouse parallax
    const mx = mouseRef.current.x * 3;
    const my = 3 + mouseRef.current.y * 1.5;
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
      12,
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });

  // Game station colors
  const stationColors = ['#22d3ee', '#e879f9', '#fbbf24', '#5eead4', '#f9a8d4', '#60a5fa'];

  return (
    <>
      <ambientLight intensity={0.3} color="#5eead4" />
      <pointLight position={[0, 6, 0]} intensity={3} color="#22d3ee" />
      <pointLight position={[-8, 3, 4]} intensity={2} color="#e879f9" />
      <pointLight position={[8, 3, 4]} intensity={2} color="#fbbf24" />

      {/* Central rotating game carousel */}
      <group ref={carouselRef} position={[0, 0, 0]}>
        {stationColors.map((color, i) => {
          const angle = (i / stationColors.length) * Math.PI * 2;
          const x = Math.cos(angle) * 3;
          const z = Math.sin(angle) * 3;
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Game pod */}
              <mesh>
                <capsuleGeometry args={[0.5, 0.8, 8, 16]} />
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.9}
                  roughness={0.15}
                />
              </mesh>
              {/* Holographic screen */}
              <mesh position={[0, 0.6, 0.5]}>
                <boxGeometry args={[0.6, 0.4, 0.02]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={2}
                  transparent
                  opacity={0.7}
                />
              </mesh>
              <pointLight color={color} intensity={1.5} distance={4} />
            </group>
          );
        })}
      </group>

      {/* Central spinning ring — "galaxy room" portal */}
      <mesh ref={ringRef} position={[0, 2, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive="#5eead4"
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floor with glow grid */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      {[2, 4, 6, 8].map((r) => (
        <mesh
          key={r}
          position={[0, -1.48, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[r, r + 0.04, 64]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={1.2}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Floating holographic game icons */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i} position={[x, 3.5, -2]}>
          <mesh>
            <icosahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color={stationColors[i]}
              emissive={stationColors[i]}
              emissiveIntensity={1.5}
              wireframe
            />
          </mesh>
        </group>
      ))}

      <StarField count={1500} radius={180} size={0.6} />
      <fog attach="fog" args={['#05060d', 20, 100]} />
    </>
  );
}
