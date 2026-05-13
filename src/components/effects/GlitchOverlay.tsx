"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  GLITCH_AMPLITUDE_THRESHOLD,
  GLITCH_DURATION_MS,
  CHORUS_GLITCH_FRAMES,
  CHORUS_GLITCH_INTERVAL_MS,
} from "@/lib/constants";

type GlitchIntensity = "normal" | "intense";

interface GlitchOverlayProps {
  amplitude: number;
  isChorus: boolean;
}

export default function GlitchOverlay({ amplitude, isChorus }: GlitchOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const amplitudeGlitchActive = useRef(false);
  const lastAmplitudeTrigger = useRef(0);
  const chorusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevChorusRef = useRef(false);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const drawGlitch = useCallback((intensity: GlitchIntensity) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const sliceCount = intensity === "intense" ? 20 : 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < sliceCount; i++) {
      const y = Math.random() * h;
      const sliceH = intensity === "intense" ? 4 + Math.random() * 24 : 2 + Math.random() * 12;
      const offset = (Math.random() - 0.5) * (intensity === "intense" ? 80 : 40);
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const alpha = intensity === "intense" ? 0.25 + Math.random() * 0.35 : 0.15 + Math.random() * 0.25;
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fillRect(offset, y, w, sliceH);
    }

    const blockCount = intensity === "intense" ? 16 : 6;
    for (let i = 0; i < blockCount; i++) {
      const bx = Math.random() * w;
      const by = Math.random() * h;
      const bw = intensity === "intense" ? 40 + Math.random() * 200 : 20 + Math.random() * 120;
      const bh = intensity === "intense" ? 8 + Math.random() * 40 : 4 + Math.random() * 20;
      // Chorus uses red/magenta glitch instead of cyan
      const glitchColor = isChorus ? `rgba(255,0,128,` : `rgba(0,200,255,`;
      ctx.fillStyle = `${glitchColor}${0.08 + Math.random() * 0.18})`;
      ctx.fillRect(bx, by, bw, bh);
    }
  }, [isChorus]);

  // Amplitude-based glitch (brief single flash)
  useEffect(() => {
    const now = Date.now();
    if (
      amplitude > GLITCH_AMPLITUDE_THRESHOLD &&
      !amplitudeGlitchActive.current &&
      now - lastAmplitudeTrigger.current > GLITCH_DURATION_MS * 3
    ) {
      amplitudeGlitchActive.current = true;
      lastAmplitudeTrigger.current = now;
      drawGlitch("normal");
      setTimeout(() => {
        clearCanvas();
        amplitudeGlitchActive.current = false;
      }, GLITCH_DURATION_MS);
    }
  }, [amplitude, drawGlitch, clearCanvas]);

  // Chorus entry: sustained 500ms intense glitch burst
  useEffect(() => {
    const entering = isChorus && !prevChorusRef.current;
    prevChorusRef.current = isChorus;

    if (!entering) return;

    // Stop any existing chorus glitch
    if (chorusIntervalRef.current) clearInterval(chorusIntervalRef.current);

    let frame = 0;
    chorusIntervalRef.current = setInterval(() => {
      if (frame < CHORUS_GLITCH_FRAMES) {
        drawGlitch("intense");
      } else {
        if (chorusIntervalRef.current) clearInterval(chorusIntervalRef.current);
        clearCanvas();
        chorusIntervalRef.current = null;
      }
      frame++;
    }, CHORUS_GLITCH_INTERVAL_MS);

    return () => {
      if (chorusIntervalRef.current) {
        clearInterval(chorusIntervalRef.current);
        chorusIntervalRef.current = null;
      }
    };
  }, [isChorus, drawGlitch, clearCanvas]);

  // Resize handler
  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
