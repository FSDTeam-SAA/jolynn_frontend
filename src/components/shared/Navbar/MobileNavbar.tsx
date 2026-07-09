"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";

type NavItem = {
  label: string;
  href: string;
};

type MobileNavbarProps = {
  navItems: NavItem[];
  BrandMark: ComponentType;
};

const MobileNavbar = ({ navItems, BrandMark }: MobileNavbarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-[5px] border border-[#22245F] bg-transparent text-[#22245F] hover:bg-white/50"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[86vw] max-w-sm border-l border-[#9FB8B7] bg-[#E6F2F2] p-5"
      >
        <div className="flex h-full flex-col pt-4">
          <Link
            href="/"
            aria-label="Home"
            onClick={closeSheet}
            className="mb-10 inline-flex w-fit rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6F2F2]"
          >
            <BrandMark />
          </Link>

          <nav className="flex-1" aria-label="Mobile navigation">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeSheet}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-12 items-center rounded-[5px] px-4 text-sm font-medium transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] ${
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
            <Link
              href="/login"
              onClick={closeSheet}
              className="flex h-11 items-center justify-center rounded-[5px] border border-[#22245F] px-4 text-sm font-semibold text-[#22245F] transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F]"
            >
              Login
            </Link>
            <Link
              href="/contact"
              onClick={closeSheet}
              className="flex h-11 items-center justify-center rounded-[5px] bg-[#22245F] px-4 text-sm font-semibold text-white transition hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F]"
            >
              Add your business
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;
