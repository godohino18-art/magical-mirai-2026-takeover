"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, ShaderMaterial, AdditiveBlending, MathUtils } from "three";
import {
  PARTICLE_COUNT,
  PARTICLE_SPREAD,
  PARTICLE_BASE_SIZE,
  BEAT_PULSE_DECAY,
  CHORUS_COLOR_LERP_SPEED,
} from "@/lib/constants";

const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBeat;
  uniform float uAmplitude;

  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    float t = mod(uTime * aSpeed + aPhase, 1.0);
    pos.y += (t - 0.5) * ${PARTICLE_SPREAD.toFixed(1)};

    float beatPush = uBeat * 3.0;
    vec2 dir = normalize(pos.xz + 0.001);
    pos.xz += dir * beatPush * (1.0 - t);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(mvPos.xyz);

    gl_PointSize = (aSize + uBeat * 2.0 + uAmplitude * 1.5) * (300.0 / dist);
    gl_Position = projectionMatrix * mvPos;

    vAlpha = (1.0 - t) * (0.4 + uAmplitude * 0.6);
  }
`;

const particleFragmentShader = /* glsl */ `
  uniform float uBeat;
  uniform float uChorusFactor;

  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    float core = 1.0 - smoothstep(0.0, 0.25, r);
    float glow = 1.0 - smoothstep(0.1, 0.5, r);

    // Blue ↔ magenta/pink on chorus
    vec3 normalCore = mix(vec3(0.4, 0.8, 1.0), vec3(1.0, 1.0, 1.0), core);
    vec3 chorusCore = mix(vec3(1.0, 0.0, 0.8), vec3(1.0, 0.6, 1.0), core);
    vec3 col = mix(normalCore, chorusCore, uChorusFactor);
    col += mix(vec3(0.2, 0.4, 1.0), vec3(1.0, 0.0, 0.5), uChorusFactor) * uBeat;

    gl_FragColor = vec4(col, (core * 0.9 + glow * 0.3) * vAlpha);
  }
`;

// Generated once at module load — stable, no useMemo needed.
function buildParticleBuffers() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const speeds = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = Math.random() * PARTICLE_SPREAD;
    const theta = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * PARTICLE_SPREAD;
    positions[i * 3 + 2] = Math.sin(theta) * r;
    sizes[i] = PARTICLE_BASE_SIZE + Math.random() * 0.08;
    speeds[i] = 0.05 + Math.random() * 0.15;
    phases[i] = Math.random();
  }
  return { positions, sizes, speeds, phases };
}
const PARTICLE_BUFFERS = buildParticleBuffers();

interface ParticleFieldProps {
  amplitude: number;
  beat: number;
  isChorus?: boolean;
}

export default function ParticleField({
  amplitude,
  beat,
  isChorus = false,
}: ParticleFieldProps) {
  const pointsRef = useRef<Points>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const beatRef = useRef(0);
  const chorusFactorRef = useRef(0);

  const { positions, sizes, speeds, phases } = PARTICLE_BUFFERS;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBeat: { value: 0 },
      uAmplitude: { value: 0 },
      uChorusFactor: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    if (!matRef.current) return;

    beatRef.current = Math.max(beatRef.current - BEAT_PULSE_DECAY, 0);
    if (beat > beatRef.current) beatRef.current = beat;

    chorusFactorRef.current = MathUtils.lerp(
      chorusFactorRef.current,
      isChorus ? 1 : 0,
      1 - Math.exp(-CHORUS_COLOR_LERP_SPEED * delta)
    );

    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    matRef.current.uniforms.uBeat.value = beatRef.current;
    matRef.current.uniforms.uAmplitude.value = amplitude;
    matRef.current.uniforms.uChorusFactor.value = chorusFactorRef.current;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
