"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { TOUR_STEPS } from "@/content/tour";

interface TourState {
  /** Current 0-based step, or null when the tour is off. */
  step: number | null;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
}

const TourContext = createContext<TourState | null>(null);

export function useTour(): TourState {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setStep(index);
      router.push(TOUR_STEPS[index].route);
    },
    [router],
  );

  const start = useCallback(() => goTo(0), [goTo]);
  const skip = useCallback(() => setStep(null), []);
  const next = useCallback(() => {
    setStep((s) => {
      if (s === null) return s;
      if (s >= TOUR_STEPS.length - 1) return null;
      router.push(TOUR_STEPS[s + 1].route);
      return s + 1;
    });
  }, [router]);
  const back = useCallback(() => {
    setStep((s) => {
      if (s === null || s === 0) return s;
      router.push(TOUR_STEPS[s - 1].route);
      return s - 1;
    });
  }, [router]);

  // ?tour=1 (e.g. from the landing CTA) starts the tour on first mount. This is
  // a one-shot read of an external system (the URL) after hydration; deriving it
  // during render would mismatch the server-rendered HTML.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tour") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot URL adoption post-hydration
      setStep(0);
    }
  }, []);

  return (
    <TourContext.Provider value={{ step, start, next, back, skip }}>
      {children}
    </TourContext.Provider>
  );
}
