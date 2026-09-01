import { useEffect, useRef, useState } from "react";

/**
 * Fires once, the first time the element scrolls near the viewport, then
 * disconnects — a one-shot "is this about to be visible" flag, not a live
 * visibility tracker. `rootMargin` defaults to loading ~600px ahead of
 * scroll so section data is already in flight before the user reaches it.
 */
export function useInView<T extends Element>(rootMargin = "600px 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
