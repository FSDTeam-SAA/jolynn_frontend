import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./dashboard/_component/shared/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SidebarProvider defaultOpen={true} className="px-8">
        <AppSidebar />
        <main className="w-full">
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>
          <div className="w-full">
            <div className="pb-10">{children}</div>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
