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
  if (progress < 20) return "ESTABLISHING NEURAL LINK...";
  if (progress < 45) return "LOADING AUDIO ENGINE...";
  if (progress < 70) return "SYNCHRONIZING LYRICS DATA...";
  return "CALIBRATING BEAT DETECTION...";
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
        <h1 className="font-mono text-cyan-400 text-3xl font-bold tracking-[0.3em] uppercase">
          CYBER VOID
        </h1>
        <p className="font-mono text-white/30 text-xs tracking-[0.25em] mt-1">
          TAKEOVER &nbsp;//&nbsp; マジカルミライ 2026
        </p>
      </div>

      {/* Separator */}
      <div className="w-72 h-px bg-cyan-400/20" />

      {/* Progress */}
      <div className="w-72 space-y-3">
        <div className="flex justify-between font-mono text-xs text-cyan-400/50 tracking-widest">
          <span>INITIALIZING SYSTEM</span>
          <span>{progress}%</span>
        </div>

        {/* Block-style progress bar */}
        <div className="font-mono text-sm text-cyan-400 tracking-tight leading-none">
          {"▓".repeat(filled)}
          <span className="text-white/15">{"░".repeat(empty)}</span>
        </div>

        {/* Step label */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-300/40 tracking-wider">
          <span className="text-cyan-400/60">&gt;</span>
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
        <h1 className="font-mono text-cyan-400 text-3xl font-bold tracking-[0.3em] uppercase">
          CYBER VOID
        </h1>
        <p className="font-mono text-white/30 text-xs tracking-[0.25em] mt-1">
          TAKEOVER &nbsp;//&nbsp; マジカルミライ 2026
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 font-mono text-xs tracking-widest">
        <motion.span
          className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-green-400/70">SYSTEM READY</span>
      </div>

      {/* Start button */}
      <motion.button
        onClick={onStart}
        className="font-mono text-cyan-400 border border-cyan-400/50 px-10 py-4 text-base tracking-[0.25em] uppercase cursor-pointer"
        whileHover={{
          scale: 1.04,
          borderColor: "rgba(34,211,238,0.9)",
          color: "rgba(255,255,255,1)",
        }}
        whileTap={{ scale: 0.96 }}
        animate={{
          boxShadow: [
            "0 0 8px rgba(34,211,238,0.15)",
            "0 0 28px rgba(34,211,238,0.45)",
            "0 0 8px rgba(34,211,238,0.15)",
          ],
        }}
        transition={{
          boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        [ INITIALIZE TAKEOVER ]
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
      <div className="flex gap-6 font-mono text-xs text-white/30 tracking-wider">
        <span>{posSeconds}s</span>
        <span>VOC {ampPct}%</span>
        <span>{isPlaying ? "▶ PLAYING" : "⏸ PAUSED"}</span>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="font-mono text-xs text-cyan-400 border border-cyan-400/40 px-5 py-2 tracking-widest hover:border-cyan-400 hover:text-white transition-colors"
        >
          {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
        <button
          onClick={onStop}
          disabled={!isPlaying}
          className="font-mono text-xs text-white/30 border border-white/10 px-5 py-2 tracking-widest hover:border-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
  // Animated progress for the "loading" phase only (5% → 75% over 4.5 s).
  // idle/ready values are derived directly from status during render to avoid
  // synchronous setState-in-effect (react-hooks/set-state-in-effect).
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

  // Derive the displayed progress without synchronous setState in effect
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
            style={{ background: "rgba(0,0,5,0.82)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 1.0, ease: "easeInOut" },
            }}
          >
            {/* Scan-line overlay for cyberpunk texture */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.015) 2px, rgba(0,255,255,0.015) 4px)",
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
