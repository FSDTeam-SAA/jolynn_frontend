"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, LogOut, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

type MobileNavbarProps = {
  navItems: NavItem[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  profileImage?: string;
  displayName: string;
  profileRoles: string[];
  onProfileSwitch: (targetRole: "user" | "businessOwner", href: string) => void;
  onLogout: () => void;
};

const MobileNavbar = ({ navItems, isAuthenticated, isAuthLoading, profileImage, displayName, profileRoles, onProfileSwitch, onLogout }: MobileNavbarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-[5px] border border-[#22245F] bg-transparent text-[#22245F] hover:bg-white/60 focus-visible:ring-[#22245F]"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(88vw,380px)] border-l border-[#9FB8B7] bg-[#E6F2F2] p-3 sm:p-4"
      >
        <div className="flex h-full flex-col pt-5">
           <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-12 h-12"
            />
          </Link>

          <nav className="flex-1" aria-label="Mobile navigation">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeSheet}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-12 items-center rounded-[5px] px-4 text-[18px] font-medium transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] ${
                        isActive
                          ? "bg-white/70 text-[#22245F]"
                          : "text-slate-950"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-[#9FB8B7] pt-5">
            {isAuthLoading ? (
              <div className="h-12 animate-pulse rounded-[5px] bg-white/60" />
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <div className="mb-4 flex items-center gap-3 rounded-[5px] bg-white/60 p-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#22245F] bg-white text-[#22245F]">
                    {profileImage ? <Image src={profileImage} alt={displayName} fill sizes="44px" className="object-cover" /> : <User className="h-5 w-5" />}
                  </div>
                  <span className="min-w-0 truncate text-sm font-semibold text-[#22245F]">{displayName}</span>
                </div>
                {profileRoles.includes("user") && (
                  <button type="button" onClick={() => { closeSheet(); onProfileSwitch("user", "/account/profile"); }} className="flex h-12 w-full items-center gap-3 rounded-[5px] border border-[#22245F] px-4 text-left text-base font-semibold text-[#22245F] transition hover:bg-white/60">
                    <User className="h-5 w-5" />My Profile
                  </button>
                )}
                {profileRoles.includes("businessOwner") && (
                  <button type="button" onClick={() => { closeSheet(); onProfileSwitch("businessOwner", "/my-business"); }} className="flex h-12 w-full items-center gap-3 rounded-[5px] border border-[#22245F] px-4 text-left text-base font-semibold text-[#22245F] transition hover:bg-white/60">
                    <LayoutDashboard className="h-5 w-5" />My Business
                  </button>
                )}
                <button type="button" onClick={() => { closeSheet(); onLogout(); }} className="flex h-12 w-full items-center gap-3 rounded-[5px] border border-red-500 px-4 text-base font-semibold text-red-600 transition hover:bg-red-50">
                  <LogOut className="h-5 w-5" />Logout
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={closeSheet} className="flex h-12 items-center justify-center rounded-[5px] border border-[#22245F] px-4 text-base font-semibold text-[#22245F] transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F]">Login</Link>
            )}
            {/* <Link
              href="/contact"
              onClick={closeSheet}
              className="flex h-12 items-center justify-center rounded-[5px] bg-[#22245F] px-4 text-base font-semibold text-white transition hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F]"
            >
              Add your business
            </Link> */}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;
