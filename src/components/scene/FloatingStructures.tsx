"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group, MathUtils } from "three";
import { STRUCTURE_COUNT } from "@/lib/constants";

// Generated once at module load — stable random data, no useMemo needed.
interface StructureData {
  id: number;
  position: [number, number, number];
  rotationSpeed: [number, number, number];
  scale: number;
  shapeIndex: number;
}
const STRUCTURE_DATA: StructureData[] = Array.from(
  { length: STRUCTURE_COUNT },
  (_, i) => {
    const angle = (i / STRUCTURE_COUNT) * Math.PI * 2;
    const radius = 6 + Math.random() * 6;
    return {
      id: i,
      position: [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius,
      ],
      rotationSpeed: [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ],
      scale: 0.4 + Math.random() * 0.8,
      shapeIndex: i,
    };
  }
);

interface StructureProps {
  position: [number, number, number];
  rotationSpeed: [number, number, number];
  scale: number;
  amplitude: number;
  beat: number;
  isChorus: boolean;
  shapeIndex: number;
}

function Structure({
  position,
  rotationSpeed,
  scale,
  amplitude,
  beat,
  isChorus,
  shapeIndex,
}: StructureProps) {
  const meshRef = useRef<Mesh>(null);
  const chorusSpeedRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Chorus: smoothly increase rotation speed to scatter light
    chorusSpeedRef.current = MathUtils.lerp(
      chorusSpeedRef.current,
      isChorus ? 1 : 0,
      1 - Math.exp(-2 * delta)
    );
    const speedMult = 1 + chorusSpeedRef.current * 2.5;

    meshRef.current.rotation.x += rotationSpeed[0] * 0.01 * speedMult;
    meshRef.current.rotation.y += rotationSpeed[1] * 0.01 * speedMult;
    meshRef.current.rotation.z += rotationSpeed[2] * 0.005 * speedMult;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.4;

    const targetScale = scale * (1 + beat * 0.25 + amplitude * 0.1 + (isChorus ? 0.3 : 0));
    meshRef.current.scale.setScalar(
      meshRef.current.scale.x + (targetScale - meshRef.current.scale.x) * 0.15
    );
  });

  const geometry = useMemo(() => {
    switch (shapeIndex % 4) {
      case 0: return <octahedronGeometry args={[1, 2]} />;
      case 1: return <icosahedronGeometry args={[1, 1]} />;
      case 2: return <torusGeometry args={[0.8, 0.25, 8, 20]} />;
      default: return <tetrahedronGeometry args={[1, 2]} />;
    }
  }, [shapeIndex]);

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {geometry}
      <meshPhysicalMaterial
        transmission={1.0}
        thickness={2.0}
        roughness={0.1}
        metalness={0.1}
        ior={1.5}
        transparent
      />
    </mesh>
  );
}

interface FloatingStructuresProps {
  amplitude: number;
  beat: number;
  isChorus?: boolean;
}

export default function FloatingStructures({
  amplitude,
  beat,
  isChorus = false,
}: FloatingStructuresProps) {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      {STRUCTURE_DATA.map((s) => (
        <Structure
          key={s.id}
          position={s.position}
          rotationSpeed={s.rotationSpeed}
          scale={s.scale}
          amplitude={amplitude}
          beat={beat}
          isChorus={isChorus}
          shapeIndex={s.shapeIndex}
        />
      ))}
    </group>
  );
}
