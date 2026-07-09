"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNavbar from "./MobileNavbar";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/treatments" },
  { label: "Help Wanted", href: "/referrals" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact" },
];

const BrandMark = () => (
  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B8FDB] shadow-[0_0_0_3px_rgba(255,255,255,0.9)] sm:h-11 sm:w-11">
    <span className="relative mt-1 flex h-5 w-6 items-start justify-center gap-1.5">
      <span className="h-3 w-3 rounded-full bg-white" />
      <span className="h-3 w-3 rounded-full bg-white" />
      <span className="absolute left-[3px] top-2 h-3 w-2 -skew-x-[18deg] rounded-bl-full bg-white" />
      <span className="absolute right-[3px] top-2 h-3 w-2 -skew-x-[18deg] rounded-bl-full bg-white" />
    </span>
  </span>
);

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#9FB8B7] bg-[#E6F2F2] shadow-[0_1px_0_rgba(20,40,60,0.18)] ">
      <div className="mx-auto flex h-[74px] w-full max-w-[1060px] items-center justify-between px-5 sm:px-8 lg:h-[72px]">
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            href="/"
            aria-label="Home"
            className="inline-flex shrink-0 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            <BrandMark />
          </Link>
        </div>

        <nav
          className="hidden flex-[2] justify-center lg:flex"
          aria-label="Primary navigation"
        >
          <ul className="flex items-center justify-center gap-9 text-[11px] font-medium text-black xl:gap-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative inline-flex h-8 items-center whitespace-nowrap px-1 transition-colors hover:text-[#22245F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2] ${
                      isActive ? "font-bold text-[#22245F]" : ""
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-px bg-[#22245F]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-2 lg:flex">
          <Link
            href="/login"
            className="inline-flex h-[27px] min-w-[62px] items-center justify-center rounded-[5px] border border-[#22245F] px-4 text-[11px] font-semibold text-[#22245F] transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            Login
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-[27px] items-center justify-center rounded-[5px] bg-[#22245F] px-5 text-[11px] font-semibold text-white transition hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            Add your business
          </Link>
        </div>

        <div className="flex flex-1 justify-end lg:hidden">
          <MobileNavbar navItems={navItems} BrandMark={BrandMark} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
