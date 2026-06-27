import { useState } from 'react';

let cached;

/**
 * Cheap, cached feature-detection for WebGL. Used to decide whether to mount a
 * three.js canvas at all — when it returns false (no context, blocked GPU,
 * headless/older engine) callers should render a non-WebGL fallback instead.
 */
export function supportsWebGL() {
  if (cached !== undefined) return cached;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    cached = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    cached = false;
  }
  return cached;
}

/** Hook form: evaluates once on mount. SPA-only app, so no SSR flash concerns. */
export function useSupportsWebGL() {
  const [ok] = useState(() => supportsWebGL());
  return ok;
}
