import { useRef, useState, useEffect } from "react";

/**
 * SEO-friendly scroll-triggered fade-in animation.
 *
 * SSR: renders with NO inline opacity styles (content visible to crawlers).
 * Client: hides below-fold elements, then animates them in on scroll.
 * Above-fold elements stay visible (no flash).
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 30,
  duration = 0.8,
  margin = "-80px",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"initial" | "hidden" | "visible">(
    "initial"
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Above the fold on mount: mark visible immediately (no animation)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setState("visible");
      return;
    }

    // Below the fold: hide instantly, then animate in on scroll
    setState("hidden");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("visible");
          observer.disconnect();
        }
      },
      { rootMargin: margin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  const ease = "cubic-bezier(0.25, 0.4, 0.25, 1)";

  const style: React.CSSProperties =
    state === "hidden"
      ? { opacity: 0, transform: `translateY(${y}px)` }
      : state === "visible"
        ? {
            opacity: 1,
            transform: "translateY(0)",
            transition: `opacity ${duration}s ${ease} ${delay}s, transform ${duration}s ${ease} ${delay}s`,
          }
        : {}; // "initial": no inline styles — SSR-visible

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
