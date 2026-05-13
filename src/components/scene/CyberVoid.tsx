"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import {
  BloomEffect,
  ChromaticAberrationEffect,
  VignetteEffect,
  BlendFunction,
} from "postprocessing";
import { MathUtils, Vector2 } from "three";
import InfiniteGrid from "./InfiniteGrid";
import FloatingStructures from "./FloatingStructures";
import ParticleField from "./ParticleField";
import LyricVisualizer from "./LyricVisualizer";
import CameraRig from "./CameraRig";
import {
  BLOOM_INTENSITY,
  BLOOM_THRESHOLD,
  BLOOM_RADIUS,
  VIGNETTE_OFFSET,
  VIGNETTE_DARKNESS,
  CHROMATIC_OFFSET,
  CHORUS_BLOOM_MULTIPLIER,
  CHORUS_CHROMATIC_MULTIPLIER,
} from "@/lib/constants";

// Module-level singletons: initialized once, mutated every frame via useFrame.
// Avoids both useMemo immutability violations and ref.current access during render.
const bloomEffect = new BloomEffect({
  blendFunction: BlendFunction.ADD,
  intensity: BLOOM_INTENSITY,
  luminanceThreshold: BLOOM_THRESHOLD,
  radius: BLOOM_RADIUS,
});
const chromaticEffect = new ChromaticAberrationEffect({
  offset: new Vector2(CHROMATIC_OFFSET, CHROMATIC_OFFSET),
  radialModulation: false,
  modulationOffset: 0,
});
const vignetteEffect = new VignetteEffect({
  offset: VIGNETTE_OFFSET,
  darkness: VIGNETTE_DARKNESS,
});

// ---- Dynamic Post-Processing -------------------------------------------
interface DynamicEffectsProps {
  amplitude: number;
  isChorus: boolean;
}

function DynamicEffects({ amplitude, isChorus }: DynamicEffectsProps) {
  useFrame((_, delta) => {
    const targetBloom = isChorus
      ? BLOOM_INTENSITY * CHORUS_BLOOM_MULTIPLIER
      : BLOOM_INTENSITY + amplitude * 1.5;
    bloomEffect.intensity = MathUtils.lerp(
      bloomEffect.intensity,
      targetBloom,
      1 - Math.exp(-6 * delta)
    );

    const targetCA = isChorus
      ? CHROMATIC_OFFSET * CHORUS_CHROMATIC_MULTIPLIER
      : CHROMATIC_OFFSET + amplitude * 0.008;
    const caLerp = 1 - Math.exp(-5 * delta);
    chromaticEffect.offset.x = MathUtils.lerp(chromaticEffect.offset.x, targetCA, caLerp);
    chromaticEffect.offset.y = MathUtils.lerp(
      chromaticEffect.offset.y,
      targetCA * 0.6,
      caLerp
    );
  });

  return (
    <EffectComposer>
      <primitive object={bloomEffect} dispose={null} />
      <primitive object={chromaticEffect} dispose={null} />
      <primitive object={vignetteEffect} dispose={null} />
    </EffectComposer>
  );
}

// ---- Main Scene --------------------------------------------------------
interface CyberVoidProps {
  amplitude: number;
  beat: number;
  isChorus: boolean;
  currentLyric: string;
  introComplete: boolean;
}

export default function CyberVoid({
  amplitude,
  beat,
  isChorus,
  currentLyric,
  introComplete,
}: CyberVoidProps) {
  const pointLightRef = useRef(null);

  useFrame(() => {
    if (!pointLightRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const light = pointLightRef.current as any;
    const targetR = isChorus ? 1.0 : 0.25;
    const targetG = isChorus ? 0.0 : 0.5;
    const targetB = isChorus ? 0.5 : 1.0;
    light.color.r = MathUtils.lerp(light.color.r, targetR, 0.05);
    light.color.g = MathUtils.lerp(light.color.g, targetG, 0.05);
    light.color.b = MathUtils.lerp(light.color.b, targetB, 0.05);
    light.intensity = 2 + amplitude * 4 + beat * 2;
  });

  return (
    <>
      <CameraRig introComplete={introComplete} />

      <ambientLight intensity={0.1} color="#0a1030" />
      <pointLight
        ref={pointLightRef}
        position={[0, 10, 0]}
        intensity={2}
        color="#4080ff"
      />
      <pointLight
        position={[0, -5, 0]}
        intensity={0.5 + beat * 2}
        color={isChorus ? "#ff0066" : "#00cfff"}
      />

      <InfiniteGrid amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <FloatingStructures amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <ParticleField amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <LyricVisualizer currentLyric={currentLyric} isChorus={isChorus} />

      <DynamicEffects amplitude={amplitude} isChorus={isChorus} />
    </>
  );
}
