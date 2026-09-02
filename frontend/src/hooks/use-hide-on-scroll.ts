import { useEffect, useRef, useState } from "react";

const SAMPLE_INTERVAL_MS = 120;
const SCROLL_DELTA_THRESHOLD = 24;
const TOP_OFFSET = 8;

// True once the user scrolls down past a small dead-zone; resets to false on
// scroll-up or near the top. Samples scrollY on a throttled interval rather
// than every raw scroll event — with `scroll-behavior: smooth` set globally,
// even a single scroll gesture emits a stream of events whose tail can settle
// with a same-direction micro-correction, which would otherwise flip the
// result back right at the end of the gesture.
export function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastSampleY = useRef(0);

  useEffect(() => {
    lastSampleY.current = window.scrollY;
    let scheduled = false;

    function sample() {
      scheduled = false;
      const y = window.scrollY;
      const delta = y - lastSampleY.current;

      if (y <= TOP_OFFSET) {
        setHidden(false);
      } else if (Math.abs(delta) >= SCROLL_DELTA_THRESHOLD) {
        setHidden(delta > 0);
      }
      lastSampleY.current = y;
    }

    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      window.setTimeout(sample, SAMPLE_INTERVAL_MS);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
