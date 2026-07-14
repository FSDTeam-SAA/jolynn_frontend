"use client";

import { ArrowRight, BriefcaseBusiness, ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: number;
  titleStart: string;
  titleAccentOne: string;
  titleMiddle: string;
  titleAccentTwo: string;
  description: string;
  image: string;
  imageAlt: string;
};

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    titleStart: "Find",
    titleAccentOne: "Trusted",
    titleMiddle: "Local Businesses",
    titleAccentTwo: "Near You",
    description:
      "At Contact Connect, we specialize in comprehensive home renovations, ensuring every project meets your unique vision and standards.",
    image: "/assets/images/hero.png",
    imageAlt: "Professional home service team standing near a house",
  },
  {
    id: 2,
    titleStart: "Hire",
    titleAccentOne: "Skilled",
    titleMiddle: "Home Experts",
    titleAccentTwo: "With Ease",
    description:
      "Compare trusted local professionals, check the right services, and connect with the team that fits your project needs.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Local business professionals reviewing a project",
  },
  {
    id: 3,
    titleStart: "Book",
    titleAccentOne: "Reliable",
    titleMiddle: "Local Services",
    titleAccentTwo: "Faster",
    description:
      "Search by service and location, discover nearby businesses, and start your next home project without the guesswork.",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Home renovation tools and construction planning",
  },
];

const Hero = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const activeSlide = heroSlides[activeIndex];

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const goToPreviousSlide = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? heroSlides.length - 1 : currentIndex - 1,
    );
  };

  const goToNextSlide = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
    );
  };

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
      );
    }, 5500);

    return () => window.clearInterval(slideTimer);
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (service.trim()) params.set("service", service.trim());
    if (location.trim()) params.set("location", location.trim());

    router.push(`/services${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-white px-4 py-8 sm:px-6 md:py-10 lg:py-14 lg:px-8 mt-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[330px] items-center gap-8  xl:min-h-[462px]">
          <div className="md:col-span-1">
            <div key={activeSlide.id} className="transition duration-500">
              <h1 className="text-primary font-bold leading-[120%] text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                {activeSlide.titleStart}{" "}
                <span className="text-[#4365D0] font-medium">
                  {activeSlide.titleAccentOne}
                </span>{" "}
                {activeSlide.titleMiddle}{" "}
                <span className="text-[#4365D0] font-medium">
                  {activeSlide.titleAccentTwo}
                </span>
              </h1>
              <p className="text-sm md:text-base xl:text-lg font-normal text-[#444444] leading-[120%] pt-3 md:pt-4">
                {activeSlide.description}
              </p>
            </div>

            <div className="mt-4 md:mt-5">
               <Link
                href="/add-your-business"
                className="bg-primary inline-flex h-12 items-center justify-center gap-3 rounded-[8px] border border-white px-4 text-sm md:text-base font-semibold leading-[150%] text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <BriefcaseBusiness className="h-5 w-5 sm:hidden" />
                Grow your business with Sidequote
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <form
              onSubmit={handleSearch}
              className="mx-auto mt-6 flex max-w-[520px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[4px_5px_16px_0px_#00000026] ring-1 ring-[#E6E8F0] sm:flex-row lg:mx-0 px-2 py-1.5"
            >
              <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
                <Search className="h-5 w-5 shrink-0 text-[#7E7E7ED6]" />
                <input
                  type="text"
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  placeholder="What service do you need?"
                  className="w-full bg-transparent text-[12px] font-medium text-[#292E78] outline-none placeholder:text-[#7E7E7ED6]"
                />
              </label>

              <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
                <MapPin className="h-5 w-5 shrink-0 text-[#7E7E7ED6]" />
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
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

      <button
        type="button"
        onClick={goToPreviousSlide}
        className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#292E78] shadow-[0_8px_22px_rgba(32,42,70,0.16)] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] sm:left-4 lg:flex xl:left-8"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={goToNextSlide}
        className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#292E78] shadow-[0_8px_22px_rgba(32,42,70,0.16)] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] sm:right-4 lg:flex xl:right-8"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
};

export default Hero;
