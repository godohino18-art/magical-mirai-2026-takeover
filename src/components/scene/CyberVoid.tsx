"use client";

import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import { Environment } from "@react-three/drei";
import {
  BloomEffect,
  ChromaticAberrationEffect,
  VignetteEffect,
  DepthOfFieldEffect,
  BlendFunction,
} from "postprocessing";
import { MathUtils, Vector2, BackSide } from "three";
import InfiniteGrid from "./InfiniteGrid";
import FloatingStructures from "./FloatingStructures";
import ParticleField from "./ParticleField";
import LyricVisualizer from "./LyricVisualizer";
import CameraRig from "./CameraRig";
import MikuPresence from "./MikuPresence";
import SceneTitleCard from "./SceneTitleCard";
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
  const dofRef = useRef<DepthOfFieldEffect | null>(null);

  useFrame((_, delta) => {
    // Focus pull: verse → glass objects (~10 units), chorus → Miku (~38 units from camera)
    if (dofRef.current?.cocMaterial) {
      dofRef.current.cocMaterial.worldFocusDistance = MathUtils.lerp(
        dofRef.current.cocMaterial.worldFocusDistance,
        isChorus ? 38 : 10,
        1 - Math.exp(-1.2 * delta)
      );
      dofRef.current.cocMaterial.worldFocusRange = MathUtils.lerp(
        dofRef.current.cocMaterial.worldFocusRange,
        isChorus ? 8 : 3,
        1 - Math.exp(-1.2 * delta)
      );
    }

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
      : CHROMATIC_OFFSET + amplitude * 0.002;
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
      <DepthOfField ref={dofRef} target={[0, 0.5, 10]} focalLength={0.012} bokehScale={8} />
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
  const ambientRef    = useRef(null);

  useFrame((_, delta) => {
    const lerpSpeed = 1 - Math.exp(-2 * delta);

    // Upper light: Miku teal → warm amber (chorus)
    if (upperLightRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ul = upperLightRef.current as any;
      ul.color.r = MathUtils.lerp(ul.color.r, isChorus ? 1.0  : 0.12, lerpSpeed);
      ul.color.g = MathUtils.lerp(ul.color.g, isChorus ? 0.65 : 0.72, lerpSpeed);
      ul.color.b = MathUtils.lerp(ul.color.b, isChorus ? 0.18 : 0.70, lerpSpeed);
      ul.intensity = 2 + amplitude * 4 + beat * 2;
    }

    // Lower light: Miku green → warm orange
    if (lowerLightRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ll = lowerLightRef.current as any;
      ll.color.r = MathUtils.lerp(ll.color.r, isChorus ? 1.0  : 0.15, lerpSpeed);
      ll.color.g = MathUtils.lerp(ll.color.g, isChorus ? 0.53 : 0.77, lerpSpeed);
      ll.color.b = MathUtils.lerp(ll.color.b, isChorus ? 0.0  : 0.73, lerpSpeed);
    }

    // Ambient: dark teal → dark amber
    if (ambientRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const al = ambientRef.current as any;
      al.color.r = MathUtils.lerp(al.color.r, isChorus ? 0.18 : 0.02, lerpSpeed * 0.4);
      al.color.g = MathUtils.lerp(al.color.g, isChorus ? 0.12 : 0.10, lerpSpeed * 0.4);
      al.color.b = MathUtils.lerp(al.color.b, isChorus ? 0.02 : 0.07, lerpSpeed * 0.4);
    }
  });

  return (
    <>
      <CameraRig introComplete={introComplete} isChorus={isChorus} />

      {/* Custom dark environment: teal IBL from Miku's direction for glass reflections */}
      <Environment background={false} resolution={256}>
        {/* Void base */}
        <mesh scale={[100, 100, 100]}>
          <sphereGeometry />
          <meshBasicMaterial color="#020408" side={BackSide} />
        </mesh>
        {/* Miku backlight source — creates teal reflections on glass from -Z direction */}
        <mesh position={[0, 2, -60]}>
          <sphereGeometry args={[12, 16, 16]} />
          <meshBasicMaterial color="#80e8e4" />
        </mesh>
        {/* Subtle warm rim from above */}
        <mesh position={[0, 50, 5]}>
          <sphereGeometry args={[6, 16, 16]} />
          <meshBasicMaterial color="#a0c8d8" />
        </mesh>
      </Environment>

      <ambientLight ref={ambientRef} intensity={0.18} color="#061a12" />
      <pointLight ref={upperLightRef} position={[0, 10, 0]}  intensity={2}  color="#20b8a0" />
      <pointLight ref={lowerLightRef} position={[0, -5, 0]}  intensity={0.5 + beat * 2} color="#39c5bb" />
      {/* Miku backlight: illuminates glass objects from behind with teal */}
      <pointLight position={[0, 2, -22]} intensity={6} color="#39C5BB" />

      <InfiniteGrid amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <FloatingStructures amplitude={amplitude} beat={beat} isChorus={isChorus} />
      <ParticleField amplitude={amplitude} beat={beat} isChorus={isChorus} hasLyric={!!currentLyric} />
      <LyricVisualizer currentLyric={currentLyric} isChorus={isChorus} />
      <MikuPresence amplitude={amplitude} />

      {/* 3D glass title — loaded async, Suspense prevents waterfall */}
      <Suspense fallback={null}>
        <SceneTitleCard introComplete={introComplete} hasLyric={!!currentLyric} />
      </Suspense>

      <DynamicEffects amplitude={amplitude} isChorus={isChorus} />
    </>
  );
}
