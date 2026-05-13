"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, MathUtils, Color } from "three";
import { LYRIC_FONT_URL, LYRIC_FONT_SIZE, LYRIC_ANIM_SPEED } from "@/lib/constants";

// HDR color constants for strong Bloom response (values > 1 pass Bloom threshold)
const NORMAL_COLOR = new Color(0, 1.8, 2.5);   // HDR cyan
const CHORUS_COLOR = new Color(2.8, 0.1, 2.8); // HDR magenta

interface LyricVisualizerProps {
  currentLyric: string;
  isChorus: boolean;
}

interface AnimState {
  scale: number;
  z: number;
  chorusBlend: number;
}

export default function LyricVisualizer({ currentLyric, isChorus }: LyricVisualizerProps) {
  const groupRef = useRef<Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const prevLyricRef = useRef("");
  const anim = useRef<AnimState>({ scale: 0.05, z: -4, chorusBlend: 0 });
  const lerpedColor = useRef(NORMAL_COLOR.clone());

  // Reset animation when lyric changes
  useEffect(() => {
    if (currentLyric !== prevLyricRef.current) {
      prevLyricRef.current = currentLyric;
      anim.current.scale = 0.05;
      anim.current.z = -4;
    }
  }, [currentLyric]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const k = 1 - Math.exp(-LYRIC_ANIM_SPEED * delta);
    const state = anim.current;

    // Fly-in: scale from 0.05 → 1, z from -4 → 0
    state.scale = MathUtils.lerp(state.scale, currentLyric ? 1 : 0, k);
    state.z = MathUtils.lerp(state.z, 0, k * 0.7);

    groupRef.current.scale.setScalar(state.scale);
    groupRef.current.position.z = state.z;

    // Smooth chorus color blend
    state.chorusBlend = MathUtils.lerp(
      state.chorusBlend,
      isChorus ? 1 : 0,
      1 - Math.exp(-3 * delta)
    );

    // Update text material color in HDR space
    if (textRef.current?.material) {
      lerpedColor.current.copy(NORMAL_COLOR).lerp(CHORUS_COLOR, state.chorusBlend);
      textRef.current.material.color = lerpedColor.current;
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
        color="#00ccff"
        sdfGlyphSize={64}
        outlineWidth={0.02}
        outlineColor="#000033"
        depthOffset={-1}
      >
        {currentLyric}
      </Text>
    </group>
  );
}
