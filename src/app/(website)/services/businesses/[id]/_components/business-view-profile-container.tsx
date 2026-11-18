"use client";

import {
  ArrowLeft,
  Bookmark,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe2,
  LogIn,
  Mail,
  MapPin,
  Phone,
  RotateCw,
  ShieldAlert,
  Star,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import BusinessGallery from "./business-gallery";
import BusinessReviews from "./business-reviews";
import BusinessServices from "./business-services";
import RequestAQuoteModal from "./request-a-quote-modal";
import ReportBusinessModal from "../../_components/report-business-modal";
import { usePublicBusinessProfile } from "@/hooks/use-public-business-profile";
import { useBusinessGallery } from "@/hooks/use-business-profile-sections";
import { useSavedBusinesses } from "@/hooks/use-saved-businesses";
import { useCreateConversation } from "@/hooks/use-messages";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const renderStars = (rating: number) =>
  Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`h-3.5 w-3.5 ${
        index < Math.round(rating)
          ? "fill-[#FFB800] text-[#FFB800]"
          : "text-[#D9DEE7]"
      }`}
    />
  ));

const getEmbeddableUrl = (
  url: string
): {
  embedUrl: string;
  originalUrl: string;
  isConvertedYoutube: boolean;
  isYoutubeMain: boolean;
} => {
  if (!url) {
    return {
      embedUrl: "",
      originalUrl: "",
      isConvertedYoutube: false,
      isYoutubeMain: false,
    };
  }
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          originalUrl: cleanUrl,
          isConvertedYoutube: true,
          isYoutubeMain: false,
        };
      }
      if (host.includes("youtu.be")) {
        const pathId = parsed.pathname.slice(1);
        if (pathId) {
          return {
            embedUrl: `https://www.youtube.com/embed/${pathId}`,
            originalUrl: cleanUrl,
            isConvertedYoutube: true,
            isYoutubeMain: false,
          };
        }
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return {
          embedUrl: cleanUrl,
          originalUrl: cleanUrl,
          isConvertedYoutube: false,
          isYoutubeMain: false,
        };
      }
      return {
        embedUrl: cleanUrl,
        originalUrl: cleanUrl,
        isConvertedYoutube: false,
        isYoutubeMain: true,
      };
    }
  } catch {
    // fallback
  }

  return {
    embedUrl: cleanUrl,
    originalUrl: cleanUrl,
    isConvertedYoutube: false,
    isYoutubeMain: false,
  };
};

const ContactCard = ({
  onOpenQuoteModal,
  onOpenReportModal,
  onOpenMessageFlow,
  onOpenWebsitePreview,
  onToggleSave,
  isSaving,
  isSaved,
  isCreatingMessage,
  business,
}: {
  onOpenQuoteModal: () => void;
  onOpenReportModal: () => void;
  onOpenMessageFlow: () => void;
  onOpenWebsitePreview: () => void;
  onToggleSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
  isCreatingMessage: boolean;
  business: NonNullable<ReturnType<typeof usePublicBusinessProfile>["data"]>;
}) => (
  <aside className="rounded-[10px] border border-[#E1E5EC] bg-white px-4 py-5 shadow-[0_8px_24px_rgba(41,45,115,0.07)] lg:sticky lg:top-6">
    <h2 className="text-center text-[13px] font-extrabold text-[#292D73]">
      Contact {business?.businessName || "N/A"}
    </h2>

    <div className="mt-4 space-y-3">
      {business?.phoneNumber && (
        <Link
          href={`tel:${business?.phoneNumber || "#"}`}
          className="flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#292D73] px-4 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 focus-visible:ring-offset-2"
        >
          <Phone className="h-3.5 w-3.5" />
          {business?.phoneNumber || "N/A"}
        </Link>
      )}

      {business.businessWebsiteUrl && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenWebsitePreview}
            className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#D7DCE5] bg-white px-3 text-[12px] font-bold text-[#344054] transition hover:border-[#292D73]/35 hover:bg-[#F7F7FC] hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/30"
            title="Preview website inline"
          >
            <Globe2 className="h-3.5 w-3.5 text-[#292D73]" />
            <span>Visit Website</span>
            <span className="rounded bg-[#EEF1FF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#292D73]">
              Preview
            </span>
          </button>

          <a
            href={
              business.businessWebsiteUrl.startsWith("http://") ||
              business.businessWebsiteUrl.startsWith("https://")
                ? business.businessWebsiteUrl
                : `https://${business.businessWebsiteUrl}`
            }
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-[#D7DCE5] bg-white text-[#475467] transition hover:border-[#292D73]/35 hover:bg-[#F7F7FC] hover:text-[#292D73]"
            title="Open external website in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Email / Message Button (Triggers POST /messages) */}
      <button
        type="button"
        onClick={onOpenMessageFlow}
        disabled={isCreatingMessage}
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#D7DCE5] bg-white px-4 text-[12px] font-bold text-[#344054] transition hover:border-[#292D73]/35 hover:bg-[#F7F7FC] hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/30 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {isCreatingMessage ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#292D73]" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        {isCreatingMessage ? "Starting Chat..." : "Message"}
      </button>

      <button
        type="button"
        onClick={onOpenReportModal}
        className="flex h-10 w-full cursor-pointer items-center justify-center rounded-[6px] border border-[#F1C7C7] bg-[#FFF8F8] px-4 text-[12px] font-bold text-[#B42318] transition hover:border-[#E7AAAA] hover:bg-[#FFF0EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20]/25 focus-visible:ring-offset-2"
      >
        Report
      </button>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onToggleSave}
          disabled={isSaving}
          aria-pressed={isSaved}
          className={`inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#292D73] px-5 text-[13px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
            isSaved
              ? "bg-[#F0F1FA] text-[#292D73] hover:bg-[#E5E7F5]"
              : "bg-white text-[#292D73] hover:bg-[#F3F4FA]"
          } ${isSaving ? "opacity-60" : ""}`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          {isSaving
            ? isSaved
              ? "Unsaving..."
              : "Saving..."
            : isSaved
            ? "Unsave"
            : "Save"}
        </button>

        <button
          type="button"
          onClick={onOpenQuoteModal}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[6px] bg-[#292D73] px-6 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 focus-visible:ring-offset-2"
        >
          Request a Quote
        </button>
      </div>
    </div>
  </aside>
);

const BusinessProfileSkeleton = () => (
  <main
    className="min-h-screen bg-[#F5F8F7] py-8 sm:py-10"
    aria-label="Loading business profile"
  >
    <div className="container max-w-[1240px] space-y-6">
      {/* Top Profile Card Skeleton (Full Width) */}
      <div className="overflow-hidden rounded-[14px] border border-[#E1E5EC] bg-white shadow-sm">
        <Skeleton className="h-[220px] w-full sm:h-[280px] md:h-[340px]" />
        <div className="relative px-5 pb-6 pt-[76px] sm:px-8 sm:pt-6">
          <div className="absolute -top-[70px] left-5 sm:left-8">
            <Skeleton className="h-[130px] w-[130px] rounded-full border-4 border-white shadow-sm sm:h-[140px] sm:w-[140px]" />
          </div>
          <div className="space-y-2 sm:ml-[160px]">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="my-6 h-px bg-[#EAECF0]" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full max-w-[700px]" />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Section + Sidebar Skeleton */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-[14px]" />
          <Skeleton className="h-64 w-full rounded-[14px]" />
        </div>

        <aside className="rounded-[10px] border border-[#E1E5EC] bg-white px-4 py-5 shadow-sm">
          <Skeleton className="mx-auto h-4 w-44" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-[6px]" />
            ))}
            <Skeleton className="h-10 w-full rounded-[6px]" />
          </div>
        </aside>
      </div>
    </div>
  </main>
);

const BusinessViewProfileContainer = ({
  businessId,
  publicProfilePath,
}: {
  businessId: string;
  publicProfilePath?: string;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const serviceId = searchParams.get("serviceId") || undefined;

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSaveSignInModalOpen, setIsSaveSignInModalOpen] = useState(false);
  const [isQuoteSignInModalOpen, setIsQuoteSignInModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const [activeCoverIndex, setActiveCoverIndex] = useState(0);

  const { data: business, isPending, isError, refetch } =
    usePublicBusinessProfile(businessId, serviceId);
  const { data: galleryData } = useBusinessGallery(businessId);

  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;

  const { data: savedBusinessesData } = useSavedBusinesses(token, 1, 100);
  const createConversation = useCreateConversation(token);

  const savedOnServer = (savedBusinessesData?.data ?? []).some(
    (savedBusiness) =>
      savedBusiness.businessOwner.businessOwnerId === businessId
  );
  const isSaved = savedOverride ?? savedOnServer;

  // Extract all gallery photos
  const galleryImages = useMemo(() => {
    return (galleryData?.data ?? []).flatMap((item) =>
      (item.images ?? []).map((img) => ({
        url: img.url,
        title: item.title,
        publicId: img.publicId,
      }))
    );
  }, [galleryData?.data]);

  // Consolidate cover photos: background image first, followed by gallery images
  const allCoverPhotos = useMemo(() => {
    const list: Array<{ url: string; title: string }> = [];
    if (business?.backgroundImage) {
      list.push({ url: business.backgroundImage, title: "Cover Photo" });
    }
    for (const g of galleryImages) {
      if (!list.some((p) => p.url === g.url)) {
        list.push({ url: g.url, title: g.title });
      }
    }
    return list;
  }, [business?.backgroundImage, galleryImages]);

  // Scroll to reviews section if requestedTab === 'reviews'
  useEffect(() => {
    if (requestedTab === "reviews") {
      const el = document.getElementById("reviews");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [requestedTab]);

  const openQuoteFlow = () => {
    if (!token) {
      setIsQuoteSignInModalOpen(true);
      return;
    }
    setIsQuoteModalOpen(true);
  };

  const openMessageFlow = () => {
    if (!token) {
      setIsQuoteSignInModalOpen(true);
      return;
    }
    if (!business?.ownerId) {
      toast.error("Business details not available yet.");
      return;
    }

    createConversation.mutate(
      {
        businessOwnerId: business.ownerId,
        subject: `Inquiry for ${business.businessName}`,
        message: `Hello ${business.businessName}, I would like to inquire about your services.`,
      },
      {
        onSuccess: (resData) => {
          const conversationId = resData?.conversation?._id || resData?._id;
          router.push(
            `/account/message${
              conversationId ? `?conversationId=${conversationId}` : ""
            }`
          );
        },
      }
    );
  };

  const redirectToLogin = () => {
    const currentQuery = searchParams.toString();
    const callbackUrl =
      publicProfilePath ||
      `/services/businesses/${businessId}${
        currentQuery ? `?${currentQuery}` : ""
      }`;
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const openReportFlow = () => {
    setIsReportModalOpen(true);
  };

  const toggleSaveFlow = () => {
    if (!token) {
      setIsSaveSignInModalOpen(true);
      return;
    }
    toggleSaveMutation.mutate(isSaved);
  };

  const toggleSaveMutation = useMutation({
    mutationFn: async (shouldUnsave: boolean) => {
      if (!token) {
        throw new Error(
          `Please sign in to ${shouldUnsave ? "unsave" : "save"} this business.`
        );
      }
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL ??
        process.env.NEXT_PUBLIC_BACKEND_API_URL
      )?.replace(/\/$/, "");
      if (!apiUrl) throw new Error("The save API is not configured.");

      const response = await fetch(
        shouldUnsave
          ? `${apiUrl}/save-quote/${encodeURIComponent(businessId)}`
          : `${apiUrl}/save-quote`,
        {
          method: shouldUnsave ? "DELETE" : "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          ...(shouldUnsave
            ? {}
            : { body: JSON.stringify({ businessOwnerId: businessId }) }),
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Unable to ${shouldUnsave ? "unsave" : "save"} this business.`
        );
      }
      return { result, shouldUnsave };
    },
    onSuccess: async ({ result, shouldUnsave }) => {
      setSavedOverride(!shouldUnsave);
      toast.success(
        result.message ||
          `Business ${shouldUnsave ? "unsaved" : "saved"} successfully.`
      );
      await queryClient.invalidateQueries({ queryKey: ["saved-businesses"] });
      setSavedOverride(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this saved business."
      );
    },
  });

  if (isPending) return <BusinessProfileSkeleton />;
  if (isError || !business) {
    return (
      <main className="min-h-[500px] bg-[#F5F8F7] py-16">
        <div className="container max-w-[700px] rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-red-600">
            Unable to load this business profile.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-md bg-[#292D73] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#20255F]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // Location and address calculations
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const businessAddress =
    [business.address, business.city, business.state]
      .filter(Boolean)
      .join(", ") || location;
  const businessEmail = business.businessEmail || business.email;
  const currentCoverPhoto =
    allCoverPhotos[activeCoverIndex]?.url ||
    business.backgroundImage ||
    allCoverPhotos[0]?.url;

  if (isPreviewOpen && business?.businessWebsiteUrl) {
    const { embedUrl, originalUrl, isConvertedYoutube, isYoutubeMain } =
      getEmbeddableUrl(business.businessWebsiteUrl);

    return (
      <div>
        <main className="min-h-[calc(100vh-140px)] bg-[#F5F8F7] py-6 sm:py-8">
          <div className="container">
            <section className="flex min-h-[calc(100vh-180px)] flex-col overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white shadow-[0_4px_24px_rgba(41,45,115,0.08)]">
              {/* Top Header Bar */}
              <div className="flex flex-col gap-3 border-b border-[#EAECF0] bg-[#FAFAFC] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#344054] shadow-xs transition-colors hover:bg-[#F9FAFB] sm:h-auto sm:w-auto sm:py-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sm:hidden">Back to Profile</span>
                    <span className="hidden sm:inline">
                      Back to Business Profile
                    </span>
                  </button>

                  <div className="hidden h-5 w-[1px] bg-[#E4E7EC] sm:block" />

                  <div className="flex min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2 sm:bg-transparent sm:px-0 sm:py-0">
                    <Globe2 className="h-4 w-4 shrink-0 text-[#292D73]" />
                    <span className="truncate text-sm font-semibold text-[#101828]">
                      {business.businessWebsiteUrl}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_32px_32px] items-center gap-2 sm:flex sm:shrink-0">
                  <a
                    href={originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#EEF1FF] px-3 text-xs font-semibold text-[#292D73] transition-colors hover:bg-[#E0E5FF] sm:h-auto sm:py-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Open in New Tab</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const iframe = document.getElementById(
                        "public-website-preview-iframe"
                      ) as HTMLIFrameElement;
                      if (iframe) iframe.src = embedUrl;
                    }}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#D0D5DD] bg-white text-[#475467] transition-colors hover:bg-[#F9FAFB]"
                    title="Refresh website"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-[#F2F4F7] hover:text-[#101828]"
                    title="Close preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Security Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B2DDFF] bg-[#EFF8FF] px-5 py-2 text-xs text-[#175CD3] sm:px-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[#175CD3]" />
                  <span>
                    {isConvertedYoutube
                      ? "Converted YouTube video URL to official Embed format for inline playback."
                      : isYoutubeMain
                      ? "YouTube main site blocks embedding for security (X-Frame-Options: SAMEORIGIN). Click 'Open in New Tab' to view."
                      : "If this external site prevents embedding (X-Frame-Options / CSP), click 'Open in New Tab' to view it directly."}
                  </span>
                </div>
              </div>

              {/* Main iFrame Body */}
              <div className="relative h-[calc(100vh-260px)] min-h-[600px] w-full flex-1 bg-[#F8FAFC]">
                <iframe
                  id="public-website-preview-iframe"
                  src={embedUrl}
                  title={`${business.businessName || "Business"} Website Preview`}
                  className="h-full min-h-[600px] w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Bottom Footer Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAECF0] bg-[#FAFAFC] px-5 py-3 text-xs text-[#475467] sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="font-medium">Embedded Website Preview</span>
                  <span>•</span>
                  <span className="text-[#667085]">
                    {business.businessName}
                  </span>
                </div>
                <div className="truncate text-slate-500">
                  Target URL:{" "}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-[#344054]">
                    {embedUrl}
                  </code>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] py-6 sm:py-8 lg:py-10">
      <main className="container max-w-[1240px] space-y-6">
        {/* 1. Main Business Profile Card (Full container width, matching reference design) */}
        <div className="overflow-hidden rounded-[14px] border border-[#E1E5EC] bg-white shadow-sm">
          {/* Top Banner / Cover Image with Gallery Image Switching */}
          <div className="relative h-[220px] w-full bg-[#EEF1FF] sm:h-[280px] md:h-[340px]">
            {currentCoverPhoto ? (
              <Image
                src={currentCoverPhoto}
                alt={business?.businessName || "Business cover"}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#E9EFFD] via-[#F3F6FD] to-[#DFEEEE] px-6 text-center">
                <span className="text-xl font-bold text-[#292D73] sm:text-2xl">
                  {business?.businessName || "SideQuote Verified Business"}
                </span>
              </div>
            )}

            {/* If multiple photos (cover + gallery), allow previous/next browsing */}
            {allCoverPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveCoverIndex((prev) =>
                      prev > 0 ? prev - 1 : allCoverPhotos.length - 1
                    )
                  }
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65 focus:outline-none"
                  aria-label="Previous gallery image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveCoverIndex((prev) =>
                      prev < allCoverPhotos.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65 focus:outline-none"
                  aria-label="Next gallery image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Thumbnail strip on the bottom-left of cover */}
                <div className="absolute bottom-3 left-4 hidden items-center gap-2 rounded-lg bg-black/45 p-1.5 backdrop-blur sm:flex">
                  {allCoverPhotos.slice(0, 6).map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCoverIndex(idx)}
                      className={`relative h-10 w-14 cursor-pointer overflow-hidden rounded border transition ${
                        activeCoverIndex === idx
                          ? "scale-105 border-white shadow-sm ring-1 ring-white"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                      title={photo.title || `Photo ${idx + 1}`}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.title || "Gallery thumbnail"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                  {allCoverPhotos.length > 6 && (
                    <span className="px-1.5 text-[11px] font-bold text-white">
                      +{allCoverPhotos.length - 6}
                    </span>
                  )}
                </div>

                {/* Photo counter on bottom-right */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <Camera className="h-3.5 w-3.5" />
                  <span>
                    {activeCoverIndex + 1} / {allCoverPhotos.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Profile Header & Information Body */}
          <div className="relative px-5 pb-6 pt-[78px] sm:px-8 sm:pt-6">
            {/* Circular Profile Avatar (Overlapping the banner) */}
            <div className="absolute -top-[65px] left-5 sm:-top-[70px] sm:left-8">
              <div className="relative h-[125px] w-[125px] overflow-hidden rounded-full border-4 border-white bg-[#F2F4F7] shadow-sm sm:h-[140px] sm:w-[140px]">
                {business?.profilePicture ? (
                  <Image
                    src={business.profilePicture}
                    alt={business?.businessName || "Business profile"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#EEF1FF] text-4xl font-bold uppercase text-[#30347F]">
                    {business?.businessName?.charAt(0) || "B"}
                  </div>
                )}
              </div>
            </div>

            {/* Business Name, Category & Reviews */}
            <div className="sm:ml-[160px] sm:min-h-[72px]">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-[24px] font-bold leading-tight text-[#111111] sm:text-[28px]">
                  {business.businessName || "Business Name"}
                </h1>
                <span className="inline-flex shrink-0 rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#30347F]">
                  Owner
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2.5">
                <p className="text-sm font-semibold text-[#667085]">
                  {business.category || "General Services"}
                </p>
                <span className="text-[#D0D5DD]">•</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-[1px]">
                    {renderStars(
                      business.rating ??
                        business.reviewSummary?.averageRating ??
                        0
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#111827]">
                    {(
                      business.rating ??
                      business.reviewSummary?.averageRating ??
                      0
                    ).toFixed(1)}
                  </span>
                  <a
                    href="#reviews"
                    className="text-xs text-[#667085] hover:text-[#292D73] hover:underline"
                  >
                    (
                    {business.totalReviews ??
                      business.reviewSummary?.totalReviews ??
                      0}{" "}
                    reviews)
                  </a>
                </div>
              </div>
            </div>

            {/* About This Business & Contact Grid */}
            <div className="mt-6 space-y-6 text-[#101828]">
              {/* About This Business */}
              <div>
                <h3 className="mb-1.5 text-base font-semibold">
                  About This Business
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#1D2939]">
                  {business.bio ||
                    "No business description has been added yet."}
                </p>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-[#111827]">
                    Service Area
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-[#475467]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#4365D0]" />
                    <span>
                      {business.serviceArea || location || "Not added"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-semibold text-[#111827]">
                    Phone Number
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-[#475467]">
                    <Phone className="h-4 w-4 shrink-0 text-[#4365D0]" />
                    {business.phoneNumber ? (
                      <a
                        href={`tel:${business.phoneNumber}`}
                        className="hover:text-[#292D73] hover:underline"
                      >
                        {business.phoneNumber}
                      </a>
                    ) : (
                      <span>Not added</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-semibold text-[#111827]">
                    Business Email
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-[#475467]">
                    <Mail className="h-4 w-4 shrink-0 text-[#4365D0]" />
                    {businessEmail ? (
                      <a
                        href={`mailto:${businessEmail}`}
                        className="hover:text-[#292D73] hover:underline"
                      >
                        {businessEmail}
                      </a>
                    ) : (
                      <span>Not added</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-semibold text-[#111827]">
                    Business Address
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-[#475467]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#4365D0]" />
                    <span>{businessAddress || "Not added"}</span>
                  </div>
                </div>
              </div>

              {/* Website */}
              {business.businessWebsiteUrl && (
                <div>
                  <h3 className="mb-1.5 text-base font-semibold">Website</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#EEF1FF] px-4 py-2 text-sm font-medium text-[#30347F] transition-colors hover:bg-[#E0E5FF]"
                    >
                      <Globe2 className="h-4 w-4 shrink-0" />
                      <span className="break-all">
                        {business.businessWebsiteUrl}
                      </span>
                      <span className="ml-1 rounded-full bg-[#30347F] px-2 py-0.5 text-[10px] font-semibold text-white">
                        Preview
                      </span>
                    </button>

                    <a
                      href={
                        business.businessWebsiteUrl.startsWith("http://") ||
                        business.businessWebsiteUrl.startsWith("https://")
                          ? business.businessWebsiteUrl
                          : `https://${business.businessWebsiteUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#667085] transition hover:text-[#30347F] hover:underline"
                      title="Open external website in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open external
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Second Section + Right Side ContactCard (Grid spanning full container width) */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
          {/* Left Sub-Sections */}
          <div className="min-w-0 space-y-6">
            {/* Services Offered Section */}
            <section id="services">
              <BusinessServices businessId={businessId} />
            </section>

            {/* Project Gallery Section */}
            <section id="gallery">
              <BusinessGallery businessId={businessId} />
            </section>

            {/* Customer Reviews Section */}
            <section id="reviews">
              <BusinessReviews businessId={businessId} />
            </section>
          </div>

          {/* Right Column: ContactCard (Original right-side sidebar) */}
          <div>
            <ContactCard
              business={business}
              onOpenQuoteModal={openQuoteFlow}
              onOpenReportModal={openReportFlow}
              onOpenMessageFlow={openMessageFlow}
              onOpenWebsitePreview={() => setIsPreviewOpen(true)}
              onToggleSave={toggleSaveFlow}
              isSaving={toggleSaveMutation.isPending}
              isSaved={isSaved}
              isCreatingMessage={createConversation.isPending}
            />
          </div>
        </div>
      </main>

      {/* Quote Request Modal */}
      <RequestAQuoteModal
        open={isQuoteModalOpen}
        businessOwnerId={business.ownerId}
        businessName={business.businessName}
        onClose={() => setIsQuoteModalOpen(false)}
      />

      {/* Report Modal */}
      <ReportBusinessModal
        ownerId={business.ownerId}
        businessName={business.businessName}
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
      />

      {/* Save Business Sign In Modal */}
      <Dialog
        open={isSaveSignInModalOpen}
        onOpenChange={setIsSaveSignInModalOpen}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border-0 p-0 shadow-2xl sm:w-full">
          <div className="border-b border-[#E8ECF2] bg-[#F7FAFC] px-5 py-5 pr-12 sm:px-6">
            <DialogHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF0FF] text-[#292D73]">
                <Bookmark className="h-5 w-5" aria-hidden="true" />
              </div>
              <DialogTitle className="text-xl font-extrabold text-[#292D73] sm:text-2xl">
                Save business
              </DialogTitle>
              <DialogDescription className="pt-1 text-xs leading-5 text-[#667085] sm:text-sm">
                Sign in to save {business.businessName} to your saved
                businesses.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-6 sm:px-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              You need to sign in before saving this business.
            </div>
            <DialogFooter className="mt-5 gap-2 sm:space-x-0">
              <button
                type="button"
                onClick={() => setIsSaveSignInModalOpen(false)}
                className="h-10 rounded-md border border-[#D0D5DD] px-5 text-xs font-semibold text-[#475467] transition hover:bg-[#F5F7FA]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={redirectToLogin}
                className="h-10 rounded-md bg-[#292D73] px-5 text-xs font-bold text-white transition hover:bg-[#20255F]"
              >
                Sign in
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Sign In Modal */}
      <Dialog
        open={isQuoteSignInModalOpen}
        onOpenChange={setIsQuoteSignInModalOpen}
      >
        <DialogContent className="max-w-[92%] rounded-[14px] border-0 bg-white p-6 sm:max-w-[430px]">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF0FF] text-[#292D73]">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-extrabold leading-tight text-[#292D73]">
              Sign in required
            </DialogTitle>
            <DialogDescription className="pt-2 text-[13px] leading-5 text-[#667085]">
              You need to sign in before you can start a message or request a
              quote.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 grid grid-cols-2 gap-3 sm:space-x-0">
            <button
              type="button"
              onClick={() => setIsQuoteSignInModalOpen(false)}
              className="h-10 rounded-[6px] border border-[#B8C0CC] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={redirectToLogin}
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

export default BusinessViewProfileContainer;