"use client";

import { Button } from "@/components/ui/Button";
import { TOUR_STEPS } from "@/content/tour";
import { useTour } from "./TourProvider";

/**
 * The tour card: fixed, non-blocking (the page stays fully interactive so
 * captions like "press Submit" actually work), skippable at every step.
 */
export function TourOverlay() {
  const { step, next, back, skip } = useTour();
  if (step === null) return null;

  const current = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-label={`Tour step ${step + 1} of ${TOUR_STEPS.length}: ${current.title}`}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-lg border border-accent/40 bg-surface-3 p-4 shadow-2xl"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">
          <span className="mr-2 font-mono text-[11px] text-accent">
            {step + 1}/{TOUR_STEPS.length}
          </span>
          {current.title}
        </h2>
        <button
          onClick={skip}
          className="text-xs text-ink-faint hover:text-ink"
          aria-label="Skip the tour"
        >
          Skip tour
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-[13px] leading-relaxed text-ink-muted">
        {current.caption}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={next}>{last ? "Finish" : "Next"}</Button>
      </div>
    </div>
  );
}
