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

type ServiceCategory = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

const serviceCategories: ServiceCategory[] = [
  {
    id: "plumbers",
    title: "Plumbers",
    description: "Expert plumbing repairs, installations, and maintenance.",
    href: "/treatments",
    icon: Wrench,
    iconColor: "text-[#336DFF]",
    iconBg: "bg-[#E8EEFF]",
  },
  {
    id: "electricians",
    title: "Electricians",
    description: "Safe electrical repairs, wiring, and installations.",
    href: "/treatments",
    icon: PlugZap,
    iconColor: "text-[#F5A400]",
    iconBg: "bg-[#FFF3D6]",
  },
  {
    id: "hvac",
    title: "HVAC",
    description: "Heating, cooling, and ventilation services for comfort.",
    href: "/treatments",
    icon: AirVent,
    iconColor: "text-[#16B7CF]",
    iconBg: "bg-[#DDF9FD]",
  },
  {
    id: "roofers",
    title: "Roofers",
    description: "Professional roof repair, replacement, and maintenance.",
    href: "/treatments",
    icon: House,
    iconColor: "text-[#FF5B68]",
    iconBg: "bg-[#FFE6EA]",
  },
  {
    id: "kitchen",
    title: "Kitchen",
    description: "Kitchen remodeling, repairs, and custom installations.",
    href: "/treatments",
    icon: Hammer,
    iconColor: "text-[#FF6A1A]",
    iconBg: "bg-[#FFEBDD]",
  },
  {
    id: "fencing",
    title: "Fencing",
    description: "Durable fence installation, repair, and replacement.",
    href: "/treatments",
    icon: Fence,
    iconColor: "text-[#A97925]",
    iconBg: "bg-[#F6EBD7]",
  },
  {
    id: "flooring",
    title: "Flooring",
    description: "Quality flooring installation, refinishing, and repairs.",
    href: "/treatments",
    icon: Grid2X2,
    iconColor: "text-[#9D63B8]",
    iconBg: "bg-[#F0E2F8]",
  },
  {
    id: "painting",
    title: "Painting",
    description: "Interior and exterior painting with flawless finishes.",
    href: "/treatments",
    icon: Brush,
    iconColor: "text-[#E2277D]",
    iconBg: "bg-[#FFE3F0]",
  },
];

const MostPopularService = () => {
  return (
    <section className="bg-[#E5F3F2] px-5 py-12 sm:px-8 md:py-14 lg:py-[42px] mt-10 md:mt-12 lg:mt-14 xl:mt-16" >
      <div className="mx-auto w-full max-w-[990px]">
        <div className="text-center">
          <h2 className="text-[24px] font-extrabold leading-tight text-[#292E78] sm:text-[28px]">
            Most popular Categories
          </h2>
          <p className="mt-2 text-[11px] font-medium text-[#5F6B7A] sm:text-xs">
            Choose a service to get started
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-[18px]">
          {serviceCategories.map((category) => {
            const Icon = category.icon;

            return (
              <article
                key={category.id}
                className="flex min-h-[116px] flex-col items-center rounded-[5px] bg-white px-4 pb-3 pt-3 text-center shadow-[0_1px_1px_rgba(31,41,55,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(31,41,55,0.08)]"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-[5px] ${category.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${category.iconColor}`} />
                </div>

                <h3 className="mt-2 text-[15px] font-extrabold leading-tight text-[#292E78]">
                  {category.title}
                </h3>
                <p className="mt-1 min-h-[30px] max-w-[185px] text-[9.5px] font-medium leading-[1.25] text-[#778395]">
                  {category.description}
                </p>

                <Link
                  href={category.href}
                  className="mt-auto flex h-[29px] w-full items-center justify-center rounded-[5px] bg-[#F1F1F1] text-[10.5px] font-semibold text-[#20223F] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
                >
                  Get Started
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/treatments"
            className="inline-flex h-9 items-center justify-center rounded-[5px] bg-[#292E78] px-6 text-[11px] font-bold text-white transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E5F3F2]"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MostPopularService;
