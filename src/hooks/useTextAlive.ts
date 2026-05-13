"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Player, IPlayerApp } from "textalive-app-api";
import { SONG_URL } from "@/lib/constants";

export type PlayerStatus = "idle" | "loading" | "ready" | "playing" | "paused";

export interface TextAliveState {
  status: PlayerStatus;
  isPlaying: boolean;
  position: number;
  beatIndex: number;
  beatPulse: number;
  vocalAmplitude: number;
  currentLyric: string;
  isChorus: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export function useTextAlive(): TextAliveState {
  const playerRef = useRef<Player | null>(null);
  const lastBeatIndexRef = useRef(-1);
  const lastChorusRef = useRef(false);

  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [beatPulse, setBeatPulse] = useState(0);
  const [vocalAmplitude, setVocalAmplitude] = useState(0);
  const [currentLyric, setCurrentLyric] = useState("");
  const [isChorus, setIsChorus] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_TEXTALIVE_TOKEN ?? "dummy_token";

    const player = new Player({
      app: { token },
      vocalAmplitudeEnabled: true,
    });

    playerRef.current = player;

    player.addListener({
      onAppReady(app: IPlayerApp) {
        if (!app.managed) {
          setStatus("loading");
          player.createFromSongUrl(SONG_URL);
        }
      },

      onVideoReady() {
        setStatus("ready");
      },

      onTimerReady() {
        setStatus("ready");
      },

      onPlay() {
        setIsPlaying(true);
        setStatus("playing");
      },

      onPause() {
        setIsPlaying(false);
        setStatus("paused");
      },

      onStop() {
        setIsPlaying(false);
        setStatus("ready");
        setPosition(0);
        setCurrentLyric("");
        setIsChorus(false);
        lastBeatIndexRef.current = -1;
        lastChorusRef.current = false;
      },

      onTimeUpdate(pos: number) {
        setPosition(pos);

        // Beat pulse
        const currentBeat = player.findBeat(pos);
        if (currentBeat) {
          const idx = currentBeat.index ?? 0;
          setBeatIndex(idx);
          if (idx !== lastBeatIndexRef.current) {
            lastBeatIndexRef.current = idx;
            setBeatPulse(1);
            setTimeout(() => setBeatPulse(0), 16);
          }
        }

        // Vocal amplitude
        const amp = player.getVocalAmplitude(pos);
        setVocalAmplitude(amp ?? 0);

        // Current lyric (phrase level)
        // findPhrase exists at runtime but is not reflected in the Player class .d.ts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const phrase = (player as any).findPhrase?.(pos);
        setCurrentLyric(phrase?.text ?? "");

        // Chorus detection
        const chorus = player.findChorus(pos);
        const inChorus = chorus != null;
        if (inChorus !== lastChorusRef.current) {
          lastChorusRef.current = inChorus;
          setIsChorus(inChorus);
        }
      },
    });

    return () => {
      player.dispose();
      playerRef.current = null;
    };
  }, []);

  const play = useCallback(() => {
    playerRef.current?.requestPlay();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.requestPause();
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.requestStop();
  }, []);

  return {
    status,
    isPlaying,
    position,
    beatIndex,
    beatPulse,
    vocalAmplitude,
    currentLyric,
    isChorus,
    play,
    pause,
    stop,
  };
}
