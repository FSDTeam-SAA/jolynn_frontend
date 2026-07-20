"use client";

import React, { useState } from "react";
import Header from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#382A1A]">
      <Header setSidebarOpen={setSidebarOpen} />

      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />


        <main className="mt-[100px] min-w-0 flex-1 overflow-x-auto bg-[#382A1A] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
