"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, MathUtils, Color } from "three";
import { LYRIC_FONT_URL, LYRIC_FONT_SIZE, LYRIC_ANIM_SPEED } from "@/lib/constants";

// HDR colors: warm white (default) → gold (chorus)
const NORMAL_COLOR = new Color(1.6, 1.5, 1.2);  // HDR warm white
const CHORUS_COLOR = new Color(2.5, 1.8, 0.4);  // HDR gold

interface LyricVisualizerProps {
  currentLyric: string;
  isChorus: boolean;
}

interface AnimState {
  scale: number;
  yOffset: number;   // float up from -0.4 → 0
  opacity: number;   // fade in from 0 → 1
  chorusBlend: number;
}

export default function LyricVisualizer({ currentLyric, isChorus }: LyricVisualizerProps) {
  const groupRef = useRef<Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const prevLyricRef = useRef("");
  const anim = useRef<AnimState>({ scale: 0.01, yOffset: -0.4, opacity: 0, chorusBlend: 0 });
  const lerpedColor = useRef(NORMAL_COLOR.clone());

  // Trigger enter animation on lyric change
  useEffect(() => {
    if (currentLyric !== prevLyricRef.current) {
      prevLyricRef.current = currentLyric;
      anim.current.scale = 0.01;
      anim.current.yOffset = -0.4;
      anim.current.opacity = 0;
    }
  }, [currentLyric]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const k = 1 - Math.exp(-LYRIC_ANIM_SPEED * delta);
    const state = anim.current;

    // Scale pop-in
    state.scale = MathUtils.lerp(state.scale, currentLyric ? 1 : 0, k);
    // Rise from below
    state.yOffset = MathUtils.lerp(state.yOffset, 0, k * 0.5);
    // Fade in
    state.opacity = MathUtils.lerp(state.opacity, currentLyric ? 1 : 0, k * 0.8);

    groupRef.current.scale.setScalar(state.scale);
    groupRef.current.position.y = 0.5 + state.yOffset;

    // Chorus color blend
    state.chorusBlend = MathUtils.lerp(
      state.chorusBlend,
      isChorus ? 1 : 0,
      1 - Math.exp(-3 * delta)
    );

    if (textRef.current?.material) {
      const mat = textRef.current.material;
      mat.transparent = true;
      mat.opacity = state.opacity;
      lerpedColor.current.copy(NORMAL_COLOR).lerp(CHORUS_COLOR, state.chorusBlend);
      mat.color = lerpedColor.current;
    }
  });

  if (!currentLyric) return null;

  return (
    <group ref={groupRef} position={[0, 0.5, 2]}>
      <Text
        ref={textRef}
        font={LYRIC_FONT_URL}
        fontSize={LYRIC_FONT_SIZE}
        anchorX="center"
        anchorY="middle"
        maxWidth={12}
        textAlign="center"
        sdfGlyphSize={64}
        depthOffset={-1}
      >
        {currentLyric}
      </Text>
    </group>
  );
}
