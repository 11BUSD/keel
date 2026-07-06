import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { TourOverlay } from "@/components/tour/TourOverlay";
import { TourProvider } from "@/components/tour/TourProvider";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <TourProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6">
            {children}
          </main>
        </div>
      </div>
      <TourOverlay />
    </TourProvider>
  );
}
