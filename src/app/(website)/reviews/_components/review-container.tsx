"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Review = {
  _id: string;
  businessId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  businessName: string;
  rating: number;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Review[];
};

const PAGE_LIMIT = 10;

const fetchMyReviews = async (
  token: string,
  page: number,
): Promise<ReviewsResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The reviews service is not configured.");

  const params = new URLSearchParams({
    limit: String(PAGE_LIMIT),
    page: String(page),
    // rating: "5",
  });
  const response = await fetch(`${apiUrl}/reviews?${params}`, {
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = (await response.json()) as ReviewsResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Unable to load your reviews.");
  }

  return result;
};

const ReviewsSkeleton = () => (
  <div
    className="mx-auto mt-9 grid max-w-[1080px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-11 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-10"
    aria-label="Loading reviews"
  >
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="flex min-h-[190px] flex-col rounded-[7px] border border-[#D9F0F1] bg-[#F0FEFE] px-4 pb-4 pt-3.5"
      >
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-11/12" />
        <Skeleton className="mt-2 h-3 w-4/5" />
        <div className="mb-3 mt-auto h-px bg-[#A7DDE4]" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-36" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ReviewContainer = () => {
  const { data: session, status } = useSession();
  const [page, setPage] = useState(1);
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token ?? "";

  const reviewsQuery = useQuery<ReviewsResponse>({
    queryKey: ["my-reviews", { page, limit: PAGE_LIMIT, rating: 5 }],
    queryFn: () => fetchMyReviews(token, page),
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const reviews = reviewsQuery.data?.data ?? [];
  const total = reviewsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const isLoading = status === "loading" || (Boolean(token) && reviewsQuery.isPending);

  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20 xl:py-24">
      <div className="container">
        <div className="mx-auto max-w-[520px] text-center">
          <h2 className="text-[28px] font-extrabold leading-tight text-[#292D73] sm:text-[32px] lg:text-[36px]">
            What Our Users Say
          </h2>
          <p className="mx-auto mt-3 max-w-[430px] text-[12px] font-medium leading-[1.45] text-[#4B5563] sm:text-[13px]">
            Your reviews of trusted professionals and the services you received.
          </p>
        </div>

        {isLoading ? (
          <ReviewsSkeleton />
        ) : status === "unauthenticated" ? (
          <div className="mx-auto mt-10 max-w-[620px] rounded-[8px] border border-[#D9F0F1] bg-[#F0FEFE] px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#475467]">
              Please sign in to see your reviews.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[5px] bg-[#292D73] px-6 text-sm font-bold text-white"
            >
              Sign In
            </Link>
          </div>
        ) : reviewsQuery.isError ? (
          <div className="mx-auto mt-10 max-w-[620px] rounded-[8px] border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-red-700">
              {reviewsQuery.error instanceof Error
                ? reviewsQuery.error.message
                : "Unable to load your reviews."}
            </p>
            <button
              type="button"
              onClick={() => reviewsQuery.refetch()}
              className="mt-5 h-10 rounded-[5px] bg-[#292D73] px-6 text-sm font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="mx-auto mt-10 max-w-[620px] rounded-[8px] border border-[#D9F0F1] bg-[#F0FEFE] px-6 py-12 text-center text-sm font-semibold text-[#667085]">
            You have not submitted any 5-star reviews yet.
          </div>
        ) : (
          <>
            <div className="mx-auto mt-9 grid max-w-[1080px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-11 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-10">
              {reviews.map((review, index) => (
                <article
                  key={review._id}
                  className={`flex min-h-[190px] flex-col rounded-[7px] px-4 pb-4 pt-3.5 shadow-[0_7px_16px_rgba(30,45,75,0.16)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(30,45,75,0.2)] motion-reduce:transform-none motion-reduce:transition-none ${
                    index % 3 === 1
                      ? "border border-[#315CFF] bg-white"
                      : "border border-[#D9F0F1] bg-[#F0FEFE]"
                  }`}
                >
                  <div
                    className="flex items-center gap-[2px]"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-3.5 w-3.5 ${
                          starIndex < review.rating
                            ? "fill-[#FFB800] text-[#FFB800]"
                            : "fill-transparent text-[#D9DEE7]"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-3 flex-1 text-[12px] font-medium leading-[1.45] text-[#273142]">
                    &ldquo;{review.message}&rdquo;
                  </p>

                  <div className="mb-3 mt-4 h-px bg-[#A7DDE4]" />

                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#292D73] text-sm font-bold text-white ring-2 ring-white">
                      {review.reviewerAvatar ? (
                        <Image
                          src={review.reviewerAvatar}
                          alt={`${review.reviewerName} avatar`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        review.reviewerName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-extrabold leading-tight text-[#292D73]">
                        {review.reviewerName}
                      </h3>
                      <p className="mt-1 truncate text-[10px] font-medium leading-tight text-[#667085]">
                        {review.businessName} · {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-2"
                aria-label="Reviews pagination"
              >
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || reviewsQuery.isFetching}
                  className="flex h-9 w-9 items-center justify-center rounded border border-[#B8C0CC] text-[#667085] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-semibold text-[#475467]">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page === totalPages || reviewsQuery.isFetching}
                  className="flex h-9 w-9 items-center justify-center rounded border border-[#B8C0CC] text-[#667085] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ReviewContainer;
