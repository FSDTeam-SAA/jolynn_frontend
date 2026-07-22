"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Megaphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SponsoredAd = {
  _id: string;
  title: string;
  content: string;
  image: string;
  imagePublicId: string;
  createdAt: string;
  updatedAt: string;
};

type SponsorResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: SponsoredAd[];
};

const fetchSponsors = async (): Promise<SponsorResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The sponsor service is not configured.");
  }

  const response = await fetch(
    `${apiUrl}/sponsor?sortBy=createdAt&limit=10&page=1`,
    { headers: { Accept: "*/*" } },
  );

  if (!response.ok) {
    throw new Error("We couldn't load the sponsors. Please try again.");
  }

  const result = (await response.json()) as SponsorResponse;

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "We couldn't load the sponsors.");
  }

  return result;
};

const SponsorsSkeleton = () => (
  <div
    className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    aria-label="Loading sponsored advertisements"
  >
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="relative h-[280px] overflow-hidden rounded-[5px] bg-slate-100"
      >
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 flex flex-col justify-between p-3">
          <Skeleton className="h-8 w-3/4 bg-slate-300/70" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-slate-300/70" />
            <Skeleton className="h-3 w-5/6 bg-slate-300/70" />
            <Skeleton className="h-3 w-2/3 bg-slate-300/70" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SponsoredAdvertisements = () => {
  const { data, isPending, isError, error, refetch, isFetching } =
    useQuery<SponsorResponse>({
      queryKey: ["website-sponsors"],
      queryFn: fetchSponsors,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const sponsoredAds = data?.data ?? [];

  return (
    <section className="bg-white px-5 py-12 sm:px-8 md:py-16 lg:py-[58px]">
      <div className="container">
        <div className=" text-center">
          <h2 className="text-2xl md:text-[28px] lg:text-[32px] font-bold leading-normal text-primary">
            Sponsored Advertisements
          </h2>
          <p className="mt-2 text-xs md:text-sm font-normal leading-normal text-[#444444]">
            Thousands of homeowners trust our verified professionals for
            reliable, high-quality home services. From small repairs to major{" "}
            <br className="hidden md:block" /> projects, we deliver dependable
            workmanship and exceptional customer care.
          </p>
        </div>

        {isPending ? (
          <SponsorsSkeleton />
        ) : isError ? (
          <div
            role="alert"
            className="mt-8 flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center"
          >
            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
            <p className="mt-3 font-semibold text-red-900">
              Unable to load sponsors
            </p>
            <p className="mt-1 text-sm text-red-700">
              {error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </div>
        ) : sponsoredAds.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-[#E4E8EE] bg-slate-50 px-5 py-8 text-center">
            <Megaphone className="h-8 w-8 text-[#667789]" aria-hidden="true" />
            <p className="mt-3 font-semibold text-primary">
              No sponsored advertisements available
            </p>
            <p className="mt-1 text-sm text-[#667789]">
              Please check back later for featured sponsors.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sponsoredAds.map((ad) => (
              <Link
                key={ad._id}
                href="/contact"
                className="group relative block overflow-hidden rounded-[5px] bg-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
              >
                <Image
                  src={ad.image}
                  alt={ad.title}
                  width={400}
                  height={400}
                  className="h-[280px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/18 to-black/82" />
                <div className="absolute inset-0 flex flex-col justify-between p-3">
                  <h3 className="text-xl font-bold leading-normal text-white md:text-2xl ">
                    {ad.title}
                  </h3>
                  <p className="line-clamp-4 text-xs font-normal leading-normal text-white md:text-sm">
                    {ad.content}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SponsoredAdvertisements;
