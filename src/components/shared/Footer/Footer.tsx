import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";
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
      { label: "Find Services", href: "#3" },
      { label: "Browse Categories", href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Leave a Review", href: "#" },
    ],
  },
  {
    title: "For Businesses",
    links: [
      { label: "Get Listed", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Success Stories", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
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

const Footer = () => {
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

            <ul className="mt-6 flex flex-wrap items-center gap-3">
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
            </ul>
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
                        className="inline-flex min-h-7 items-center text-sm font-light leading-snug text-white/85 transition hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-[15px]"
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
