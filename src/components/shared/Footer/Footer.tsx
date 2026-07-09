import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";

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
      { label: "Find Services", href: "/treatments" },
      { label: "Browse Categories", href: "/treatments" },
      { label: "How It Works", href: "/" },
      { label: "Leave a Review", href: "/contact" },
    ],
  },
  {
    title: "For Businesses",
    links: [
      { label: "Get Listed", href: "/contact" },
      { label: "Pricing", href: "/pricing" },
      { label: "Success Stories", href: "/about-us" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "FAQ", href: "/contact" },
      { label: "Contact Us", href: "/contact" },
      { label: "Terms od service", href: "/terms-and-condition" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: <Facebook className="h-3.5 w-3.5" />,
  },
  {
    label: "X",
    href: "https://x.com",
    icon: <span className="text-[13px] font-medium leading-none">X</span>,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: <Instagram className="h-3.5 w-3.5" />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    icon: <Linkedin className="h-3.5 w-3.5" />,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    icon: <Youtube className="h-3.5 w-3.5" />,
  },
];

const BrandMark = () => (
  <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#0B8FDB] shadow-[0_0_0_4px_rgba(255,255,255,0.94)]">
    <span className="relative mt-1 flex h-7 w-8 items-start justify-center gap-2">
      <span className="h-4 w-4 rounded-full bg-white" />
      <span className="h-4 w-4 rounded-full bg-white" />
      <span className="absolute left-1 top-3 h-4 w-2.5 -skew-x-[18deg] rounded-bl-full bg-white" />
      <span className="absolute right-1 top-3 h-4 w-2.5 -skew-x-[18deg] rounded-bl-full bg-white" />
    </span>
  </span>
);

const Footer = () => {
  return (
    <footer className="bg-[#292E78] text-white">
      <div className="mx-auto w-full max-w-[1060px] px-6 py-12 sm:px-8 md:py-16 lg:px-10 lg:pb-9 lg:pt-[94px]">
        <div className="grid gap-10 md:grid-cols-[1.45fr_2.15fr] lg:gap-20">
          <div className="max-w-[315px]">
            <Link
              href="/"
              aria-label="SideQuote home"
              className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#292E78]"
            >
              <BrandMark />
            </Link>

            <h2 className="mt-7 text-base font-bold leading-tight">
              SideQuote
            </h2>
            <p className="mt-4 text-[13px] font-light leading-[1.55] text-white/80">
              Connect with verified electricians, plumbers, HVAC technicians,
              roofers, and more in your area.
            </p>

            <ul className="mt-6 flex items-center gap-3">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/13 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {item.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 sm:gap-7 lg:gap-14">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[15px] font-bold leading-tight">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[15px] font-light leading-tight text-white/85 transition hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/12 pt-7 text-center md:mt-[66px]">
          <p className="text-[11px] font-light text-white/80">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
