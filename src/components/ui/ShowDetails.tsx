import type { ReactNode } from "react";

/**
 * The expert layer, kept but collapsed (Round 14). Native <details> for free
 * keyboard/screen-reader support. The plain summary always sits above it.
 */
export function ShowDetails({
  label = "Show the details",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-md border border-line bg-surface-2">
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-accent hover:text-ink group-open:border-b group-open:border-line">
        {label}
      </summary>
      <div className="p-3">{children}</div>
    </details>
  );
}
