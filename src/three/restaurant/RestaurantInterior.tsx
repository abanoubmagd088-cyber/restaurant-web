import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StarField from '../shared/StarField';
import Planet from '../shared/Planet';

// A glowing holographic ring decoration that rotates slowly
function HoloRing({
  position,
  color = '#22d3ee',
  scale = 1,
}: {
  position: [number, number, number];
  color?: string;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4;
      ref.current.rotation.x += delta * 0.2;
    }
  });
  return (
    <group position={position} scale={scale}>
      <group ref={ref}>
        <mesh>
          <torusGeometry args={[1, 0.03, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.03, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1, 0.03, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
      <pointLight color={color} intensity={2} distance={6} />
    </group>
  );
}

// A luxury dining table with chrome finish and glowing edge
function DiningTable({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.05, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      {/* Glowing edge ring */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>
      {/* Central base */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.3, 0.8, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
      </mesh>
      {/* Holographic centerpiece */}
      <mesh position={[0, 1.1, 0]}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#5eead4"
          emissive="#5eead4"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
      {/* Chairs */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <group
            key={i}
            position={[Math.cos(angle) * 1.4, 0.5, Math.sin(angle) * 1.4]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.5, -0.18]}>
              <boxGeometry args={[0.4, 0.6, 0.05]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.2, -0.18]}>
              <boxGeometry args={[0.4, 0.4, 0.05]} />
              <meshStandardMaterial
                color="#22d3ee"
                emissive="#22d3ee"
                emissiveIntensity={0.5}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// A VIP dining capsule — a transparent sphere with a table inside
function VIPCapsule({
  position,
  color = '#e879f9',
}: {
  position: [number, number, number];
  color?: string;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });
  return (
    <group position={position}>
      <group ref={ref}>
        {/* Glass shell */}
        <mesh>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.15}
            metalness={0.3}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glowing frame rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.05, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.6, 0.05, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
          />
        </mesh>
        {/* Mini table inside */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            wireframe
          />
        </mesh>
      </group>
      <pointLight color={color} intensity={1.5} distance={5} />
    </group>
  );
}

// A small floating robot companion with a glowing eye
function Robot({
  position,
  color = '#5eead4',
  speed = 0.3,
  offset = 0,
}: {
  position: [number, number, number];
  color?: string;
  speed?: number;
  offset?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset;
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(t) * 2;
      ref.current.position.y = position[1] + Math.sin(t * 2) * 0.3;
      ref.current.position.z = position[2] + Math.cos(t * 0.7) * 1.5;
      ref.current.rotation.y = Math.sin(t) * 0.5;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.25, 0.3, 8, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      {/* Eye */}
      <mesh position={[0, 0.25, 0.2]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
        />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight color={color} intensity={0.8} distance={3} />
    </group>
  );
}

// A walking character — abstract humanoid figure with a glow
function Character({
  position,
  color = '#22d3ee',
  speed = 0.2,
  offset = 0,
  range = 4,
}: {
  position: [number, number, number];
  color?: string;
  speed?: number;
  offset?: number;
  range?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset;
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(t) * range;
      ref.current.position.y =
        position[1] + Math.abs(Math.sin(t * 4)) * 0.08;
      ref.current.rotation.y = Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color="#e0f2fe"
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.12, 0.12]}>
        <boxGeometry args={[0.2, 0.08, 0.05]} />
        <meshStandardMaterial
          color="#0c4a6e"
          metalness={0.9}
          roughness={0.1}
          emissive="#22d3ee"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// A flying spaceship visible through the windows, moving outside
function FlyingShip({
  position,
  color = '#fbbf24',
  speed = 0.15,
  offset = 0,
}: {
  position: [number, number, number];
  color?: string;
  speed?: number;
  offset?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset;
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(t) * 30;
      ref.current.position.y = position[1] + Math.sin(t * 0.5) * 2;
      ref.current.position.z = position[2];
      ref.current.rotation.y = Math.sin(t) * 0.3;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[-0.9, 0, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
        />
      </mesh>
      <pointLight color={color} intensity={2} distance={10} />
    </group>
  );
}

// The transparent futuristic kitchen where chefs prepare food
function Kitchen() {
  const stationsRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (stationsRef.current) stationsRef.current.rotation.y += delta * 0.05;
  });
  return (
    <group position={[0, -2, -12]}>
      {/* Counter */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.1, 1.5]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Glowing counter edge */}
      <mesh position={[0, 0.06, 0.75]}>
        <boxGeometry args={[6, 0.02, 0.02]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>
      {/* Holographic chef stations */}
      <group ref={stationsRef} position={[0, 0.6, 0]}>
        {[-2, 0, 2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.3, 0.02, 8, 32]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={2}
              />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={1.5}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        ))}
      </group>
      {/* Glass wall */}
      <mesh position={[0, 1.5, -0.8]}>
        <boxGeometry args={[6, 2.5, 0.05]} />
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
  );
}

// A floating platform
function FloatingPlatform({
  position,
  scale = 1,
  color = '#22d3ee',
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <cylinderGeometry args={[2, 2.2, 0.2, 32]} />
      <meshStandardMaterial
        color="#1e293b"
        metalness={0.9}
        roughness={0.2}
      />
    </mesh>
  );
}

// The full restaurant interior scene
export default function RestaurantInterior({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Gentle camera orbit influenced by mouse for parallax
    const targetX = mouseRef.current.x * 2;
    const targetY = 2 + mouseRef.current.y * 1;
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      targetX,
      0.04
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY,
      0.04
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      14,
      0.02
    );
    state.camera.lookAt(0, 0, -5);

    if (groupRef.current) {
      groupRef.current.rotation.y +=
        delta * 0.02 * (1 + mouseRef.current.x * 0.5);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#5eead4" />
      <pointLight position={[0, 8, 0]} intensity={3} color="#22d3ee" />
      <pointLight position={[-10, 4, -5]} intensity={2} color="#e879f9" />
      <pointLight position={[10, 4, -5]} intensity={2} color="#fbbf24" />
      <spotLight
        position={[0, 12, 5]}
        angle={0.6}
        penumbra={0.8}
        intensity={3}
        color="#e0f2fe"
      />

      <group ref={groupRef}>
        {/* Main floor — large disc */}
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[14, 64]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Floor glow rings */}
        {[3, 6, 9, 12].map((r) => (
          <mesh
            key={r}
            position={[0, -1.98, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[r, r + 0.05, 64]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={1.5}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Central bar / island */}
        <mesh position={[0, -1, -4]}>
          <cylinderGeometry args={[1.5, 1.8, 2, 32]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.05, -4]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.55, 32]} />
          <meshStandardMaterial
            color="#5eead4"
            emissive="#5eead4"
            emissiveIntensity={2}
          />
        </mesh>

        {/* Dining tables arranged around */}
        <DiningTable position={[-5, -1.8, 2]} />
        <DiningTable position={[5, -1.8, 2]} />
        <DiningTable position={[-5, -1.8, -2]} />
        <DiningTable position={[5, -1.8, -2]} />
        <DiningTable position={[0, -1.8, 5]} />

        {/* VIP capsules elevated on sides */}
        <VIPCapsule position={[-9, 1, -3]} color="#e879f9" />
        <VIPCapsule position={[9, 1, -3]} color="#fbbf24" />
        <VIPCapsule position={[-9, 3, -6]} color="#22d3ee" />
        <VIPCapsule position={[9, 3, -6]} color="#5eead4" />

        {/* Floating platforms */}
        <FloatingPlatform position={[-6, 0, 4]} scale={0.6} />
        <FloatingPlatform position={[6, 0, 4]} scale={0.6} color="#e879f9" />
        <FloatingPlatform position={[0, 2, -8]} scale={0.8} color="#fbbf24" />

        {/* Holographic decorations */}
        <HoloRing position={[0, 4, -6]} color="#22d3ee" scale={1.5} />
        <HoloRing position={[-4, 3, 2]} color="#e879f9" scale={0.8} />
        <HoloRing position={[4, 3, 2]} color="#fbbf24" scale={0.8} />
        <HoloRing position={[0, 6, 0]} color="#5eead4" scale={2} />

        {/* Kitchen */}
        <Kitchen />

        {/* Characters — robots and explorers */}
        <Robot position={[-3, 0, 3]} color="#5eead4" speed={0.3} offset={0} />
        <Robot position={[3, 0, 3]} color="#fbbf24" speed={0.25} offset={2} />
        <Robot position={[0, 0, -2]} color="#e879f9" speed={0.35} offset={4} />
        <Character position={[-4, -1.8, 0]} color="#22d3ee" speed={0.15} range={3} />
        <Character position={[4, -1.8, 0]} color="#5eead4" speed={0.2} offset={1.5} range={3} />
        <Character position={[0, -1.8, 4]} color="#f9a8d4" speed={0.18} offset={3} range={2.5} />

        {/* Giant glass dome ceiling */}
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[16, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#22d3ee"
            transparent
            opacity={0.06}
            metalness={0.5}
            roughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Dome frame arcs */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[0, 0, 0]}
            rotation={[0, (i / 4) * Math.PI, 0]}
          >
            <torusGeometry args={[16, 0.08, 8, 32, Math.PI / 2]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={1}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}

        {/* Exterior visible through the dome — stars and planets */}
        <StarField count={2000} radius={200} size={0.7} />
        <Planet position={[-40, 20, -80]} radius={12} baseColor="#7c3aed" accentColor="#e879f9" hasRing rotationSpeed={0.02} />
        <Planet position={[50, 10, -100]} radius={8} baseColor="#0f766e" accentColor="#5eead4" rotationSpeed={0.03} />
        <Planet position={[20, 30, -120]} radius={6} baseColor="#b45309" accentColor="#fbbf24" rotationSpeed={0.04} />

        {/* Flying ships outside */}
        <FlyingShip position={[0, 5, -50]} color="#fbbf24" speed={0.12} offset={0} />
        <FlyingShip position={[0, 8, -60]} color="#22d3ee" speed={0.1} offset={3} />
        <FlyingShip position={[0, 3, -70]} color="#e879f9" speed={0.15} offset={1.5} />
      </group>

      <fog attach="fog" args={['#05060d', 25, 120]} />
    </>
  );
}
