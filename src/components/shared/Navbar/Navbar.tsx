"use client";

import LogoutModal from "@/components/modals/LogoutModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileQuery } from "@/hooks/APicalling";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNavbar from "./MobileNavbar";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Help Wanted", href: "/job-posts" },
  { label: "About Us", href: "/about-us" },
  // { label: "Contact Us", href: "/contact" },
];


const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);


  const sessionUser = session?.user as
    | {
        firstName?: string;
        lastName?: string;
        email?: string | null;
        profileImage?: string;
        profilePicture?: string;
        token?: string;
        accessToken?: string;
        role?: string
      }
    | undefined;


    // console.log(sessionUser?.role)
  const { data: profileResponse } = useProfileQuery(
    sessionUser?.accessToken ?? sessionUser?.token,
  );
  const profile = profileResponse?.data;
  const userName = profile?.username || "N/A";
  const profileImage =
    profile?.profilePicture ??
    sessionUser?.profilePicture ??
    sessionUser?.profileImage;
  const displayName =
    [profile?.firstName ?? sessionUser?.firstName, profile?.lastName ?? sessionUser?.lastName]
      .filter(Boolean)
      .join(" ") || sessionUser?.email || "Account";
  const isAuthenticated = status === "authenticated";
  const effectiveRole = profile?.role ?? sessionUser?.role;

  const confirmLogout = async () => {
    setIsLogoutOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="mb-[76px]">
      <header className=" fixed inset-x-0 top-0 z-50 border-b border-white bg-[#DDEDEC] ">
      <div className="container flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center lg:flex-1">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="h-14 w-14"
            />
          </Link>
          </div>

        <nav
          className="hidden min-w-0 flex-[2] justify-center lg:flex"
          aria-label="Primary navigation"
        >
          <ul className="flex min-w-0 items-center justify-center gap-5 text-[15px] font-medium text-black xl:gap-8">
            {navItems?.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative inline-flex h-10 text-[#010101] font-medium items-center whitespace-nowrap px-1 transition-colors hover:text-[#22245F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2] ${
                      isActive ? "font-bold text-primary" : ""
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-1 h-0.5 rounded-full bg-[#22245F]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
          {status === "loading" ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/70" />
          ) : isAuthenticated ? (
            <DropdownMenu modal={false}>
              
                <Link href={`/${userName}`} target="_blank">{userName}</Link>
              <DropdownMenuTrigger asChild className="">
                <button type="button" className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#22245F] bg-white text-[#22245F] outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2" aria-label={`Open ${displayName} menu`}>
                  {profileImage ? <Image src={profileImage} alt={displayName} fill sizes="40px" className="object-cover" /> : <User className="h-5 w-5" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                side="bottom"
                sideOffset={8}
                className="w-44 bg-white p-1.5"
              >
                <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                  <Link href={effectiveRole === "businessOwner" ? "/overview" : "/account/profile"}><LayoutDashboard className="h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsLogoutOpen(true)} className="cursor-pointer py-2.5 text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="inline-flex h-9 min-w-[76px] items-center justify-center rounded-[5px] border border-[#22245F] px-4 text-[13px] font-semibold text-[#22245F] transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]">Login</Link>
          )}

          {/* {
            sessionUser?.role !== "businessOwner" &&  <Link
            href="/add-your-business"
            className="inline-flex h-9 items-center justify-center rounded-[5px] bg-[#22245F] px-5 text-[13px] font-semibold text-white transition hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            Add your business
          </Link>
          } */}
         
        </div>

        <div className="flex justify-end lg:hidden">
          <MobileNavbar navItems={navItems} isAuthenticated={isAuthenticated} isAuthLoading={status === "loading"} profileImage={profileImage} displayName={displayName} role={effectiveRole} onLogout={() => setIsLogoutOpen(true)} />
        </div>
      </div>
    </header>
    <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={confirmLogout} />
    </div>
  );
};

export default Navbar;
