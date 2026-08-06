"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MotionIntensity } from "@/lib/happy-banner/types";
import { INTENSITY, effectiveIntensity } from "@/lib/happy-banner/intensity";

interface MotionContextValue {
  reducedMotion: boolean;
  lowPower: boolean;
  intensity: MotionIntensity;
  pxPerSecond: number;
  paused: boolean;
  setPaused: (v: boolean) => void;
  subscribe: (cb: (dt: number, t: number) => void) => () => void;
  time: number;
}

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({
  intensity: requested,
  speedMultiplier = 1,
  children,
}: {
  intensity: MotionIntensity;
  speedMultiplier?: number;
  children: ReactNode;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [paused, setPaused] = useState(false);
  const [time, setTime] = useState(0);
  const subscribers = useRef(new Set<(dt: number, t: number) => void>());
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setLowPower(Boolean(conn?.saveData));
  }, []);

  const intensity = effectiveIntensity(requested, reducedMotion, lowPower);
  const base = INTENSITY[intensity];
  const pxPerSecond = base.pxPerSecond * speedMultiplier * (reducedMotion ? 0 : 1);

  const subscribe = useCallback((cb: (dt: number, t: number) => void) => {
    subscribers.current.add(cb);
    return () => subscribers.current.delete(cb);
  }, []);

  useEffect(() => {
    const tick = (now: number) => {
      if (lastRef.current != null && !paused && !reducedMotion) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        timeRef.current += dt;
        setTime(timeRef.current);
        subscribers.current.forEach((cb) => cb(dt, timeRef.current));
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, reducedMotion]);

  return (
    <MotionContext.Provider
      value={{
        reducedMotion,
        lowPower,
        intensity,
        pxPerSecond,
        paused,
        setPaused,
        subscribe,
        time,
      }}
    >
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used within MotionProvider");
  return ctx;
}

export function useMotionOffset(initial = 0) {
  const { subscribe, pxPerSecond, reducedMotion, direction } = useMotion() as MotionContextValue & {
    direction?: "ltr" | "rtl";
  };
  const offsetRef = useRef(initial);
  const dir = direction === "rtl" ? -1 : 1;

  useEffect(() => {
    if (reducedMotion) return;
    return subscribe((dt) => {
      offsetRef.current += pxPerSecond * dt * dir;
    });
  }, [subscribe, pxPerSecond, reducedMotion, dir]);

  return offsetRef;
}
