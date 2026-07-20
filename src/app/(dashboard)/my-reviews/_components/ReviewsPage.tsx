"use client";

import DeleteModal from "@/components/modals/delete-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MessageSquareReply, Search, Star, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ReviewReply = {
  message: string;
  repliedById: string;
  repliedByName: string;
  repliedAt: string;
};

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
  reply?: ReviewReply;
};

type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
};

type ReviewsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: { summary: ReviewSummary; reviews: Review[] };
};

type ReviewResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Review;
};

const PAGE_LIMIT = 10;

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The reviews API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

async function readResponse<T extends { success: boolean; message: string }>(response: Response) {
  const result = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || "The review request could not be completed.");
  return result;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

function ReviewsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState(5);
  const [search, setSearch] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const reviewsQuery = useQuery<ReviewsResponse>({
    queryKey: ["my-business-reviews", page, rating],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view your reviews.");
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT), page: String(page), rating: String(rating) });
      const response = await fetch(`${getApiUrl()}/reviews/my-business?${params}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      const result = await readResponse<ReviewsResponse>(response);
      if (!Array.isArray(result.data?.reviews) || !result.data?.summary) throw new Error("The reviews response is invalid.");
      return result;
    },
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const reviews = useMemo(() => reviewsQuery.data?.data.reviews ?? [], [reviewsQuery.data?.data.reviews]);
  const summary = reviewsQuery.data?.data.summary;
  const total = reviewsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? reviews.filter((review) => [review.reviewerName, review.businessName, review.message, review.reply?.message || ""].some((value) => value.toLowerCase().includes(query))) : reviews;
  }, [reviews, search]);

  const deleteMutation = useMutation<ReviewResponse, Error, Review>({
    mutationFn: async (review) => {
      if (!token) throw new Error("Please sign in to delete a review.");
      const response = await fetch(`${getApiUrl()}/reviews/${encodeURIComponent(review._id)}`, { method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      return readResponse<ReviewResponse>(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Review deleted successfully.");
      setReviewToDelete(null);
      if (reviews.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["my-business-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["business-dashboard-overview"] });
    },
    onError: (error) => {
      setReviewToDelete(null);
      toast.error(error.message);
    },
  });

  const isLoading = sessionStatus === "loading" || (Boolean(token) && reviewsQuery.isPending);

  return (
    <>
      <section>
        {isLoading ? <SummarySkeleton /> : summary ? <ReviewSummaryCard summary={summary} selectedRating={rating} onRatingChange={(value) => { setRating(value); setPage(1); }} /> : null}

        <div className="mb-5 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[340px]"><span className="sr-only">Search reviews on this page</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="h-[36px] w-full rounded-[8px] border-0 bg-[#EAECED] pl-9 pr-4 text-xs text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20" /></label>
          <p className="text-xs text-[#667085]">Showing {rating}-star reviews</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[250px] rounded-[8px]" />)}</div>
        ) : reviewsQuery.isError || !token ? (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center"><p className="text-sm text-red-600">{reviewsQuery.error instanceof Error ? reviewsQuery.error.message : "Please sign in to view your reviews."}</p>{token && <button type="button" onClick={() => reviewsQuery.refetch()} className="mt-3 text-sm font-semibold text-[#30347F] hover:underline">Try again</button>}</div>
        ) : filteredReviews.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredReviews.map((review) => (
              <article key={review._id} className="relative flex min-h-[230px] flex-col rounded-[8px] bg-white px-5 py-5">
                <button type="button" disabled={deleteMutation.isPending} aria-label={`Delete review from ${review.reviewerName}`} onClick={() => setReviewToDelete(review)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6] disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                <div className="flex items-center gap-0.5 pr-11" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-[#FFB000] text-[#FFB000]" : "fill-[#E4E7EC] text-[#E4E7EC]"}`} />)}</div>
                <p className="mt-3 text-[13px] leading-[1.6] text-[#41444A]">“{review.message}”</p>

                {review.reply && <div className="mt-3 rounded-md bg-[#F5F7FF] p-3"><div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#30347F]"><MessageSquareReply className="h-3.5 w-3.5" />Reply from {review.reply.repliedByName}</div><p className="mt-1 text-[11px] leading-5 text-[#5F6368]">{review.reply.message}</p><time className="mt-1 block text-[9px] text-[#98A2B3]">{formatDate(review.reply.repliedAt)}</time></div>}

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAECF0]">
                    {review.reviewerAvatar ? <Image src={review.reviewerAvatar} alt={review.reviewerName} fill className="object-cover" /> : <span className="text-sm font-semibold text-[#667085]">{review.reviewerName.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-[#30347F]">{review.reviewerName}</h2><p className="truncate text-[11px] text-[#7A8190]">Reviewed {review.businessName} · {formatDate(review.createdAt)}</p></div>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">{search ? "No matching reviews found on this page." : `No ${rating}-star reviews found.`}</div>}

        {!isLoading && !reviewsQuery.isError && totalPages > 1 && <div className="mt-6 flex items-center justify-between rounded-[7px] bg-white px-4 py-3"><p className="text-xs text-[#667085]">Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}</p><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page === 1 || reviewsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="text-xs font-medium">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page >= totalPages || reviewsQuery.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>}
      </section>

      <DeleteModal isOpen={Boolean(reviewToDelete)} onClose={() => !deleteMutation.isPending && setReviewToDelete(null)} onConfirm={() => reviewToDelete && !deleteMutation.isPending && deleteMutation.mutate(reviewToDelete)} title={deleteMutation.isPending ? "Deleting Review..." : "Delete Review?"} desc={`Are you sure you want to delete ${reviewToDelete?.reviewerName || "this user's"} review?`} />
    </>
  );
}

function ReviewSummaryCard({ summary, selectedRating, onRatingChange }: { summary: ReviewSummary; selectedRating: number; onRatingChange: (rating: number) => void }) {
  const maxCount = Math.max(1, ...Object.values(summary.ratingBreakdown));
  return <div className="rounded-[8px] bg-white p-5"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="shrink-0 text-center sm:w-40"><p className="text-4xl font-bold text-[#30347F]">{summary.averageRating.toFixed(1)}</p><div className="mt-2 flex justify-center gap-0.5">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < Math.round(summary.averageRating) ? "fill-[#FFB000] text-[#FFB000]" : "fill-[#E4E7EC] text-[#E4E7EC]"}`} />)}</div><p className="mt-1 text-xs text-[#667085]">{summary.totalReviews} total reviews</p></div><div className="w-full space-y-2">{[5, 4, 3, 2, 1].map((value) => { const count = summary.ratingBreakdown[String(value) as keyof ReviewSummary["ratingBreakdown"]] || 0; return <button type="button" key={value} onClick={() => onRatingChange(value)} className={`grid w-full grid-cols-[34px_1fr_28px] items-center gap-2 rounded px-2 py-1 text-xs ${selectedRating === value ? "bg-[#F3F4FA] text-[#30347F]" : "text-[#667085] hover:bg-[#F9FAFB]"}`}><span>{value} ★</span><span className="h-2 overflow-hidden rounded-full bg-[#EAECF0]"><span className="block h-full rounded-full bg-[#FFB000]" style={{ width: `${(count / maxCount) * 100}%` }} /></span><span className="text-right">{count}</span></button>; })}</div></div></div>;
}

function SummarySkeleton() {
  return <div className="flex gap-5 rounded-[8px] bg-white p-5"><Skeleton className="h-24 w-40" /><div className="flex-1 space-y-2">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-4 w-full" />)}</div></div>;
}

export default ReviewsPage;
