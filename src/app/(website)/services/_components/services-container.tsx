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
    id: "plumbers-1",
    title: "Plumbers",
    description: "Expert plumbing repairs, installations, and maintenance.",
    href: "/services/businesses",
    iconKey: "wrench",
    iconColor: "text-[#336DFF]",
    iconBg: "bg-[#E8EEFF]",
  },
  {
    id: "electricians-1",
    title: "Electricians",
    description: "Safe electrical repairs, wiring, and installations.",
    href: "/services/businesses",
    iconKey: "plugZap",
    iconColor: "text-[#F5A400]",
    iconBg: "bg-[#FFF3D6]",
  },
  {
    id: "hvac-1",
    title: "HVAC",
    description: "Heating, cooling, and ventilation services for comfort.",
    href: "/services/businesses",
    iconKey: "airVent",
    iconColor: "text-[#16B7CF]",
    iconBg: "bg-[#DDF9FD]",
  },
  {
    id: "roofers-1",
    title: "Roofers",
    description: "Professional roof repair, replacement, and maintenance.",
    href: "/services/businesses",
    iconKey: "house",
    iconColor: "text-[#FF5B68]",
    iconBg: "bg-[#FFE6EA]",
  },
  {
    id: "kitchen-1",
    title: "Kitchen",
    description: "Kitchen remodeling, repairs, and custom installations.",
    href: "/services/businesses",
    iconKey: "hammer",
    iconColor: "text-[#FF6A1A]",
    iconBg: "bg-[#FFEBDD]",
  },
  {
    id: "fencing-1",
    title: "Fencing",
    description: "Durable fence installation, repair, and replacement.",
    href: "/services/businesses",
    iconKey: "fence",
    iconColor: "text-[#A97925]",
    iconBg: "bg-[#F6EBD7]",
  },
  {
    id: "flooring-1",
    title: "Flooring",
    description: "Quality flooring installation, refinishing, and repairs.",
    href: "/services/businesses",
    iconKey: "flooring",
    iconColor: "text-[#9D63B8]",
    iconBg: "bg-[#F0E2F8]",
  },
  {
    id: "painting-1",
    title: "Painting",
    description: "Interior and exterior painting with flawless finishes.",
    href: "/services/businesses",
    iconKey: "brush",
    iconColor: "text-[#E2277D]",
    iconBg: "bg-[#FFE3F0]",
  },
  {
    id: "plumbers-2",
    title: "Plumbers",
    description: "Expert plumbing repairs, installations, and maintenance.",
    href: "/services/businesses",
    iconKey: "wrench",
    iconColor: "text-[#336DFF]",
    iconBg: "bg-[#E8EEFF]",
  },
  {
    id: "electricians-2",
    title: "Electricians",
    description: "Safe electrical repairs, wiring, and installations.",
    href: "/services/businesses",
    iconKey: "plugZap",
    iconColor: "text-[#F5A400]",
    iconBg: "bg-[#FFF3D6]",
  },
  {
    id: "hvac-2",
    title: "HVAC",
    description: "Heating, cooling, and ventilation services for comfort.",
    href: "/services/businesses",
    iconKey: "airVent",
    iconColor: "text-[#16B7CF]",
    iconBg: "bg-[#DDF9FD]",
  },
  {
    id: "roofers-2",
    title: "Roofers",
    description: "Professional roof repair, replacement, and maintenance.",
    href: "/services/businesses",
    iconKey: "house",
    iconColor: "text-[#FF5B68]",
    iconBg: "bg-[#FFE6EA]",
  },
  {
    id: "kitchen-2",
    title: "Kitchen",
    description: "Kitchen remodeling, repairs, and custom installations.",
    href: "/services/businesses",
    iconKey: "hammer",
    iconColor: "text-[#FF6A1A]",
    iconBg: "bg-[#FFEBDD]",
  },
  {
    id: "fencing-2",
    title: "Fencing",
    description: "Durable fence installation, repair, and replacement.",
    href: "/services/businesses",
    iconKey: "fence",
    iconColor: "text-[#A97925]",
    iconBg: "bg-[#F6EBD7]",
  },
  {
    id: "flooring-2",
    title: "Flooring",
    description: "Quality flooring installation, refinishing, and repairs.",
    href: "/services/businesses",
    iconKey: "flooring",
    iconColor: "text-[#9D63B8]",
    iconBg: "bg-[#F0E2F8]",
  },
  {
    id: "painting-2",
    title: "Painting",
    description: "Interior and exterior painting with flawless finishes.",
    href: "/services/businesses",
    iconKey: "brush",
    iconColor: "text-[#E2277D]",
    iconBg: "bg-[#FFE3F0]",
  },
];

const ServicesContainer = () => {
  return (
    <section className="min-h-screen bg-[#DFF0EE] px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-[86px]">
      <div className="container ">
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold leading-tight text-[#292E78] sm:text-[32px] md:text-[36px]">
            Select a Service
          </h1>
          <p className="mt-3 text-[12px] font-medium text-[#515E6E] sm:text-[13px]">
            Choose a service to get started
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-[21px] xl:mt-[34px]">
          {serviceCategories.map((category) => {
            const Icon = serviceIcons[category.iconKey];

            return (
              <article
                key={category.id}
                className="group flex min-h-[174px] flex-col items-center rounded-[7px] bg-white px-4 pb-3.5 pt-4 text-center shadow-[0_1px_2px_rgba(32,42,70,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(32,42,70,0.12)] sm:min-h-[176px]"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-[5px] transition duration-200 group-hover:scale-105 ${category.iconBg}`}
                >
                  <Icon
                    className={`h-[23px] w-[23px] stroke-[2.25] ${category.iconColor}`}
                  />
                </div>

                <h2 className="mt-3 text-[16px] font-extrabold leading-none text-[#292E78]">
                  {category.title}
                </h2>
                <p className="mt-2 min-h-[34px] max-w-[210px] text-[10.5px] font-medium leading-[1.15] text-[#6F7D90]">
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
      </div>
    </section>
  );
};

export default ServicesContainer;
