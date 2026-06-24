import { useEffect, useRef, useState } from 'react';

/** True when the user has requested reduced motion (re-evaluates on change). */
export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}

/**
 * Run `callback(dtMs, tMs)` on every animation frame while `active`. Pauses
 * automatically when the tab is hidden or reduced motion is requested.
 */
export function useRaf(callback, active = true) {
  const cb = useRef(callback);
  cb.current = callback;
  useEffect(() => {
    if (!active) return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    let raf;
    let last = window.performance.now();
    const loop = (t) => {
      const dt = t - last;
      last = t;
      if (!document.hidden) cb.current(dt, t);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [active]);
}

/**
 * Animate a numeric value toward `target` with a simple critically-ish damped
 * spring. Returns the current value. Snaps instantly under reduced motion.
 */
export function useSpring(target, { stiffness = 0.14, threshold = 0.4 } = {}) {
  const [value, setValue] = useState(target);
  const cur = useRef(target);
  const raf = useRef(null);

  useEffect(() => {
    if (raf.current) window.cancelAnimationFrame(raf.current);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      cur.current = target;
      setValue(target);
      return undefined;
    }
    const step = () => {
      const diff = target - cur.current;
      if (Math.abs(diff) < threshold) {
        cur.current = target;
        setValue(target);
        return;
      }
      cur.current += diff * stiffness;
      setValue(cur.current);
      raf.current = window.requestAnimationFrame(step);
    };
    raf.current = window.requestAnimationFrame(step);
    return () => raf.current && window.cancelAnimationFrame(raf.current);
  }, [target, stiffness, threshold]);

  return value;
}
