"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/content/copy";

const items = [
  { href: "/dashboard", label: COPY.shell.nav.dashboard },
  { href: "/financing", label: COPY.shell.nav.financing },
  { href: "/treasury", label: COPY.shell.nav.treasury },
  { href: "/risk", label: COPY.shell.nav.risk },
  { href: "/scenarios", label: COPY.shell.nav.scenarios },
  { href: "/lenders", label: COPY.shell.nav.lenders },
  { href: "/controls", label: COPY.shell.nav.controls },
  { href: "/audit", label: COPY.shell.nav.audit },
];

/** Phone-width navigation: brand row + horizontally scrollable section strip. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-line bg-surface-1 md:hidden">
      <Link href="/" className="flex items-baseline gap-2 px-4 pt-3">
        <span className="text-lg font-semibold tracking-tight text-ink">
          {COPY.shell.brand}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-ink-faint">
          {COPY.shell.brandSuffix}
        </span>
      </Link>
      <nav aria-label="Primary" className="flex gap-1 overflow-x-auto px-3 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/dashboard" && pathname.startsWith("/agents"));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs ${
                active
                  ? "bg-surface-3 font-medium text-ink"
                  : "text-ink-muted hover:bg-surface-2"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
