// ---- TextAlive ----
export const SONG_URL = "https://piapro.jp/t/6W2N";

// ---- Audio Thresholds ----
export const GLITCH_AMPLITUDE_THRESHOLD = 0.75;
export const GLITCH_DURATION_MS = 120;
export const BEAT_PULSE_DECAY = 0.08;

// ---- Particles ----
export const PARTICLE_COUNT = 4000;
export const PARTICLE_SPREAD = 40;
export const PARTICLE_BASE_SIZE = 0.06;

// ---- Grid ----
export const GRID_SIZE = 80;
export const GRID_DIVISIONS = 40;

// ---- Floating Structures ----
export const STRUCTURE_COUNT = 12;
export const DISPLACEMENT_SCALE = 0.4;

// ---- Post Processing ----
export const BLOOM_INTENSITY = 1.4;
export const BLOOM_THRESHOLD = 0.2;
export const BLOOM_RADIUS = 0.6;
export const VIGNETTE_OFFSET = 0.3;
export const VIGNETTE_DARKNESS = 0.8;
export const CHROMATIC_OFFSET = 0.0008;

// ---- Chorus (TAKEOVER) ----
export const CHORUS_BLOOM_MULTIPLIER = 3.5;
export const CHORUS_CHROMATIC_MULTIPLIER = 4.0;
export const CHORUS_COLOR_LERP_SPEED = 3.0;
export const CHORUS_GLITCH_FRAMES = 8;
export const CHORUS_GLITCH_INTERVAL_MS = 60;

// ---- Mouse Parallax ----
export const MOUSE_PARALLAX_STRENGTH = 0.8;
export const MOUSE_PARALLAX_LERP = 0.04;
export const CAMERA_BASE_Y = 2;

// ---- Cinematic Intro Camera ----
export const CAMERA_INTRO_RADIUS = 22;
export const CAMERA_INTRO_HEIGHT = 14;
export const CAMERA_INTRO_ORBIT_SPEED = 0.12;
export const CAMERA_TRANSITION_DURATION = 2.8;

// ---- Lyric Visualizer ----
// jsDelivr CDN: stable URL for Noto Sans JP Bold (full CJK coverage)
export const LYRIC_FONT_URL =
  "https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-jp@5.0.3/files/noto-serif-jp-japanese-700-normal.woff2";
export const LYRIC_FONT_SIZE = 0.9;
export const LYRIC_ANIM_SPEED = 10;
