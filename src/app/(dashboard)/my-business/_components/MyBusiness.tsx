"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RotateCw,
  ShieldAlert,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
// import Link from "next/lnk";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type BusinessProfile = {
  _id: string;
  businessName?: string;
  businessEmail?: string;
  businessWebsiteUrl?: string;
  serviceArea?: string;
  category?: string;
  city?: string;
  state?: string;
  address?: string;
  bio?: string;
  phoneNumber?: string;
  profilePicture?: string;
};

type ProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: BusinessProfile;
};

type BusinessDraft = Omit<BusinessProfile, "_id" | "profilePicture">;

const emptyDraft: BusinessDraft = {
  businessName: "",
  businessEmail: "",
  businessWebsiteUrl: "",
  serviceArea: "",
  category: "",
  city: "",
  state: "",
  address: "",
  bio: "",
  phoneNumber: "",
};

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The profile API is not configured.");
  return apiUrl.replace(/\/$/, "");
};

const getProfile = async (token: string): Promise<ProfileResponse> => {
  const response = await fetch(`${getApiUrl()}/user/profile`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const result = (await response.json().catch(() => null)) as ProfileResponse | null;
  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.message || "Unable to load business information.");
  }
  return result;
};

const toDraft = (profile: BusinessProfile): BusinessDraft => ({
  businessName: profile.businessName || "",
  businessEmail: profile.businessEmail || "",
  businessWebsiteUrl: profile.businessWebsiteUrl || "",
  serviceArea: profile.serviceArea || "",
  category: profile.category || "",
  city: profile.city || "",
  state: profile.state || "",
  address: profile.address || "",
  bio: profile.bio || "",
  phoneNumber: profile.phoneNumber || "",
});

const getEmbeddableUrl = (
  url: string
): { embedUrl: string; originalUrl: string; isConvertedYoutube: boolean; isYoutubeMain: boolean } => {
  if (!url) return { embedUrl: "", originalUrl: "", isConvertedYoutube: false, isYoutubeMain: false };
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
        return { embedUrl: cleanUrl, originalUrl: cleanUrl, isConvertedYoutube: false, isYoutubeMain: false };
      }
      return { embedUrl: cleanUrl, originalUrl: cleanUrl, isConvertedYoutube: false, isYoutubeMain: true };
    }
  } catch {
    // fallback
  }

  return { embedUrl: cleanUrl, originalUrl: cleanUrl, isConvertedYoutube: false, isYoutubeMain: false };
};

function MyBusiness() {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user as { token?: string; accessToken?: string } | undefined;
  const token = user?.accessToken ?? user?.token;
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<BusinessDraft>(emptyDraft);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File>();
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const profileInputRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery<ProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: () => {
      if (!token) throw new Error("Please sign in to view your business.");
      return getProfile(token);
    },
    enabled: Boolean(token),
    staleTime: 60 * 1000,
    retry: 1,
  });

  const business = profileQuery.data?.data;

  useEffect(() => {
    if (!business) return;
    setDraft(toDraft(business));
    setProfileImagePreview(business.profilePicture || "");
    setProfileImageFile(undefined);
  }, [business]);

  const updateProfile = useMutation<ProfileResponse, Error>({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in to update your business.");
      const formData = new FormData();
      Object.entries(draft).forEach(([key, value]) => formData.append(key, value || ""));
      if (profileImageFile) {
        formData.append("profilePicture", profileImageFile, profileImageFile.name);
      }

      const response = await fetch(`${getApiUrl()}/user/profile`, {
        method: "PUT",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as ProfileResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update business information.");
      }
      return result;
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Business information updated successfully.");
      setIsEditOpen(false);
      setProfileImageFile(undefined);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const openEditor = () => {
    if (business) setDraft(toDraft(business));
    setProfileImageFile(undefined);
    setProfileImagePreview(business?.profilePicture || "");
    setIsEditOpen(true);
  };

  const handleProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5 MB.");
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const setField = (field: keyof BusinessDraft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.businessName?.trim()) return toast.error("Business name is required.");
    if (draft.businessEmail && !/^\S+@\S+\.\S+$/.test(draft.businessEmail)) {
      return toast.error("Please enter a valid business email.");
    }
    if (draft.businessWebsiteUrl) {
      try {
        new URL(draft.businessWebsiteUrl);
      } catch {
        return toast.error("Please enter a valid website URL.");
      }
    }
    updateProfile.mutate();
  };

  const isLoading = sessionStatus === "loading" || (Boolean(token) && profileQuery.isPending);
  const location = [business?.address, business?.city, business?.state].filter(Boolean).join(", ");
  const inputClass = "h-11 w-full rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none transition-shadow focus:border-[#30347F] focus:ring-2 focus:ring-[#30347F]/15 disabled:cursor-not-allowed disabled:bg-slate-50";

  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-[12px] bg-white">
        <Skeleton className="h-[270px] w-full rounded-none" />
        <div className="space-y-5 p-6"><Skeleton className="h-8 w-72" /><Skeleton className="h-4 w-40" /><Skeleton className="h-20 w-full" /><Skeleton className="h-12 w-2/3" /></div>
      </section>
    );
  }

  if (!token || profileQuery.isError || !business) {
    return (
      <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[12px] bg-white px-6 text-center">
        <Building2 className="h-10 w-10 text-slate-400" />
        <h2 className="mt-3 font-semibold text-[#101828]">Unable to load business information</h2>
        <p className="mt-1 text-sm text-slate-500">{profileQuery.error instanceof Error ? profileQuery.error.message : "Please sign in and try again."}</p>
        {token && <button type="button" onClick={() => profileQuery.refetch()} className="mt-4 rounded-lg bg-[#30347F] px-5 py-2 text-sm font-medium text-white">Try again</button>}
      </section>
    );
  }

  if (isPreviewOpen && business?.businessWebsiteUrl) {
    const { embedUrl, originalUrl, isConvertedYoutube, isYoutubeMain } = getEmbeddableUrl(business.businessWebsiteUrl);

    return (
      <section className="flex min-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAECF0] bg-[#FAFAFC] px-5 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] shadow-xs hover:bg-[#F9FAFB] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Business Info</span>
            </button>

            <div className="hidden h-5 w-[1px] bg-[#E4E7EC] sm:block" />

            <div className="flex min-w-0 items-center gap-2">
              <Globe2 className="h-4 w-4 shrink-0 text-[#30347F]" />
              <span className="truncate text-sm font-semibold text-[#101828]">
                {business.businessWebsiteUrl}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={originalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-[#EEF1FF] px-3 py-1.5 text-xs font-semibold text-[#30347F] hover:bg-[#E0E5FF] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in New Tab</span>
            </a>
            <button
              type="button"
              onClick={() => {
                const iframe = document.getElementById("website-preview-iframe") as HTMLIFrameElement;
                if (iframe) iframe.src = embedUrl;
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F9FAFB] transition-colors"
              title="Refresh website"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828] transition-colors"
              title="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Security / Info Banner */}
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
        <div className="relative flex-1 w-full bg-[#F8FAFC] min-h-[580px]">
          <iframe
            id="website-preview-iframe"
            src={embedUrl}
            title={`${business.businessName || "Business"} Website Preview`}
            className="h-full w-full border-0 min-h-[600px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Bottom Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAECF0] bg-[#FAFAFC] px-5 py-3 text-xs text-[#475467] sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Embedded Website Preview</span>
            <span>•</span>
            <span className="text-[#667085]">{business.businessName}</span>
          </div>
          <div className="truncate text-slate-500">
            Target URL: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-[#344054]">{embedUrl}</code>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
        <div className="relative h-[230px] w-full sm:h-[270px]">
          <Image src="/assets/images/about_hero.jpg" alt="Business cover" fill priority className="object-cover" />
        </div>

        <div className="relative px-5 pb-5 pt-[86px] sm:px-6 sm:pt-5">
          <div className="absolute -top-[70px] left-5 sm:left-6">
            <div className="relative h-[140px] w-[140px] overflow-hidden rounded-full border-4 border-white bg-[#F2F4F7] shadow-sm">
              <Image
                src={business.profilePicture || "/assets/images/review1.png"}
                alt={business.businessName || "Business profile"}
                fill
                unoptimized={Boolean(business.profilePicture)}
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 sm:ml-[154px] sm:min-h-[72px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-[24px] font-semibold leading-tight text-[#111111]">
                  {business.businessName || "Business name not added"}
                </h2>
                <span className="inline-flex shrink-0 rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#30347F]">
                  Owner
                </span>
              </div>
              <p className="mt-1 text-sm text-[#667085]">{business.category || "Category not added"}</p>
            </div>
            <button type="button" aria-label="Edit business details" onClick={openEditor} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#172B4D] transition-colors hover:bg-[#F3F4FA] hover:text-[#30347F]">
              <Pencil className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-6 text-[#101828] sm:mt-4">
            <div>
              <h3 className="mb-1.5 text-base font-semibold">About This Business</h3>
              <p className="whitespace-pre-wrap text-sm leading-6 text-[#1D2939]">{business.bio || "No business description has been added yet."}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoBlock icon={MapPin} title="Service Area" value={business.serviceArea || location || "Not added"} />
              <InfoBlock icon={Phone} title="Phone Number" value={business.phoneNumber || "Not added"} />
              <InfoBlock icon={Mail} title="Business Email" value={business.businessEmail || "Not added"} />
              <InfoBlock icon={MapPin} title="Business Address" value={location || "Not added"} />
            </div>

            {business.businessWebsiteUrl && (
              <div>
                <h3 className="mb-1.5 text-base font-semibold">Website</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#EEF1FF] px-4 py-2 text-sm font-medium text-[#30347F] hover:bg-[#E0E5FF] transition-colors"
                  >
                    <Globe2 className="h-4 w-4 shrink-0" />
                    <span className="break-all">{business.businessWebsiteUrl}</span>
                    <span className="ml-1 rounded-full bg-[#30347F] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Preview
                    </span>
                  </button>

                  <a
                    href={
                      business.businessWebsiteUrl.startsWith("http://") || business.businessWebsiteUrl.startsWith("https://")
                        ? business.businessWebsiteUrl
                        : `https://${business.businessWebsiteUrl}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#667085] hover:text-[#30347F] hover:underline"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open external
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={isEditOpen} onOpenChange={(open) => !updateProfile.isPending && setIsEditOpen(open)}>
        <DialogContent className="max-h-[90vh] max-w-[760px] overflow-y-auto rounded-xl bg-white p-0">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-[#EAECF0] px-6 py-5">
              <DialogTitle className="text-xl font-semibold text-[#101828]">Edit Business Information</DialogTitle>
              <DialogDescription>Update the information customers see on your business profile.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-[#344054]"><span>Business name *</span><input required value={draft.businessName} onChange={(e) => setField("businessName", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054]"><span>Business category</span><input value={draft.category} onChange={(e) => setField("category", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054]"><span>Business email</span><input type="email" value={draft.businessEmail} onChange={(e) => setField("businessEmail", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054]"><span>Phone number</span><input type="tel" value={draft.phoneNumber} onChange={(e) => setField("phoneNumber", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2"><span>Website URL</span><input type="url" placeholder="https://example.com" value={draft.businessWebsiteUrl} onChange={(e) => setField("businessWebsiteUrl", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2"><span>About This Business</span><textarea value={draft.bio} onChange={(e) => setField("bio", e.target.value)} placeholder="Write about your business..." className={`${inputClass} min-h-[140px] resize-y py-3`} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2"><span>Service area</span><input value={draft.serviceArea} onChange={(e) => setField("serviceArea", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2"><span>Street address</span><input value={draft.address} onChange={(e) => setField("address", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054]"><span>City</span><input value={draft.city} onChange={(e) => setField("city", e.target.value)} className={inputClass} /></label>
              <label className="space-y-2 text-sm font-medium text-[#344054]"><span>State</span><input value={draft.state} onChange={(e) => setField("state", e.target.value)} className={inputClass} /></label>

              <div className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-[#344054]">Business profile image</span>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#F2F4F7]">
                    <Image src={profileImagePreview || "/assets/images/review1.png"} alt="Business profile preview" fill unoptimized={profileImagePreview.startsWith("data:") || Boolean(business.profilePicture)} className="object-cover" />
                  </div>
                  <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImage} />
                  <button type="button" onClick={() => profileInputRef.current?.click()} className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]">Choose image</button>
                  <span className="text-xs text-[#667085]">JPG, PNG or WebP. Max 5 MB.</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 border-t border-[#EAECF0] px-6 py-4 sm:space-x-0">
              <button type="button" disabled={updateProfile.isPending} onClick={() => setIsEditOpen(false)} className="h-10 rounded-lg border border-[#D0D5DD] px-5 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={updateProfile.isPending} className="h-10 rounded-lg bg-[#30347F] px-5 text-sm font-medium text-white hover:bg-[#252966] disabled:cursor-not-allowed disabled:opacity-60">{updateProfile.isPending ? "Saving..." : "Save changes"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoBlock({ icon: Icon, title, value }: { icon: typeof MapPin; title: string; value: string }) {
  return (
    <div>
      <h3 className="mb-1.5 text-base font-semibold">{title}</h3>
      <p className="flex items-start gap-2 text-sm text-[#667085]"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#30569B]" /><span>{value}</span></p>
    </div>
  );
}

export default MyBusiness;
