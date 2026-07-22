"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/use-services";
import { AlertCircle, Layers3 } from "lucide-react";
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
          <h2 className="text-[24px] font-extrabold leading-tight text-[#292E78] sm:text-[28px] md:text-[30px]">
            Most popular Categories
          </h2>
          <p className="mt-2 text-xs lg:text-sm font-medium text-[#515E6E] sm:text-xs">
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
                className="flex min-h-[176px] flex-col items-center rounded-[6px] bg-white px-4 py-3.5"
              >
                <Skeleton className="h-9 w-9" />
                <Skeleton className="mt-3 h-4 w-24" />
                <Skeleton className="mt-3 h-8 w-4/5" />
                <Skeleton className="mt-auto h-[34px] w-full" />
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
                className="group flex min-h-[176px] flex-col items-center rounded-[6px] bg-white px-3 pb-3.5 pt-3.5 text-center shadow-[0_1px_2px_rgba(32,42,70,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(32,42,70,0.10)] sm:px-4"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[5px] bg-[#E8EEFF] p-1.5 transition group-hover:scale-105">
                  <Image
                    src={service.logo.url}
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-contain"
                  />
                </div>
                <h3 className="mt-3 text-[15px] lg:text-base font-extrabold leading-none text-[#292E78]">
                  {service.title}
                </h3>
                <p className="mt-2 min-h-[42px] text-[10px] line-clamp-2 md:text-xs font-medium leading-[1.18] text-[#6F7D90]">
                  {service.description}
                </p>
                <Link
                  href={`/services/businesses?service=${encodeURIComponent(service.title)}`}
                  className="mt-auto flex h-[34px] w-full items-center justify-center rounded-[5px] bg-[#F1F1F1] text-[10.5px] font-semibold text-[#171B2F] transition hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
                >
                  Get Started
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
