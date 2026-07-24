"use client";

import { useProfileQuery } from "@/hooks/APicalling";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPageConfig } from "@/lib/page-config";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();

  const pageInfo = getPageConfig(pathname);

  const { data: session } = useSession();

  const sessionUser = session?.user as
    | {
        name?: string;
        email?: string;
        token?: string;
        accessToken?: string;
      }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const { data: profileResponse } = useProfileQuery(token);
  const profile = profileResponse?.data;
  const displayName = profile?.fullName || sessionUser?.name || "User";
  const email = profile?.email || sessionUser?.email || "";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed top-0 right-0 left-0 z-30 h-[100px] flex items-center justify-between px-4 md:px-6 bg-[#FFFFFF]">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open dashboard menu"
          className="text-[#CD9B46] lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="lg:ml-[320px]">
          <h1 className="text-2xl font-bold leading-[150%] text-[#000000]">
            {pageInfo.title}
          </h1>

          <p className="hidden md:block text-sm text-[#2A2F4D]">
            {pageInfo.description}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="relative flex items-center">
        <div className="flex items-center gap-3">
          <div className="hidden max-w-[220px] text-right sm:block">
            <p className="truncate text-sm font-semibold text-[#344054]">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-[#667085]">{email}</p>
          </div>

          <Avatar className="h-10 w-10 border border-[#CBA24A]/30">
            <AvatarImage
              src={profile?.profilePicture}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#CBA24A]/20 text-xs font-semibold text-[#30347F]">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
