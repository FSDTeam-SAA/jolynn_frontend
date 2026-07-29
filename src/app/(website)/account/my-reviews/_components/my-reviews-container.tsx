"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AccountPageShell } from "../../_components/account-ui";

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
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1"
  ).replace(/\/$/, "");
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_LIMIT),
  });
  const response = await fetch(`${apiUrl}/reviews/my-reviews?${params}`, {
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = (await response.json().catch(() => null)) as
    | ReviewsResponse
    | null;

  if (!response.ok || !result?.success || !Array.isArray(result.data)) {
    throw new Error(result?.message || "Unable to load your reviews.");
  }

  return result;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const MyReviewsContainer = () => {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as
    | { id?: string; token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token ?? "";
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const reviewsQuery = useQuery<ReviewsResponse>({
    queryKey: ["account-my-reviews", sessionUser?.id, page, PAGE_LIMIT],
    queryFn: () => fetchMyReviews(token, page),
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const reviews = reviewsQuery.data?.data ?? [];
  const total = reviewsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const isLoading =
    status === "loading" || (Boolean(token) && reviewsQuery.isPending);

  return (
    <AccountPageShell active="my-reviews" showProfileCard={false}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#292D73]">My Reviews</h1>
          {!isLoading &&
            status === "authenticated" &&
            !reviewsQuery.isError && (
            <p className="mt-1 text-[12px] font-medium text-[#667085]">
              {total} review{total === 1 ? "" : "s"}
            </p>
            )}
        </div>

        <div
          className="inline-flex items-center rounded-[7px] border border-[#D8DEE8] bg-[#F5F7FA] p-1"
          role="group"
          aria-label="Choose reviews view"
        >
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            title="List view"
            className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 sm:px-3 ${
              viewMode === "list"
                ? "bg-[#292D73] text-white shadow-sm"
                : "text-[#667085] hover:bg-white hover:text-[#292D73]"
            }`}
          >
            <List className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            title="Grid view"
            className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 sm:px-3 ${
              viewMode === "grid"
                ? "bg-[#292D73] text-white shadow-sm"
                : "text-[#667085] hover:bg-white hover:text-[#292D73]"
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          className={`grid grid-cols-1 gap-5 ${
            viewMode === "grid" ? "xl:grid-cols-2" : ""
          }`}
          aria-label="Loading reviews"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[210px] rounded-[8px]" />
          ))}
        </div>
      ) : status === "unauthenticated" || !token ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center">
          <p className="text-[13px] font-medium text-[#667085]">
            Please sign in to view your reviews.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex h-9 items-center rounded-[5px] bg-[#292D73] px-5 text-[12px] font-bold text-white"
          >
            Sign In
          </Link>
        </div>
      ) : reviewsQuery.isError ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[8px] border border-red-200 bg-red-50 px-6 text-center">
          <p className="text-[13px] font-semibold text-red-700">
            {reviewsQuery.error instanceof Error
              ? reviewsQuery.error.message
              : "Unable to load your reviews."}
          </p>
          <button
            type="button"
            onClick={() => reviewsQuery.refetch()}
            className="mt-4 h-9 rounded-[5px] bg-[#292D73] px-5 text-[12px] font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-[8px] border border-[#E8ECF2] bg-white px-6 text-center text-[13px] font-medium text-[#667085]">
          You haven&apos;t written any reviews yet.
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-5 ${
              viewMode === "grid" ? "xl:grid-cols-2" : ""
            }`}
          >
            {reviews.map((review) => (
              <article
                key={review._id}
                className={`rounded-[8px] border border-[#E8ECF2] bg-white p-5 shadow-[0_8px_24px_rgba(30,45,75,0.10)] ${
                  viewMode === "list"
                    ? "sm:grid sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-6"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F2F4F7]">
                      {review.reviewerAvatar ? (
                        <Image
                          src={review.reviewerAvatar}
                          alt={review.reviewerName}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-sm font-bold text-[#667085]">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-[14px] font-bold text-[#292D73]">
                        {review.businessName}
                      </h2>
                      <time className="text-[10px] font-medium text-[#98A2B3]">
                        {formatDate(review.createdAt)}
                      </time>
                    </div>
                  </div>

                  <div
                    className="mt-4 flex items-center gap-1"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < review.rating
                            ? "fill-[#FFB800] text-[#FFB800]"
                            : "fill-[#E4E7EC] text-[#E4E7EC]"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-bold text-[#292D73]">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div
                  className={`${
                    viewMode === "list"
                      ? "mt-4 border-t border-[#EAECF0] pt-4 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
                      : "mt-4 border-t border-[#EAECF0] pt-4"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#98A2B3]">
                    Review
                  </p>
                  <p className="mt-2 text-[13px] font-medium leading-6 text-[#475467]">
                    “{review.message}”
                  </p>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page === 1 || reviewsQuery.isFetching}
                onClick={() => setPage((current) => current - 1)}
                className="h-9 rounded-[5px] border border-[#B8C0CC] px-4 text-[12px] font-semibold text-[#475467] disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-[12px] font-medium text-[#667085]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages || reviewsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="h-9 rounded-[5px] bg-[#292D73] px-4 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AccountPageShell>
  );
};

export default MyReviewsContainer;
