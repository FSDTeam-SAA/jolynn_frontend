"use client";

// import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Mail, MapPin, Phone } from "lucide-react";
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
      { label: "Advertise with Us", href: "/advertise-with-us" },
      { label: "How It Works", href: "/#how_it_works" },
      { label: "Leave a Review", href: "/reviews" },
    ],
  },
  {
    title: "For Businesses",
    links: [
      { label: "About Us", href: "/about-us" },
       { label: "Contact Us", href: "/contact" },
       { label: "FAQ", href: "/#faq" },
       { label: "Terms of Service", href: "/terms-and-condition" },
       { label: "Privacy Policy", href: "/privacy-policy" },
      // { label: "Pricing", href: "#" },
      // { label: "Success Stories", href: "#" },
    ],
  },
  // {
  //   title: "Company",
  //   links: [
  //     { label: "About Us", href: "/about-us" },
  //     { label: "FAQ", href: "/#faq" },
  //     { label: "Contact Us", href: "/contact" },
  //     { label: "Terms of Service", href: "/terms-and-condition" },
  //     { label: "Privacy Policy", href: "/privacy-policy" },
  //   ],
  // },

];

// const socialLinks = [
//   {
//     label: "Facebook",
//     href: "https://www.facebook.com",
//     icon: <Facebook className="h-3.5 w-3.5" />,
//   },
//   {
//     label: "X",
//     href: "https://x.com",
//     icon: <span className="text-[13px] font-medium leading-none">X</span>,
//   },
//   {
//     label: "Instagram",
//     href: "https://www.instagram.com",
//     icon: <Instagram className="h-3.5 w-3.5" />,
//   },
//   {
//     label: "LinkedIn",
//     href: "https://www.linkedin.com",
//     icon: <Linkedin className="h-3.5 w-3.5" />,
//   },
//   {
//     label: "YouTube",
//     href: "https://www.youtube.com",
//     icon: <Youtube className="h-3.5 w-3.5" />,
//   },
// ];

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
              className="w-16 h-16"
            />
          </Link>

            <h2 className="mt-7 text-base font-bold leading-tight">
              SideQuote
            </h2>
            <p className="mt-4 max-w-sm text-sm font-light leading-6 text-white/80">
              Connect with verified electricians, plumbers, HVAC technicians,
              roofers, and more in your area.
            </p>

            {/* <ul className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks?.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex h-9 w-9 items-center justify-center bg-[#FFFFFF1A] rounded-full bg-white/13 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {item.icon}
                  </Link>
                </li>
              ))}
            </ul> */}
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
              <address className="mt-5 not-italic">
                <ul className="space-y-4">
                  <li>
                    <a
                      href="mailto:info@sidequote.com"
                      className="group flex items-start gap-3 text-sm font-light leading-6 text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-[15px]"
                    >
                      <Mail
                        className="mt-0.5 h-5 w-5 shrink-0 text-white"
                        aria-hidden="true"
                      />
                      <span className="break-all group-hover:underline">
                        info@sidequote.com
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+14159027471"
                      className="group flex items-start gap-3 text-sm font-light leading-6 text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-[15px]"
                    >
                      <Phone
                        className="mt-0.5 h-5 w-5 shrink-0 text-white"
                        aria-hidden="true"
                      />
                      <span className="group-hover:underline">
                        +1 (415) 902-7471
                      </span>
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-sm font-light leading-6 text-white/85 sm:text-[15px]">
                    <MapPin
                      className="mt-0.5 h-5 w-5 shrink-0 text-white"
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
                  </li>
                </ul>
              </address>
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
