"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MeshPhysicalMaterial, DoubleSide, MathUtils } from "three";

// Module-level singleton — mutated in useFrame for amplitude breathing
const mikuMaterial = new MeshPhysicalMaterial({
  transmission: 0.85,
  thickness: 0.30,
  roughness: 0.06,
  metalness: 0,
  ior: 1.1,
  color: "#c8f0ec",
  emissive: "#39C5BB",
  emissiveIntensity: 0.20,
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
});

interface MikuForegroundProps {
  amplitude: number;
  isChorus: boolean;
}

export default function MikuForeground({ amplitude, isChorus }: MikuForegroundProps) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const lerp = 1 - Math.exp(-4 * delta);

    // Emissive breathes with voice
    mikuMaterial.emissiveIntensity = MathUtils.lerp(
      mikuMaterial.emissiveIntensity,
      0.12 + amplitude * 0.55 + (isChorus ? 0.18 : 0),
      lerp
    );

    // Subtle body-scale breath (keeps at 1.5 base scale)
    if (groupRef.current) {
      const breath = 1.5 * (1 + Math.sin(t * 1.2) * 0.005 + amplitude * 0.008);
      groupRef.current.scale.setScalar(breath);
    }
  });

  return (
    // Positioned close to camera (z=-6) so she fills ~25% of vertical screen
    <group ref={groupRef} position={[0, -0.4, -6]} scale={1.5}>
      {/* ── Head ── */}
      <mesh position={[0, 2.82, 0]}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>

      {/* ── Twin-tails ── */}
      <mesh position={[-0.36, 2.55, 0]} rotation={[0, 0, 0.38]}>
        <cylinderGeometry args={[0.065, 0.09, 1.05, 8]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[0.36, 2.55, 0]} rotation={[0, 0, -0.38]}>
        <cylinderGeometry args={[0.065, 0.09, 1.05, 8]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, 2.22, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.22, 10]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>

      {/* ── Torso ── */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 1.10, 14]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>

      {/* ── Arms ── */}
      <mesh position={[-0.46, 1.60, 0]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.075, 0.075, 0.95, 8]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[0.46, 1.60, 0]} rotation={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.075, 0.075, 0.95, 8]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>

      {/* ── Skirt ── */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.32, 0.46, 0.62, 14]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>

      {/* ── Legs ── */}
      <mesh position={[-0.14, 0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 1.10, 8]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[0.14, 0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 1.10, 8]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>

      {/* ── Boots ── */}
      <mesh position={[-0.14, -0.44, 0]}>
        <boxGeometry args={[0.22, 0.40, 0.16]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[0.14, -0.44, 0]}>
        <boxGeometry args={[0.22, 0.40, 0.16]} />
        <primitive object={mikuMaterial} attach="material" dispose={null} />
      </mesh>
    </group>
  );
}
