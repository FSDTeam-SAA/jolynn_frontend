"use client";

import { Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

export interface ContactInfoResponse {
  status: boolean;
  message: string;
  data: ContactInfo[];
  pagination: Pagination;
}

export interface ContactInfo {
  _id: string;
  address: string;
  email: string;
  openingHours: string;
  phoneNumbers: string[];
  __v: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const footerColumns = [
  {
    title: "For Customers",
    links: [
      { label: "Find Services", href: "/services" },
      { label: "Get Listed", href: "/services/businesses" },
      { label: "How It Works", href: "/#how_it_works" },
      { label: "Leave a Review", href: "/reviews" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Corporate Info",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Advertise with Us", href: "/advertise-with-us" },
      { label: "Terms of Service", href: "/terms-and-condition" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

const Footer = () => {
  const pathname = usePathname();

  const handleHowItWorksClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;

    const section = document.getElementById("how_it_works");

    if (!section) return;

    event.preventDefault();
    window.history.pushState(null, "", "/#how_it_works");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="bg-[#292E78] text-white">
      <div className="container px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:pb-9 lg:pt-20 xl:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,2fr)] lg:gap-14 xl:gap-20">
          <div className="max-w-[420px]">
            <Link href="/">
              <Image
                src="/assets/images/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-16 w-16"
              />
            </Link>

            <h2 className="mt-7 text-base font-bold leading-tight">
              SideQuote
            </h2>
            <p className="mt-4 max-w-sm text-sm font-light leading-6 text-white/80">
              The Largest Business Directory and Help Wanted Platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 min-[520px]:grid-cols-2 md:grid-cols-3 md:gap-7 lg:gap-10 xl:gap-14">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-base font-bold leading-tight">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={
                          item.href === "/#how_it_works"
                            ? handleHowItWorksClick
                            : undefined
                        }
                        className="inline-flex min-h-7 items-center text-sm font-light leading-snug text-white/85 transition hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-[15px]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="text-base font-bold leading-tight">Contact Us</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2.5 text-sm font-light leading-6 text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-[15px]"
                  >
                    <Mail
                      className="h-4 w-4 shrink-0 text-white"
                      aria-hidden="true"
                    />
                    <span className="group-hover:underline">Email Us</span>
                  </Link>
                </li>

                <li className="pt-2">
                  <h4 className="text-sm font-bold text-white">Customer Service</h4>
                  <address className="mt-2.5 not-italic">
                    <div className="flex items-start gap-2.5 text-sm font-light leading-6 text-white/85 sm:text-[15px]">
                      <MapPin
                        className="mt-1 h-4 w-4 shrink-0 text-white"
                        aria-hidden="true"
                      />
                      <span>
                        8414 Farm Road
                        <br />
                        Ste 180 PMB 1105
                        <br />
                        Las Vegas, NV 89131
                        <br />
                        United States
                      </span>
                    </div>
                  </address>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/12 pt-6 text-center md:mt-14 lg:mt-16">
          <p className="text-xs font-light text-white/80">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
