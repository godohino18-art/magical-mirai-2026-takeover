"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial, MathUtils } from "three";
import { CHORUS_COLOR_LERP_SPEED } from "@/lib/constants";

const gridVertexShader = /* glsl */ `
  varying vec2 vWorldXZ;
  varying float vDist;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldXZ = worldPos.xz;
    vDist = length(worldPos.xz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const gridFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBeat;
  uniform float uChorusFactor;

  varying vec2 vWorldXZ;
  varying float vDist;

  float gridLine(vec2 p, float scale, float width) {
    vec2 g = abs(fract(p / scale) - 0.5) * scale;
    return 1.0 - smoothstep(width, width * 2.0, min(g.x, g.y));
  }

  void main() {
    float g1 = gridLine(vWorldXZ, 2.0, 0.04);
    float g2 = gridLine(vWorldXZ, 10.0, 0.06);

    float convergence = 1.0 / (1.0 + vDist * 0.06);
    float flow = sin(vDist * 0.3 - uTime * 1.5) * 0.5 + 0.5;
    float flowMask = g1 * flow * convergence;

    float gridVal = max(g1 * 0.5, g2 * 0.9) * convergence;
    gridVal += flowMask * (0.5 + uAmplitude);
    gridVal += g2 * uBeat * 0.8 * convergence;

    float fade = smoothstep(40.0, 5.0, vDist);

    // Blue ↔ red/magenta on chorus
    vec3 normalColor = mix(vec3(0.05, 0.2, 0.5), vec3(0.3, 0.7, 1.0), uAmplitude);
    vec3 chorusColor = mix(vec3(0.5, 0.0, 0.2), vec3(1.0, 0.2, 0.5), uAmplitude);
    vec3 lineColor = mix(normalColor, chorusColor, uChorusFactor);
    lineColor += mix(vec3(0.4, 0.6, 1.0), vec3(1.0, 0.3, 0.8), uChorusFactor) * uBeat * 0.5;

    float alpha = gridVal * fade;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(lineColor, alpha);
  }
`;

interface InfiniteGridProps {
  amplitude: number;
  beat: number;
  isChorus?: boolean;
}

export default function InfiniteGrid({ amplitude, beat, isChorus = false }: InfiniteGridProps) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const chorusFactorRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uBeat: { value: 0 },
      uChorusFactor: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    if (!matRef.current) return;
    chorusFactorRef.current = MathUtils.lerp(
      chorusFactorRef.current,
      isChorus ? 1 : 0,
      1 - Math.exp(-CHORUS_COLOR_LERP_SPEED * delta)
    );
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    matRef.current.uniforms.uAmplitude.value = amplitude;
    matRef.current.uniforms.uBeat.value = beat;
    matRef.current.uniforms.uChorusFactor.value = chorusFactorRef.current;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[100, 100, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={gridVertexShader}
        fragmentShader={gridFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
