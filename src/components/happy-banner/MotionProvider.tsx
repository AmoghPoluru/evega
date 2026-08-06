"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import type { MotionIntensity } from "@/lib/happy-banner/types";
import { INTENSITY, effectiveIntensity } from "@/lib/happy-banner/intensity";

export type FrameCallback = (dt: number, t: number) => void;

interface MotionContextValue {
  reducedMotion: boolean;
  lowPower: boolean;
  intensity: MotionIntensity;
  pxPerSecond: number;
  parallax: number;
  idleScale: number;
  direction: "ltr" | "rtl";
  /** User-facing play/pause, persisted across visits. */
  playing: boolean;
  togglePlaying: () => void;
  /** Transient slow-down while a tile is hovered or focused. */
  setSlowed: (v: boolean) => void;
  subscribe: (cb: FrameCallback) => () => void;
  /** Live pointer position in [-1, 1], written once per frame by the provider. */
  pointerRef: RefObject<{ x: number; y: number }>;
  rootRef: RefObject<HTMLElement | null>;
}

const MotionContext = createContext<MotionContextValue | null>(null);

const PAUSE_STORAGE_KEY = "happy-banner:paused";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Client-only preference reads go through `useSyncExternalStore` so the server
 * snapshot stays stable and nothing has to be corrected from inside an effect.
 */
const pauseListeners = new Set<() => void>();

function subscribePause(onChange: () => void) {
  pauseListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    pauseListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readPlaying(): boolean {
  return window.localStorage.getItem(PAUSE_STORAGE_KEY) !== "1";
}

function writePlaying(next: boolean) {
  window.localStorage.setItem(PAUSE_STORAGE_KEY, next ? "0" : "1");
  pauseListeners.forEach((listener) => listener());
}

const noopSubscribe = () => () => {};

function detectLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return true;
  return nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4;
}

export function MotionProvider({
  intensity: requested,
  speedMultiplier = 1,
  direction = "ltr",
  children,
}: {
  intensity: MotionIntensity;
  speedMultiplier?: number;
  direction?: "ltr" | "rtl";
  children: ReactNode;
}) {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const lowPower = useSyncExternalStore(noopSubscribe, detectLowPower, () => false);
  const playing = useSyncExternalStore(subscribePause, readPlaying, () => true);

  const rootRef = useRef<HTMLElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const subscribers = useRef(new Set<FrameCallback>());
  const speedRef = useRef(1);
  const slowedRef = useRef(false);
  const visibleRef = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const intensity = effectiveIntensity(requested, reducedMotion, lowPower);
  const base = INTENSITY[intensity];
  const pxPerSecond = reducedMotion ? 0 : base.pxPerSecond * speedMultiplier;

  const subscribe = useCallback((cb: FrameCallback) => {
    subscribers.current.add(cb);
    return () => {
      subscribers.current.delete(cb);
    };
  }, []);

  const setSlowed = useCallback((v: boolean) => {
    slowedRef.current = v;
  }, []);

  const togglePlaying = useCallback(() => {
    writePlaying(!readPlaying());
  }, []);

  // Suspend the whole banner while it is off-screen or the tab is hidden.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        root.classList.toggle("hb-offscreen", !entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(root);

    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      root.classList.toggle("hb-offscreen", hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Pointer tracking — one listener, one target vector, no state updates.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointerTargetRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
      };
    };
    const onLeave = () => {
      pointerTargetRef.current = { x: 0, y: 0 };
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  // The single rAF driver. Subscribers mutate DOM through refs; nothing here
  // touches React state, so an animating banner never re-renders.
  useEffect(() => {
    if (reducedMotion || !playing) return;

    let frame = 0;
    let last: number | null = null;
    let elapsed = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      if (last == null) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!visibleRef.current || document.visibilityState === "hidden") return;

      // Frame-rate independent easing toward the target speed: hovering slows
      // the field to 20% over ~300ms and releases over ~600ms.
      const target = slowedRef.current ? 0.2 : 1;
      const tau = slowedRef.current ? 0.3 : 0.6;
      speedRef.current += (target - speedRef.current) * (1 - Math.exp(-dt / tau));

      const pointer = pointerRef.current;
      const wanted = pointerTargetRef.current;
      const pTau = 0.12;
      const k = 1 - Math.exp(-dt / pTau);
      pointer.x += (wanted.x - pointer.x) * k;
      pointer.y += (wanted.y - pointer.y) * k;

      const root = rootRef.current;
      if (root) {
        root.style.setProperty("--hb-px", pointer.x.toFixed(4));
        root.style.setProperty("--hb-py", pointer.y.toFixed(4));
      }

      elapsed += dt * speedRef.current;
      subscribers.current.forEach((cb) => cb(dt * speedRef.current, elapsed));
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, playing]);

  const value = useMemo<MotionContextValue>(
    () => ({
      reducedMotion,
      lowPower,
      intensity,
      pxPerSecond,
      parallax: base.parallax,
      idleScale: base.idle,
      direction,
      playing,
      togglePlaying,
      setSlowed,
      subscribe,
      pointerRef,
      rootRef,
    }),
    [
      reducedMotion,
      lowPower,
      intensity,
      pxPerSecond,
      base.parallax,
      base.idle,
      direction,
      playing,
      togglePlaying,
      setSlowed,
      subscribe,
    ],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used within MotionProvider");
  return ctx;
}
