"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Mesh,
  Group,
  MathUtils,
  MeshPhysicalMaterial,
  DoubleSide,
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
} from "three";

// Module-level materials — shared across all tube/frame meshes
const glassTubeMaterial = new MeshPhysicalMaterial({
  transmission: 0.97,
  thickness: 0.4,
  roughness: 0.01,
  metalness: 0,
  ior: 1.45,
  iridescence: 0.95,
  iridescenceIOR: 1.45,
  color: "#d0f0ff",
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
});

const glassFrameMaterial = new MeshPhysicalMaterial({
  transmission: 0.88,
  thickness: 0.3,
  roughness: 0.04,
  metalness: 0,
  ior: 1.35,
  iridescence: 0.60,
  iridescenceIOR: 1.35,
  color: "#c8eeff",
  transparent: true,
  depthWrite: false,
});

// Deterministic pseudo-random: reproducible geometry every hot-reload
function sr(seed: number, n: number): number {
  return Math.abs(Math.sin(seed * 13.7 + n * 47.3)) % 1;
}

function makeRandomCurve(seed: number): TubeGeometry {
  const pts: Vector3[] = [];
  for (let i = 0; i < 5; i++) {
    pts.push(
      new Vector3(
        (sr(seed, i * 3)     - 0.5) * 12,
        (sr(seed, i * 3 + 1) - 0.5) * 8,
        (sr(seed, i * 3 + 2) - 0.5) * 10
      )
    );
  }
  const r = 0.03 + sr(seed, 99) * 0.04;
  return new TubeGeometry(new CatmullRomCurve3(pts), 32, r, 8, false);
}

// --- Static data built once at module load ---
interface TubeEntry {
  geometry: TubeGeometry;
  position: [number, number, number];
  rotSpeed: [number, number, number];
}
interface FrameEntry {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  rotSpeed: [number, number, number];
}

const TUBE_DATA: TubeEntry[] = [
  { geometry: makeRandomCurve(1), position: [ -8,  1, -10], rotSpeed: [ 0.30,  0.50,  0.10] },
  { geometry: makeRandomCurve(2), position: [  9, -2, -12], rotSpeed: [-0.20,  0.40,  0.30] },
  { geometry: makeRandomCurve(3), position: [ -4,  3,  -7], rotSpeed: [ 0.40, -0.30,  0.20] },
  { geometry: makeRandomCurve(4), position: [  5,  0, -15], rotSpeed: [-0.10,  0.60, -0.40] },
  { geometry: makeRandomCurve(5), position: [-12, -1,  -8], rotSpeed: [ 0.20,  0.20,  0.50] },
  { geometry: makeRandomCurve(6), position: [  7,  4,  -9], rotSpeed: [-0.40,  0.10,  0.30] },
];

const FRAME_DATA: FrameEntry[] = [
  { position: [ -7,  0, -11], rotation: [ 0.10,  0.30,  0.00], width: 2.5, height: 3.5, rotSpeed: [ 0.10,  0.20,  0.05] },
  { position: [  8,  2, -13], rotation: [ 0.20, -0.40,  0.10], width: 3.0, height: 2.0, rotSpeed: [-0.15,  0.10,  0.20] },
  { position: [-10, -2,  -9], rotation: [-0.10,  0.50,  0.20], width: 2.0, height: 4.0, rotSpeed: [ 0.30, -0.10,  0.10] },
  { position: [  4,  3, -14], rotation: [ 0.30,  0.20, -0.10], width: 4.0, height: 2.5, rotSpeed: [ 0.05,  0.25, -0.15] },
  { position: [ -5, -3, -12], rotation: [-0.20, -0.30,  0.30], width: 2.8, height: 3.2, rotSpeed: [-0.20,  0.15,  0.10] },
  { position: [ 11,  1,  -8], rotation: [ 0.10,  0.10,  0.40], width: 3.5, height: 1.8, rotSpeed: [ 0.10, -0.20,  0.20] },
];

// ── GlassTube ─────────────────────────────────────────────────────────────
interface GlassTubeProps {
  entry: TubeEntry;
  amplitude: number;
  beat: number;
  isChorus: boolean;
}

function GlassTube({ entry, amplitude, beat, isChorus }: GlassTubeProps) {
  const meshRef = useRef<Mesh>(null);
  const chorusSpeedRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    chorusSpeedRef.current = MathUtils.lerp(
      chorusSpeedRef.current,
      isChorus ? 1 : 0,
      1 - Math.exp(-2 * delta)
    );
    const mult = 1 + chorusSpeedRef.current * 3.0;
    meshRef.current.rotation.x += entry.rotSpeed[0] * 0.008 * mult;
    meshRef.current.rotation.y += entry.rotSpeed[1] * 0.008 * mult;
    meshRef.current.rotation.z += entry.rotSpeed[2] * 0.004 * mult;
    meshRef.current.position.y =
      entry.position[1] + Math.sin(t * 0.4 + entry.position[0]) * 0.6;
    const s = 1 + beat * 0.18 + amplitude * 0.08 + (isChorus ? 0.2 : 0);
    meshRef.current.scale.setScalar(
      MathUtils.lerp(meshRef.current.scale.x, s, 1 - Math.exp(-3 * delta))
    );
  });

  return (
    <mesh ref={meshRef} position={entry.position}>
      <primitive object={entry.geometry} attach="geometry" dispose={null} />
      <primitive object={glassTubeMaterial} attach="material" dispose={null} />
    </mesh>
  );
}

// ── GlassFrame ────────────────────────────────────────────────────────────
const EDGE_T = 0.04;

interface GlassFrameProps {
  entry: FrameEntry;
  amplitude: number;
  beat: number;
  isChorus: boolean;
}

function GlassFrame({ entry, amplitude, beat, isChorus }: GlassFrameProps) {
  const groupRef = useRef<Group>(null);
  const chorusSpeedRef = useRef(0);
  const { position, rotation, width, height, rotSpeed } = entry;

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    chorusSpeedRef.current = MathUtils.lerp(
      chorusSpeedRef.current,
      isChorus ? 1 : 0,
      1 - Math.exp(-2 * delta)
    );
    const mult = 1 + chorusSpeedRef.current * 2.5;
    groupRef.current.rotation.x += rotSpeed[0] * 0.007 * mult;
    groupRef.current.rotation.y += rotSpeed[1] * 0.007 * mult;
    groupRef.current.rotation.z += rotSpeed[2] * 0.004 * mult;
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.35 + position[2]) * 0.5;
    const s = 1 + beat * 0.15 + amplitude * 0.06 + (isChorus ? 0.15 : 0);
    groupRef.current.scale.setScalar(
      MathUtils.lerp(groupRef.current.scale.x, s, 1 - Math.exp(-3 * delta))
    );
  });

  const hw = width  / 2;
  const hh = height / 2;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* top */}
      <mesh position={[0, hh, 0]}>
        <boxGeometry args={[width + EDGE_T, EDGE_T, EDGE_T]} />
        <primitive object={glassFrameMaterial} attach="material" dispose={null} />
      </mesh>
      {/* bottom */}
      <mesh position={[0, -hh, 0]}>
        <boxGeometry args={[width + EDGE_T, EDGE_T, EDGE_T]} />
        <primitive object={glassFrameMaterial} attach="material" dispose={null} />
      </mesh>
      {/* left */}
      <mesh position={[-hw, 0, 0]}>
        <boxGeometry args={[EDGE_T, height, EDGE_T]} />
        <primitive object={glassFrameMaterial} attach="material" dispose={null} />
      </mesh>
      {/* right */}
      <mesh position={[hw, 0, 0]}>
        <boxGeometry args={[EDGE_T, height, EDGE_T]} />
        <primitive object={glassFrameMaterial} attach="material" dispose={null} />
      </mesh>
    </group>
  );
}

// ── FloatingStructures (iridescence pulsed at module-material level) ──────
interface FloatingStructuresProps {
  amplitude: number;
  beat: number;
  isChorus?: boolean;
}

export default function FloatingStructures({
  amplitude,
  beat,
  isChorus = false,
}: FloatingStructuresProps) {
  useFrame((_, delta) => {
    const lerp = 1 - Math.exp(-3 * delta);
    glassTubeMaterial.iridescence = MathUtils.lerp(
      glassTubeMaterial.iridescence,
      0.55 + (isChorus ? 0.40 : 0) + amplitude * 0.35,
      lerp
    );
  });

  return (
    <>
      {TUBE_DATA.map((entry, i) => (
        <GlassTube
          key={i}
          entry={entry}
          amplitude={amplitude}
          beat={beat}
          isChorus={isChorus}
        />
      ))}
      {FRAME_DATA.map((entry, i) => (
        <GlassFrame
          key={i + 6}
          entry={entry}
          amplitude={amplitude}
          beat={beat}
          isChorus={isChorus}
        />
      ))}
    </>
  );
}
