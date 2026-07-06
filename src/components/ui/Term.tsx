"use client";

import { useId, useState } from "react";

/**
 * Progressive disclosure for jargon (Round 14): the plain phrase leads; the
 * expert term + one-line definition reveals on click/tap. Keyboard accessible.
 */
export function Term({
  plain,
  expert,
  def,
}: {
  plain: string;
  expert: string;
  def: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help rounded-sm underline decoration-line-strong decoration-dotted underline-offset-2 hover:decoration-accent"
      >
        {plain}
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className="absolute left-0 top-full z-20 mt-1 block w-64 rounded-md border border-line bg-surface-3 p-2.5 text-xs leading-relaxed shadow-lg"
        >
          <span className="font-medium text-accent">{expert}</span>
          <span className="mt-0.5 block text-ink-muted">{def}</span>
        </span>
      )}
    </span>
  );
}
