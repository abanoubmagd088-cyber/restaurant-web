import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StarField from '../shared/StarField';
import Planet from '../shared/Planet';

// 360-degree virtual tour — a panoramic orbit around the restaurant exterior
// showing VIP rooms, dining areas, and galaxy views from multiple angles.
export default function VirtualTour({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Tour waypoints the camera cycles through
  const waypoints = useMemo(
    () => [
      { pos: [0, 2, 16] as [number, number, number], look: [0, 0, 0] as [number, number, number], label: 'Grand Dining Hall' },
      { pos: [12, 4, 8] as [number, number, number], look: [-4, 1, -4] as [number, number, number], label: 'VIP Capsule Lounge' },
      { pos: [-12, 6, 6] as [number, number, number], look: [4, 2, -6] as [number, number, number], label: 'Galaxy View Terrace' },
      { pos: [0, 10, 12] as [number, number, number], look: [0, 0, -8] as [number, number, number], label: 'Observation Deck' },
    ],
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cycleTime = 10;
    const idx = Math.floor((t / cycleTime) % waypoints.length);
    const localT = (t / cycleTime) % 1;
    const next = (idx + 1) % waypoints.length;
    const ease = localT < 0.8 ? 0 : (localT - 0.8) / 0.2;

    const wp = waypoints[idx];
    const wpNext = waypoints[next];
    const mx = mouseRef.current.x * 1.5;
    const my = mouseRef.current.y * 1;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      THREE.MathUtils.lerp(wp.pos[0], wpNext.pos[0], ease) + mx,
      0.03
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      THREE.MathUtils.lerp(wp.pos[1], wpNext.pos[1], ease) + my,
      0.03
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      THREE.MathUtils.lerp(wp.pos[2], wpNext.pos[2], ease),
      0.03
    );

    const lookX = THREE.MathUtils.lerp(wp.look[0], wpNext.look[0], ease);
    const lookY = THREE.MathUtils.lerp(wp.look[1], wpNext.look[1], ease);
    const lookZ = THREE.MathUtils.lerp(wp.look[2], wpNext.look[2], ease);
    state.camera.lookAt(lookX, lookY, lookZ);

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#5eead4" />
      <pointLight position={[0, 8, 0]} intensity={3} color="#22d3ee" />
      <pointLight position={[-15, 5, 5]} intensity={2} color="#e879f9" />
      <pointLight position={[15, 5, 5]} intensity={2} color="#fbbf24" />

      <group ref={groupRef}>
        {/* The restaurant exterior — a large ring-shaped station */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[8, 2.5, 32, 64]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Glowing edge rings */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[10.5, 0.1, 8, 64]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.5, 0.1, 8, 64]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={2}
          />
        </mesh>

        {/* Central core */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 2, 4, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* VIP capsule pods around the ring */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 8;
          const z = Math.sin(angle) * 8;
          return (
            <group key={i} position={[x, 0, z]}>
              <mesh>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? '#e879f9' : '#fbbf24'}
                  transparent
                  opacity={0.3}
                  metalness={0.5}
                  roughness={0.1}
                  emissive={i % 2 === 0 ? '#e879f9' : '#fbbf24'}
                  emissiveIntensity={0.5}
                />
              </mesh>
              <pointLight
                color={i % 2 === 0 ? '#e879f9' : '#fbbf24'}
                intensity={1}
                distance={4}
              />
            </group>
          );
        })}

        {/* Connecting spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 4;
          const z = Math.sin(angle) * 4;
          return (
            <mesh
              key={i}
              position={[x, 0, z]}
              rotation={[0, -angle, 0]}
              scale={[1, 0.15, 0.15]}
            >
              <boxGeometry args={[4, 1, 1]} />
              <meshStandardMaterial
                color="#334155"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          );
        })}

        {/* Glass dome on top */}
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#22d3ee"
            transparent
            opacity={0.1}
            metalness={0.5}
            roughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Exterior space environment */}
      <StarField count={2500} radius={250} size={0.7} />
      <Planet position={[-50, 15, -80]} radius={14} baseColor="#7c3aed" accentColor="#e879f9" hasRing rotationSpeed={0.01} />
      <Planet position={[60, -10, -100]} radius={10} baseColor="#0f766e" accentColor="#5eead4" rotationSpeed={0.02} />
      <Planet position={[30, 25, -130]} radius={7} baseColor="#b45309" accentColor="#fbbf24" rotationSpeed={0.03} />

      <fog attach="fog" args={['#05060d', 30, 150]} />
    </>
  );
}
