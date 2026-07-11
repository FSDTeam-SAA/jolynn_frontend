import {
  AirVent,
  Brush,
  Fence,
  Grid2X2,
  Hammer,
  House,
  PlugZap,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

const serviceIcons: Record<string, LucideIcon> = {
  airVent: AirVent,
  brush: Brush,
  fence: Fence,
  flooring: Grid2X2,
  hammer: Hammer,
  house: House,
  plugZap: PlugZap,
  wrench: Wrench,
};

type ServiceCategory = {
  id: string;
  title: string;
  description: string;
  href: string;
  iconKey: keyof typeof serviceIcons;
  iconColor: string;
  iconBg: string;
};

const serviceCategories: ServiceCategory[] = [
  {
    id: "plumbers",
    title: "Plumbers",
    description: "Expert plumbing repairs, installations, and maintenance.",
    href: "/services/businesses",
    iconKey: "wrench",
    iconColor: "text-[#336DFF]",
    iconBg: "bg-[#E8EEFF]",
  },
  {
    id: "electricians",
    title: "Electricians",
    description: "Safe electrical repairs, wiring, and installations.",
    href: "/services/businesses",
    iconKey: "plugZap",
    iconColor: "text-[#F5A400]",
    iconBg: "bg-[#FFF3D6]",
  },
  {
    id: "hvac",
    title: "HVAC",
    description: "Heating, cooling, and ventilation services for comfort.",
    href: "/services/businesses",
    iconKey: "airVent",
    iconColor: "text-[#16B7CF]",
    iconBg: "bg-[#DDF9FD]",
  },
  {
    id: "roofers",
    title: "Roofers",
    description: "Professional roof repair, replacement, and maintenance.",
    href: "/services/businesses",
    iconKey: "house",
    iconColor: "text-[#FF5B68]",
    iconBg: "bg-[#FFE6EA]",
  },
  {
    id: "kitchen",
    title: "Kitchen",
    description: "Kitchen remodeling, repairs, and custom installations.",
    href: "/services/businesses",
    iconKey: "hammer",
    iconColor: "text-[#FF6A1A]",
    iconBg: "bg-[#FFEBDD]",
  },
  {
    id: "fencing",
    title: "Fencing",
    description: "Durable fence installation, repair, and replacement.",
    href: "/services/businesses",
    iconKey: "fence",
    iconColor: "text-[#A97925]",
    iconBg: "bg-[#F6EBD7]",
  },
  {
    id: "flooring",
    title: "Flooring",
    description: "Quality flooring installation, refinishing, and repairs.",
    href: "/services/businesses",
    iconKey: "flooring",
    iconColor: "text-[#9D63B8]",
    iconBg: "bg-[#F0E2F8]",
  },
  {
    id: "painting",
    title: "Painting",
    description: "Interior and exterior painting with flawless finishes.",
    href: "/services/businesses",
    iconKey: "brush",
    iconColor: "text-[#E2277D]",
    iconBg: "bg-[#FFE3F0]",
  }
];

const MostPopularService = () => {
  return (
    <section className="bg-[#DFF0EE] px-4 py-12 sm:px-6 md:py-14 lg:px-8 lg:py-[50px]">
      <div className="container">
        <div className="text-center">
          <h2 className="text-[24px] font-extrabold leading-tight text-[#292E78] sm:text-[28px] md:text-[30px]">
            Most popular Categories
          </h2>
          <p className="mt-2 text-[11px] font-medium text-[#515E6E] sm:text-xs">
            Choose a service to get started
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-[22px]">
          {serviceCategories.map((category) => {
            const Icon = serviceIcons[category.iconKey];

            return (
              <article
                key={category.id}
                className="group flex min-h-[176px] flex-col items-center rounded-[6px] bg-white px-3 pb-3.5 pt-3.5 text-center shadow-[0_1px_2px_rgba(32,42,70,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(32,42,70,0.10)] sm:min-h-[174px] sm:px-4"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-[5px] transition duration-200 group-hover:scale-105 ${category.iconBg}`}
                >
                  <Icon className={`h-[22px] w-[22px] stroke-[2.25] ${category.iconColor}`} />
                </div>

                <h3 className="mt-3 text-[15px] font-extrabold leading-none text-[#292E78]">
                  {category.title}
                </h3>
                <p className="mt-2 min-h-[34px] max-w-[190px] text-[10px] font-medium leading-[1.18] text-[#6F7D90]">
                  {category.description}
                </p>

                <Link
                  href={category.href}
                  className="mt-auto flex h-[34px] w-full items-center justify-center rounded-[5px] bg-[#F1F1F1] text-[10.5px] font-semibold text-[#171B2F] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Get Started
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/services"
            className="inline-flex h-[40px] items-center justify-center rounded-[5px] bg-[#292E78] px-6 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(41,46,120,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 focus-visible:ring-offset-[#DFF0EE]"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MostPopularService;
