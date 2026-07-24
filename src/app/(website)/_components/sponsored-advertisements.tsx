"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Megaphone } from "lucide-react";
import Image from "next/image";

type SponsoredAd = {
  _id: string;
  title: string;
  content: string;
  image: string;
  imagePublicId: string;
  link?: string;
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

const getSponsorUrl = (link?: string) => {
  const trimmedLink = link?.trim();
  if (!trimmedLink) return null;

  const candidate = /^https?:\/\//i.test(trimmedLink)
    ? trimmedLink
    : `https://${trimmedLink}`;

  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const getPlainText = (content: string) =>
  content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const SponsorsSkeleton = () => (
  <div
    className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    aria-label="Loading sponsored advertisements"
  >
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="h-[310px] overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <Skeleton className="h-[190px] w-full" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
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
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sponsoredAds.map((ad) => {
              const sponsorUrl = getSponsorUrl(ad.link);
              const description = getPlainText(ad.content);
              const cardContent = (
                <>
                  <div className="relative h-[185px] overflow-hidden bg-[#EEF2F6]">
                    <Image
                      src={ad.image}
                      alt={ad.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/35 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#292D73] shadow-sm backdrop-blur">
                      Sponsored
                    </span>
                  </div>

                  <div className="flex min-h-[125px] flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 text-base font-extrabold leading-6 text-[#292D73]">
                        {ad.title}
                      </h3>
                      {sponsorUrl && (
                        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-[#7B8798] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#292D73]" />
                      )}
                    </div>
                    {description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#667085]">
                        {description}
                      </p>
                    )}
                    <span className="mt-auto pt-3 text-[11px] font-bold text-[#4365D0]">
                      {sponsorUrl ? "Visit sponsor site" : "Sponsor details"}
                    </span>
                  </div>
                </>
              );

              return sponsorUrl ? (
                <a
                  key={ad._id}
                  href={sponsorUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  aria-label={`Visit ${ad.title} website`}
                  className="group block overflow-hidden rounded-xl border border-[#E1E7EF] bg-white shadow-[0_5px_18px_rgba(30,45,75,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#B9C8DF] hover:shadow-[0_14px_32px_rgba(30,45,75,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
                >
                  {cardContent}
                </a>
              ) : (
                <article
                  key={ad._id}
                  className="group overflow-hidden rounded-xl border border-[#E1E7EF] bg-white shadow-[0_5px_18px_rgba(30,45,75,0.08)]"
                >
                  {cardContent}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default SponsoredAdvertisements;
