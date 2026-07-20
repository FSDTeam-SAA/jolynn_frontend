"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarRange,
  FileText,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plane,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoutModal from "@/components/modals/LogoutModal";

const navigation = [
  { name: "Dashboard Overview", href: "/overview", icon: LayoutDashboard },
  {
    name: "My Business",
    href: "/my-business",
    icon: CreditCard,
  },
  {
    name: "My Services",
    href: "/my-services",
    icon: Plane,
  },
  {
    name: "My Gallery",
    href: "/my-gallery",
    icon: GraduationCap,
  },
  {
    name: "My Reviews",
    href: "/my-reviews",
    icon: MapPin,
  },
  {
    name: "Contact Info",
    href: "/contact-info",
    icon: CalendarRange,
  },
  {
    name: "Quote Request",
    href: "/quote-request",
    icon: FileText,
  },
  {
    name: "Security",
    href: "/security",
    icon: UserRound,
  },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const user = session?.user as
    | { name?: string; email?: string; profileImage?: string }
    | undefined;
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)

      
      .toUpperCase() || "U";

  return (

    
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-[280px] lg:w-[320px] bg-[#FFFFFF] z-50 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile Close Button */}
        <div className="absolute right-4 top-4 lg:hidden">
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>


        

        {/* Logo */}
        <div className="flex h-[80px] shrink-0 items-center justify-center">
          <Image
            src="/assets/images/logo.png"
            alt="Dashboard logo"
            width={64}
            height={64}
            priority
            className="h-[64px] w-[64px] object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 flex flex-col items-center px-3 overflow-y-auto mt-5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[4px] px-4 py-[11px] text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#30347F] text-white"
                    : "text-[#344054] hover:bg-[#F3F4FA] hover:text-[#30347F]",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-[#667085]",
                  )}
                />

                <span
                  className={cn(
                    "text-base",
                    isActive ? "font-semibold text-white" : "text-[#344054]",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User profile and logout */}
        <div className="shrink-0 bg-[#FFFFFF] px-5 py-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[#CBA24A]/30">
              <AvatarImage
                src={user?.profileImage}
                alt={user?.name || "User profile"}
                className="object-cover"
              />
              <AvatarFallback className="bg-[#CBA24A]/20 text-xs font-semibold text-[#E5BE6A]">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#F5E7C8]">
                {user?.name || "Admin User"}
              </p>
              <p className="truncate text-[11px] text-[#9A8060]">
                {user?.email || "admin@example.com"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] border border-[#D83939] text-sm font-medium text-[#F04444] transition-colors duration-200 hover:bg-[#D83939] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D83939]/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          void signOut({ callbackUrl: "/signin" });
        }}
      />
    </>
  );
}
