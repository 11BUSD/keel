"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Fleet Dashboard" },
  { href: "/financing", label: "Financing" },
  { href: "/controls", label: "Fail-safe Controls" },
  { href: "/audit", label: "Audit Log" },
  { href: "/style", label: "Design System" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-line bg-surface-1">
      <Link
        href="/"
        className="flex items-baseline gap-2 border-b border-line px-4 py-4"
      >
        <span className="text-lg font-semibold tracking-tight text-ink">Keel</span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-ink-faint">
          Prime
        </span>
      </Link>
      <nav aria-label="Main" className="flex-1 space-y-0.5 p-2">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/dashboard" && pathname.startsWith("/agents"));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-[13px] transition-colors ${
                active
                  ? "bg-surface-3 font-medium text-ink"
                  : "text-ink-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="border-t border-line px-4 py-3 text-[10px] leading-relaxed text-ink-faint">
        Demo prototype. All data simulated — no real funds, custody, or trading.
      </p>
    </aside>
  );
}
