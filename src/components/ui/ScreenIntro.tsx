import type { ReactNode } from "react";

/**
 * One plain sentence at the top of every screen: what am I looking at, and why
 * should I care (Round 14). Every route renders exactly one of these.
 */
export function ScreenIntro({
  title,
  intro,
}: {
  title: string;
  intro: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
        {intro}
      </p>
    </div>
  );
}
