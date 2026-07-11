"use client";

import { MapPin, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: number;
  eyebrow: string;
  titleStart: string;
  titleAccent: string;
  titleEnd: string;
  description: string;
  image: string;
  imageAlt: string;
};

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    eyebrow: "Connect with verified home experts",
    titleStart: "Find",
    titleAccent: "Trusted Local",
    titleEnd: "Businesses Near You",
    description:
      "At Contact Connect, we specialize in comprehensive home renovations, ensuring every project meets your unique vision and standards.",
    image: "/assets/images/hero.png",
    imageAlt: "Professional home service team standing near a house",
  },
  {
    id: 2,
    eyebrow: "Compare quotes before you book",
    titleStart: "Hire",
    titleAccent: "Skilled Pros",
    titleEnd: "For Every Home Job",
    description:
      "Explore electricians, plumbers, roofers, remodelers, and more from one clean place built for fast decisions.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Local business professionals reviewing a project",
  },
  {
    id: 3,
    eyebrow: "Renovation help, made simple",
    titleStart: "Book",
    titleAccent: "Reliable Service",
    titleEnd: "Without The Guesswork",
    description:
      "Search by service and location, check trusted profiles, then connect with the right team for your next project.",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Home renovation tools and construction planning",
  },
];

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = heroSlides[activeIndex];

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  //   const goToPreviousSlide = () => {
  //     setActiveIndex((currentIndex) =>
  //       currentIndex === 0 ? heroSlides.length - 1 : currentIndex - 1
  //     );
  //   };

  //   const goToNextSlide = () => {
  //     setActiveIndex((currentIndex) =>
  //       currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1
  //     );
  //   };

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
      );
    }, 5500);

    return () => window.clearInterval(slideTimer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white px-4 py-8 sm:px-6 md:py-10 lg:py-14 lg:px-8 mt-20">
      <div className="container relative">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[330px] items-center gap-8  xl:min-h-[462px]">
          <div className="md:col-span-1">
            {/* <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5B66B7] sm:text-xs">
              {activeSlide.eyebrow}
            </p>

            <h1 className="text-[34px] font-extrabold leading-[1.05] text-[#292E78] sm:text-[44px] lg:text-[47px] xl:text-[52px]">
              {activeSlide.titleStart}{" "}
              <span className="italic text-[#4668E8]">
                {activeSlide.titleAccent}
              </span>{" "}
              {activeSlide.titleEnd}
            </h1>

            <p className="mx-auto mt-4 max-w-[560px] text-[13px] font-medium leading-[1.45] text-[#515E6E] sm:text-sm lg:mx-0">
              {activeSlide.description}
            </p> */}

            <h1 className="text-primary font-bold leading-[120%] text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Find <span className="text-[#4365D0] font-medium">Trusted</span> Local
              Businesses <span className="text-[#4365D0] font-medium">Near You</span>
            </h1>
            <p className="text-sm md:text-base xl:text-lg font-normal text-[#444444] leading-[120%] pt-3 md:pt-4">At Contact Connect, we specialize in comprehensive home renovations, ensuring every project meets your unique vision and standards.</p>

            <form className="mx-auto mt-6 flex max-w-[520px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[4px_5px_16px_0px_#00000026] ring-1 ring-[#E6E8F0] sm:flex-row lg:mx-0 px-2 py-1.5">
              <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
                <Search className="h-5 w-5 shrink-0 text-[#7E7E7ED6]" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full bg-transparent text-[12px] font-medium text-[#292E78] outline-none placeholder:text-[#7E7E7ED6]"
                />
              </label>

              <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
                <MapPin className="h-5 w-5 shrink-0 text-[#7E7E7ED6]" />
                <input
                  type="text"
                  placeholder="City or Zip code"
                  className="w-full bg-transparent text-[12px] font-medium text-[#292E78] outline-none placeholder:text-[#7E7E7ED6]"
                />
              </label>

              <button
                type="submit"
                className="h-12 bg-primary px-7 text-sm md:text-base font-bold text-white transition hover:bg-[#1F2464] focus-visible:outline-none rounded-[8px] focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 sm:h-auto"
              >
                Search
              </button>
            </form>
          </div>

          <div className="md:col-span-1">
            <div className="relative overflow-hidden rounded-[10px] bg-[#EFF4FF] shadow-[0_18px_45px_rgba(32,42,70,0.22)] ring-1 ring-white/70">
              <div className="relative h-[230px] w-full overflow-hidden transition duration-500 sm:h-[330px] lg:h-[430px]">
                <Image
                  key={activeSlide.id}
                  src={activeSlide.image}
                  alt={activeSlide.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={activeIndex === 0}
                  unoptimized
                  className="object-cover object-center"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* <button
          type="button"
          onClick={goToPreviousSlide}
          className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#292E78] shadow-[0_8px_22px_rgba(32,42,70,0.16)] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] lg:flex"
          aria-label="Previous banner"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={goToNextSlide}
          className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#292E78] shadow-[0_8px_22px_rgba(32,42,70,0.16)] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] lg:flex"
          aria-label="Next banner"
        >
          <ChevronRight className="h-5 w-5" />
        </button> */}

        <div className="mt-7 flex justify-center gap-2">
          {heroSlides?.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition ${
                activeIndex === index
                  ? "w-7 bg-[#292E78]"
                  : "w-2.5 bg-[#C7CBD6] hover:bg-[#8D94AA]"
              }`}
              aria-label={`Go to banner ${index + 1}`}
              aria-current={activeIndex === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
