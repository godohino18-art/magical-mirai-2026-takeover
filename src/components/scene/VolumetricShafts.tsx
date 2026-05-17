"use client";

import { useFrame } from "@react-three/fiber";
import {
  ShaderMaterial,
  Color,
  AdditiveBlending,
  DoubleSide,
  MathUtils,
} from "three";

const shaftVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shaftFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    float radial = 1.0 - abs(vUv.x - 0.5) * 2.0;
    radial = pow(max(radial, 0.0), 1.8);
    float axial  = pow(vUv.y, 0.6);
    float a = radial * axial * uAlpha;
    if (a < 0.001) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

// Module-level materials: mutated in useFrame
const blueShaftMat = new ShaderMaterial({
  uniforms: {
    uColor: { value: new Color(0.04, 0.20, 1.0) },
    uAlpha: { value: 0.10 },
  },
  vertexShader: shaftVert,
  fragmentShader: shaftFrag,
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  side: DoubleSide,
});

const amberShaftMat = new ShaderMaterial({
  uniforms: {
    uColor: { value: new Color(1.0, 0.52, 0.04) },
    uAlpha: { value: 0.08 },
  },
  vertexShader: shaftVert,
  fragmentShader: shaftFrag,
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  side: DoubleSide,
});

const SHAFT_ANGLES = [0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4];
const SHAFT_H = 24;

interface VolumetricShaftsProps {
  amplitude: number;
  isChorus: boolean;
}

export default function VolumetricShafts({ amplitude, isChorus }: VolumetricShaftsProps) {
  useFrame((_, delta) => {
    const lerp = 1 - Math.exp(-3 * delta);
    blueShaftMat.uniforms.uAlpha.value = MathUtils.lerp(
      blueShaftMat.uniforms.uAlpha.value,
      0.07 + amplitude * 0.16 + (isChorus ? 0.08 : 0),
      lerp
    );
    amberShaftMat.uniforms.uAlpha.value = MathUtils.lerp(
      amberShaftMat.uniforms.uAlpha.value,
      0.05 + amplitude * 0.12 + (isChorus ? 0.06 : 0),
      lerp
    );
  });

  return (
    <>
      {/* Blue shaft — upper left */}
      <pointLight position={[-9, 18, -8]} color="#1030e8" intensity={3.5} distance={45} />
      {SHAFT_ANGLES.map((a, i) => (
        <mesh key={i} position={[-9, 18 - SHAFT_H / 2, -8]} rotation={[0, a, 0]}>
          <planeGeometry args={[6, SHAFT_H]} />
          <primitive object={blueShaftMat} attach="material" dispose={null} />
        </mesh>
      ))}

      {/* Blue shaft — upper right */}
      <pointLight position={[11, 20, -4]} color="#082cd0" intensity={3} distance={45} />
      {SHAFT_ANGLES.map((a, i) => (
        <mesh key={i + 4} position={[11, 20 - SHAFT_H / 2, -4]} rotation={[0, a, 0]}>
          <planeGeometry args={[6, SHAFT_H]} />
          <primitive object={blueShaftMat} attach="material" dispose={null} />
        </mesh>
      ))}

      {/* Amber shaft — warm accent, center-back */}
      <pointLight position={[2, 17, -14]} color="#e06818" intensity={2.5} distance={40} />
      {SHAFT_ANGLES.map((a, i) => (
        <mesh key={i + 8} position={[2, 17 - SHAFT_H / 2, -14]} rotation={[0, a, 0]}>
          <planeGeometry args={[5, SHAFT_H]} />
          <primitive object={amberShaftMat} attach="material" dispose={null} />
        </mesh>
      ))}
    </>
  );
}
