"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import {
  MOUSE_PARALLAX_STRENGTH,
  MOUSE_PARALLAX_LERP,
  CAMERA_BASE_Y,
  CAMERA_INTRO_RADIUS,
  CAMERA_INTRO_HEIGHT,
  CAMERA_INTRO_ORBIT_SPEED,
  CAMERA_TRANSITION_DURATION,
} from "@/lib/constants";

interface CameraRigProps {
  /** true once the user has clicked Start — triggers the rush-in transition */
  introComplete: boolean;
  /** smoothly drifts camera toward Miku during chorus for cinematic focus pull */
  isChorus: boolean;
}

export default function CameraRig({ introComplete, isChorus }: CameraRigProps) {
  const orbitAngleRef = useRef(0);
  const transitionStartedRef = useRef(false);
  const transitionStartPosRef = useRef(new Vector3());
  const transitionTimeRef = useRef(0);

  useFrame(({ camera, pointer }, delta) => {
    if (!introComplete) {
      // ── Intro orbit: slow rotation around origin from a high vantage point ──
      orbitAngleRef.current += delta * CAMERA_INTRO_ORBIT_SPEED;
      const a = orbitAngleRef.current;
      const targetX = Math.cos(a) * CAMERA_INTRO_RADIUS;
      const targetY = CAMERA_INTRO_HEIGHT + Math.sin(a * 0.35) * 3;
      const targetZ = Math.sin(a) * CAMERA_INTRO_RADIUS;

      // Lag-follow the orbit point — gives a floating, cinematic drift
      camera.position.x = MathUtils.lerp(camera.position.x, targetX, 0.025);
      camera.position.y = MathUtils.lerp(camera.position.y, targetY, 0.025);
      camera.position.z = MathUtils.lerp(camera.position.z, targetZ, 0.025);
      camera.lookAt(0, 0, 0);

      // Reset transition state so the next play() triggers a fresh rush-in
      transitionStartedRef.current = false;
      return;
    }

    // ── Capture start position on the first frame after introComplete ──
    if (!transitionStartedRef.current) {
      transitionStartPosRef.current.copy(camera.position);
      transitionStartedRef.current = true;
      transitionTimeRef.current = 0;
    }

    transitionTimeRef.current = Math.min(
      transitionTimeRef.current + delta,
      CAMERA_TRANSITION_DURATION
    );
    const t = transitionTimeRef.current / CAMERA_TRANSITION_DURATION;
    // Ease-out cubic: fast initial rush, smooth settle
    const eased = 1 - Math.pow(1 - t, 3);

    const targetX = pointer.x * MOUSE_PARALLAX_STRENGTH;
    const targetY = CAMERA_BASE_Y + pointer.y * MOUSE_PARALLAX_STRENGTH * 0.5;
    // Chorus: drift 4 units closer to Miku for the focus-pull moment
    const targetZ = isChorus ? 10 : 14;

    if (t < 1) {
      // Hard interpolation from orbit position → normal view
      camera.position.x = MathUtils.lerp(
        transitionStartPosRef.current.x,
        targetX,
        eased
      );
      camera.position.y = MathUtils.lerp(
        transitionStartPosRef.current.y,
        targetY,
        eased
      );
      camera.position.z = MathUtils.lerp(
        transitionStartPosRef.current.z,
        14,
        eased
      );
    } else {
      // Normal mouse parallax + gentle chorus z-drift
      camera.position.x = MathUtils.lerp(
        camera.position.x,
        targetX,
        MOUSE_PARALLAX_LERP
      );
      camera.position.y = MathUtils.lerp(
        camera.position.y,
        targetY,
        MOUSE_PARALLAX_LERP
      );
      camera.position.z = MathUtils.lerp(
        camera.position.z,
        targetZ,
        1 - Math.exp(-0.6 * delta)
      );
    }

    camera.lookAt(0, 0, 0);
  });

  return null;
}
