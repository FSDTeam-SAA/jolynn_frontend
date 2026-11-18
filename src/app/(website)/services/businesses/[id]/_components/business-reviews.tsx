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
import {
  Star,
  BadgeCheck,
  LogIn,
  MessageSquareReply,
  Pencil,
  Trash2,
  Loader2,
  Reply,
  Send,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BusinessReviewsProps = {
  businessId: string;
};

type ReviewReply = {
  message: string;
  repliedById: string;
  repliedByName: string;
  repliedAt: string;
};

type BusinessReviewItem = {
  _id: string;
  businessId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  message: string;
  photo?: string;
  photos?: string[];
  images?: Array<string | { url: string; publicId?: string }>;
  image?: string;
  createdAt: string;
  reply?: ReviewReply;
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
  
  // Customer Review Write State
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const clearSelectedImages = () => {
    selectedImages.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setSelectedImages([]);
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, [selectedImages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    if (selectedImages.length + files.length > 5) {
      toast.error("You can upload up to 5 images.");
      e.target.value = "";
      return;
    }

    const validImages: { file: File; previewUrl: string }[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5 MB size limit.`);
        continue;
      }
      validImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedImages((prev) => [...prev, ...validImages]);
    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) => {
      const target = prev[indexToRemove];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Customer Edit / Delete State
  const [editingReview, setEditingReview] = useState<BusinessReviewItem | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editMessage, setEditMessage] = useState("");
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [reviewToDelete, setReviewToDelete] = useState<BusinessReviewItem | null>(null);

  const closeEditModal = () => {
    editNewImages.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setEditNewImages([]);
    setEditExistingImages([]);
    setEditingReview(null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const totalCount =
      editExistingImages.length + editNewImages.length + files.length;
    if (totalCount > 5) {
      toast.error("You can have up to 5 photos in total.");
      e.target.value = "";
      return;
    }

    const validImages: { file: File; previewUrl: string }[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5 MB size limit.`);
        continue;
      }
      validImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setEditNewImages((prev) => [...prev, ...validImages]);
    e.target.value = "";
  };

  const removeExistingEditImage = (urlToRemove: string) => {
    setEditExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const removeNewEditImage = (indexToRemove: number) => {
    setEditNewImages((prev) => {
      const target = prev[indexToRemove];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Business Owner Reply State
  const [replyingReview, setReplyingReview] = useState<BusinessReviewItem | null>(null);
  const [replyMessageText, setReplyMessageText] = useState("");

  const sessionUser = session?.user as
    | { id?: string; name?: string; email?: string; role?: string; token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  
  // Check if logged-in user is the owner of THIS specific business
  const isBusinessOwnerOfThisProfile = Boolean(
    token && sessionUser?.id && sessionUser.id === businessId
  );

  const summary = data?.data.summary;
  const reviews = (data?.data.reviews ?? []) as BusinessReviewItem[];

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

  // 1. Create Review Mutation (Customer)
  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in to submit a review.");
      if (!message.trim()) throw new Error("Please write your review.");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1").replace(/\/$/, "");

      let response: Response;

      if (selectedImages.length > 0) {
        const formData = new FormData();
        formData.append("businessId", businessId);
        formData.append("rating", String(rating));
        formData.append("message", message.trim());
        selectedImages.forEach(({ file }) => {
          formData.append("photo", file, file.name);
        });

        response = await fetch(`${apiUrl}/reviews`, {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok && response.status === 415) {
          response = await fetch(`${apiUrl}/reviews`, {
            method: "POST",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ businessId, rating, message: message.trim() }),
          });
        }
      } else {
        response = await fetch(`${apiUrl}/reviews`, {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ businessId, rating, message: message.trim() }),
        });
      }

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
      clearSelectedImages();
      await queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["public-business", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["account-my-reviews"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to submit your review."
      ),
  });

  // 2. Edit Review Mutation (Customer)
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      rating: newRating,
      message: newMessage,
      existingPhotos,
      newPhotos,
    }: {
      id: string;
      rating: number;
      message: string;
      existingPhotos: string[];
      newPhotos: File[];
    }) => {
      if (!token) throw new Error("Unauthorized");
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1"
      ).replace(/\/$/, "");

      let response: Response;

      if (newPhotos.length > 0 || existingPhotos.length > 0) {
        const formData = new FormData();
        formData.append("rating", String(newRating));
        formData.append("message", newMessage);
        existingPhotos.forEach((url) => formData.append("photos", url));
        if (existingPhotos[0]) formData.append("photo", existingPhotos[0]);
        newPhotos.forEach((file) => {
          formData.append("photo", file, file.name);
        });

        response = await fetch(`${apiUrl}/reviews/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok && response.status === 415) {
          response = await fetch(`${apiUrl}/reviews/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rating: newRating,
              message: newMessage,
              photos: existingPhotos,
              photo: existingPhotos[0] || "",
            }),
          });
        }
      } else {
        response = await fetch(`${apiUrl}/reviews/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: newRating,
            message: newMessage,
            photos: [],
            photo: "",
          }),
        });
      }

      const resData = await response.json().catch(() => ({}));
      if (!response.ok || !resData?.success) {
        throw new Error(resData?.message || "Failed to update review.");
      }
      return resData;
    },
    onSuccess: async (resData) => {
      toast.success(resData?.message || "Review updated successfully!");
      closeEditModal();
      await queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["public-business", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["account-my-reviews"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // 3. Delete Review Mutation (Customer)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Unauthorized");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/reviews/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData?.success) {
        throw new Error(resData?.message || "Failed to delete review.");
      }
      return resData;
    },
    onSuccess: async (resData) => {
      toast.success(resData?.message || "Review deleted successfully!");
      setReviewToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["public-business", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["account-my-reviews"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // 4. Business Owner Submit / Update Reply Mutation (PUT /reviews/:id/reply)
  const ownerReplyMutation = useMutation({
    mutationFn: async ({ reviewId, replyText }: { reviewId: string; replyText: string }) => {
      if (!token) throw new Error("Unauthorized");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/reviews/${encodeURIComponent(reviewId)}/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyText }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData?.success) {
        throw new Error(resData?.message || "Failed to submit reply.");
      }
      return resData;
    },
    onSuccess: async (resData) => {
      toast.success(resData?.message || "Reply submitted successfully!");
      setReplyingReview(null);
      setReplyMessageText("");
      await queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["public-business", businessId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // 5. Business Owner Delete Reply Mutation (DELETE /reviews/:id/reply)
  const ownerDeleteReplyMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!token) throw new Error("Unauthorized");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://api.sidequote.cloud/api/v1").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/reviews/${encodeURIComponent(reviewId)}/reply`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData?.success) {
        throw new Error(resData?.message || "Failed to remove reply.");
      }
      return resData;
    },
    onSuccess: async (resData) => {
      toast.success(resData?.message || "Reply removed successfully!");
      setReplyingReview(null);
      setReplyMessageText("");
      await queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      await queryClient.invalidateQueries({ queryKey: ["public-business", businessId] });
    },
    onError: (err: Error) => toast.error(err.message),
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

  const openEditModal = (review: BusinessReviewItem) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditMessage(review.message);
    const existing = Array.from(
      new Set(
        [
          ...(Array.isArray(review.photos)
            ? review.photos
            : review.photo
              ? [review.photo]
              : []),
          ...(Array.isArray(review.images)
            ? review.images.map((img) =>
                typeof img === "string" ? img : img.url,
              )
            : review.image
              ? [review.image]
              : []),
        ].filter(Boolean) as string[],
      ),
    );
    setEditExistingImages(existing);
    editNewImages.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setEditNewImages([]);
  };

  const handleCustomerUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editMessage.trim()) {
      toast.error("Please enter a review message.");
      return;
    }
    updateMutation.mutate({
      id: editingReview._id,
      rating: editRating,
      message: editMessage.trim(),
      existingPhotos: editExistingImages,
      newPhotos: editNewImages.map((img) => img.file),
    });
  };

  const openOwnerReplyModal = (review: BusinessReviewItem) => {
    setReplyingReview(review);
    setReplyMessageText(review.reply?.message || "");
  };

  const handleOwnerReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyMessageText.trim()) {
      toast.error("Please enter your reply message.");
      return;
    }
    ownerReplyMutation.mutate({
      reviewId: replyingReview._id,
      replyText: replyMessageText.trim(),
    });
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
      {/* Review Summary Breakdown Header */}
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

      {/* Review List */}
      <div className="space-y-5">
        {reviews?.map((review) => {
          const isOwnReview = Boolean(
            token &&
              ((sessionUser?.id && review.reviewerId === sessionUser.id) ||
                (sessionUser?.name && review.reviewerName === sessionUser.name))
          );

          return (
            <article
              key={review._id}
              className="relative rounded-[8px] border border-[#E1E7EC] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(17,24,39,0.03)] sm:px-5"
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="truncate text-[14px] font-extrabold leading-tight text-[#292D73]">
                        {review.reviewerName}
                      </h3>
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#4E67D8]" />
                      {isOwnReview && (
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-[#292D73] border border-indigo-100">
                          You
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] font-medium text-[#667085]">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(review.createdAt))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-[1px]">
                    {renderStars(review.rating, "h-3.5 w-3.5")}
                  </div>

                  {/* Customer Edit & Delete buttons if logged in user owns this review */}
                  {isOwnReview && (
                    <div className="flex items-center gap-1">
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
                  )}

                  {/* Business Owner Reply Button if logged in user is owner of THIS business profile */}
                  {isBusinessOwnerOfThisProfile && (
                    <button
                      type="button"
                      onClick={() => openOwnerReplyModal(review)}
                      className={`inline-flex h-7 px-2.5 items-center gap-1 rounded-md text-[11px] font-bold transition-colors shrink-0 ${
                        review.reply
                          ? "bg-indigo-50 text-[#292D73] border border-indigo-200 hover:bg-indigo-100"
                          : "bg-[#292D73] text-white hover:bg-[#1f2359] shadow-xs"
                      }`}
                      title={review.reply ? "Edit reply" : "Reply to review"}
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>{review.reply ? "Edit Reply" : "Reply"}</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3 text-[13px] font-medium leading-[1.45] text-[#172033]">
                {review.message}
              </p>

              {/* Display review photos if present */}
              {(() => {
                const reviewImages = [
                  ...(Array.isArray(review.photos)
                    ? review.photos
                    : review.photo
                      ? [review.photo]
                      : []),
                  ...(Array.isArray(review.images)
                    ? review.images.map((img) =>
                        typeof img === "string" ? img : img.url,
                      )
                    : review.image
                      ? [review.image]
                      : []),
                ].filter(Boolean) as string[];
                const uniquePhotos = Array.from(new Set(reviewImages));
                if (!uniquePhotos.length) return null;
                return (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {uniquePhotos.map((imgUrl, imgIdx) => (
                      <a
                        key={imgIdx}
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#E1E7EC] bg-slate-50 transition hover:opacity-90 hover:ring-2 hover:ring-[#292D73] sm:h-20 sm:w-20"
                      >
                        <Image
                          src={imgUrl}
                          alt="Review attachment"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </a>
                    ))}
                  </div>
                );
              })()}

              {/* Display Reply if exists */}
              {review.reply && (
                <div className="mt-3.5 rounded-lg bg-[#F5F7FF] border border-[#E0E7FF] p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#292D73] text-[12px]">
                      <MessageSquareReply className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>Response from {review.reply.repliedByName}</span>
                    </div>

                    {/* Quick Edit Reply button for Owner directly on reply box */}
                    {isBusinessOwnerOfThisProfile && (
                      <button
                        type="button"
                        onClick={() => openOwnerReplyModal(review)}
                        className="text-[11px] font-bold text-[#292D73] hover:underline"
                      >
                        Edit Reply
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {review.reply.message}
                  </p>
                  <time className="mt-1.5 block text-[10px] text-slate-400 font-medium">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                      new Date(review.reply.repliedAt)
                    )}
                  </time>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Write a review section (Hidden if viewer is the business owner of this profile) */}
      {!isBusinessOwnerOfThisProfile && (
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

          {/* Add Photos Section with Beautiful Preview */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#292D73]">
                Add Photos <span className="font-normal text-[#667085]">(Optional)</span>
              </label>
              {selectedImages.length > 0 && (
                <span className="text-[11px] font-medium text-[#667085]">
                  {selectedImages.length} of 5 selected
                </span>
              )}
            </div>

            {selectedImages.length === 0 ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D0D5DD] bg-[#F8FAFC] p-4 text-center transition hover:border-[#292D73] hover:bg-[#F3F5FC]">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  multiple
                  onChange={handleImageChange}
                  className="sr-only"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF0FF] text-[#292D73]">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-bold text-[#292D73]">
                  Click to upload photos or drag and drop
                </p>
                <p className="mt-0.5 text-[11px] text-[#667085]">
                  PNG, JPG, or WEBP (Max 5 MB each, up to 5 photos)
                </p>
              </label>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {selectedImages.map(({ file, previewUrl }, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[#DCE4F0] bg-slate-50 shadow-xs"
                    >
                      <Image
                        src={previewUrl}
                        alt={file.name}
                        fill
                        unoptimized
                        className="object-cover transition duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-90" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-red-600"
                        title="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <p className="absolute bottom-1.5 left-2 right-2 truncate text-[10px] font-medium text-white">
                        {file.name}
                      </p>
                    </div>
                  ))}

                  {selectedImages.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#D0D5DD] bg-[#F8FAFC] text-center transition hover:border-[#292D73] hover:bg-[#F3F5FC]">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        multiple
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                      <Plus className="h-5 w-5 text-[#292D73]" />
                      <span className="text-[11px] font-bold text-[#292D73]">
                        Add more
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setMessage("");
                setRating(5);
                clearSelectedImages();
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
      )}

      {/* Sign In Required Modal */}
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

      {/* CUSTOMER EDIT REVIEW MODAL */}
      <Dialog open={Boolean(editingReview)} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="max-h-[90vh] max-w-[480px] overflow-y-auto rounded-[16px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#292D73] flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#292D73]" />
              Edit Your Review
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Updating your review rating & message
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCustomerUpdateSubmit} className="space-y-4 mt-3">
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

            {/* Photos (Optional) in Edit Modal */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Photos <span className="font-normal text-slate-500">(Optional)</span>
                </label>
                {editExistingImages.length + editNewImages.length > 0 && (
                  <span className="text-[11px] font-medium text-[#667085]">
                    {editExistingImages.length + editNewImages.length} of 5 photos
                  </span>
                )}
              </div>

              {editExistingImages.length === 0 && editNewImages.length === 0 ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D0D5DD] bg-[#F8FAFC] p-4 text-center transition hover:border-[#292D73] hover:bg-[#F3F5FC]">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    multiple
                    onChange={handleEditImageChange}
                    className="sr-only"
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF0FF] text-[#292D73]">
                    <UploadCloud className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#292D73]">
                    Click to upload photos
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#667085]">
                    PNG, JPG, or WEBP (Max 5 MB each, up to 5 photos)
                  </p>
                </label>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {/* Existing Photos */}
                    {editExistingImages.map((url, idx) => (
                      <div
                        key={`existing-${idx}-${url}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs"
                      >
                        <Image
                          src={url}
                          alt={`Review photo ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />
                        <button
                          type="button"
                          onClick={() => removeExistingEditImage(url)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-red-600"
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1.5 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">
                          Current
                        </span>
                      </div>
                    ))}

                    {/* New Added Photos */}
                    {editNewImages.map(({ file, previewUrl }, idx) => (
                      <div
                        key={`new-${idx}-${file.name}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-indigo-200 bg-slate-50 shadow-xs"
                      >
                        <Image
                          src={previewUrl}
                          alt={file.name}
                          fill
                          unoptimized
                          className="object-cover transition duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />
                        <button
                          type="button"
                          onClick={() => removeNewEditImage(idx)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-red-600"
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1.5 rounded bg-[#292D73]/90 px-1 py-0.5 text-[9px] font-semibold text-white">
                          New
                        </span>
                      </div>
                    ))}

                    {/* Add More Tile if < 5 */}
                    {editExistingImages.length + editNewImages.length < 5 && (
                      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#D0D5DD] bg-[#F8FAFC] text-center transition hover:border-[#292D73] hover:bg-[#F3F5FC]">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          multiple
                          onChange={handleEditImageChange}
                          className="sr-only"
                        />
                        <Plus className="h-5 w-5 text-[#292D73]" />
                        <span className="text-[11px] font-bold text-[#292D73]">
                          Add more
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeEditModal}
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

      {/* CUSTOMER DELETE REVIEW MODAL */}
      <Dialog open={Boolean(reviewToDelete)} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="max-w-[420px] rounded-[16px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Delete Review?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-1">
              Are you sure you want to delete your review? This action cannot be undone.
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

      {/* BUSINESS OWNER REPLY MODAL */}
      <Dialog open={Boolean(replyingReview)} onOpenChange={(open) => !open && setReplyingReview(null)}>
        <DialogContent className="max-h-[90vh] max-w-[500px] overflow-y-auto rounded-[16px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#292D73] flex items-center gap-2">
              <Reply className="w-5 h-5 text-[#292D73]" />
              {replyingReview?.reply ? "Edit Your Response" : "Reply to Customer Review"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Responding to review from <span className="font-semibold text-slate-800">{replyingReview?.reviewerName}</span>
            </DialogDescription>
          </DialogHeader>

          {replyingReview && (
            <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700">
              <div className="flex items-center justify-between gap-2 font-bold text-slate-800 mb-1">
                <span>{replyingReview.reviewerName}</span>
                <div className="flex items-center gap-1">
                  {renderStars(replyingReview.rating, "h-3 w-3")}
                </div>
              </div>
              <p className="line-clamp-3 text-slate-600 italic">“{replyingReview.message}”</p>
            </div>
          )}

          <form onSubmit={handleOwnerReplySubmit} className="space-y-4 mt-3">
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
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#292D73]/20 focus:border-[#292D73]"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {replyingReview?.reply ? (
                <button
                  type="button"
                  onClick={() => {
                    if (replyingReview) {
                      ownerDeleteReplyMutation.mutate(replyingReview._id);
                    }
                  }}
                  disabled={ownerDeleteReplyMutation.isPending}
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
                  disabled={ownerReplyMutation.isPending}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#292D73] hover:bg-[#1f2359] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                >
                  {ownerReplyMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{ownerReplyMutation.isPending ? "Submitting..." : "Submit Reply"}</span>
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessReviews;
