import type { ReactNode } from "react";

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-line bg-surface-1 ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          {title && (
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-ink-muted">
              {title}
            </h2>
          )}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
