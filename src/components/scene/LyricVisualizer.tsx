"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, MathUtils, Color } from "three";
import { LYRIC_FONT_URL, LYRIC_FONT_SIZE, LYRIC_ANIM_SPEED } from "@/lib/constants";

// HDR colors: warm white → golden (chorus)
const NORMAL_COLOR = new Color(1.6, 1.5, 1.2);
const CHORUS_COLOR = new Color(2.5, 1.8, 0.4);

interface LyricVisualizerProps {
  currentLyric: string;
  isChorus: boolean;
}

interface AnimState {
  scale: number;
  yOffset: number;
  opacity: number;
  chorusBlend: number;
}

export default function LyricVisualizer({ currentLyric, isChorus }: LyricVisualizerProps) {
  const groupRef = useRef<Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const anim = useRef<AnimState>({ scale: 0.01, yOffset: -0.4, opacity: 0, chorusBlend: 0 });
  const lerpedColor = useRef(NORMAL_COLOR.clone());
  // Tracks which lyric value was last used to reset the enter animation (in useFrame)
  const animLyricRef = useRef("");

  // --- Derived state: keep the last non-empty phrase visible during fade-out ----------
  // Calling setState during render (conditional, prop-driven) is the React-approved
  // replacement for getDerivedStateFromProps and does NOT violate react-hooks/set-state-in-effect.
  const [displayLyric, setDisplayLyric] = useState("");
  const [prevCurrentLyric, setPrevCurrentLyric] = useState("");

  if (currentLyric !== prevCurrentLyric) {
    setPrevCurrentLyric(currentLyric);
    if (currentLyric) setDisplayLyric(currentLyric);
  }
  // -------------------------------------------------------------------------------------

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Reset enter animation when a new phrase arrives (detected here to avoid render access)
    if (currentLyric && currentLyric !== animLyricRef.current) {
      anim.current.scale   = 0.01;
      anim.current.yOffset = -0.4;
      anim.current.opacity = 0;
      animLyricRef.current = currentLyric;
    }

    const k = 1 - Math.exp(-LYRIC_ANIM_SPEED * delta);
    const state = anim.current;
    const hasLyric = !!currentLyric;

    // Scale: pop-in on enter, hold at 1 during fade-out
    state.scale = MathUtils.lerp(state.scale, 1, k);

    // Y: rise from below on enter; drift upward slowly on exit (余韻)
    const targetY = hasLyric ? 0 : 0.5;
    const ySpeed  = hasLyric ? k * 0.5 : k * 0.15;
    state.yOffset = MathUtils.lerp(state.yOffset, targetY, ySpeed);

    // Opacity: fast fade-in, slow dreamy fade-out
    const opacityK = hasLyric ? k * 0.8 : k * 0.2;
    state.opacity  = MathUtils.lerp(state.opacity, hasLyric ? 1 : 0, opacityK);

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

  if (!displayLyric) return null;

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
        {displayLyric}
      </Text>
    </group>
  );
}
