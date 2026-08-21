"use client";

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
  LayoutGrid,
  List,
  MessageSquareReply,
  Pencil,
  Star,
  Trash2,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AccountPageShell, AccountSectionHeader } from "../../_components/account-ui";

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
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Edit / Delete State
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editMessage, setEditMessage] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

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

  // Edit Review Mutation (PUT /reviews/:id)
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      rating,
      message,
    }: {
      id: string;
      rating: number;
      message: string;
    }) => {
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1"
      ).replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/reviews/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update review.");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Review updated successfully!");
      setEditingReview(null);
      queryClient.invalidateQueries({ queryKey: ["account-my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["business-reviews"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete Review Mutation (DELETE /reviews/:id)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1"
      ).replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/reviews/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete review.");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Review deleted successfully!");
      setReviewToDelete(null);
      if (reviews.length === 1 && page > 1) setPage((prev) => prev - 1);
      queryClient.invalidateQueries({ queryKey: ["account-my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["business-reviews"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditMessage(review.message);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editMessage.trim()) {
      toast.error("Please enter a review message.");
      return;
    }
    updateMutation.mutate({
      id: editingReview._id,
      rating: editRating,
      message: editMessage.trim(),
    });
  };

  return (
    <AccountPageShell active="my-reviews" showProfileCard={false}>
      <AccountSectionHeader
        title="My Reviews"
        description="See the feedback you have shared with local businesses."
        count={!isLoading && status === "authenticated" ? `${total} total` : undefined}
        action={
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
        }
      />

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
                className={`relative rounded-[8px] border border-[#E8ECF2] bg-white p-5 shadow-[0_8px_24px_rgba(30,45,75,0.10)] ${
                  viewMode === "list"
                    ? "sm:grid sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-6"
                    : ""
                }`}
              >
                {/* Action Buttons: Edit & Delete */}
                <div className="absolute right-4 top-4 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => openEditModal(review)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E4E7EC] bg-slate-50 text-slate-600 transition-colors hover:bg-indigo-50 hover:text-[#292D73] hover:border-indigo-200"
                    title="Edit review"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewToDelete(review)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    title="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-3 pr-16">
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

                  {review.reply && (
                    <div className="mt-3.5 rounded-lg bg-[#F5F7FF] border border-[#E0E7FF] p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#292D73]">
                        <MessageSquareReply className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>Response from {review.reply.repliedByName}</span>
                      </div>
                      <p className="mt-1 text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {review.reply.message}
                      </p>
                      <time className="mt-1.5 block text-[10px] text-slate-400 font-medium">
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                          new Date(review.reply.repliedAt)
                        )}
                      </time>
                    </div>
                  )}
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

      {/* EDIT REVIEW MODAL */}
      <Dialog open={Boolean(editingReview)} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent className="max-h-[90vh] max-w-[480px] overflow-y-auto rounded-[16px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#292D73] flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#292D73]" />
              Edit Your Review
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Updating feedback for <span className="font-semibold text-slate-800">{editingReview?.businessName}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }, (_, idx) => {
                  const starVal = idx + 1;
                  return (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setEditRating(starVal)}
                      className="p-1 text-amber-400 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          starVal <= editRating
                            ? "fill-[#FFB800] text-[#FFB800]"
                            : "fill-transparent text-gray-300"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-sm font-bold text-[#292D73]">
                  {editRating}.0 / 5.0
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Feedback Message <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="Write your experience..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#292D73]/20 focus:border-[#292D73]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-5 py-2 text-xs font-bold text-white bg-[#292D73] hover:bg-[#1f2359] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60 transition-colors"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                <span>{updateMutation.isPending ? "Updating..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE REVIEW MODAL */}
      <Dialog open={Boolean(reviewToDelete)} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="max-w-[420px] rounded-[16px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Delete Review?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-1">
              Are you sure you want to delete your review for{" "}
              <strong className="text-slate-800">{reviewToDelete?.businessName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => setReviewToDelete(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => reviewToDelete && deleteMutation.mutate(reviewToDelete._id)}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60 transition-colors"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              <span>{deleteMutation.isPending ? "Deleting..." : "Delete Review"}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AccountPageShell>
  );
};

export default MyReviewsContainer;
