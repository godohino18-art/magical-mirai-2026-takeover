"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import PlayerUI from "./PlayerUI";
import { useTextAlive } from "@/hooks/useTextAlive";

// R3F Canvas は SSR 非対応のため dynamic import で無効化
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

export default function HomeClient() {
  const {
    status,
    isPlaying,
    position,
    vocalAmplitude,
    beatPulse,
    currentLyric,
    isChorus,
    play,
    pause,
    stop,
  } = useTextAlive();

  // hasStarted tracks whether the user has clicked the Start button at least once.
  // Once true it never reverts — pausing/stopping keeps the minimal HUD visible.
  const [hasStarted, setHasStarted] = useState(false);

  // onStart: must be called directly from a click event to unlock AudioContext
  const handleStart = useCallback(() => {
    setHasStarted(true);
    play();
  }, [play]);

  const normalizedAmplitude = Math.min(vocalAmplitude / 128, 1);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Scene3D
        amplitude={normalizedAmplitude}
        beat={beatPulse}
        isChorus={isChorus}
        currentLyric={currentLyric}
        introComplete={hasStarted}
      />
      <PlayerUI
        status={status}
        isPlaying={isPlaying}
        position={position}
        vocalAmplitude={vocalAmplitude}
        hasStarted={hasStarted}
        onStart={handleStart}
        onPlay={play}
        onPause={pause}
        onStop={stop}
      />
    </div>
  );
}
