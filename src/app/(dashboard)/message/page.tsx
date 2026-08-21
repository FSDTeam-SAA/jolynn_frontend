import React from "react";
import MessageBox from "@/app/(website)/message/_components/MessageBox";

export const metadata = {
  title: "Messages | Jolynn Dashboard",
  description: "Dashboard chat and messaging system",
};

export default function DashboardMessagePage() {
  return (
    <div className="w-full h-full overflow-hidden">
      <MessageBox mode="business" heightClass="h-[calc(100vh-160px)]" />
    </div>
  );
}