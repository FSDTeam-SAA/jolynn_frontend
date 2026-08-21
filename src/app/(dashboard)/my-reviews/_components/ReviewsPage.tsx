"use client";

import DeleteModal from "@/components/modals/delete-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  MessageSquareReply,
  Reply,
  Search,
  Send,
  Star,
  Trash2,
  Loader2,
} from "lucide-react";
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
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
  const [rating, setRating] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Reply Modal & Form State
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyMessageText, setReplyMessageText] = useState("");

  const reviewsQuery = useQuery<ReviewsResponse>({
    queryKey: ["my-business-reviews", page, rating],
    queryFn: async () => {
      if (!token) throw new Error("Please sign in to view your reviews.");
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT), page: String(page) });
      if (rating !== "all") {
        params.append("rating", String(rating));
      }
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

  // Reply Mutation (PUT /reviews/:id/reply)
  const replyMutation = useMutation<ReviewResponse, Error, { reviewId: string; message: string }>({
    mutationFn: async ({ reviewId, message }) => {
      if (!token) throw new Error("Please sign in to submit a reply.");
      const response = await fetch(`${getApiUrl()}/reviews/${encodeURIComponent(reviewId)}/reply`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      return readResponse<ReviewResponse>(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Reply submitted successfully.");
      setReplyingReview(null);
      setReplyMessageText("");
      await queryClient.invalidateQueries({ queryKey: ["my-business-reviews"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete Reply Mutation (DELETE /reviews/:id/reply)
  const deleteReplyMutation = useMutation<ReviewResponse, Error, string>({
    mutationFn: async (reviewId) => {
      if (!token) throw new Error("Please sign in to remove reply.");
      const response = await fetch(`${getApiUrl()}/reviews/${encodeURIComponent(reviewId)}/reply`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return readResponse<ReviewResponse>(response);
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Reply removed successfully.");
      await queryClient.invalidateQueries({ queryKey: ["my-business-reviews"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const openReplyModal = (review: Review) => {
    setReplyingReview(review);
    setReplyMessageText(review.reply?.message || "");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyMessageText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    replyMutation.mutate({
      reviewId: replyingReview._id,
      message: replyMessageText.trim(),
    });
  };

  const isLoading = sessionStatus === "loading" || (Boolean(token) && reviewsQuery.isPending);

  return (
    <>
      <section>
        {isLoading ? (
          <SummarySkeleton />
        ) : summary ? (
          <ReviewSummaryCard
            summary={summary}
            selectedRating={rating}
            onRatingChange={(value) => {
              setRating(value);
              setPage(1);
            }}
          />
        ) : null}

        <div className="mb-5 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[340px]">
            <span className="sr-only">Search reviews on this page</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-[36px] w-full rounded-[8px] border-0 bg-[#EAECED] pl-9 pr-4 text-xs text-[#344054] outline-none placeholder:text-[#667085] focus:ring-2 focus:ring-[#30347F]/20"
            />
          </label>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-xs text-[#667085]">
              Showing {rating === "all" ? "all" : `${rating}-star`} reviews
            </p>
            <div className="flex rounded-[7px] border border-[#D0D5DD] bg-white p-1" aria-label="Review view">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                aria-label="Card view"
                aria-pressed={viewMode === "card"}
                className={`flex h-7 w-8 items-center justify-center rounded-[4px] transition-colors ${
                  viewMode === "card" ? "bg-[#30347F] text-white" : "text-[#667085] hover:bg-[#F3F4FA]"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`flex h-7 w-8 items-center justify-center rounded-[4px] transition-colors ${
                  viewMode === "list" ? "bg-[#30347F] text-white" : "text-[#667085] hover:bg-[#F3F4FA]"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[250px] rounded-[8px]" />
            ))}
          </div>
        ) : reviewsQuery.isError || !token ? (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center">
            <p className="text-sm text-red-600">
              {reviewsQuery.error instanceof Error ? reviewsQuery.error.message : "Please sign in to view your reviews."}
            </p>
            {token && (
              <button type="button" onClick={() => reviewsQuery.refetch()} className="mt-3 text-sm font-semibold text-[#30347F] hover:underline">
                Try again
              </button>
            )}
          </div>
        ) : filteredReviews.length && viewMode === "card" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredReviews.map((review) => (
              <article key={review._id} className="relative flex min-h-[250px] flex-col rounded-[8px] bg-white px-5 py-5 border border-slate-100 shadow-xs">
                {/* Action Buttons Header */}
                <div className="absolute right-4 top-4 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openReplyModal(review)}
                    className={`inline-flex h-8 px-2.5 items-center justify-center gap-1 rounded-[4px] font-bold text-[11px] transition-colors whitespace-nowrap shrink-0 ${
                      review.reply
                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                        : "bg-[#30347F] text-white hover:bg-[#252968] shadow-sm"
                    }`}
                    title={review.reply ? "Edit reply" : "Reply to review"}
                  >
                    <Reply className="h-3.5 w-3.5" />
                    <span>{review.reply ? "Edit Reply" : "Reply"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    aria-label={`Delete review from ${review.reviewerName}`}
                    onClick={() => setReviewToDelete(review)}
                    className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6] disabled:opacity-50"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 pr-28" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-[#FFB000] text-[#FFB000]" : "fill-[#E4E7EC] text-[#E4E7EC]"}`} />
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-[1.6] text-[#41444A]">“{review.message}”</p>

                {review.reply && (
                  <div className="mt-3.5 rounded-xl bg-[#F5F7FF] border border-[#E0E7FF] p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#30347F]">
                        <MessageSquareReply className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Replied by {review.reply.repliedByName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteReplyMutation.mutate(review._id)}
                        disabled={deleteReplyMutation.isPending}
                        className="text-[10px] font-semibold text-red-500 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-[11px] leading-5 text-[#5F6368] whitespace-pre-wrap">“{review.reply.message}”</p>
                    <time className="block text-[9px] text-[#98A2B3]">{formatDate(review.reply.repliedAt)}</time>
                  </div>
                )}

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAECF0]">
                    {review.reviewerAvatar ? (
                      <Image src={review.reviewerAvatar} alt={review.reviewerName} fill className="object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-[#667085]">{review.reviewerName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-[#30347F]">{review.reviewerName}</h2>
                    <p className="truncate text-[11px] text-[#7A8190]">
                      Reviewed {review.businessName} · {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : filteredReviews.length ? (
          <div className="overflow-hidden rounded-[8px] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#30347F] text-[11px] font-semibold uppercase tracking-wider text-white">
                    <th className="px-5 py-3.5">Reviewer</th>
                    <th className="px-4 py-3.5">Rating</th>
                    <th className="px-4 py-3.5">Review</th>
                    <th className="px-4 py-3.5">Reply</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  {filteredReviews.map((review) => (
                    <tr key={review._id} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAECF0]">
                            {review.reviewerAvatar ? (
                              <Image src={review.reviewerAvatar} alt={review.reviewerName} fill className="object-cover" />
                            ) : (
                              <span className="text-sm font-semibold text-[#667085]">{review.reviewerName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-sm font-semibold text-[#30347F]">{review.reviewerName}</p>
                            <p className="max-w-[180px] truncate text-[11px] text-[#7A8190]">{review.businessName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                          <Star className="h-4 w-4 fill-[#FFB000] text-[#FFB000]" />
                          <span className="text-sm font-semibold text-[#344054]">{review.rating}.0</span>
                        </div>
                      </td>
                      <td className="max-w-[320px] px-4 py-4">
                        <p className="line-clamp-2 text-[13px] leading-5 text-[#41444A]">{review.message}</p>
                      </td>
                      {/* Reply Column */}
                      <td className="max-w-[280px] px-4 py-4">
                        {review.reply ? (
                          <div className="space-y-0.5">
                            <p className="line-clamp-2 text-xs leading-5 font-medium text-[#344054]">
                              “{review.reply.message}”
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-[#667085] font-semibold">
                              <span>Replied by: <span className="text-[#30347F]">{review.reply.repliedByName}</span></span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#98A2B3] italic">No reply yet</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-[#667085]">{formatDate(review.createdAt)}</td>

                      {/* Action Column */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Reply / Edit Reply Action Button */}
                          <button
                            type="button"
                            onClick={() => openReplyModal(review)}
                            className={`inline-flex h-8 px-3 items-center justify-center gap-1.5 rounded-[4px] font-bold text-[11px] transition-colors whitespace-nowrap shrink-0 ${
                              review.reply
                                ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                                : "bg-[#30347F] text-white hover:bg-[#252968] shadow-sm"
                            }`}
                            title={review.reply ? "Edit reply" : "Reply to review"}
                          >
                            <Reply className="h-3.5 w-3.5" />
                            <span>{review.reply ? "Edit Reply" : "Reply"}</span>
                          </button>

                          {/* Delete Review Button */}
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            aria-label={`Delete review from ${review.reviewerName}`}
                            onClick={() => setReviewToDelete(review)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#FFF0EF] text-[#FF4D4F] transition-colors hover:bg-[#FFD9D6] disabled:opacity-50 shrink-0"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-[8px] bg-white px-6 py-14 text-center text-sm text-[#667085]">
            {search ? "No matching reviews found on this page." : rating === "all" ? "No reviews found." : `No ${rating}-star reviews found.`}
          </div>
        )}

        {!isLoading && !reviewsQuery.isError && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-[7px] bg-white px-4 py-3">
            <p className="text-xs text-[#667085]">
              Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page === 1 || reviewsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= totalPages || reviewsQuery.isFetching}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D0D5DD] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* REPLY MODAL */}
      <Dialog open={Boolean(replyingReview)} onOpenChange={(open) => !open && setReplyingReview(null)}>
        <DialogContent className="max-h-[90vh] max-w-[500px] overflow-y-auto rounded-[16px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#30347F] flex items-center gap-2">
              <Reply className="w-5 h-5 text-indigo-600" />
              Reply to Review
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Responding to review from <span className="font-semibold text-slate-800">{replyingReview?.reviewerName}</span>
            </DialogDescription>
          </DialogHeader>

          {replyingReview && (
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 my-1">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < replyingReview.rating ? "fill-[#FFB000] text-[#FFB000]" : "fill-[#E4E7EC] text-[#E4E7EC]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic">“{replyingReview.message}”</p>
            </div>
          )}

          <form onSubmit={handleSendReply} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Response Message <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={replyMessageText}
                onChange={(e) => setReplyMessageText(e.target.value)}
                placeholder="Type your response to this review..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {replyingReview?.reply ? (
                <button
                  type="button"
                  onClick={() => {
                    if (replyingReview) {
                      deleteReplyMutation.mutate(replyingReview._id);
                      setReplyingReview(null);
                    }
                  }}
                  disabled={deleteReplyMutation.isPending}
                  className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Reply</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyMutation.isPending}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#30347F] hover:bg-[#252968] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{replyMutation.isPending ? "Submitting..." : "Submit Reply"}</span>
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={Boolean(reviewToDelete)}
        onClose={() => !deleteMutation.isPending && setReviewToDelete(null)}
        onConfirm={() => reviewToDelete && !deleteMutation.isPending && deleteMutation.mutate(reviewToDelete)}
        title={deleteMutation.isPending ? "Deleting Review..." : "Delete Review?"}
        desc={`Are you sure you want to delete ${reviewToDelete?.reviewerName || "this user's"} review?`}
      />
    </>
  );
}

function ReviewSummaryCard({
  summary,
  selectedRating,
  onRatingChange,
}: {
  summary: ReviewSummary;
  selectedRating: number | "all";
  onRatingChange: (rating: number | "all") => void;
}) {
  const maxCount = Math.max(1, ...Object.values(summary.ratingBreakdown));
  return (
    <div className="rounded-[8px] bg-white p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => onRatingChange("all")}
          className={`shrink-0 text-center sm:w-44 p-3 rounded-xl transition-all cursor-pointer ${
            selectedRating === "all"
              ? "bg-[#30347F]/10 ring-2 ring-[#30347F]"
              : "hover:bg-[#F9FAFB] border border-slate-100"
          }`}
          title="Click to view all reviews"
        >
          <p className="text-4xl font-bold text-[#30347F]">{summary.averageRating.toFixed(1)}</p>
          <div className="mt-2 flex justify-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < Math.round(summary.averageRating) ? "fill-[#FFB000] text-[#FFB000]" : "fill-[#E4E7EC] text-[#E4E7EC]"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-semibold text-[#30347F]">
            {summary.totalReviews} total reviews
          </p>
          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#30347F] text-white">
            {selectedRating === "all" ? "Showing All" : "Filter: All"}
          </span>
        </button>
        <div className="w-full space-y-2">
          {[5, 4, 3, 2, 1].map((value) => {
            const count = summary.ratingBreakdown[String(value) as keyof ReviewSummary["ratingBreakdown"]] || 0;
            const isSelected = selectedRating === value;
            return (
              <button
                type="button"
                key={value}
                onClick={() => onRatingChange(isSelected ? "all" : value)}
                className={`grid w-full grid-cols-[34px_1fr_28px] items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                  isSelected ? "bg-[#F3F4FA] text-[#30347F] font-bold ring-1 ring-[#30347F]/30" : "text-[#667085] hover:bg-[#F9FAFB]"
                }`}
                title={`Filter by ${value}-star reviews`}
              >
                <span>{value} ★</span>
                <span className="h-2 overflow-hidden rounded-full bg-[#EAECF0]">
                  <span className="block h-full rounded-full bg-[#FFB000]" style={{ width: `${(count / maxCount) * 100}%` }} />
                </span>
                <span className="text-right">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="flex gap-5 rounded-[8px] bg-white p-5">
      <Skeleton className="h-24 w-40" />
      <div className="flex-1 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export default ReviewsPage;
