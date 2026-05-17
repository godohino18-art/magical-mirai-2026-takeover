"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MeshPhysicalMaterial, DoubleSide, MathUtils } from "three";

// ── Material palette ─────────────────────────────────────────────────────
// Each zone of the costume gets its own glass identity.

const mikuHairMaterial = new MeshPhysicalMaterial({
  transmission: 0.82,
  thickness: 0.25,
  roughness: 0.05,
  metalness: 0,
  ior: 1.15,
  iridescence: 0.50,
  iridescenceIOR: 1.38,
  color: "#48e0d8",
  emissive: "#39C5BB",
  emissiveIntensity: 0.32,
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
});

const mikuBodyMaterial = new MeshPhysicalMaterial({
  transmission: 0.84,
  thickness: 0.30,
  roughness: 0.07,
  metalness: 0,
  ior: 1.10,
  color: "#c8f0ec",
  emissive: "#39C5BB",
  emissiveIntensity: 0.18,
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
});

// Black arm-sleeves, skirt inner panels, boots
const mikuDarkMaterial = new MeshPhysicalMaterial({
  transmission: 0.20,
  thickness: 0.42,
  roughness: 0.14,
  metalness: 0.05,
  ior: 1.32,
  color: "#08101a",
  emissive: "#39C5BB",
  emissiveIntensity: 0.07,
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
});

// Necktie + skirt hem + boot trim
const mikuAccentMaterial = new MeshPhysicalMaterial({
  transmission: 0.62,
  thickness: 0.18,
  roughness: 0.04,
  metalness: 0,
  ior: 1.22,
  color: "#39C5BB",
  emissive: "#39C5BB",
  emissiveIntensity: 0.55,
  transparent: true,
  depthWrite: false,
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
    const base = 0.12 + amplitude * 0.55 + (isChorus ? 0.18 : 0);

    mikuHairMaterial.emissiveIntensity   = MathUtils.lerp(mikuHairMaterial.emissiveIntensity,   base + 0.14, lerp);
    mikuBodyMaterial.emissiveIntensity   = MathUtils.lerp(mikuBodyMaterial.emissiveIntensity,   base,        lerp);
    mikuDarkMaterial.emissiveIntensity   = MathUtils.lerp(mikuDarkMaterial.emissiveIntensity,   base * 0.28, lerp);
    mikuAccentMaterial.emissiveIntensity = MathUtils.lerp(mikuAccentMaterial.emissiveIntensity, base + 0.32, lerp);

    if (groupRef.current) {
      const breath = 1.5 * (1 + Math.sin(t * 1.2) * 0.005 + amplitude * 0.008);
      groupRef.current.scale.setScalar(breath);
    }
  });

  // Local Y=0 is boot-bottom; Y=3.35 is head-top.
  // group.scale=1.5 and position=[0,-0.5,-6] place her filling ~30% of vertical screen.
  return (
    <group ref={groupRef} position={[0, -0.5, -6]} scale={1.5}>

      {/* HEAD — face sphere */}
      <mesh position={[0, 3.10, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>
      {/* Hair cap slightly larger, sitting over face */}
      <mesh position={[0, 3.20, 0.04]}>
        <sphereGeometry args={[0.236, 14, 14]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>

      {/* TWIN-TAIL ORNAMENT clips at temples */}
      <mesh position={[-0.20, 3.19, 0.06]}>
        <boxGeometry args={[0.09, 0.065, 0.055]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.20, 3.19, 0.06]}>
        <boxGeometry args={[0.09, 0.065, 0.055]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>

      {/*
        LEFT TWIN-TAIL — 4 segments.
        Seg1: thick root rising up-left from temple.
        Seg2: outward bend at top.
        Seg3: long main downward fall (covers ~2.3 local units).
        Seg4: tapered tip reaching near boot-level.
      */}
      <mesh position={[-0.28, 3.32, 0]} rotation={[0, 0, 0.46]}>
        <cylinderGeometry args={[0.078, 0.110, 0.52, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[-0.57, 3.28, 0]} rotation={[0, 0, 1.28]}>
        <cylinderGeometry args={[0.054, 0.080, 0.50, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[-0.73, 2.06, 0]} rotation={[0, 0, 0.09]}>
        <cylinderGeometry args={[0.032, 0.058, 2.35, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[-0.64, 0.47, 0]} rotation={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.005, 0.030, 1.12, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>

      {/* RIGHT TWIN-TAIL — mirror of left */}
      <mesh position={[ 0.28, 3.32, 0]} rotation={[0, 0, -0.46]}>
        <cylinderGeometry args={[0.078, 0.110, 0.52, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.57, 3.28, 0]} rotation={[0, 0, -1.28]}>
        <cylinderGeometry args={[0.054, 0.080, 0.50, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.73, 2.06, 0]} rotation={[0, 0, -0.09]}>
        <cylinderGeometry args={[0.032, 0.058, 2.35, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.64, 0.47, 0]} rotation={[0, 0, -0.04]}>
        <cylinderGeometry args={[0.005, 0.030, 1.12, 8]} />
        <primitive object={mikuHairMaterial} attach="material" dispose={null} />
      </mesh>

      {/* NECK */}
      <mesh position={[0, 2.68, 0]}>
        <cylinderGeometry args={[0.074, 0.084, 0.22, 10]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>

      {/* NECKTIE */}
      <mesh position={[0, 2.45, 0.11]}>
        <boxGeometry args={[0.072, 0.40, 0.038]} />
        <primitive object={mikuAccentMaterial} attach="material" dispose={null} />
      </mesh>

      {/* TORSO — sleeveless vest */}
      <mesh position={[0, 2.08, 0]}>
        <cylinderGeometry args={[0.225, 0.255, 0.88, 12]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>

      {/* UPPER ARMS — short white shirt sleeve */}
      <mesh position={[-0.37, 2.32, 0]} rotation={[0, 0, 0.22]}>
        <cylinderGeometry args={[0.060, 0.066, 0.28, 8]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.37, 2.32, 0]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.060, 0.066, 0.28, 8]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>

      {/* FOREARMS — black detached sleeves */}
      <mesh position={[-0.50, 1.92, 0]} rotation={[0, 0, 0.16]}>
        <cylinderGeometry args={[0.054, 0.061, 0.74, 8]} />
        <primitive object={mikuDarkMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.50, 1.92, 0]} rotation={[0, 0, -0.16]}>
        <cylinderGeometry args={[0.054, 0.061, 0.74, 8]} />
        <primitive object={mikuDarkMaterial} attach="material" dispose={null} />
      </mesh>

      {/* HANDS */}
      <mesh position={[-0.54, 1.49, 0]}>
        <sphereGeometry args={[0.050, 8, 8]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.54, 1.49, 0]}>
        <sphereGeometry args={[0.050, 8, 8]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>

      {/* WAIST */}
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.205, 0.225, 0.16, 12]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>

      {/* SKIRT — outer pale flare */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.265, 0.430, 0.52, 12]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>
      {/* SKIRT — inner dark panels */}
      <mesh position={[0, 1.36, 0]}>
        <cylinderGeometry args={[0.245, 0.375, 0.42, 8]} />
        <primitive object={mikuDarkMaterial} attach="material" dispose={null} />
      </mesh>
      {/* SKIRT — teal hem */}
      <mesh position={[0, 1.10, 0]}>
        <cylinderGeometry args={[0.398, 0.415, 0.038, 12]} />
        <primitive object={mikuAccentMaterial} attach="material" dispose={null} />
      </mesh>

      {/* THIGHS — bare skin between skirt hem and boot top */}
      <mesh position={[-0.11, 0.94, 0]}>
        <cylinderGeometry args={[0.080, 0.084, 0.40, 8]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.11, 0.94, 0]}>
        <cylinderGeometry args={[0.080, 0.084, 0.40, 8]} />
        <primitive object={mikuBodyMaterial} attach="material" dispose={null} />
      </mesh>

      {/* BOOTS — thigh-high dark shafts */}
      <mesh position={[-0.11, 0.48, 0]}>
        <cylinderGeometry args={[0.079, 0.083, 0.56, 8]} />
        <primitive object={mikuDarkMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.11, 0.48, 0]}>
        <cylinderGeometry args={[0.079, 0.083, 0.56, 8]} />
        <primitive object={mikuDarkMaterial} attach="material" dispose={null} />
      </mesh>

      {/* BOOT BASES */}
      <mesh position={[-0.11, 0.13, 0]}>
        <boxGeometry args={[0.20, 0.18, 0.14]} />
        <primitive object={mikuDarkMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.11, 0.13, 0]}>
        <boxGeometry args={[0.20, 0.18, 0.14]} />
        <primitive object={mikuDarkMaterial} attach="material" dispose={null} />
      </mesh>

      {/* BOOT TEAL TRIM — sole accent */}
      <mesh position={[-0.11, 0.042, 0]}>
        <boxGeometry args={[0.206, 0.022, 0.148]} />
        <primitive object={mikuAccentMaterial} attach="material" dispose={null} />
      </mesh>
      <mesh position={[ 0.11, 0.042, 0]}>
        <boxGeometry args={[0.206, 0.022, 0.148]} />
        <primitive object={mikuAccentMaterial} attach="material" dispose={null} />
      </mesh>

    </group>
  );
}
