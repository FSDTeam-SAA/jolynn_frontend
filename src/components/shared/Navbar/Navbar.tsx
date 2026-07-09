"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNavbar from "./MobileNavbar";
import Image from "next/image";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#" },
  { label: "Help Wanted", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Contact Us", href: "#" },
];


const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white bg-[#DDEDEC]">
      <div className="container flex  items-center justify-between gap-4 px-4 sm:px-6 py-4 md:py-4 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center lg:flex-1">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-16 h-16"
            />
          </Link>
          </div>

        <nav
          className="hidden min-w-0 flex-[2] justify-center lg:flex"
          aria-label="Primary navigation"
        >
          <ul className="flex min-w-0 items-center justify-center gap-5 text-[13px] font-medium text-black xl:gap-8">
            {navItems.map((item) => {
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
          <Link
            href="/login"
            className="inline-flex h-9 min-w-[76px] items-center justify-center rounded-[5px] border border-[#22245F] px-4 text-[13px] font-semibold text-[#22245F] transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            Login
          </Link>
          <Link
            href="#"
            className="inline-flex h-9 items-center justify-center rounded-[5px] bg-[#22245F] px-5 text-[13px] font-semibold text-white transition hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            Add your business
          </Link>
        </div>

        <div className="flex justify-end lg:hidden">
          <MobileNavbar navItems={navItems}/>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
