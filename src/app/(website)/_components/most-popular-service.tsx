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

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5 lg:gap-6">
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





// "use client";

// import { ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import type { FormEvent } from "react";
// import { useEffect, useState } from "react";

// type HeroSlide = {
//   id: number;
//   eyebrow: string;
//   titleStart: string;
//   titleAccent: string;
//   titleEnd: string;
//   description: string;
//   image: string;
//   imageAlt: string;
// };

// const heroSlides: HeroSlide[] = [
//   {
//     id: 1,
//     eyebrow: "Connect with verified home experts",
//     titleStart: "Find",
//     titleAccent: "Trusted Local",
//     titleEnd: "Businesses Near You",
//     description:
//       "At Contact Connect, we specialize in comprehensive home renovations, ensuring every project meets your unique vision and standards.",
//     image: "/assets/images/hero.png",
//     imageAlt: "Professional home service team standing near a house",
//   },
//   {
//     id: 2,
//     eyebrow: "Compare quotes before you book",
//     titleStart: "Hire",
//     titleAccent: "Skilled Pros",
//     titleEnd: "For Every Home Job",
//     description:
//       "Explore electricians, plumbers, roofers, remodelers, and more from one clean place built for fast decisions.",
//     image:
//       "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85",
//     imageAlt: "Local business professionals reviewing a project",
//   },
//   {
//     id: 3,
//     eyebrow: "Renovation help, made simple",
//     titleStart: "Book",
//     titleAccent: "Reliable Service",
//     titleEnd: "Without The Guesswork",
//     description:
//       "Search by service and location, check trusted profiles, then connect with the right team for your next project.",
//     image:
//       "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",
//     imageAlt: "Home renovation tools and construction planning",
//   },
// ];

// const Hero = () => {
//   const router = useRouter();
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [service, setService] = useState("");
//   const [location, setLocation] = useState("");
//   const activeSlide = heroSlides[activeIndex];

//   const goToSlide = (index: number) => {
//     setActiveIndex(index);
//   };

//     const goToPreviousSlide = () => {
//       setActiveIndex((currentIndex) =>
//         currentIndex === 0 ? heroSlides.length - 1 : currentIndex - 1
//       );
//     };

//     const goToNextSlide = () => {
//       setActiveIndex((currentIndex) =>
//         currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1
//       );
//     };

//   useEffect(() => {
//     const slideTimer = window.setInterval(() => {
//       setActiveIndex((currentIndex) =>
//         currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
//       );
//     }, 5500);

//     return () => window.clearInterval(slideTimer);
//   }, []);

//   const handleSearch = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     const params = new URLSearchParams();
//     if (service.trim()) params.set("service", service.trim());
//     if (location.trim()) params.set("location", location.trim());

//     router.push(`/services${params.toString() ? `?${params}` : ""}`);
//   };

//   return (
//     <section className="relative overflow-hidden bg-white px-4 py-8 sm:px-6 md:py-10 lg:py-14 lg:px-8 mt-20">
//       <div className="container relative">
//         <div className="grid grid-cols-1 md:grid-cols-2 min-h-[330px] items-center gap-8  xl:min-h-[462px]">
//           <div className="md:col-span-1">
//             {/* <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5B66B7] sm:text-xs">
//               {activeSlide.eyebrow}
//             </p>

//             <h1 className="text-[34px] font-extrabold leading-[1.05] text-[#292E78] sm:text-[44px] lg:text-[47px] xl:text-[52px]">
//               {activeSlide.titleStart}{" "}
//               <span className="italic text-[#4668E8]">
//                 {activeSlide.titleAccent}
//               </span>{" "}
//               {activeSlide.titleEnd}
//             </h1>

//             <p className="mx-auto mt-4 max-w-[560px] text-[13px] font-medium leading-[1.45] text-[#515E6E] sm:text-sm lg:mx-0">
//               {activeSlide.description}
//             </p> */}

//             <h1 className="text-primary font-bold leading-[120%] text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
//               Find <span className="text-[#4365D0] font-medium">Trusted</span> Local
//               Businesses <span className="text-[#4365D0] font-medium">Near You</span>
//             </h1>
//             <p className="text-sm md:text-base xl:text-lg font-normal text-[#444444] leading-[120%] pt-3 md:pt-4">At Contact Connect, we specialize in comprehensive home renovations, ensuring every project meets your unique vision and standards.</p>

//             <form
//               onSubmit={handleSearch}
//               className="mx-auto mt-6 flex max-w-[520px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[4px_5px_16px_0px_#00000026] ring-1 ring-[#E6E8F0] sm:flex-row lg:mx-0 px-2 py-1.5"
//             >
//               <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
//                 <Search className="h-5 w-5 shrink-0 text-[#7E7E7ED6]" />
//                 <input
//                   type="text"
//                   value={service}
//                   onChange={(event) => setService(event.target.value)}
//                   placeholder="What service do you need?"
//                   className="w-full bg-transparent text-[12px] font-medium text-[#292E78] outline-none placeholder:text-[#7E7E7ED6]"
//                 />
//               </label>

//               <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
//                 <MapPin className="h-5 w-5 shrink-0 text-[#7E7E7ED6]" />
//                 <input
//                   type="text"
//                   value={location}
//                   onChange={(event) => setLocation(event.target.value)}
//                   placeholder="City or Zip code"
//                   className="w-full bg-transparent text-[12px] font-medium text-[#292E78] outline-none placeholder:text-[#7E7E7ED6]"
//                 />
//               </label>

//               <button
//                 type="submit"
//                 className="h-12 bg-primary px-7 text-sm md:text-base font-bold text-white transition hover:bg-[#1F2464] focus-visible:outline-none rounded-[8px] focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 sm:h-auto"
//               >
//                 Search
//               </button>
//             </form>
//           </div>

//           <div className="md:col-span-1">
//             <div className="relative overflow-hidden rounded-[10px] bg-[#EFF4FF] shadow-[0_18px_45px_rgba(32,42,70,0.22)] ring-1 ring-white/70">
//               <div className="relative h-[230px] w-full overflow-hidden transition duration-500 sm:h-[330px] lg:h-[430px]">
//                 <Image
//                   key={activeSlide.id}
//                   src={activeSlide.image}
//                   alt={activeSlide.imageAlt}
//                   fill
//                   sizes="(max-width: 768px) 100vw, 50vw"
//                   priority={activeIndex === 0}
//                   unoptimized
//                   className="object-cover object-center"
//                   style={{ objectFit: "cover" }}
//                 />
//               </div>
//               <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
//             </div>
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={goToPreviousSlide}
//           className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#292E78] shadow-[0_8px_22px_rgba(32,42,70,0.16)] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] lg:flex"
//           aria-label="Previous banner"
//         >
//           <ChevronLeft className="h-5 w-5" />
//         </button>

//         <button
//           type="button"
//           onClick={goToNextSlide}
//           className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#292E78] shadow-[0_8px_22px_rgba(32,42,70,0.16)] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] lg:flex"
//           aria-label="Next banner"
//         >
//           <ChevronRight className="h-5 w-5" />
//         </button>

//         <div className="mt-7 flex justify-center gap-2">
//           {heroSlides?.map((slide, index) => (
//             <button
//               key={slide.id}
//               type="button"
//               onClick={() => goToSlide(index)}
//               className={`h-2.5 rounded-full transition ${
//                 activeIndex === index
//                   ? "w-7 bg-[#292E78]"
//                   : "w-2.5 bg-[#C7CBD6] hover:bg-[#8D94AA]"
//               }`}
//               aria-label={`Go to banner ${index + 1}`}
//               aria-current={activeIndex === index}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;

