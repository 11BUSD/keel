"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-deep text-ink hover:bg-accent disabled:bg-surface-3 disabled:text-ink-faint",
  ghost:
    "border border-line bg-transparent text-ink-muted hover:border-line-strong hover:text-ink disabled:text-ink-faint",
  danger:
    "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  busy = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; busy?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {busy && (
        <span
          aria-hidden
          className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
