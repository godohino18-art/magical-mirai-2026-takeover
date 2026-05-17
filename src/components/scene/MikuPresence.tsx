"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Mesh, ShaderMaterial, AdditiveBlending } from "three";

interface MikuPresenceProps {
  amplitude: number;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uPulse;
  uniform float uTime;
  varying vec2 vUv;

  float sdCircle(vec2 p, float r) { return length(p) - r; }
  float sdBox(vec2 p, vec2 b) {
    vec2 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  }

  void main() {
    // p.x in [-0.4, 0.4], p.y in [-1, 1] — tall figure space
    vec2 p;
    p.x = (vUv.x - 0.5) * 0.8;
    p.y = (vUv.y - 0.5) * 2.0;

    // --- Miku silhouette (SDF) ---
    // Head
    float d = sdCircle(p - vec2(0.0,  0.44), 0.11);
    // Twin tails (iconic)
    d = min(d, sdBox(p - vec2(-0.25, 0.34), vec2(0.04, 0.23)));
    d = min(d, sdBox(p - vec2( 0.25, 0.34), vec2(0.04, 0.23)));
    // Neck
    d = min(d, sdBox(p - vec2(0.0,  0.31), vec2(0.03, 0.02)));
    // Torso
    d = min(d, sdBox(p - vec2(0.0,  0.11), vec2(0.10, 0.16)));
    // Arms
    d = min(d, sdBox(p - vec2(-0.16, 0.08), vec2(0.03, 0.13)));
    d = min(d, sdBox(p - vec2( 0.16, 0.08), vec2(0.03, 0.13)));
    // Skirt
    d = min(d, sdBox(p - vec2(0.0, -0.15), vec2(0.14, 0.09)));
    // Legs
    d = min(d, sdBox(p - vec2(-0.05, -0.38), vec2(0.035, 0.14)));
    d = min(d, sdBox(p - vec2( 0.05, -0.38), vec2(0.035, 0.14)));
    // Boots
    d = min(d, sdBox(p - vec2(-0.055, -0.55), vec2(0.05, 0.03)));
    d = min(d, sdBox(p - vec2( 0.055, -0.55), vec2(0.05, 0.03)));

    // --- Fresnel-like edge glow ---
    float edgeGlow  = 1.0 - smoothstep(0.0, 0.022, abs(d));
    float outerHalo = smoothstep(0.14, 0.0, d) * step(0.0, d);
    float innerFill = step(d, 0.0) * 0.06;

    // Animated shimmer along silhouette boundary
    float shimmer     = sin(uTime * 2.2 + p.y * 14.0) * 0.5 + 0.5;
    float edgeShimmer = edgeGlow * shimmer * 0.35;

    vec3 mikuColor = vec3(0.224, 0.773, 0.733);  // #39C5BB
    vec3 col = mikuColor * (edgeGlow * 3.0 + outerHalo * 0.6 + edgeShimmer);

    float alpha = (edgeGlow * 0.95 + outerHalo * 0.22 + innerFill) * uPulse;

    if (alpha < 0.005) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function MikuPresence({ amplitude }: MikuPresenceProps) {
  const matRef  = useRef<ShaderMaterial>(null);
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo(() => ({
    uPulse: { value: 0.7 },
    uTime:  { value: 0.0 },
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current || !meshRef.current) return;
    const t = clock.getElapsedTime();
    // Pulse: base 0.65 + breathing sine + vocal amplitude
    const pulse = 0.65 + Math.sin(t * 1.5) * 0.05 + amplitude * 0.35;
    matRef.current.uniforms.uPulse.value = pulse;
    matRef.current.uniforms.uTime.value  = t;
    // Subtle scale breath
    const scalePulse = 1.0 + Math.sin(t * 1.2) * 0.008 + amplitude * 0.012;
    meshRef.current.scale.setScalar(scalePulse);
  });

  return (
    <Billboard position={[0, 1, -25]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 7.5]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </Billboard>
  );
}
