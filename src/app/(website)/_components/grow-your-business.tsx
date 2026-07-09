import {
  ArrowRight,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CloudUpload,
  MailCheck,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type BusinessStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type RatingAvatar = {
  id: string;
  image: string;
  alt: string;
};

const ratingAvatars: RatingAvatar[] = [
  {
    id: "business-owner-1",
    image: "/assets/images/meet-1.jpg",
    alt: "Business owner",
  },
  {
    id: "business-owner-2",
    image: "/assets/images/meet-2.jpg",
    alt: "Business owner",
  },
  {
    id: "business-owner-3",
    image: "/assets/images/meet-3.jpg",
    alt: "Business owner",
  },
  {
    id: "business-owner-4",
    image: "/assets/images/meet-4.jpg",
    alt: "Business owner",
  },
];

const businessSteps: BusinessStep[] = [
  {
    id: "create-profile",
    title: "1. Create Profile",
    description: "Sign up and build your professional profile",
    icon: UserRoundPlus,
  },
  {
    id: "showcase-work",
    title: "2. Showcase Work",
    description: "Add photos, services & business details",
    icon: CloudUpload,
  },
  {
    id: "get-discovered",
    title: "2. Get Discovered",
    description: "Customers find you when they search",
    icon: MailCheck,
  },
  {
    id: "grow-business",
    title: "2. Grow Business",
    description: "Receive leads & grow your customer base",
    icon: ChartNoAxesCombined,
  },
];

const GrowYourBusiness = () => {
  return (
    <section className="bg-white px-5 py-8 sm:px-8 md:py-10">
      <div className="mx-auto w-full max-w-[990px] overflow-hidden rounded-[5px] bg-gradient-to-r from-[#292E78] to-[#078FDB] text-white">
        <div className="grid min-h-[181px] grid-cols-1 lg:grid-cols-[1fr_2.1fr]">
          <div className="flex items-center justify-center px-7 py-8 lg:border-r lg:border-white/20 lg:px-8 lg:py-6">
            <div className="text-center">
              <div className="flex justify-center -space-x-2">
                {ratingAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-white"
                  >
                    <Image
                      src={avatar.image}
                      alt={avatar.alt}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2 text-[17px] leading-none text-[#FFC83D]">
                ★★★★★ <span className="text-[11px] font-bold text-white">Join 1000+</span>
              </div>
              <p className="mt-1 text-[10px] font-bold leading-tight text-white">
                Businesses Growing with SideQuote
              </p>
            </div>
          </div>

          <div className="px-5 pb-7 pt-0 sm:px-7 lg:px-8 lg:py-6">
            <h2 className="text-center text-[25px] font-extrabold leading-tight sm:text-[30px] lg:text-left lg:text-[31px]">
              Grow Your Business with SideQuote
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {businessSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div key={step.id}>
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] bg-white text-[#292E78]">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="mt-3 text-[9px] font-extrabold leading-tight text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 max-w-[108px] text-[8px] font-medium leading-[1.25] text-white/90 sm:max-w-none lg:max-w-[108px]">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/contact"
                className="inline-flex h-9 items-center justify-center gap-3 rounded-[4px] bg-white px-4 text-[10px] font-extrabold text-[#292E78] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Add your business to Sidequote Directory
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-9 items-center justify-center gap-3 rounded-[4px] border border-white/80 px-4 text-[10px] font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <BriefcaseBusiness className="h-3.5 w-3.5 sm:hidden" />
                Grow your business with Sidequote
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowYourBusiness;
