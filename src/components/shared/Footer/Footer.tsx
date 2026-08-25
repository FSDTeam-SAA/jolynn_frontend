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
      { label: "Reviews", href: "/reviews" },
      { label: "FAQ", href: "/#faq" },
      { label: "Post a Job", href: "/job-posts" },
    ],
  },
  {
    title: "For Businesses",
    links: [
      { label: "Get Listed", href: "/services/businesses" },
      { label: "How It Works", href: "/#how_it_works" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/#faq" },

    ],
  },
  {
    title: "Contact Us",
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(220px,1.3fr)_repeat(4,minmax(0,1fr))] lg:gap-x-8 xl:grid-cols-[minmax(260px,1.4fr)_repeat(4,minmax(0,1fr))] xl:gap-x-12">
          <div className="max-w-[420px] min-[520px]:col-span-2 md:col-span-3 lg:col-span-1">
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
            <a
              href="https://www.tiktok.com/@sidequote0?_r=1&_t=ZT-99AVCBljMjd"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow SideQuote on TikTok"
              className="group mt-5 inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#ff0050]/80 hover:bg-white/15 hover:shadow-lg hover:shadow-[#12153f]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#292E78]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#25F4EE] via-white to-[#FE2C55] text-[#171945] transition-transform duration-200 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.6 5.82a4.64 4.64 0 0 1-1.15-2.72h-3.1v12.2a2.32 2.32 0 1 1-2.32-2.32c.2 0 .4.03.59.08V9.91a5.47 5.47 0 1 0 4.9 5.44V9.16a7.68 7.68 0 0 0 4.5 1.45V7.54a4.63 4.63 0 0 1-3.42-1.72Z" />
                </svg>
              </span>
              <span className="flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold">Follow us on TikTok</span>
                <span className="mt-1 text-[11px] text-white/70">@sidequote0</span>
              </span>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 min-[520px]:col-span-2 min-[520px]:grid-cols-2 md:col-span-3 md:grid-cols-3 lg:contents">
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
