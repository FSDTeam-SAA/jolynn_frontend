"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock3,
  Flag,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Star,
  UsersRound,
} from "lucide-react";
import {
  useLocationCities,
  useLocationStates,
} from "@/hooks/use-location-options";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: number;
  eyebrow: string;
  titleStart: string;
  titleAccentOne: string;
  titleMiddle: string;
  titleAccentTwo: string;
  description: string;
  image: string;
  imageAlt: string;
  backgroundClass: string;
  overlayClass: string;
  action?: {
    href: string;
    label: string;
    icon: typeof BriefcaseBusiness;
  };
};

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    eyebrow: "Search trusted services near you",
    titleStart: "Find",
    titleAccentOne: "Trusted",
    titleMiddle: "Local Businesses",
    titleAccentTwo: "Near You",
    description:
      "Search by service, state and city discover nearby businesses, and start your next home project without the guesswork.",
    image: "/assets/images/caro_1.png",
    imageAlt: "A trusted local home-service professional outside a modern home",
    backgroundClass: "bg-[#FAFBFC]",
    overlayClass:
      "bg-[linear-gradient(90deg,rgba(245,248,251,0.75)_0%,rgba(245,248,251,0.58)_34%,rgba(232,238,244,0.22)_57%,rgba(232,238,244,0.03)_78%,transparent_100%)]",
  },
  {
    id: 2,
    eyebrow: "Your local business directory",
    titleStart: "Our",
    titleAccentOne: "Business Directory",
    titleMiddle: "Finds Small to Medium Sized Businesses",
    titleAccentTwo: "Faster.",
    description:
      "Discover trusted local professionals, compare top-rated services, and connect with businesses in your community.",
    image: "/assets/images/caro_2.png",
    imageAlt: "Local business owners talking on a neighborhood main street",
    backgroundClass: "bg-[#FDFBF8]",
    overlayClass:
      "bg-[linear-gradient(90deg,rgba(255,250,242,0.75)_0%,rgba(255,248,238,0.58)_35%,rgba(244,238,229,0.23)_58%,rgba(244,238,229,0.03)_79%,transparent_100%)]",
    action: {
      href: "/add-your-business",
      label: "Grow your business with SideQuote",
      icon: BriefcaseBusiness,
    },
  },
  {
    id: 3,
    eyebrow: "New opportunities in your community",
    titleStart: "Help",
    titleAccentOne: "Wanted",
    titleMiddle: "Find Local Work",
    titleAccentTwo: "Faster",
    description:
      "Explore help-wanted posts from local businesses and connect with opportunities that match your skills and experience.",
    image: "/assets/images/caro_3.png",
    imageAlt: "A local employer welcoming a skilled job candidate",
    backgroundClass: "bg-[#F8FCFB]",
    overlayClass:
      "bg-[linear-gradient(90deg,rgba(244,251,250,0.75)_0%,rgba(239,249,247,0.58)_35%,rgba(228,241,239,0.23)_58%,rgba(228,241,239,0.03)_79%,transparent_100%)]",
    action: {
      href: "/job-posts",
      label: "View Help Wanted",
      icon: UsersRound,
    },
  },
];

const featuredBusinesses = [
  { name: "Yelo Het", category: "Pet Services", rating: "5.0", location: "Austin, TX" },
  { name: "BrightFix Electric", category: "Electricians", rating: "4.9", location: "Dallas, TX" },
  { name: "Green Leaf Lawn Care", category: "Landscaping", rating: "4.8", location: "Tampa, FL" },
  { name: "ClearFlow Plumbing", category: "Plumbing", rating: "4.9", location: "Orlando, FL" },
];

const featuredJobs = [
  { user: "@joyful", title: "Looking for kitchen service", location: "Austin, TX", time: "Today" },
  { user: "@maria_home", title: "Need an experienced house painter", location: "Dallas, TX", time: "1 day ago" },
  { user: "@northside", title: "Weekend landscaping help needed", location: "Tampa, FL", time: "2 days ago" },
  { user: "@alexbuilds", title: "Licensed electrician for renovation", location: "Orlando, FL", time: "3 days ago" },
];

const defaultSlideDuration = 6_000;
const previewSlideDuration = 16_000;
const previewCardDuration = 7_000;
const excludedStateNames = new Set([
  "armed forces europe",
  "armed forces pacific",
  "armed forces of the americas",
]);

const SlidePreviewCarousel = ({ slideId }: { slideId: number }) => {
  const [previewIndex, setPreviewIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const items = slideId === 2 ? featuredBusinesses : featuredJobs;

  useEffect(() => {
    const previewTimer = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % items.length);
    }, previewCardDuration);

    return () => window.clearInterval(previewTimer);
  }, [items.length]);

  if (slideId === 2) {
    const business = featuredBusinesses[previewIndex];

    return (
      <div
        className="relative mt-5 h-[78px] max-w-[760px] overflow-hidden"
        aria-label="Featured local businesses"
        aria-live="off"
      >
        <AnimatePresence initial={false}>
          <motion.article
            key={business.name}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -14, scale: reduceMotion ? 1 : 0.995 }}
            transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-0 flex min-h-[70px] will-change-transform items-center gap-3 rounded-xl border border-[#DCE3EC] border-l-[3px] border-l-[#0082D7] bg-white/95 p-3 backdrop-blur"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-sm font-extrabold text-[#292D73] ring-1 ring-[#DCE3EC]">
              {business.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-extrabold text-[#292D73]">
                {business.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#E6F3F2] px-2 py-0.5 text-[9px] font-semibold text-[#426078]">
                  {business.category}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-[#475467]">
                  <Star className="h-3 w-3 fill-[#FFB800] text-[#FFB800]" />
                  {business.rating}
                </span>
                <span className="hidden items-center gap-1 text-[9px] text-[#667085] sm:flex">
                  <MapPin className="h-3 w-3" />
                  {business.location}
                </span>
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-1.5 md:flex">
              <span className="rounded-md bg-[#292D73] px-3 py-2 text-[9px] font-bold text-white">
                View Profile
              </span>
              <span className="rounded-md border border-[#F2C36B] bg-[#FFF8E8] px-3 py-2 text-[9px] font-bold text-[#D97706]">
                Review
              </span>
              <span className="rounded-md bg-[#A7A7A7] px-3 py-2 text-[9px] font-bold text-white">
                Report
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#292D73] text-[#292D73]">
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    );
  }

  const job = featuredJobs[previewIndex];

  return (
    <div
      className="relative mt-5 h-[78px] max-w-[760px] overflow-hidden"
      aria-label="Featured help wanted posts"
      aria-live="off"
    >
      <AnimatePresence initial={false}>
        <motion.article
          key={`${job.user}-${job.title}`}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -14, scale: reduceMotion ? 1 : 0.995 }}
          transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-0 flex min-h-[70px] will-change-transform items-center gap-3 rounded-xl border border-[#DCE3EC] border-l-[3px] border-l-[#4365D0] bg-white/95 p-3 backdrop-blur"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#292D73] text-[10px] font-extrabold uppercase text-white">
            {job.user.charAt(1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-[#4365D0]">{job.user}</p>
            <h3 className="truncate text-[11px] font-extrabold text-[#292D73]">
              {job.title}
            </h3>
            <div className="mt-1 hidden items-center gap-3 text-[9px] text-[#667085] sm:flex">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {job.time}
              </span>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <span className="flex items-center gap-1 rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-[9px] font-bold text-[#667085]">
              <Flag className="h-3 w-3" />
              Report
            </span>
            <span className="flex items-center gap-1 rounded-md bg-[#292D73] px-3 py-2 text-[9px] font-bold text-white">
              <Mail className="h-3 w-3" />
              Respond by email
            </span>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
};

type HeroLocationDropdownProps = {
  value: string;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  clearLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
};

const HeroLocationDropdown = ({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  clearLabel = "None",
  disabled = false,
  loading = false,
  onChange,
}: HeroLocationDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(normalizedSearch),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearchTerm("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || loading}
          aria-expanded={open}
          className="flex h-11 w-full min-w-0 items-center justify-between gap-2 bg-transparent px-3 text-left text-[13px] font-medium text-[#292D73] outline-none disabled:cursor-not-allowed disabled:text-[#98A2B3]"
        >
          <span
            className="min-w-0 flex-1 truncate"
            title={value || placeholder}
          >
            {loading ? "Loading..." : value || placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#4365D0]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={7}
        className="z-[70] w-[min(280px,calc(100vw-2rem))] overflow-hidden rounded-md border border-[#e4e7ec] bg-white p-0 shadow-[0_14px_35px_rgba(41,45,115,0.18)]"
      >
        <div className="flex h-10 items-center border-b border-[#eaecf0] px-3">
          <Search className="h-4 w-4 shrink-0 text-[#4365D0]" />
          <input
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-[#292D73] outline-none placeholder:text-[#98A2B3]"
          />
        </div>
        <div className="max-h-52 overflow-y-auto p-1.5">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
              setSearchTerm("");
            }}
            className="flex w-full items-start rounded-lg px-2.5 py-2 text-left text-xs font-medium leading-5 text-[#344054] transition hover:bg-[#f2f4f7] focus:bg-[#eef2ff] focus:outline-none"
          >
            <Check
              className={`mr-2 mt-[3px] h-3.5 w-3.5 shrink-0 text-[#4365D0] ${
                value === "" ? "opacity-100" : "opacity-0"
              }`}
            />
            <span>{clearLabel}</span>
          </button>

          {filteredOptions.length === 0 && searchTerm.trim() ? (
            <p className="px-3 py-5 text-center text-xs text-[#667085]">
              {emptyMessage}
            </p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setSearchTerm("");
                }}
                className="flex w-full items-start rounded-lg px-2.5 py-2 text-left text-xs font-medium leading-5 text-[#344054] transition hover:bg-[#f2f4f7] focus:bg-[#eef2ff] focus:outline-none"
              >
                <Check
                  className={`mr-2 mt-[3px] h-3.5 w-3.5 shrink-0 text-[#4365D0] ${
                    value === option ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="min-w-0 whitespace-normal break-words">
                  {option}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Hero = () => {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [timerKey, setTimerKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasSearchInteraction, setHasSearchInteraction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const statesQuery = useLocationStates();
  const states = (statesQuery.data?.data ?? []).filter(
    (state) => !excludedStateNames.has(state.name.trim().toLowerCase()),
  );
  const selectedState = states.find((state) => state.name === stateName);
  const citiesQuery = useLocationCities(selectedState);
  const cities = citiesQuery.data?.data.cities ?? [];
  const activeSlide = heroSlides[activeIndex];
  const ActiveActionIcon = activeSlide.action?.icon;

  const changeSlide = (nextIndex: number, nextDirection: number) => {
    setDirection(nextDirection);
    setActiveIndex(nextIndex);
    setTimerKey((value) => value + 1);
  };

  const goToPreviousSlide = () => {
    changeSlide(
      activeIndex === 0 ? heroSlides.length - 1 : activeIndex - 1,
      -1,
    );
  };

  const goToNextSlide = () => {
    changeSlide(
      activeIndex === heroSlides.length - 1 ? 0 : activeIndex + 1,
      1,
    );
  };

  const goToSlide = (index: number) => {
    if (index === activeIndex) return;
    changeSlide(index, index > activeIndex ? 1 : -1);
  };

  useEffect(() => {
    if (isPaused || (activeIndex === 0 && hasSearchInteraction)) return;

    const slideTimer = window.setTimeout(() => {
      setDirection(1);
      setActiveIndex((currentIndex) =>
        currentIndex === heroSlides.length - 1 ? 0 : currentIndex + 1,
      );
      setTimerKey((value) => value + 1);
    }, activeIndex === 0 ? defaultSlideDuration : previewSlideDuration);

    return () => window.clearTimeout(slideTimer);
  }, [activeIndex, hasSearchInteraction, isPaused, timerKey]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
    if (stateName) params.set("state", stateName);
    if (city) params.set("city", city);
    const query = params.toString();
    router.push(query ? `/services/businesses?${query}` : "/services/businesses");
  };

  const horizontalOffset = reduceMotion ? 0 : direction * -72;
  const imageOffset = reduceMotion ? 0 : direction * -42;

  return (
    <section
      className={`relative isolate min-h-[640px] overflow-hidden transition-colors duration-700 sm:min-h-[680px] lg:min-h-[720px] ${activeSlide.backgroundClass}`}
      aria-roledescription="carousel"
      aria-label="Sidequote services"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeSlide.id}
          custom={direction}
          initial={{ opacity: 0, x: imageOffset, scale: 1.035 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -imageOffset, scale: 1.015 }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={activeSlide.image}
            alt={activeSlide.imageAlt}
            fill
            priority={activeIndex === 0}
            sizes="100vw"
            className="object-cover object-[62%_28%] opacity-65 sm:object-[center_28%]"
          />
        </motion.div>
      </AnimatePresence>

      <div
        className={`pointer-events-none absolute inset-0 transition-colors duration-700 ${activeSlide.overlayClass}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#eef3f7]/50 via-transparent to-white/10" />

      <div className="container relative z-10 flex min-h-[640px] items-center px-5 py-16 sm:min-h-[680px] sm:px-10 lg:min-h-[720px] lg:px-16">
        <div className="w-full max-w-[820px]">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div key={activeSlide.id}>
              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : -34 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -18 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.12 }}
                className="mb-5 flex items-center gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#292D73]/10 bg-white/70 text-[#292D73] shadow-sm backdrop-blur">
                  {activeSlide.id === 1 ? (
                    <Search className="h-5 w-5" />
                  ) : activeSlide.id === 2 ? (
                    <BriefcaseBusiness className="h-5 w-5" />
                  ) : (
                    <UsersRound className="h-5 w-5" />
                  )}
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#292D73]/75 sm:text-sm">
                  {activeSlide.eyebrow}
                </p>
              </motion.div>

              <motion.div
                custom={direction}
                initial={{ opacity: 0, x: horizontalOffset, y: reduceMotion ? 0 : 38 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -horizontalOffset, y: reduceMotion ? 0 : 22 }}
                transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1
                  className={`max-w-[650px] font-extrabold tracking-[-0.03em] text-[#292D73] ${
                    activeSlide.id === 2
                      ? "text-2xl leading-[1.32] sm:text-3xl sm:leading-[1.3] lg:text-[38px] lg:leading-[1.28] xl:text-[44px] xl:leading-[1.26]"
                      : "text-3xl leading-[1.2] sm:text-4xl sm:leading-[1.18] lg:text-5xl lg:leading-[1.16] xl:text-[54px] xl:leading-[1.14]"
                  }`}
                >
                  {activeSlide.titleStart}{" "}
                  <span className="font-medium text-[#4365D0]">
                    {activeSlide.titleAccentOne}
                  </span>{" "}
                  {activeSlide.titleMiddle}{" "}
                  <span className="font-medium text-[#4365D0]">
                    {activeSlide.titleAccentTwo}
                  </span>
                </h1>
                <p className="mt-6 max-w-[570px] text-sm leading-8 text-[#3f4852] sm:text-base lg:text-lg">
                  {activeSlide.description}
                </p>

                {activeSlide.id === 1 ? (
                  <form
                    onSubmit={handleSearch}
                    onFocusCapture={() => setHasSearchInteraction(true)}
                    onPointerDown={() => setHasSearchInteraction(true)}
                    onClickCapture={() => setHasSearchInteraction(true)}
                    className="mt-6 grid max-w-[650px] grid-cols-1 rounded-xl border border-white/80 bg-white/90 p-1.5 shadow-[0_14px_35px_rgba(41,45,115,0.14)] backdrop-blur-md sm:grid-cols-2 lg:grid-cols-[0.9fr_0.9fr_0.9fr_auto]"
                  >
                    <label className="flex min-w-0 items-center gap-2 border-b border-[#e6e8f0] px-3 py-2 sm:border-r lg:border-b-0">
                      <Search className="h-4 w-4 shrink-0 text-[#4365D0]" />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="What service do you need?"
                        className="h-7 w-full bg-transparent text-[13px] font-medium text-[#292D73] outline-none placeholder:text-[11px] placeholder:text-[#667481]"
                      />
                    </label>

                    <div className="min-w-0 border-b border-[#e6e8f0] sm:border-b lg:border-b-0 lg:border-r">
                      <HeroLocationDropdown
                        value={stateName}
                        options={states.map((state) => state.name)}
                        placeholder={
                          statesQuery.isError
                            ? "States unavailable"
                            : "Select state"
                        }
                        searchPlaceholder="Search states..."
                        emptyMessage="No state found."
                        clearLabel="None"
                        loading={statesQuery.isPending}
                        disabled={statesQuery.isError || states.length === 0}
                        onChange={(nextState) => {
                          setStateName(nextState);
                          setCity("");
                        }}
                      />
                    </div>

                    <div className="min-w-0 border-b border-[#e6e8f0] sm:border-b-0 sm:border-r">
                      <HeroLocationDropdown
                        value={city}
                        options={cities}
                        placeholder={
                          !selectedState
                            ? "Select state first"
                            : citiesQuery.isError
                              ? "Cities unavailable"
                              : "Select city"
                        }
                        searchPlaceholder="Search cities..."
                        emptyMessage="No city found."
                        clearLabel="None"
                        loading={Boolean(selectedState) && citiesQuery.isPending}
                        disabled={
                          !selectedState ||
                          citiesQuery.isError ||
                          (!citiesQuery.isPending && cities.length === 0)
                        }
                        onChange={setCity}
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#292D73] px-5 text-[13px] font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-1"
                    >
                      Search
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  activeSlide.action && ActiveActionIcon && (
                    <>
                      <Link
                        href={activeSlide.action.href}
                        className="mt-7 inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#292D73] px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(41,45,115,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2"
                      >
                        <ActiveActionIcon className="h-5 w-5" />
                        {activeSlide.action.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <SlidePreviewCarousel slideId={activeSlide.id} />
                    </>
                  )
                )}

                {activeSlide.id === 1 && statesQuery.isError && (
                  <button
                    type="button"
                    onClick={() => statesQuery.refetch()}
                    className="mt-2 text-xs font-semibold text-red-600 underline underline-offset-2"
                  >
                    Unable to load states. Try again
                  </button>
                )}
                {activeSlide.id === 1 && selectedState && citiesQuery.isError && (
                  <button
                    type="button"
                    onClick={() => citiesQuery.refetch()}
                    className="mt-2 block text-xs font-semibold text-red-600 underline underline-offset-2"
                  >
                    Unable to load cities. Try again
                  </button>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={goToPreviousSlide}
        className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#292D73] shadow-lg backdrop-blur transition duration-300 hover:scale-105 hover:bg-[#292D73] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] md:flex lg:left-6"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={goToNextSlide}
        className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#292D73] shadow-lg backdrop-blur transition duration-300 hover:scale-105 hover:bg-[#292D73] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] md:flex lg:right-6"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-md backdrop-blur">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              activeIndex === index
                ? "w-8 bg-[#292D73]"
                : "w-2.5 bg-[#aab0bd] hover:bg-[#667085]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
