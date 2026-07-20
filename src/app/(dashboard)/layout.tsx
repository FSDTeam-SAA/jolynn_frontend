"use client";

import React, { useState } from "react";
import Header from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F8F7]">
      <Header setSidebarOpen={setSidebarOpen} />

      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />


        <main className="mt-[100px] min-w-0 flex-1 overflow-x-auto bg-[#F5F8F7] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
