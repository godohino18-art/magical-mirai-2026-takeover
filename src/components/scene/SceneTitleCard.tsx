"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import { MeshPhysicalMaterial, MathUtils } from "three";

// Three.js built-in font — reliable CDN, no CORS issues
const FONT_URL =
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

interface SceneTitleCardProps {
  introComplete: boolean;
  hasLyric: boolean;
}

export default function SceneTitleCard({ introComplete, hasLyric }: SceneTitleCardProps) {
  const matRef = useRef<MeshPhysicalMaterial>(null);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    // Visible before music starts OR between lyrics; dims when a lyric phrase is displayed
    const wantVisible = !introComplete || !hasLyric;
    const targetEmissive = wantVisible ? 0.35 : 0.0;
    matRef.current.emissiveIntensity = MathUtils.lerp(
      matRef.current.emissiveIntensity,
      targetEmissive,
      1 - Math.exp(-2 * delta)
    );
  });

  return (
    <Center position={[0, 5.2, -4]}>
      <Text3D
        font={FONT_URL}
        size={0.42}
        height={0.06}
        curveSegments={8}
        bevelEnabled
        bevelThickness={0.008}
        bevelSize={0.004}
        bevelSegments={3}
      >
        PRISM RESONANCE
        <meshPhysicalMaterial
          ref={matRef}
          transmission={0.88}
          thickness={0.3}
          roughness={0.06}
          metalness={0}
          ior={1.5}
          color="#b0ece8"
          emissive="#39C5BB"
          emissiveIntensity={0.35}
          transparent
          depthWrite={false}
        />
      </Text3D>
    </Center>
  );
}
