"use client";

import { useBusinessReviews } from "@/hooks/use-business-profile-sections";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, BadgeCheck, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type BusinessReviewsProps = {
  businessId: string;
};

const renderStars = (rating: number, className = "h-4 w-4") =>
  Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`${className} ${
        index < rating ? "fill-[#FFB800] text-[#FFB800]" : "text-[#D9DEE7]"
      }`}
    />
  ));

const BusinessReviews = ({ businessId }: BusinessReviewsProps) => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useBusinessReviews(businessId);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const summary = data?.data.summary;
  const reviews = data?.data.reviews ?? [];
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count =
      summary?.ratingBreakdown[String(stars) as "1" | "2" | "3" | "4" | "5"] ??
      0;
    return {
      stars,
      percent: summary?.totalReviews
        ? Math.round((count / summary.totalReviews) * 100)
        : 0,
    };
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in to submit a review.");
      if (!message.trim()) throw new Error("Please write your review.");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The reviews API is not configured.");
      const response = await fetch(`${apiUrl}/reviews`, {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessId, rating, message: message.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your review.");
      }
      return result;
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Review submitted successfully.");
      setMessage("");
      setRating(5);
      await queryClient.invalidateQueries({
        queryKey: ["business-reviews", businessId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["public-business", businessId],
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit your review.",
      ),
  });

  const handleReviewSubmit = () => {
    if (!token) {
      setIsSignInModalOpen(true);
      return;
    }

    reviewMutation.mutate();
  };

  const handleSignIn = () => {
    const callbackUrl = `/services/businesses/${businessId}?tab=reviews`;
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  if (isPending)
    return (
      <div className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-8 text-[13px] text-[#667085]">
        Loading reviews...
      </div>
    );
  if (isError || !summary)
    return (
      <div className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-8 text-[13px] text-red-600">
        Unable to load reviews.
      </div>
    );

  return (
    <div className="space-y-5">
      <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
        <div className="grid gap-5 sm:grid-cols-[90px_minmax(0,1fr)] sm:items-center">
          <div>
            <p className="text-[34px] font-extrabold leading-none text-[#292D73]">
              {summary.averageRating.toFixed(1)}
            </p>
            <div className="mt-3 flex items-center gap-[1px]">
              {renderStars(Math.round(summary.averageRating), "h-3.5 w-3.5")}
            </div>
            <p className="mt-1 text-[11px] font-medium text-[#667085]">
              {summary.totalReviews} reviews
            </p>
          </div>

          <div className="space-y-2">
            {distribution.map((item) => (
              <div
                key={item.stars}
                className="grid grid-cols-[18px_12px_minmax(0,1fr)_32px] items-center gap-2 text-[11px] font-medium text-[#667085]"
              >
                <span>{item.stars}</span>
                <Star className="h-3 w-3 fill-[#FFB800] text-[#FFB800]" />
                <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-[#5367E8]"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-right">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="space-y-5">
        {reviews.map((review) => (
          <article
            key={review._id}
            className="rounded-[8px] border border-[#E1E7EC] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(17,24,39,0.03)] sm:px-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF2F7] text-xs font-bold text-[#292D73]">
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
                  <div className="flex items-center gap-1">
                    <h3 className="truncate text-[14px] font-extrabold leading-tight text-[#292D73]">
                      {review.reviewerName}
                    </h3>
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#4E67D8]" />
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium text-[#667085]">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(review.createdAt))}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-[1px]">
                {renderStars(review.rating, "h-3.5 w-3.5")}
              </div>
            </div>

            <p className="mt-3 text-[13px] font-medium leading-[1.45] text-[#172033]">
              {review.message}
            </p>
          </article>
        ))}
      </div>

      <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)] sm:px-5">
        <h2 className="text-[20px] font-extrabold leading-tight text-[#292D73]">
          Write a review
        </h2>
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setRating(index + 1)}
              aria-label={`Rate ${index + 1} stars`}
            >
              <Star
                className={`h-6 w-6 ${index < rating ? "fill-[#FFB800] text-[#FFB800]" : "text-[#D9DEE7]"}`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-4 min-h-[126px] w-full resize-none rounded-[5px] border border-[#B8C0CC] px-4 py-3 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#999999] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
          placeholder="Oh my man this is incredible, I never get a service as fast as like this..."
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setRating(5);
            }}
            className="h-9 rounded-[6px] border border-[#8290A3] bg-white px-5 text-[13px] font-medium text-[#344054] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReviewSubmit}
            disabled={
              reviewMutation.isPending || sessionStatus === "loading"
            }
            className="h-9 rounded-[6px] bg-[#292D73] px-6 text-[13px] font-bold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
          >
            {reviewMutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </article>

      <Dialog open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen}>
        <DialogContent className="max-w-[92%] rounded-[14px] border-0 bg-white p-6 sm:max-w-[430px]">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF0FF] text-[#292D73]">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-extrabold leading-tight text-[#292D73]">
              Sign in to write a review
            </DialogTitle>
            <DialogDescription className="pt-2 text-[13px] leading-5 text-[#667085]">
              You need to sign in before you can submit a review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 grid grid-cols-2 gap-3 sm:space-x-0">
            <button
              type="button"
              onClick={() => setIsSignInModalOpen(false)}
              className="h-10 rounded-[6px] border border-[#B8C0CC] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSignIn}
              className="h-10 rounded-[6px] bg-[#292D73] px-4 text-[13px] font-bold text-white transition hover:bg-[#20255F]"
            >
              Sign In
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessReviews;
