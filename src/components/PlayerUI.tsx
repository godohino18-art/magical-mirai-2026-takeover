"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerStatus } from "@/hooks/useTextAlive";

interface PlayerUIProps {
  status: PlayerStatus;
  isPlaying: boolean;
  position: number;
  vocalAmplitude: number;
  hasStarted: boolean;
  onStart: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

// ── Loading step copy based on progress ──────────────────────────────────
function loadingStep(progress: number): string {
  if (progress < 20) return "CONNECTING TO PRISM...";
  if (progress < 45) return "LOADING AUDIO ENGINE...";
  if (progress < 70) return "SYNCHRONIZING LYRICS DATA...";
  return "CALIBRATING RESONANCE...";
}

// ── Blinking cursor ───────────────────────────────────────────────────────
function Cursor() {
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
    >
      ▌
    </motion.span>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────
function LoadingScreen({ progress }: { progress: number }) {
  const filled = Math.round(progress / 5); // 0–20 blocks
  const empty = 20 - filled;

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 select-none"
    >
      {/* Title */}
      <div className="text-center">
        <h1 className="font-mono text-white/90 text-3xl font-bold tracking-[0.3em] uppercase">
          PRISM RESONANCE
        </h1>
        <p className="font-mono text-white/30 text-xs tracking-[0.25em] mt-1">
          KOTAETE &nbsp;//&nbsp; マジカルミライ 2026
        </p>
      </div>

      {/* Separator */}
      <div className="w-72 h-px bg-white/15" />

      {/* Progress */}
      <div className="w-72 space-y-3">
        <div className="flex justify-between font-mono text-xs text-white/40 tracking-widest">
          <span>INITIALIZING</span>
          <span>{progress}%</span>
        </div>

        {/* Block-style progress bar */}
        <div className="font-mono text-sm text-white/70 tracking-tight leading-none">
          {"▓".repeat(filled)}
          <span className="text-white/10">{"░".repeat(empty)}</span>
        </div>

        {/* Step label */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-white/35 tracking-wider">
          <span className="text-white/50">&gt;</span>
          <span>{loadingStep(progress)}</span>
          <Cursor />
        </div>
      </div>
    </motion.div>
  );
}

// ── Ready Screen ──────────────────────────────────────────────────────────
function ReadyScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      key="ready"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 select-none"
    >
      {/* Title */}
      <div className="text-center">
        <h1 className="font-mono text-white/90 text-3xl font-bold tracking-[0.3em] uppercase">
          PRISM RESONANCE
        </h1>
        <p className="font-mono text-white/30 text-xs tracking-[0.25em] mt-1">
          KOTAETE &nbsp;//&nbsp; マジカルミライ 2026
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 font-mono text-xs tracking-widest">
        <motion.span
          className="inline-block w-1.5 h-1.5 rounded-full bg-white/70"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-white/50">SYSTEM READY</span>
      </div>

      {/* Start button */}
      <motion.button
        onClick={onStart}
        className="font-mono text-white/80 border border-white/25 px-10 py-4 text-base tracking-[0.25em] uppercase cursor-pointer"
        whileHover={{
          scale: 1.04,
          borderColor: "rgba(255,255,255,0.7)",
          color: "rgba(255,255,255,1)",
        }}
        whileTap={{ scale: 0.96 }}
        animate={{
          boxShadow: [
            "0 0 8px rgba(255,255,255,0.06)",
            "0 0 28px rgba(255,255,255,0.18)",
            "0 0 8px rgba(255,255,255,0.06)",
          ],
        }}
        transition={{
          boxShadow: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        [ TOUCH TO ANSWER ]
      </motion.button>

      {/* Hint */}
      <motion.p
        className="font-mono text-white/20 text-xs tracking-[0.3em]"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        CLICK TO BEGIN SEQUENCE
      </motion.p>
    </motion.div>
  );
}

// ── Minimal HUD (shown while playing) ────────────────────────────────────
interface MinimalHUDProps {
  isPlaying: boolean;
  position: number;
  vocalAmplitude: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

function MinimalHUD({
  isPlaying,
  position,
  vocalAmplitude,
  onPlay,
  onPause,
  onStop,
}: MinimalHUDProps) {
  const posSeconds = (position / 1000).toFixed(1);
  const ampPct = Math.min(Math.round((vocalAmplitude / 128) * 100), 100);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Info row */}
      <div className="flex gap-6 font-mono text-xs text-white/25 tracking-wider">
        <span>{posSeconds}s</span>
        <span>VOC {ampPct}%</span>
        <span>{isPlaying ? "▶ PLAYING" : "⏸ PAUSED"}</span>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="font-mono text-xs text-white/60 border border-white/20 px-5 py-2 tracking-widest hover:border-white/50 hover:text-white transition-colors"
        >
          {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
        <button
          onClick={onStop}
          disabled={!isPlaying}
          className="font-mono text-xs text-white/25 border border-white/10 px-5 py-2 tracking-widest hover:border-white/25 hover:text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ⏹ STOP
        </button>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────
export default function PlayerUI({
  status,
  isPlaying,
  position,
  vocalAmplitude,
  hasStarted,
  onStart,
  onPlay,
  onPause,
  onStop,
}: PlayerUIProps) {
  const [loadingProgress, setLoadingProgress] = useState(5);

  useEffect(() => {
    if (status !== "loading") return;
    const startTime = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / 4500, 1);
      const eased = t * (2 - t);
      setLoadingProgress(Math.round(5 + eased * 70));
      if (t >= 1) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [status]);

  const progress =
    status === "ready" ? 100 : status === "idle" ? 5 : loadingProgress;

  return (
    <>
      {/* ── Full-screen overlay (loading / ready) ── */}
      <AnimatePresence mode="wait">
        {!hasStarted && (
          <motion.div
            key="overlay"
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ background: "rgba(0,0,5,0.78)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 1.2, ease: "easeInOut" },
            }}
          >
            {/* Subtle prismatic scan-line overlay */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)",
              }}
            />

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {status !== "ready" ? (
                  <LoadingScreen key="loading" progress={progress} />
                ) : (
                  <ReadyScreen key="ready" onStart={onStart} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Minimal HUD (playing state) ── */}
      <AnimatePresence>
        {hasStarted && (
          <motion.div
            key="hud"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <MinimalHUD
              isPlaying={isPlaying}
              position={position}
              vocalAmplitude={vocalAmplitude}
              onPlay={onPlay}
              onPause={onPause}
              onStop={onStop}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
