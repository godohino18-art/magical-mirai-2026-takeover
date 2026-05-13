"use client";

import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import CyberVoid from "./scene/CyberVoid";

interface Scene3DProps {
  amplitude: number;
  beat: number;
  isChorus: boolean;
  currentLyric: string;
  introComplete: boolean;
}

export default function Scene3D({
  amplitude,
  beat,
  isChorus,
  currentLyric,
  introComplete,
}: Scene3DProps) {
  return (
    <Canvas
      style={{ background: "#000005" }}
      camera={{ position: [0, 2, 14], fov: 65 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
    >
      {process.env.NODE_ENV === "development" && (
        <Perf position="top-left" />
      )}
      <CyberVoid
        amplitude={amplitude}
        beat={beat}
        isChorus={isChorus}
        currentLyric={currentLyric}
        introComplete={introComplete}
      />
    </Canvas>
  );
}
