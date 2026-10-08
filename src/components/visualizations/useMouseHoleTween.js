import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { interpolateVisual } from './mouseHoleMotion.js';

// Retarget from the currently displayed intermediate value, never the old goal.
// Pause freezes elapsed time; rewind/reset replaces the target and cancels old RAF.
export default function useMouseHoleTween(target, { paused = false, speed = 1, duration = 420 } = {}) {
  const [display, setDisplay] = useState(target);
  const tween = useRef({ from: target, to: target, value: target, elapsed: duration, amount: 1 });
  useLayoutEffect(() => {
    if (tween.current.to === target) return;
    tween.current = { from: tween.current.value, to: target, value: tween.current.value, elapsed: 0, amount: 0 };
  }, [target]);
  useEffect(() => {
    if (paused || tween.current.elapsed >= duration) return;
    let raf, last = null;
    const tick = now => {
      const s = tween.current;
      if (last !== null) s.elapsed = Math.min(duration, s.elapsed + Math.min(80, now - last) * speed);
      last = now;
      const t = s.elapsed / duration;
      s.amount = t * t * (3 - 2 * t);
      s.value = interpolateVisual(s.from, s.to, s.amount);
      setDisplay(s.value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, paused, speed, duration]);
  return { display, from: tween.current.from, amount: tween.current.amount };
}
