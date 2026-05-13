"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { ShaderMaterial, MathUtils } from "three";
import { CHORUS_COLOR_LERP_SPEED } from "@/lib/constants";

export const electronicVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBeat;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vDisplacement;

  vec3 hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yxz + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(dot(hash3(i), f),
              dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), f.x),
          mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
              dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), f.x), f.y),
      mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
              dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), f.x),
          mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
              dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vUv = uv;
    vPosition = position;

    float n = noise(position * 1.8 + uTime * 0.4);
    float displacement = n * uAmplitude * 0.4 + uBeat * 0.15;
    vDisplacement = displacement;

    vec3 displaced = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const electronicFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBeat;
  uniform float uChorusFactor;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vDisplacement;

  float grid(vec2 uv, float scale, float lineWidth) {
    vec2 g = abs(fract(uv * scale) - 0.5);
    return 1.0 - smoothstep(lineWidth, lineWidth + 0.01, min(g.x, g.y));
  }

  void main() {
    float g1 = grid(vUv, 8.0, 0.04);
    float g2 = grid(vUv, 2.0, 0.02);
    float gridVal = max(g1 * 0.6, g2 * 0.9);

    vec2 centered = vUv - 0.5;
    float radialDist = length(centered);
    float depthFade = 1.0 - smoothstep(0.0, 0.7, radialDist);

    float scanline = sin(vUv.y * 120.0 + uTime * 2.0) * 0.04 + 0.96;

    vec3 baseColor = mix(vec3(0.02, 0.04, 0.12), vec3(0.05, 0.2, 0.4), depthFade);

    float emission = gridVal * (0.6 + uAmplitude * 1.8 + uBeat * 1.2);

    // Blue ↔ magenta color shift on chorus
    vec3 normalGridColor = mix(vec3(0.1, 0.4, 0.9), vec3(0.6, 0.9, 1.0), uAmplitude);
    vec3 chorusGridColor = mix(vec3(0.9, 0.0, 0.6), vec3(1.0, 0.3, 0.9), uAmplitude);
    vec3 gridColor = mix(normalGridColor, chorusGridColor, uChorusFactor);

    vec3 col = baseColor + gridColor * emission * 0.7;
    col += gridColor * vDisplacement * 2.0;
    col += mix(vec3(0.05, 0.1, 0.3), vec3(0.3, 0.0, 0.2), uChorusFactor) * uBeat;
    col *= scanline;
    col = col / (col + 0.5);
    col = pow(col, vec3(0.9));

    gl_FragColor = vec4(col, 0.88 + gridVal * 0.12);
  }
`;

interface ElectronicMaterialProps {
  amplitude: number;
  beat: number;
  isChorus?: boolean;
}

export function useElectronicMaterial({
  amplitude,
  beat,
  isChorus = false,
}: ElectronicMaterialProps) {
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

  return { matRef, uniforms };
}

export function ElectronicMaterial({
  amplitude,
  beat,
  isChorus = false,
}: ElectronicMaterialProps) {
  const { matRef, uniforms } = useElectronicMaterial({ amplitude, beat, isChorus });

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={electronicVertexShader}
      fragmentShader={electronicFragmentShader}
      uniforms={uniforms}
      transparent
    />
  );
}
