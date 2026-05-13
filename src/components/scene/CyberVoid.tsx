"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { Environment } from "@react-three/drei";
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
  const upperLightRef = useRef(null);
  const lowerLightRef = useRef(null);
  const ambientRef = useRef(null);

  useFrame((_, delta) => {
    const lerpSpeed = 1 - Math.exp(-2 * delta);

    // Upper point light: cool blue → warm amber
    if (upperLightRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ul = upperLightRef.current as any;
      ul.color.r = MathUtils.lerp(ul.color.r, isChorus ? 1.0  : 0.25, lerpSpeed);
      ul.color.g = MathUtils.lerp(ul.color.g, isChorus ? 0.65 : 0.5,  lerpSpeed);
      ul.color.b = MathUtils.lerp(ul.color.b, isChorus ? 0.18 : 1.0,  lerpSpeed);
      ul.intensity = 2 + amplitude * 4 + beat * 2;
    }

    // Lower point light: cyan → warm orange
    if (lowerLightRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ll = lowerLightRef.current as any;
      ll.color.r = MathUtils.lerp(ll.color.r, isChorus ? 1.0  : 0.0,  lerpSpeed);
      ll.color.g = MathUtils.lerp(ll.color.g, isChorus ? 0.53 : 0.81, lerpSpeed);
      ll.color.b = MathUtils.lerp(ll.color.b, isChorus ? 0.0  : 1.0,  lerpSpeed);
    }

    // Ambient: dark blue → dark amber
    if (ambientRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const al = ambientRef.current as any;
      al.color.r = MathUtils.lerp(al.color.r, isChorus ? 0.18 : 0.04, lerpSpeed * 0.5);
      al.color.g = MathUtils.lerp(al.color.g, isChorus ? 0.12 : 0.06, lerpSpeed * 0.5);
      al.color.b = MathUtils.lerp(al.color.b, isChorus ? 0.02 : 0.19, lerpSpeed * 0.5);
    }
  });

  return (
    <>
      <CameraRig introComplete={introComplete} />

      {/* Environment map for glass reflections */}
      <Environment preset="city" background={false} />

      <ambientLight ref={ambientRef} intensity={0.15} color="#0a1030" />
      <pointLight
        ref={upperLightRef}
        position={[0, 10, 0]}
        intensity={2}
        color="#4080ff"
      />
      <pointLight
        ref={lowerLightRef}
        position={[0, -5, 0]}
        intensity={0.5 + beat * 2}
        color="#00cfff"
      />

      <InfiniteGrid amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <FloatingStructures amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <ParticleField amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <LyricVisualizer currentLyric={currentLyric} isChorus={isChorus} />

      <DynamicEffects amplitude={amplitude} isChorus={isChorus} />
    </>
  );
}
