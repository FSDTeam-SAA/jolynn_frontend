"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/use-services";
import { AlertCircle, ArrowUpRight, Layers3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MostPopularService = () => {
  const { data, isPending, isError, error, refetch, isFetching } =
    useServices();
  const services = data?.data ?? [];

  return (
    <section
      id="most-popular-categories"
      className="scroll-mt-24 bg-[#DFF0EE] px-4 py-12 sm:px-6 md:py-14 lg:px-8 lg:py-[50px]"
    >
      <div className="container">
        <div className="text-center">
          <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-[#292E78]/10 bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4365D0]">
            <Layers3 className="h-3.5 w-3.5" />
            Explore Services
          </div>
          <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#292E78] sm:text-[28px] md:text-[32px]">
            Most popular Categories
          </h2>
          <p className="mt-2 text-xs font-medium text-[#515E6E] lg:text-sm">
            Choose a service to get started
          </p>
        </div>

        {isPending ? (
          <div
            className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:gap-6"
            aria-label="Loading popular services"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-[224px] flex-col items-center rounded-[14px] border border-white/80 bg-white px-5 py-5 shadow-sm"
              >
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="mt-4 h-5 w-28" />
                <Skeleton className="mt-3 h-10 w-4/5" />
                <Skeleton className="mt-auto h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="mt-7 flex flex-col items-center rounded-lg border border-red-200 bg-red-50 px-5 py-8 text-center"
          >
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="mt-3 font-semibold text-red-900">
              Unable to load services
            </p>
            <p className="mt-1 text-sm text-red-700">
              {error instanceof Error ? error.message : "Please try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-4 rounded-[5px] bg-[#292E78] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="mt-7 flex flex-col items-center rounded-lg border border-[#D5E3E1] bg-white/70 px-5 py-8 text-center">
            <Layers3 className="h-8 w-8 text-[#667085]" />
            <p className="mt-3 font-semibold text-[#292E78]">
              No services available
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              Please check back later for new service categories.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:gap-6">
            {services?.slice(0, 8).map((service) => (
              <article
                key={service._id}
                className="group relative isolate flex min-h-[224px] flex-col items-center overflow-hidden rounded-[14px] border border-white/90 bg-white px-4 pb-4 pt-5 text-center shadow-[0_5px_18px_rgba(32,42,70,0.06)] transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-[#4365D0]/20 hover:shadow-[0_20px_45px_rgba(32,42,70,0.14)] focus-within:-translate-y-1 focus-within:border-[#4365D0]/30 focus-within:shadow-[0_18px_40px_rgba(32,42,70,0.12)] sm:px-5"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-[#EEF3FF] to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-10 -top-12 -z-10 h-28 w-28 rounded-full bg-[#4365D0]/[0.06] blur-2xl transition-transform duration-700 group-hover:scale-150" />

                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#4365D0]/10 bg-[#F2F5FF] p-2.5 shadow-[0_6px_16px_rgba(67,101,208,0.10)] transition duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-[#4365D0]/20 group-hover:bg-[#E9EEFF]">
                  <Image
                    src={service?.logo?.url}
                    alt={`${service?.title} service`}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                  />
                </div>
                <h3 className="mt-4 text-[15px] font-extrabold leading-tight text-[#292E78] transition-colors duration-300 group-hover:text-[#4365D0] lg:text-base">
                  {service.title}
                </h3>
                <p className="mt-2 line-clamp-3 min-h-[45px] text-[11px] font-medium leading-[1.45] text-[#667085] md:text-xs">
                  {service.description}
                </p>
                <Link
                  href={`/services/businesses?service=${encodeURIComponent(service.title)}`}
                  className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[#292E78]/10 bg-[#F6F7FA] text-[11px] font-bold text-[#292E78] transition duration-300 hover:border-[#292E78] hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
                >
                  Get Started
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </article>
            ))}
          </div>
        )}

       {
        services?.length > 8 &&  <div className="mt-6 flex justify-center">
          <Link
            href="/services"
            className="inline-flex h-[40px] items-center justify-center rounded-[5px] bg-[#292E78] px-6 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(41,46,120,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1F2464]"
          >
            View All Services
          </Link>
        </div>
       }
      </div>
    </section>
  );
};

export default MostPopularService;
