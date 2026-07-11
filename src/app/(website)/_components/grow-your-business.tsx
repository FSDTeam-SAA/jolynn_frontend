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
    image: "/assets/images/review1.png",
    alt: "Business owner",
  },
  {
    id: "business-owner-2",
    image: "/assets/images/review2.png",
    alt: "Business owner",
  },
  {
    id: "business-owner-3",
    image: "/assets/images/review3.png",
    alt: "Business owner",
  },
  {
    id: "business-owner-4",
    image: "/assets/images/review4.png",
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
    <section className="pb-8 md:pb-10 bg-white">
      <div className="container max-w-[1300px] overflow-x-hidden rounded-[12px] bg-[linear-gradient(90deg,_#292D73_0%,_#0082D7_100%)]">
        <div className="grid min-h-[181px] grid-cols-1 lg:grid-cols-[1fr_3fr]">
          <div className="flex items-center justify-end px-7 py-8 lg:border-r lg:border-white/20 lg:px-8 lg:py-6">
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

              <div className="mt-2 text-[17px] leading-none text-[#FFD119]">
                ★★★★★ <span className="text-sm md:text-base leading-[120%] font-bold text-[#EAF1F6]">Join 1000+</span>
              </div>
              <p className="mt-1 text-sm md:text-base font-bold leading-normal text-[#EAF1F6]">
                Businesses Growing with SideQuote
              </p>
            </div>
          </div>

          <div className="px-5 pb-7 pt-0 sm:px-7 lg:px-8 lg:py-8">
            <h2 className="text-center text-white text-2xl md:text-3xl lg:text-4xl xl:text-[40px] font-extrabold leading-tight lg:text-left ">
              Grow Your Business with SideQuote
            </h2>

            <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4 lg:gap-5">
              {businessSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div key={step.id} className="">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-white text-[#292E78]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 text-xs md:text-base font-semibold leading-[120%] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[10px] md:text-xs font-normal leading-[130%] text-white ">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 md:text-gap-5 lg:gap-8 md:grid-cols-2">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-white px-4 text-sm md:text-base font-semibold leading-[150%] text-primary transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Add your business to Sidequote Directory
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] border border-white px-4 text-sm md:text-base font-semibold leading-[150%] text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <BriefcaseBusiness className="h-5 w-5 sm:hidden" />
                Grow your business with Sidequote
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowYourBusiness;
