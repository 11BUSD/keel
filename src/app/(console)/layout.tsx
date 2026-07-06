import type { ReactNode } from "react";
import { MobileNav } from "@/components/shell/MobileNav";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { TourOverlay } from "@/components/tour/TourOverlay";
import { TourProvider } from "@/components/tour/TourProvider";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <TourProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <MobileNav />
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </main>
        </div>
      </div>
      <TourOverlay />
    </TourProvider>
  );
}
