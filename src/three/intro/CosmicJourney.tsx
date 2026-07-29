import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StarField from '../shared/StarField';
import Planet from '../shared/Planet';

// The hero spaceship — a sleek chrome vessel with glowing engines.
function Spaceship({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const engineMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.15;
      groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
    }
    if (engineMatRef.current) {
      engineMatRef.current.emissiveIntensity =
        2 + Math.sin(t * 8) * 0.5 + progressRef.current * 3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main hull */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.5, 2.2, 8, 16]} />
        <meshStandardMaterial
          color="#cfd8e3"
          metalness={0.95}
          roughness={0.15}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Nose cone */}
      <mesh position={[1.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.5, 0.8, 16]} />
        <meshStandardMaterial
          color="#5eead4"
          metalness={0.8}
          roughness={0.2}
          emissive="#22d3ee"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0.4, 0.35, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#0ea5e9"
          metalness={0.6}
          roughness={0.1}
          transparent
          opacity={0.7}
          emissive="#22d3ee"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Wings */}
      <mesh position={[-0.4, -0.1, 0.6]} rotation={[0.3, 0, -0.2]}>
        <boxGeometry args={[1, 0.08, 0.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.4, -0.1, -0.6]} rotation={[-0.3, 0, -0.2]}>
        <boxGeometry args={[1, 0.08, 0.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Engine glow */}
      <mesh position={[-1.4, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          ref={engineMatRef}
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={3}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        position={[-1.4, 0, 0]}
        color="#22d3ee"
        intensity={5}
        distance={8}
      />
    </group>
  );
}

// A cosmic tunnel made of rings that the ship flies through.
function CosmicTunnel() {
  const groupRef = useRef<THREE.Group>(null);
  const rings = useMemo(() => {
    const arr: { z: number; color: string; r: number }[] = [];
    const colors = ['#22d3ee', '#e879f9', '#fbbf24', '#5eead4', '#f9a8d4'];
    for (let i = 0; i < 40; i++) {
      arr.push({
        z: -i * 4 - 20,
        color: colors[i % colors.length],
        r: 3 + Math.sin(i * 0.3) * 0.8,
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.3;
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ring.r, 0.08, 8, 64]} />
          <meshStandardMaterial
            color={ring.color}
            emissive={ring.color}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating asteroids near the flight path
function Asteroids() {
  const refs = useRef<THREE.Mesh[]>([]);
  const asteroids = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        -Math.random() * 120 - 10,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.8,
      rotSpeed: 0.2 + Math.random() * 0.6,
      seed: i,
    }));
  }, []);

  useFrame((_, delta) => {
    refs.current.forEach((m, i) => {
      if (m) {
        m.rotation.x += delta * asteroids[i].rotSpeed;
        m.rotation.y += delta * asteroids[i].rotSpeed * 0.7;
      }
    });
  });

  return (
    <>
      {asteroids.map((a, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={a.pos}
          scale={a.scale}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.2} />
        </mesh>
      ))}
    </>
  );
}

// The full cinematic journey scene. Camera flies forward through space.
export default function CosmicJourney({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const cameraTarget = useRef(new THREE.Vector3(0, 0, -40));

  useFrame((state, delta) => {
    const p = progressRef.current;
    // Camera dolly forward with gentle sway, intensifying in the tunnel
    const sway = Math.sin(state.clock.elapsedTime * 0.5) * (0.5 + p * 1.5);
    const swayY = Math.cos(state.clock.elapsedTime * 0.4) * (0.3 + p * 1.2);
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      sway,
      0.05
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      swayY,
      0.05
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      6 - p * 30,
      0.04
    );
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#22d3ee" />
      <pointLight position={[-10, -5, -20]} intensity={3} color="#e879f9" />

      <StarField count={3000} radius={250} size={0.8} />

      {/* Passing planets along the journey */}
      <Planet position={[-8, 3, -25]} radius={4} baseColor="#7c3aed" accentColor="#e879f9" hasRing rotationSpeed={0.1} />
      <Planet position={[10, -4, -50]} radius={6} baseColor="#0f766e" accentColor="#5eead4" rotationSpeed={0.06} />
      <Planet position={[-6, 5, -75]} radius={3} baseColor="#b45309" accentColor="#fbbf24" rotationSpeed={0.12} />
      <Planet position={[8, -3, -100]} radius={5} baseColor="#1e40af" accentColor="#60a5fa" hasRing rotationSpeed={0.04} />

      <CosmicTunnel />
      <Asteroids />

      {/* The hero ship — stays near camera, flying "with" us */}
      <group position={[0, -0.5, 3]}>
        <Spaceship progressRef={progressRef} />
      </group>

      <fog attach="fog" args={['#05060d', 30, 180]} />
    </>
  );
}
