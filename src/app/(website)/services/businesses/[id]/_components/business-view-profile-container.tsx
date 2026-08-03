"use client";

import {
  Bookmark,
  Globe2,
  LogIn,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BusinessGallery from "./business-gallery";
import BusinessOverview from "./business-overview";
import { usePublicBusinessProfile } from "@/hooks/use-public-business-profile";
import { useSavedBusinesses } from "@/hooks/use-saved-businesses";
import BusinessReviews from "./business-reviews";
import BusinessServices from "./business-services";
import RequestAQuoteModal from "./request-a-quote-modal";
import ReportBusinessModal from "../../_components/report-business-modal";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProfileTab = "overview" | "services" | "gallery" | "reviews";

const tabs: { id: ProfileTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
];

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

const BusinessProfileSkeleton = () => (
  <main className="min-h-screen bg-[#F5F8F7]" aria-label="Loading business profile">
    <header className="border-b border-[#E2E8F0] bg-white">
      <div className="container pb-0 pt-8">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-[12px]" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-9 w-full max-w-[280px]" />
            <div className="mt-3 flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-7" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-[3px]" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex h-11 items-center gap-7">
          {tabs.map((tab, index) => (
            <Skeleton
              key={tab.id}
              className={`h-4 rounded ${index === 0 ? "w-16" : "w-14"}`}
            />
          ))}
        </div>
      </div>
    </header>

    <section className="container py-10 sm:py-12 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
        <div className="space-y-5">
          <div className="rounded-[8px] border border-[#D9DEE7] bg-white p-5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-4 h-4 w-full max-w-[620px]" />
          </div>
          <div className="rounded-[8px] border border-[#D9DEE7] bg-white p-5">
            <Skeleton className="h-6 w-32" />
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        <aside className="rounded-[8px] border border-[#D9DEE7] bg-white px-4 py-5">
          <Skeleton className="mx-auto h-4 w-44" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-[4px]" />
            ))}
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-10 w-[108px] rounded-[6px]" />
              <Skeleton className="h-10 w-[116px] rounded-[6px]" />
            </div>
          </div>
          <div className="mt-6 h-px bg-[#E5E7EB]" />
          <Skeleton className="mx-auto mt-4 h-3 w-44" />
        </aside>
      </div>
    </section>
  </main>
);

const ContactCard = ({
  onOpenQuoteModal,
  onOpenReportModal,
  onToggleSave,
  isSaving,
  isSaved,
  business,
}: {
  onOpenQuoteModal: () => void;
  onOpenReportModal: () => void;
  onToggleSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
  business: NonNullable<ReturnType<typeof usePublicBusinessProfile>["data"]>;
}) => (
  <aside className="rounded-[10px] border border-[#E1E5EC] bg-white px-4 py-5 shadow-[0_8px_24px_rgba(41,45,115,0.07)] lg:sticky lg:top-6">
    <h2 className="text-center text-[13px] font-extrabold text-[#292D73]">
      Contact {business?.businessName || "N/A"}
    </h2>

    <div className="mt-4 space-y-3">
      {(business?.phoneNumber) && (
        <Link
          href={`tel:${business?.phoneNumber || "#"}`}
          className="flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#292D73] px-4 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 focus-visible:ring-offset-2"
        >
          <Phone className="h-3.5 w-3.5" />
          {business?.phoneNumber || "N/A"}
        </Link>
      )}

      {business.businessWebsiteUrl && <Link
        href={business.businessWebsiteUrl}
        className="flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#D7DCE5] bg-white px-4 text-[12px] font-bold text-[#344054] transition hover:border-[#292D73]/35 hover:bg-[#F7F7FC] hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/30 focus-visible:ring-offset-2"
      >
        <Globe2 className="h-3.5 w-3.5" />
        Visit Website
      </Link>}

      <Link
        href={`mailto:${business.businessEmail || business.email || ""}`}
        className="flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#D7DCE5] bg-white px-4 text-[12px] font-bold text-[#344054] transition hover:border-[#292D73]/35 hover:bg-[#F7F7FC] hover:text-[#292D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/30 focus-visible:ring-offset-2"
      >
        <Mail className="h-3.5 w-3.5" />
        Email
      </Link>

      <button
        type="button"
        onClick={onOpenReportModal}
        className="flex h-10 w-full items-center justify-center rounded-[6px] border border-[#F1C7C7] bg-[#FFF8F8] px-4 text-[12px] font-bold text-[#B42318] transition hover:border-[#E7AAAA] hover:bg-[#FFF0EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20]/25 focus-visible:ring-offset-2"
      >
        Report
      </button>
        <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onToggleSave}
                disabled={isSaving}
                aria-pressed={isSaved}
                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] border border-[#292D73] px-5 text-[13px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
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
                className="inline-flex h-10 w-full items-center justify-center rounded-[6px] bg-[#292D73] px-6 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 focus-visible:ring-offset-2"
              >
                Request a Quote
              </button>
            </div>
    </div>

    {/* <div className="mt-6 h-px bg-[#EAECF0]" />
    <p className="mt-4 text-center text-xs font-medium text-[#98A2B3]">
      Typically responds within 2 hours
    </p> */}
  </aside>
);

const BusinessViewProfileContainer = ({ businessId }: { businessId: string }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const serviceId = searchParams.get("serviceId") || undefined;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    requestedTab === "reviews" ? "reviews" : "overview",
  );
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSaveSignInModalOpen, setIsSaveSignInModalOpen] = useState(false);
  const [isQuoteSignInModalOpen, setIsQuoteSignInModalOpen] = useState(false);
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const { data: business, isPending, isError, refetch } =
    usePublicBusinessProfile(businessId, serviceId);
  const sessionUser = session?.user as
    | { token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const { data: savedBusinessesData } = useSavedBusinesses(token, 1, 100);
  const savedOnServer = (savedBusinessesData?.data ?? []).some(
      (savedBusiness) =>
        savedBusiness.businessOwner.businessOwnerId === businessId,
    );
  const isSaved = savedOverride ?? savedOnServer;

  const openQuoteFlow = () => {
    if (!token) {
      setIsQuoteSignInModalOpen(true);
      return;
    }

    setIsQuoteModalOpen(true);
  };

  const redirectToLogin = () => {
    const currentQuery = searchParams.toString();
    const callbackUrl = `/services/businesses/${businessId}${
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
          `Please sign in to ${shouldUnsave ? "unsave" : "save"} this business.`,
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
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Unable to ${shouldUnsave ? "unsave" : "save"} this business.`,
        );
      }
      return { result, shouldUnsave };
    },
    onSuccess: async ({ result, shouldUnsave }) => {
      setSavedOverride(!shouldUnsave);
      toast.success(
        result.message ||
          `Business ${shouldUnsave ? "unsaved" : "saved"} successfully.`,
      );
      await queryClient.invalidateQueries({ queryKey: ["saved-businesses"] });
      setSavedOverride(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this saved business.",
      );
    },
  });

  useEffect(() => {
    if (requestedTab && tabs.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab as ProfileTab);
    }
  }, [requestedTab]);

  if (isPending) return <BusinessProfileSkeleton />;
  if (isError || !business) return <main className="bg-[#F5F8F7]"><div className="container  py-16"><p className="text-sm text-red-600">Unable to load this business.</p><button type="button" onClick={() => refetch()} className="mt-3 rounded bg-[#292D73] px-4 py-2 text-xs font-bold text-white">Try again</button></div></main>;

  const activeContent = {
    overview: <BusinessOverview overview={business} />,
    services: <BusinessServices businessId={businessId} />,
    gallery: <BusinessGallery businessId={businessId} />,
    reviews: <BusinessReviews businessId={businessId} />,
  }[activeTab];

  return (
    <div className="">
      <main className="bg-[#F5F8F7]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container pb-0 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center justify-start gap-2 md:gap-3 lg:gap-4">
              <div>
              <Image src={business?.profilePicture || "/assets/images/no-image.jpg"} alt={business?.businessName} width={200} height={200} className="w-14 h-14 rounded-[12px]"/>
            </div>
            <div>
              <h1 className="text-[28px] font-extrabold leading-tight text-[#111827] sm:text-[32px]">
                {business.businessName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-[1px]">
                  {renderStars(business.rating ?? business.reviewSummary?.averageRating ?? 0)}
                </div>
                <span className="text-[12px] font-extrabold text-[#111827]">
                  {(business.rating ?? business.reviewSummary?.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-[11px] font-medium text-[#667085]">
                  ({business.totalReviews ?? business.reviewSummary?.totalReviews ?? 0} reviews)
                </span>
                <span className="rounded-[3px] bg-[#DFEEEE] px-2 py-1 text-[11px] font-semibold text-[#426078]">
                  {business.category}
                </span>
              </div>
            </div>
            </div>

            {/* <div className="flex flex-wrap items-center gap-2">
              <Link
                href={businessProfile.saveUrl}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#315CFF] bg-white px-5 text-[13px] font-semibold text-[#315CFF] transition hover:bg-[#F2F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315CFF]"
              >
                <Bookmark className="h-4 w-4" />
                Save
              </Link>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#292D73] px-6 text-[13px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
              >
                Request a Quote
              </button>
            </div> */}
          </div>

          <nav className="mt-6 flex gap-7 overflow-x-auto text-[13px] font-medium text-[#475467]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative h-11 shrink-0 transition hover:text-[#292D73] ${
                  activeTab === tab.id
                    ? "font-extrabold text-[#292D73]"
                    : "text-[#475467]"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute bottom-0 left-0 h-px w-full bg-[#292D73] transition ${
                    activeTab === tab.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="container  py-10 sm:py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
          <div>{activeContent}</div>
          <ContactCard
            business={business}
            onOpenQuoteModal={openQuoteFlow}
            onOpenReportModal={openReportFlow}
            onToggleSave={toggleSaveFlow}
            isSaving={toggleSaveMutation.isPending}
            isSaved={isSaved}
          />
        </div>
      </section>
      </main>
      <RequestAQuoteModal
        open={isQuoteModalOpen}
        businessOwnerId={business.ownerId}
        businessName={business.businessName}
        onClose={() => setIsQuoteModalOpen(false)}
      />
      <ReportBusinessModal
        ownerId={business.ownerId}
        businessName={business.businessName}
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
      />
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
              Sign in to request a quote
            </DialogTitle>
            <DialogDescription className="pt-2 text-[13px] leading-5 text-[#667085]">
              You need to sign in before you can send a quote request.
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
